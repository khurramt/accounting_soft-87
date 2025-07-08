import uuid
import json
import logging
import re
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc
from sqlalchemy.orm import selectinload

from models.banking import (
    BankTransaction, BankRule, TransactionStatusEnum
)
from models.transactions import Transaction
from schemas.banking_schemas import (
    BankRuleCreate, BankRuleUpdate, TransactionMatchRequest,
    TransactionMatchResponse, TransactionIgnoreRequest, BatchActionRequest
)

logger = logging.getLogger(__name__)


class TransactionMatchingService:
    """Service for matching bank transactions with QuickBooks transactions"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def match_transaction(
        self, 
        company_id: str,
        match_request: TransactionMatchRequest,
        user_id: str
    ) -> TransactionMatchResponse:
        """Match a bank transaction with a QuickBooks transaction"""
        try:
            # Get bank transaction
            bank_transaction = await self._get_bank_transaction(
                match_request.bank_transaction_id, company_id
            )
            if not bank_transaction:
                return TransactionMatchResponse(
                    success=False,
                    message="Bank transaction not found"
                )
            
            # Get QuickBooks transaction
            qb_transaction = await self._get_qb_transaction(
                match_request.quickbooks_transaction_id, company_id
            )
            if not qb_transaction:
                return TransactionMatchResponse(
                    success=False,
                    message="QuickBooks transaction not found"
                )
            
            # Validate match (amounts should be similar)
            if not self._validate_transaction_match(bank_transaction, qb_transaction):
                return TransactionMatchResponse(
                    success=False,
                    message="Transaction amounts do not match"
                )
            
            # Perform match
            bank_transaction.matched_transaction_id = qb_transaction.transaction_id
            bank_transaction.status = TransactionStatusEnum.MATCHED
            
            await self.db.commit()
            
            logger.info(f"Matched bank transaction {match_request.bank_transaction_id} with QB transaction {match_request.quickbooks_transaction_id}")
            
            return TransactionMatchResponse(
                success=True,
                message="Transaction matched successfully",
                matched_transaction_id=qb_transaction.transaction_id
            )
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error matching transaction: {e}")
            return TransactionMatchResponse(
                success=False,
                message=f"Error matching transaction: {str(e)}"
            )
    
    async def ignore_transaction(
        self, 
        company_id: str,
        ignore_request: TransactionIgnoreRequest,
        user_id: str
    ) -> TransactionMatchResponse:
        """Mark a bank transaction as ignored"""
        try:
            bank_transaction = await self._get_bank_transaction(
                ignore_request.bank_transaction_id, company_id
            )
            if not bank_transaction:
                return TransactionMatchResponse(
                    success=False,
                    message="Bank transaction not found"
                )
            
            # Mark as ignored
            bank_transaction.status = TransactionStatusEnum.IGNORED
            
            await self.db.commit()
            
            logger.info(f"Ignored bank transaction {ignore_request.bank_transaction_id}")
            
            return TransactionMatchResponse(
                success=True,
                message="Transaction ignored successfully"
            )
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error ignoring transaction: {e}")
            return TransactionMatchResponse(
                success=False,
                message=f"Error ignoring transaction: {str(e)}"
            )
    
    async def find_potential_matches(
        self, 
        company_id: str,
        bank_transaction_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Find potential QuickBooks transactions that could match a bank transaction"""
        try:
            bank_transaction = await self._get_bank_transaction(bank_transaction_id, company_id)
            if not bank_transaction:
                return []
            
            # Search for potential matches based on amount and date
            date_range_start = bank_transaction.transaction_date - timedelta(days=5)
            date_range_end = bank_transaction.transaction_date + timedelta(days=5)
            
            # Search for transactions with similar amounts
            amount_tolerance = abs(bank_transaction.amount) * 0.05  # 5% tolerance
            min_amount = bank_transaction.amount - amount_tolerance
            max_amount = bank_transaction.amount + amount_tolerance
            
            result = await self.db.execute(
                select(Transaction).where(
                    and_(
                        Transaction.company_id == company_id,
                        Transaction.transaction_date >= date_range_start,
                        Transaction.transaction_date <= date_range_end,
                        Transaction.total_amount >= min_amount,
                        Transaction.total_amount <= max_amount
                    )
                ).limit(limit)
            )
            
            qb_transactions = result.scalars().all()
            
            # Calculate match scores
            matches = []
            for qb_transaction in qb_transactions:
                score = self._calculate_match_score(bank_transaction, qb_transaction)
                if score > 0.5:  # Only include matches with score > 50%
                    matches.append({
                        "transaction_id": qb_transaction.transaction_id,
                        "transaction_number": qb_transaction.transaction_number,
                        "transaction_date": qb_transaction.transaction_date.isoformat(),
                        "total_amount": float(qb_transaction.total_amount),
                        "description": qb_transaction.memo,
                        "match_score": score,
                        "match_reasons": self._get_match_reasons(bank_transaction, qb_transaction)
                    })
            
            # Sort by match score
            matches.sort(key=lambda x: x["match_score"], reverse=True)
            
            return matches
            
        except Exception as e:
            logger.error(f"Error finding potential matches: {e}")
            return []
    
    async def apply_rules_to_transaction(
        self, 
        company_id: str,
        bank_transaction_id: str
    ) -> Dict[str, Any]:
        """Apply bank rules to categorize/match a transaction"""
        try:
            bank_transaction = await self._get_bank_transaction(bank_transaction_id, company_id)
            if not bank_transaction:
                return {"success": False, "message": "Transaction not found"}
            
            # Get all active rules for the company
            result = await self.db.execute(
                select(BankRule).where(
                    and_(
                        BankRule.company_id == company_id,
                        BankRule.is_active == True
                    )
                ).order_by(desc(BankRule.priority))
            )
            
            rules = result.scalars().all()
            
            applied_rules = []
            for rule in rules:
                if self._evaluate_rule_conditions(bank_transaction, rule):
                    # Apply rule actions
                    actions_applied = await self._apply_rule_actions(bank_transaction, rule)
                    applied_rules.append({
                        "rule_id": rule.rule_id,
                        "rule_name": rule.rule_name,
                        "actions_applied": actions_applied
                    })
                    
                    # Stop after first matching rule (unless rule says to continue)
                    if not rule.actions.get("continue_processing", False):
                        break
            
            if applied_rules:
                await self.db.commit()
                logger.info(f"Applied {len(applied_rules)} rules to transaction {bank_transaction_id}")
            
            return {
                "success": True,
                "applied_rules": applied_rules,
                "transaction_status": bank_transaction.status.value
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error applying rules: {e}")
            return {"success": False, "message": str(e)}
    
    def _evaluate_rule_conditions(self, transaction: BankTransaction, rule: BankRule) -> bool:
        """Evaluate if a transaction matches rule conditions"""
        try:
            conditions = rule.conditions
            if not isinstance(conditions, list):
                return False
            
            for condition in conditions:
                if not self._evaluate_single_condition(transaction, condition):
                    return False  # All conditions must match (AND logic)
            
            return True
            
        except Exception as e:
            logger.error(f"Error evaluating rule conditions: {e}")
            return False
    
    def _evaluate_single_condition(self, transaction: BankTransaction, condition: Dict[str, Any]) -> bool:
        """Evaluate a single rule condition"""
        try:
            field = condition.get("field")
            operator = condition.get("operator")
            value = condition.get("value")
            case_sensitive = condition.get("case_sensitive", False)
            
            # Get transaction field value
            transaction_value = getattr(transaction, field, None)
            if transaction_value is None:
                return False
            
            # Apply case sensitivity
            if isinstance(transaction_value, str) and not case_sensitive:
                transaction_value = transaction_value.lower()
            if isinstance(value, str) and not case_sensitive:
                value = value.lower()
            
            # Evaluate based on operator
            if operator == "contains":
                return value in transaction_value
            elif operator == "equals":
                return transaction_value == value
            elif operator == "starts_with":
                return transaction_value.startswith(value)
            elif operator == "ends_with":
                return transaction_value.endswith(value)
            elif operator == "greater_than":
                return float(transaction_value) > float(value)
            elif operator == "less_than":
                return float(transaction_value) < float(value)
            elif operator == "greater_equal":
                return float(transaction_value) >= float(value)
            elif operator == "less_equal":
                return float(transaction_value) <= float(value)
            elif operator == "regex":
                pattern = re.compile(value, re.IGNORECASE if not case_sensitive else 0)
                return bool(pattern.search(transaction_value))
            else:
                return False
                
        except Exception as e:
            logger.error(f"Error evaluating condition: {e}")
            return False
    
    async def _apply_rule_actions(self, transaction: BankTransaction, rule: BankRule) -> List[str]:
        """Apply rule actions to a transaction"""
        actions_applied = []
        
        try:
            actions = rule.actions
            if not isinstance(actions, list):
                return actions_applied
            
            for action in actions:
                action_type = action.get("action_type")
                parameters = action.get("parameters", {})
                
                if action_type == "categorize":
                    transaction.category = parameters.get("category")
                    actions_applied.append(f"Set category to '{transaction.category}'")
                
                elif action_type == "set_merchant":
                    transaction.merchant_name = parameters.get("merchant_name")
                    actions_applied.append(f"Set merchant to '{transaction.merchant_name}'")
                
                elif action_type == "ignore":
                    transaction.status = TransactionStatusEnum.IGNORED
                    actions_applied.append("Marked as ignored")
                
                elif action_type == "auto_match":
                    # Try to find and match with QuickBooks transaction
                    match_criteria = parameters.get("match_criteria", {})
                    # Implementation for auto-matching would go here
                    actions_applied.append("Auto-match attempted")
        
        except Exception as e:
            logger.error(f"Error applying rule actions: {e}")
        
        return actions_applied
    
    def _validate_transaction_match(self, bank_transaction: BankTransaction, qb_transaction: Transaction) -> bool:
        """Validate if two transactions can be matched"""
        # Check amount match (within 1% tolerance)
        amount_tolerance = abs(float(bank_transaction.amount)) * 0.01
        amount_diff = abs(float(bank_transaction.amount) - float(qb_transaction.total_amount))
        
        return amount_diff <= amount_tolerance
    
    def _calculate_match_score(self, bank_transaction: BankTransaction, qb_transaction: Transaction) -> float:
        """Calculate match score between bank and QuickBooks transactions"""
        score = 0.0
        
        # Amount match (40% weight)
        amount_diff = abs(float(bank_transaction.amount) - float(qb_transaction.total_amount))
        max_amount = max(abs(float(bank_transaction.amount)), abs(float(qb_transaction.total_amount)))
        if max_amount > 0:
            amount_score = max(0, 1 - (amount_diff / max_amount))
            score += amount_score * 0.4
        
        # Date match (30% weight)
        date_diff = abs((bank_transaction.transaction_date - qb_transaction.transaction_date).days)
        date_score = max(0, 1 - (date_diff / 10))  # 10 day tolerance
        score += date_score * 0.3
        
        # Description similarity (30% weight)
        if bank_transaction.description and qb_transaction.memo:
            desc_score = self._calculate_text_similarity(
                bank_transaction.description, qb_transaction.memo
            )
            score += desc_score * 0.3
        
        return score
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two text strings"""
        if not text1 or not text2:
            return 0.0
        
        # Simple word-based similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _get_match_reasons(self, bank_transaction: BankTransaction, qb_transaction: Transaction) -> List[str]:
        """Get list of reasons why transactions might match"""
        reasons = []
        
        # Amount match
        amount_diff = abs(float(bank_transaction.amount) - float(qb_transaction.total_amount))
        if amount_diff < 0.01:
            reasons.append("Exact amount match")
        elif amount_diff < abs(float(bank_transaction.amount)) * 0.05:
            reasons.append("Similar amount")
        
        # Date match
        date_diff = abs((bank_transaction.transaction_date - qb_transaction.transaction_date).days)
        if date_diff == 0:
            reasons.append("Same date")
        elif date_diff <= 2:
            reasons.append("Close date")
        
        # Description similarity
        if bank_transaction.description and qb_transaction.memo:
            similarity = self._calculate_text_similarity(
                bank_transaction.description, qb_transaction.memo
            )
            if similarity > 0.7:
                reasons.append("Similar description")
        
        return reasons
    
    async def _get_bank_transaction(self, bank_transaction_id: str, company_id: str) -> Optional[BankTransaction]:
        """Get bank transaction by ID"""
        from services.banking_service import BankingService
        banking_service = BankingService(self.db)
        return await banking_service.get_bank_transaction(bank_transaction_id, company_id)
    
    async def _get_qb_transaction(self, transaction_id: str, company_id: str) -> Optional[Transaction]:
        """Get QuickBooks transaction by ID"""
        try:
            result = await self.db.execute(
                select(Transaction).where(
                    and_(
                        Transaction.transaction_id == transaction_id,
                        Transaction.company_id == company_id
                    )
                )
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting QB transaction: {e}")
            return None
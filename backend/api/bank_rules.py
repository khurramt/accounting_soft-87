from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging
import uuid

from database.connection import get_async_db
from services.auth_service import get_current_user
from models.user import User
from models.banking import BankRule
from schemas.banking_schemas import (
    BankRuleCreate, BankRuleUpdate, BankRuleResponse, BankRuleListResponse
)

router = APIRouter(prefix="/api", tags=["bank-rules"])
logger = logging.getLogger(__name__)


class BankRuleService:
    """Service for managing bank rules"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_bank_rule(
        self, 
        company_id: str, 
        rule_data: BankRuleCreate,
        user_id: str
    ) -> BankRule:
        """Create a new bank rule"""
        try:
            rule = BankRule(
                rule_id=str(uuid.uuid4()),
                company_id=company_id,
                created_by=user_id,
                **rule_data.dict()
            )
            
            self.db.add(rule)
            await self.db.commit()
            await self.db.refresh(rule)
            
            logger.info(f"Created bank rule {rule.rule_id} for company {company_id}")
            return rule
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating bank rule: {e}")
            raise
    
    async def get_bank_rules(
        self, 
        company_id: str, 
        skip: int = 0, 
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[BankRule]:
        """Get bank rules for a company"""
        try:
            from sqlalchemy import select, and_, desc
            
            query = select(BankRule).where(
                BankRule.company_id == company_id
            )
            
            if is_active is not None:
                query = query.where(BankRule.is_active == is_active)
            
            query = query.offset(skip).limit(limit).order_by(desc(BankRule.priority), desc(BankRule.created_at))
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Error getting bank rules: {e}")
            raise
    
    async def get_bank_rule(self, rule_id: str, company_id: str) -> Optional[BankRule]:
        """Get a specific bank rule"""
        try:
            from sqlalchemy import select, and_
            
            result = await self.db.execute(
                select(BankRule).where(
                    and_(
                        BankRule.rule_id == rule_id,
                        BankRule.company_id == company_id
                    )
                )
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting bank rule: {e}")
            raise
    
    async def update_bank_rule(
        self, 
        rule_id: str, 
        company_id: str, 
        rule_data: BankRuleUpdate,
        user_id: str
    ) -> Optional[BankRule]:
        """Update a bank rule"""
        try:
            from datetime import datetime
            
            rule = await self.get_bank_rule(rule_id, company_id)
            if not rule:
                return None
            
            # Update fields
            for field, value in rule_data.dict(exclude_unset=True).items():
                setattr(rule, field, value)
            
            rule.updated_at = datetime.utcnow()
            await self.db.commit()
            await self.db.refresh(rule)
            
            logger.info(f"Updated bank rule {rule_id}")
            return rule
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating bank rule: {e}")
            raise
    
    async def delete_bank_rule(self, rule_id: str, company_id: str, user_id: str) -> bool:
        """Delete a bank rule (soft delete)"""
        try:
            from datetime import datetime
            
            rule = await self.get_bank_rule(rule_id, company_id)
            if not rule:
                return False
            
            rule.is_active = False
            rule.updated_at = datetime.utcnow()
            await self.db.commit()
            
            logger.info(f"Deleted bank rule {rule_id}")
            return True
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting bank rule: {e}")
            raise


# Bank Rule Endpoints
@router.get("/companies/{company_id}/bank-rules", response_model=BankRuleListResponse)
async def get_bank_rules(
    company_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get bank rules for a company"""
    try:
        rule_service = BankRuleService(db)
        rules = await rule_service.get_bank_rules(
            company_id, skip, limit, is_active
        )
        
        # Calculate total for pagination
        total_rules = await rule_service.get_bank_rules(company_id, 0, 9999, is_active)
        total = len(total_rules)
        
        return BankRuleListResponse(
            rules=rules,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            total_pages=(total + limit - 1) // limit
        )
        
    except Exception as e:
        logger.error(f"Error getting bank rules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/companies/{company_id}/bank-rules", response_model=BankRuleResponse)
async def create_bank_rule(
    company_id: str,
    rule_data: BankRuleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create a new bank rule"""
    try:
        rule_service = BankRuleService(db)
        rule = await rule_service.create_bank_rule(
            company_id, rule_data, current_user.user_id
        )
        return rule
        
    except Exception as e:
        logger.error(f"Error creating bank rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/companies/{company_id}/bank-rules/{rule_id}", response_model=BankRuleResponse)
async def get_bank_rule(
    company_id: str,
    rule_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get a specific bank rule"""
    try:
        rule_service = BankRuleService(db)
        rule = await rule_service.get_bank_rule(rule_id, company_id)
        
        if not rule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank rule not found"
            )
        
        return rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting bank rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/companies/{company_id}/bank-rules/{rule_id}", response_model=BankRuleResponse)
async def update_bank_rule(
    company_id: str,
    rule_id: str,
    rule_data: BankRuleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update a bank rule"""
    try:
        rule_service = BankRuleService(db)
        rule = await rule_service.update_bank_rule(
            rule_id, company_id, rule_data, current_user.user_id
        )
        
        if not rule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank rule not found"
            )
        
        return rule
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating bank rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/companies/{company_id}/bank-rules/{rule_id}")
async def delete_bank_rule(
    company_id: str,
    rule_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete a bank rule"""
    try:
        rule_service = BankRuleService(db)
        success = await rule_service.delete_bank_rule(
            rule_id, company_id, current_user.user_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank rule not found"
            )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Bank rule deleted successfully"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting bank rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
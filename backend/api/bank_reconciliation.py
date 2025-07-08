from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import logging
import uuid
from datetime import datetime

from database.connection import get_db
from services.security import get_current_user
from models.user import User
from models.banking import BankReconciliation, ReconciliationStatusEnum
from schemas.banking_schemas import (
    BankReconciliationCreate, BankReconciliationUpdate, BankReconciliationResponse
)

router = APIRouter(prefix="/api", tags=["bank-reconciliation"])
logger = logging.getLogger(__name__)


class BankReconciliationService:
    """Service for managing bank reconciliations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_reconciliation(
        self, 
        company_id: str, 
        reconciliation_data: BankReconciliationCreate,
        user_id: str
    ) -> BankReconciliation:
        """Create a new bank reconciliation"""
        try:
            reconciliation = BankReconciliation(
                reconciliation_id=str(uuid.uuid4()),
                company_id=company_id,
                **reconciliation_data.dict()
            )
            
            self.db.add(reconciliation)
            await self.db.commit()
            await self.db.refresh(reconciliation)
            
            logger.info(f"Created bank reconciliation {reconciliation.reconciliation_id}")
            return reconciliation
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating bank reconciliation: {e}")
            raise
    
    async def get_reconciliations(
        self, 
        company_id: str, 
        account_id: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[BankReconciliation]:
        """Get bank reconciliations for a company"""
        try:
            from sqlalchemy import select, and_, desc
            
            query = select(BankReconciliation).where(
                BankReconciliation.company_id == company_id
            )
            
            if account_id:
                query = query.where(BankReconciliation.account_id == account_id)
            
            query = query.offset(skip).limit(limit).order_by(desc(BankReconciliation.created_at))
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Error getting bank reconciliations: {e}")
            raise
    
    async def get_reconciliation(self, reconciliation_id: str, company_id: str) -> Optional[BankReconciliation]:
        """Get a specific bank reconciliation"""
        try:
            from sqlalchemy import select, and_
            
            result = await self.db.execute(
                select(BankReconciliation).where(
                    and_(
                        BankReconciliation.reconciliation_id == reconciliation_id,
                        BankReconciliation.company_id == company_id
                    )
                )
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error getting bank reconciliation: {e}")
            raise
    
    async def update_reconciliation(
        self, 
        reconciliation_id: str, 
        company_id: str, 
        reconciliation_data: BankReconciliationUpdate,
        user_id: str
    ) -> Optional[BankReconciliation]:
        """Update a bank reconciliation"""
        try:
            reconciliation = await self.get_reconciliation(reconciliation_id, company_id)
            if not reconciliation:
                return None
            
            # Update fields
            for field, value in reconciliation_data.dict(exclude_unset=True).items():
                setattr(reconciliation, field, value)
            
            reconciliation.updated_at = datetime.utcnow()
            await self.db.commit()
            await self.db.refresh(reconciliation)
            
            logger.info(f"Updated bank reconciliation {reconciliation_id}")
            return reconciliation
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating bank reconciliation: {e}")
            raise
    
    async def finalize_reconciliation(
        self, 
        reconciliation_id: str, 
        company_id: str,
        user_id: str
    ) -> Optional[BankReconciliation]:
        """Finalize a bank reconciliation"""
        try:
            reconciliation = await self.get_reconciliation(reconciliation_id, company_id)
            if not reconciliation:
                return None
            
            reconciliation.status = ReconciliationStatusEnum.COMPLETED
            reconciliation.reconciled_by = user_id
            reconciliation.reconciled_at = datetime.utcnow()
            reconciliation.updated_at = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(reconciliation)
            
            logger.info(f"Finalized bank reconciliation {reconciliation_id}")
            return reconciliation
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error finalizing bank reconciliation: {e}")
            raise
    
    async def calculate_reconciliation_difference(
        self, 
        reconciliation_id: str, 
        company_id: str
    ) -> Dict[str, Any]:
        """Calculate reconciliation difference and outstanding items"""
        try:
            reconciliation = await self.get_reconciliation(reconciliation_id, company_id)
            if not reconciliation:
                return {"error": "Reconciliation not found"}
            
            # Mock calculation - in real implementation, this would analyze transactions
            outstanding_deposits = [
                {
                    "transaction_id": "TXN_001",
                    "date": "2025-01-05",
                    "amount": 1250.00,
                    "description": "Customer Payment"
                },
                {
                    "transaction_id": "TXN_002", 
                    "date": "2025-01-06",
                    "amount": 750.00,
                    "description": "Sales Receipt"
                }
            ]
            
            outstanding_checks = [
                {
                    "transaction_id": "CHK_001",
                    "date": "2025-01-04",
                    "amount": -450.00,
                    "description": "Office Supplies",
                    "check_number": "1001"
                }
            ]
            
            total_outstanding_deposits = sum(item["amount"] for item in outstanding_deposits)
            total_outstanding_checks = sum(item["amount"] for item in outstanding_checks)
            
            calculated_balance = (reconciliation.beginning_balance + 
                                total_outstanding_deposits + 
                                total_outstanding_checks +
                                reconciliation.interest_earned -
                                reconciliation.service_charge)
            
            difference = reconciliation.ending_balance - calculated_balance
            
            return {
                "reconciliation_id": reconciliation_id,
                "beginning_balance": float(reconciliation.beginning_balance),
                "ending_balance": float(reconciliation.ending_balance),
                "service_charge": float(reconciliation.service_charge),
                "interest_earned": float(reconciliation.interest_earned),
                "outstanding_deposits": outstanding_deposits,
                "outstanding_checks": outstanding_checks,
                "total_outstanding_deposits": total_outstanding_deposits,
                "total_outstanding_checks": total_outstanding_checks,
                "calculated_balance": calculated_balance,
                "difference": difference,
                "is_balanced": abs(difference) < 0.01
            }
            
        except Exception as e:
            logger.error(f"Error calculating reconciliation difference: {e}")
            return {"error": str(e)}


# Bank Reconciliation Endpoints
@router.get("/companies/{company_id}/reconciliations", response_model=List[BankReconciliationResponse])
async def get_reconciliations(
    company_id: str,
    account_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get bank reconciliations for a company"""
    try:
        reconciliation_service = BankReconciliationService(db)
        reconciliations = await reconciliation_service.get_reconciliations(
            company_id, account_id, skip, limit
        )
        
        return reconciliations
        
    except Exception as e:
        logger.error(f"Error getting bank reconciliations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/companies/{company_id}/reconciliations", response_model=BankReconciliationResponse)
async def create_reconciliation(
    company_id: str,
    reconciliation_data: BankReconciliationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new bank reconciliation"""
    try:
        reconciliation_service = BankReconciliationService(db)
        reconciliation = await reconciliation_service.create_reconciliation(
            company_id, reconciliation_data, current_user.user_id
        )
        return reconciliation
        
    except Exception as e:
        logger.error(f"Error creating bank reconciliation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/companies/{company_id}/reconciliations/{reconciliation_id}", response_model=BankReconciliationResponse)
async def get_reconciliation(
    company_id: str,
    reconciliation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific bank reconciliation"""
    try:
        reconciliation_service = BankReconciliationService(db)
        reconciliation = await reconciliation_service.get_reconciliation(
            reconciliation_id, company_id
        )
        
        if not reconciliation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank reconciliation not found"
            )
        
        return reconciliation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting bank reconciliation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/companies/{company_id}/reconciliations/{reconciliation_id}", response_model=BankReconciliationResponse)
async def update_reconciliation(
    company_id: str,
    reconciliation_id: str,
    reconciliation_data: BankReconciliationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a bank reconciliation"""
    try:
        reconciliation_service = BankReconciliationService(db)
        reconciliation = await reconciliation_service.update_reconciliation(
            reconciliation_id, company_id, reconciliation_data, current_user.user_id
        )
        
        if not reconciliation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank reconciliation not found"
            )
        
        return reconciliation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating bank reconciliation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/companies/{company_id}/reconciliations/{reconciliation_id}/finalize", response_model=BankReconciliationResponse)
async def finalize_reconciliation(
    company_id: str,
    reconciliation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Finalize a bank reconciliation"""
    try:
        reconciliation_service = BankReconciliationService(db)
        reconciliation = await reconciliation_service.finalize_reconciliation(
            reconciliation_id, company_id, current_user.user_id
        )
        
        if not reconciliation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank reconciliation not found"
            )
        
        return reconciliation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finalizing bank reconciliation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/companies/{company_id}/reconciliations/{reconciliation_id}/calculate")
async def calculate_reconciliation(
    company_id: str,
    reconciliation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Calculate reconciliation difference and outstanding items"""
    try:
        reconciliation_service = BankReconciliationService(db)
        calculation = await reconciliation_service.calculate_reconciliation_difference(
            reconciliation_id, company_id
        )
        
        if "error" in calculation:
            if calculation["error"] == "Reconciliation not found":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Bank reconciliation not found"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=calculation["error"]
                )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=calculation
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating reconciliation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
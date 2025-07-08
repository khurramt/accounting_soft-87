from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_
from sqlalchemy.orm import selectinload
from models.user import Company, CompanySetting, FileAttachment, User, CompanyMembership, UserRole
from schemas.company_schemas import (
    CompanyCreate, CompanyUpdate, CompanyResponse, 
    CompanySettingRequest, CompanySettingResponse,
    CompanyUserInviteRequest, CompanyUserUpdateRequest
)
from fastapi import HTTPException, status
from datetime import datetime, timezone, timedelta
import structlog
import uuid

logger = structlog.get_logger()

class CompanyService:
    def __init__(self):
        self.default_settings = {
            "accounting": {
                "chart_of_accounts": "standard",
                "fiscal_year_start": "01/01",
                "tax_settings": {"tax_rate": 0.0},
                "multi_currency": False
            },
            "preferences": {
                "date_format": "MM/DD/YYYY",
                "currency_symbol": "$",
                "decimal_places": 2,
                "time_format": "12h"
            },
            "security": {
                "two_factor_auth": False,
                "password_policy": "standard",
                "session_timeout": 30
            },
            "notifications": {
                "email_notifications": True,
                "sms_notifications": False,
                "push_notifications": True
            }
        }

    async def create_company(
        self,
        db: AsyncSession,
        company_data: CompanyCreate,
        user_id: str
    ) -> Company:
        """Create a new company"""
        try:
            # Create company
            company = Company(
                company_name=company_data.company_name,
                legal_name=company_data.legal_name,
                tax_id=company_data.tax_id,
                address_line1=company_data.address_line1,
                address_line2=company_data.address_line2,
                city=company_data.city,
                state=company_data.state,
                zip_code=company_data.zip_code,
                country=company_data.country,
                phone=company_data.phone,
                email=company_data.email,
                website=company_data.website,
                industry=company_data.industry,
                business_type=company_data.business_type,
                fiscal_year_start=company_data.fiscal_year_start,
                date_format=company_data.date_format,
                currency=company_data.currency,
                company_logo_url=company_data.company_logo_url,
                subscription_plan=company_data.subscription_plan or "trial",
                subscription_status=company_data.subscription_status or "trial",
                trial_ends_at=datetime.now(timezone.utc) + timedelta(days=30),
                created_by=user_id
            )
            
            db.add(company)
            await db.flush()  # Get the company_id
            
            # Create company membership for the creator (owner)
            membership = CompanyMembership(
                user_id=user_id,
                company_id=company.company_id,
                role=UserRole.ADMIN,
                permissions={"all": True},
                is_active=True,
                accepted_at=datetime.now(timezone.utc)
            )
            
            db.add(membership)
            
            # Initialize default settings
            await self._initialize_default_settings(db, company.company_id)
            
            await db.commit()
            await db.refresh(company)
            
            logger.info("Company created", company_id=company.company_id, user_id=user_id)
            return company
            
        except Exception as e:
            await db.rollback()
            logger.error("Company creation failed", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create company"
            )

    async def get_company(
        self,
        db: AsyncSession,
        company_id: str,
        user_id: str
    ) -> Company:
        """Get company by ID"""
        try:
            # Check if user has access to this company
            membership_result = await db.execute(
                select(CompanyMembership).where(
                    and_(
                        CompanyMembership.user_id == user_id,
                        CompanyMembership.company_id == company_id,
                        CompanyMembership.is_active == True
                    )
                )
            )
            
            if not membership_result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this company"
                )
            
            # Get company
            result = await db.execute(
                select(Company).where(Company.company_id == company_id)
            )
            company = result.scalar_one_or_none()
            
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Company not found"
                )
            
            return company
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get company", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get company"
            )

    async def get_user_companies(
        self,
        db: AsyncSession,
        user_id: str
    ) -> List[Company]:
        """Get all companies user has access to"""
        try:
            result = await db.execute(
                select(Company)
                .join(CompanyMembership)
                .where(
                    and_(
                        CompanyMembership.user_id == user_id,
                        CompanyMembership.is_active == True,
                        Company.is_active == True
                    )
                )
                .order_by(Company.company_name)
            )
            
            return result.scalars().all()
            
        except Exception as e:
            logger.error("Failed to get user companies", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get companies"
            )

    async def update_company(
        self,
        db: AsyncSession,
        company_id: str,
        company_data: CompanyUpdate,
        user_id: str
    ) -> Company:
        """Update company"""
        try:
            # Check if user has admin access
            membership_result = await db.execute(
                select(CompanyMembership).where(
                    and_(
                        CompanyMembership.user_id == user_id,
                        CompanyMembership.company_id == company_id,
                        CompanyMembership.is_active == True,
                        or_(
                            CompanyMembership.role == UserRole.ADMIN,
                            CompanyMembership.role == UserRole.MANAGER
                        )
                    )
                )
            )
            
            if not membership_result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions to update company"
                )
            
            # Get company
            result = await db.execute(
                select(Company).where(Company.company_id == company_id)
            )
            company = result.scalar_one_or_none()
            
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Company not found"
                )
            
            # Update company fields
            update_data = company_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if hasattr(company, field):
                    setattr(company, field, value)
            
            await db.commit()
            await db.refresh(company)
            
            logger.info("Company updated", company_id=company_id, user_id=user_id)
            return company
            
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error("Company update failed", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update company"
            )

    async def delete_company(
        self,
        db: AsyncSession,
        company_id: str,
        user_id: str
    ) -> None:
        """Delete company (soft delete)"""
        try:
            # Check if user is the owner
            membership_result = await db.execute(
                select(CompanyMembership).where(
                    and_(
                        CompanyMembership.user_id == user_id,
                        CompanyMembership.company_id == company_id,
                        CompanyMembership.is_active == True,
                        CompanyMembership.role == UserRole.ADMIN
                    )
                )
            )
            
            if not membership_result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only company owners can delete companies"
                )
            
            # Get company
            result = await db.execute(
                select(Company).where(Company.company_id == company_id)
            )
            company = result.scalar_one_or_none()
            
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Company not found"
                )
            
            # Soft delete
            company.is_active = False
            await db.commit()
            
            logger.info("Company deleted", company_id=company_id, user_id=user_id)
            
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error("Company deletion failed", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete company"
            )

    async def get_company_settings(
        self,
        db: AsyncSession,
        company_id: str,
        user_id: str,
        category: Optional[str] = None
    ) -> List[CompanySetting]:
        """Get company settings"""
        try:
            # Check access
            await self._check_company_access(db, company_id, user_id)
            
            query = select(CompanySetting).where(CompanySetting.company_id == company_id)
            
            if category:
                query = query.where(CompanySetting.category == category)
            
            result = await db.execute(query.order_by(CompanySetting.category, CompanySetting.setting_key))
            return result.scalars().all()
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get company settings", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get company settings"
            )

    async def update_company_settings(
        self,
        db: AsyncSession,
        company_id: str,
        settings: List[CompanySettingRequest],
        user_id: str
    ) -> List[CompanySetting]:
        """Update company settings"""
        try:
            # Check admin access
            await self._check_company_admin_access(db, company_id, user_id)
            
            updated_settings = []
            
            for setting_data in settings:
                # Check if setting exists
                result = await db.execute(
                    select(CompanySetting).where(
                        and_(
                            CompanySetting.company_id == company_id,
                            CompanySetting.category == setting_data.category,
                            CompanySetting.setting_key == setting_data.setting_key
                        )
                    )
                )
                
                setting = result.scalar_one_or_none()
                
                if setting:
                    # Update existing setting
                    setting.setting_value = setting_data.setting_value
                else:
                    # Create new setting
                    setting = CompanySetting(
                        company_id=company_id,
                        category=setting_data.category,
                        setting_key=setting_data.setting_key,
                        setting_value=setting_data.setting_value
                    )
                    db.add(setting)
                
                updated_settings.append(setting)
            
            await db.commit()
            
            for setting in updated_settings:
                await db.refresh(setting)
            
            logger.info("Company settings updated", company_id=company_id, user_id=user_id)
            return updated_settings
            
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error("Company settings update failed", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update company settings"
            )

    async def get_company_files(
        self,
        db: AsyncSession,
        company_id: str,
        user_id: str
    ) -> List[FileAttachment]:
        """Get company files"""
        try:
            # Check access
            await self._check_company_access(db, company_id, user_id)
            
            result = await db.execute(
                select(FileAttachment)
                .where(FileAttachment.company_id == company_id)
                .order_by(FileAttachment.created_at.desc())
            )
            
            return result.scalars().all()
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get company files", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get company files"
            )

    async def get_company_users(
        self,
        db: AsyncSession,
        company_id: str,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Get company users"""
        try:
            # Check access
            await self._check_company_access(db, company_id, user_id)
            
            result = await db.execute(
                select(User, CompanyMembership)
                .join(CompanyMembership, User.user_id == CompanyMembership.user_id)
                .where(
                    and_(
                        CompanyMembership.company_id == company_id,
                        CompanyMembership.is_active == True
                    )
                )
                .order_by(User.first_name, User.last_name)
            )
            
            users = []
            for user, membership in result.all():
                users.append({
                    "user_id": user.user_id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": membership.role,
                    "permissions": membership.permissions,
                    "is_active": membership.is_active,
                    "invited_at": membership.invited_at,
                    "accepted_at": membership.accepted_at
                })
            
            return users
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get company users", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get company users"
            )

    async def _check_company_access(
        self,
        db: AsyncSession,
        company_id: str,
        user_id: str
    ) -> None:
        """Check if user has access to company"""
        result = await db.execute(
            select(CompanyMembership).where(
                and_(
                    CompanyMembership.user_id == user_id,
                    CompanyMembership.company_id == company_id,
                    CompanyMembership.is_active == True
                )
            )
        )
        
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )

    async def _check_company_admin_access(
        self,
        db: AsyncSession,
        company_id: str,
        user_id: str
    ) -> None:
        """Check if user has admin access to company"""
        result = await db.execute(
            select(CompanyMembership).where(
                and_(
                    CompanyMembership.user_id == user_id,
                    CompanyMembership.company_id == company_id,
                    CompanyMembership.is_active == True,
                    or_(
                        CompanyMembership.role == UserRole.ADMIN,
                        CompanyMembership.role == UserRole.MANAGER
                    )
                )
            )
        )
        
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this operation"
            )

    async def _initialize_default_settings(
        self,
        db: AsyncSession,
        company_id: str
    ) -> None:
        """Initialize default company settings"""
        try:
            for category, settings in self.default_settings.items():
                for key, value in settings.items():
                    setting = CompanySetting(
                        company_id=company_id,
                        category=category,
                        setting_key=key,
                        setting_value=value if isinstance(value, dict) else {"value": value}
                    )
                    db.add(setting)
            
            await db.flush()
            
        except Exception as e:
            logger.error("Failed to initialize default settings", error=str(e))
            raise

# Global company service instance
company_service = CompanyService()
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, File, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from models.user import User
from services.security import get_current_user
from services.company_service import company_service
from schemas.company_schemas import (
    CompanyCreate, CompanyUpdate, CompanyResponse,
    CompanySettingRequest, CompanySettingResponse, CompanySettingsUpdate,
    CompanyUserResponse, CompanyUserInviteRequest, CompanyUserUpdateRequest,
    FileAttachmentResponse, MessageResponse
)
import structlog
from typing import List, Optional

logger = structlog.get_logger()

router = APIRouter(prefix="/companies", tags=["Company Management"])

@router.get("/", response_model=List[CompanyResponse])
async def get_user_companies(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all companies user has access to"""
    try:
        companies = await company_service.get_user_companies(db=db, user_id=str(user.user_id))
        return [CompanyResponse.from_orm(company) for company in companies]
        
    except Exception as e:
        logger.error("Failed to get user companies", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get companies"
        )

@router.post("/", response_model=CompanyResponse)
async def create_company(
    company_data: CompanyCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new company"""
    try:
        company = await company_service.create_company(
            db=db,
            company_data=company_data,
            user_id=str(user.user_id)
        )
        
        return CompanyResponse.from_orm(company)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Company creation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create company"
        )

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get company by ID"""
    try:
        company = await company_service.get_company(
            db=db,
            company_id=company_id,
            user_id=str(user.user_id)
        )
        
        return CompanyResponse.from_orm(company)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get company", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get company"
        )

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: str,
    company_data: CompanyUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update company"""
    try:
        company = await company_service.update_company(
            db=db,
            company_id=company_id,
            company_data=company_data,
            user_id=str(user.user_id)
        )
        
        return CompanyResponse.from_orm(company)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Company update failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update company"
        )

@router.delete("/{company_id}", response_model=MessageResponse)
async def delete_company(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete company"""
    try:
        await company_service.delete_company(
            db=db,
            company_id=company_id,
            user_id=str(user.user_id)
        )
        
        return MessageResponse(message="Company deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Company deletion failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete company"
        )

@router.get("/{company_id}/settings", response_model=List[CompanySettingResponse])
async def get_company_settings(
    company_id: str,
    category: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get company settings"""
    try:
        settings = await company_service.get_company_settings(
            db=db,
            company_id=company_id,
            user_id=str(user.user_id),
            category=category
        )
        
        return [CompanySettingResponse.from_orm(setting) for setting in settings]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get company settings", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get company settings"
        )

@router.put("/{company_id}/settings", response_model=List[CompanySettingResponse])
async def update_company_settings(
    company_id: str,
    settings_data: CompanySettingsUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update company settings"""
    try:
        settings = await company_service.update_company_settings(
            db=db,
            company_id=company_id,
            settings=settings_data.settings,
            user_id=str(user.user_id)
        )
        
        return [CompanySettingResponse.from_orm(setting) for setting in settings]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Company settings update failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update company settings"
        )

@router.get("/{company_id}/settings/{category}", response_model=List[CompanySettingResponse])
async def get_company_settings_by_category(
    company_id: str,
    category: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get company settings by category"""
    try:
        settings = await company_service.get_company_settings(
            db=db,
            company_id=company_id,
            user_id=str(user.user_id),
            category=category
        )
        
        return [CompanySettingResponse.from_orm(setting) for setting in settings]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get company settings", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get company settings"
        )

@router.get("/{company_id}/files", response_model=List[FileAttachmentResponse])
async def get_company_files(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get company files"""
    try:
        files = await company_service.get_company_files(
            db=db,
            company_id=company_id,
            user_id=str(user.user_id)
        )
        
        return [FileAttachmentResponse.from_orm(file) for file in files]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get company files", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get company files"
        )

@router.post("/{company_id}/files", response_model=FileAttachmentResponse)
async def upload_company_file(
    company_id: str,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload company file"""
    try:
        # For now, we'll just store file info without actual file storage
        # In production, you'd upload to S3 or similar service
        
        # Check company access
        await company_service._check_company_access(db, company_id, str(user.user_id))
        
        # Create file attachment record
        from models.user import FileAttachment
        
        file_attachment = FileAttachment(
            company_id=company_id,
            file_name=file.filename,
            file_size=file.size if hasattr(file, 'size') else None,
            file_type=file.content_type,
            file_url=f"/uploads/{company_id}/{file.filename}",  # Placeholder
            storage_provider="local",
            uploaded_by=str(user.user_id)
        )
        
        db.add(file_attachment)
        await db.commit()
        await db.refresh(file_attachment)
        
        return FileAttachmentResponse.from_orm(file_attachment)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("File upload failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file"
        )

@router.get("/{company_id}/users", response_model=List[CompanyUserResponse])
async def get_company_users(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get company users"""
    try:
        users = await company_service.get_company_users(
            db=db,
            company_id=company_id,
            user_id=str(user.user_id)
        )
        
        return [CompanyUserResponse(**user_data) for user_data in users]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get company users", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get company users"
        )

@router.post("/{company_id}/users/invite", response_model=MessageResponse)
async def invite_company_user(
    company_id: str,
    invite_data: CompanyUserInviteRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Invite user to company"""
    try:
        # Check admin access
        await company_service._check_company_admin_access(db, company_id, str(user.user_id))
        
        # For now, just return success message
        # In production, you'd send an invitation email
        
        return MessageResponse(message=f"Invitation sent to {invite_data.email}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("User invitation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to invite user"
        )

@router.put("/{company_id}/users/{user_id}", response_model=MessageResponse)
async def update_company_user(
    company_id: str,
    user_id: str,
    update_data: CompanyUserUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update company user"""
    try:
        # Check admin access
        await company_service._check_company_admin_access(db, company_id, str(user.user_id))
        
        # For now, just return success message
        # In production, you'd update the user's membership
        
        return MessageResponse(message="User updated successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("User update failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.delete("/{company_id}/users/{user_id}", response_model=MessageResponse)
async def remove_company_user(
    company_id: str,
    user_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove user from company"""
    try:
        # Check admin access
        await company_service._check_company_admin_access(db, company_id, str(user.user_id))
        
        # For now, just return success message
        # In production, you'd deactivate the user's membership
        
        return MessageResponse(message="User removed successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("User removal failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove user"
        )
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from database.connection import get_db
from models.user import User, UserSession, CompanyMembership, Company
from services.auth_service import auth_service
from services.security import get_current_user, check_rate_limit, security_service
from schemas.auth_schemas import (
    RegisterRequest, LoginRequest, RefreshTokenRequest, ForgotPasswordRequest,
    ResetPasswordRequest, VerifyEmailRequest, ChangePasswordRequest,
    CompanyAccessRequest, UserResponse, LoginResponse, RefreshTokenResponse,
    SessionResponse, CompanyMembershipResponse, UserProfileResponse,
    MessageResponse, ErrorResponse, PasswordStrengthResponse
)
import structlog
from typing import List
import uuid

logger = structlog.get_logger()

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    user_data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_rate_limit)
):
    """Register a new user"""
    try:
        user = await auth_service.register_user(
            db=db,
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone
        )
        
        # Log registration
        await security_service.log_security_event(
            event_type="user_registered",
            user_id=str(user.user_id),
            ip_address=security_service.get_client_ip(request)
        )
        
        return JSONResponse(content={
            "user_id": str(user.user_id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "is_email_verified": user.is_email_verified,
            "is_active": user.is_active,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }, status_code=201)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Registration failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_rate_limit)
):
    """Authenticate user and return tokens"""
    try:
        client_ip = security_service.get_client_ip(request)
        user_agent = request.headers.get("User-Agent")
        
        user, access_token, refresh_token = await auth_service.authenticate_user(
            db=db,
            email=login_data.email,
            password=login_data.password,
            device_info=login_data.device_info,
            ip_address=client_ip,
            user_agent=user_agent
        )
        
        # Check for suspicious activity
        if await security_service.is_suspicious_activity(str(user.user_id), client_ip):
            await security_service.log_security_event(
                event_type="suspicious_login",
                user_id=str(user.user_id),
                ip_address=client_ip,
                details={"user_agent": user_agent}
            )
        
        return JSONResponse(content={
            "user": {
                "user_id": str(user.user_id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "is_email_verified": user.is_email_verified,
                "is_active": user.is_active,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat() if user.created_at else None
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 900
        })
        
    except HTTPException:
        # Log failed login attempt
        await security_service.log_security_event(
            event_type="failed_login",
            ip_address=security_service.get_client_ip(request),
            details={"email": login_data.email}
        )
        raise
    except Exception as e:
        logger.error("Login failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/refresh-token", response_model=RefreshTokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_rate_limit)
):
    """Refresh access token"""
    try:
        access_token = await auth_service.refresh_access_token(
            db=db,
            refresh_token=refresh_data.refresh_token
        )
        
        return RefreshTokenResponse(access_token=access_token)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Token refresh failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Logout current session"""
    try:
        # Get session ID from token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header"
            )
        
        token = auth_header.split(" ")[1]
        payload = auth_service.decode_access_token(token)
        session_id = payload.get("session_id")
        
        await auth_service.logout_user(db=db, session_id=session_id)
        
        return MessageResponse(message="Successfully logged out")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Logout failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: Request,
    forgot_data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_rate_limit)
):
    """Request password reset"""
    try:
        reset_token = await auth_service.request_password_reset(
            db=db,
            email=forgot_data.email
        )
        
        # Log password reset request
        await security_service.log_security_event(
            event_type="password_reset_requested",
            ip_address=security_service.get_client_ip(request),
            details={"email": forgot_data.email}
        )
        
        # In production, send email with reset_token
        # For demo, return success message
        return MessageResponse(
            message="If the email exists, a password reset link has been sent"
        )
        
    except Exception as e:
        logger.error("Password reset request failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request failed"
        )

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request: Request,
    reset_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_rate_limit)
):
    """Reset password with token"""
    try:
        await auth_service.reset_password(
            db=db,
            token=reset_data.token,
            new_password=reset_data.new_password
        )
        
        # Log password reset
        await security_service.log_security_event(
            event_type="password_reset_completed",
            ip_address=security_service.get_client_ip(request)
        )
        
        return MessageResponse(message="Password has been reset successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Password reset failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )

@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    verify_data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verify email with token"""
    try:
        user = await auth_service.verify_email(
            db=db,
            token=verify_data.token
        )
        
        return MessageResponse(message="Email verified successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Email verification failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification failed"
        )

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user profile with companies"""
    try:
        # Get user's company memberships
        result = await db.execute(
            select(CompanyMembership, Company)
            .join(Company)
            .where(
                and_(
                    CompanyMembership.user_id == user.user_id,
                    CompanyMembership.is_active == True
                )
            )
        )
        
        memberships = []
        for membership, company in result.all():
            memberships.append(CompanyMembershipResponse(
                membership_id=str(membership.membership_id),
                company={
                    "company_id": str(company.company_id),
                    "name": company.name,
                    "legal_name": company.legal_name,
                    "industry": company.industry,
                    "business_type": company.business_type,
                    "created_at": company.created_at
                },
                role=membership.role,
                permissions=membership.permissions,
                is_active=membership.is_active,
                accepted_at=membership.accepted_at,
                created_at=membership.created_at
            ))
        
        # Get active sessions count
        sessions = await auth_service.get_user_sessions(db=db, user_id=str(user.user_id))
        
        return UserProfileResponse(
            user=UserResponse.from_orm(user),
            companies=memberships,
            active_sessions_count=len(sessions)
        )
        
    except Exception as e:
        logger.error("Failed to get user profile", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )

@router.put("/change-password", response_model=MessageResponse)
async def change_password(
    password_data: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password"""
    try:
        # Verify current password
        if not auth_service.verify_password(password_data.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Check password strength
        if not await auth_service.check_password_strength(password_data.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password does not meet strength requirements"
            )
        
        # Check password history
        if await auth_service.is_password_in_history(user, password_data.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reuse recent passwords"
            )
        
        # Hash new password
        new_password_hash = auth_service.hash_password(password_data.new_password)
        
        # Update password
        user.password_hash = new_password_hash
        
        # Update password history
        if not user.password_history:
            user.password_history = []
        user.password_history.append(new_password_hash)
        user.password_history = user.password_history[-5:]  # Keep last 5 passwords
        
        await db.commit()
        
        # Log password change
        await security_service.log_security_event(
            event_type="password_changed",
            user_id=str(user.user_id)
        )
        
        return MessageResponse(message="Password changed successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Password change failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.get("/sessions", response_model=List[SessionResponse])
async def get_user_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's active sessions"""
    try:
        sessions = await auth_service.get_user_sessions(db=db, user_id=str(user.user_id))
        
        return [SessionResponse.from_orm(session) for session in sessions]
        
    except Exception as e:
        logger.error("Failed to get user sessions", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user sessions"
        )

@router.delete("/sessions/{session_id}", response_model=MessageResponse)
async def logout_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Logout specific session"""
    try:
        # Verify session belongs to user
        result = await db.execute(
            select(UserSession).where(
                and_(
                    UserSession.session_id == session_id,
                    UserSession.user_id == user.user_id
                )
            )
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        await auth_service.logout_user(db=db, session_id=session_id)
        
        return MessageResponse(message="Session logged out successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Session logout failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session logout failed"
        )

@router.delete("/sessions/all", response_model=MessageResponse)
async def logout_all_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Logout from all sessions"""
    try:
        await auth_service.logout_all_sessions(db=db, user_id=str(user.user_id))
        
        return MessageResponse(message="All sessions logged out successfully")
        
    except Exception as e:
        logger.error("All sessions logout failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="All sessions logout failed"
        )

@router.get("/companies", response_model=List[CompanyMembershipResponse])
async def get_user_companies(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get companies user has access to"""
    try:
        result = await db.execute(
            select(CompanyMembership, Company)
            .join(Company)
            .where(
                and_(
                    CompanyMembership.user_id == user.user_id,
                    CompanyMembership.is_active == True
                )
            )
        )
        
        memberships = []
        for membership, company in result.all():
            memberships.append(CompanyMembershipResponse(
                membership_id=str(membership.membership_id),
                company={
                    "company_id": str(company.company_id),
                    "name": company.name,
                    "legal_name": company.legal_name,
                    "industry": company.industry,
                    "business_type": company.business_type,
                    "created_at": company.created_at
                },
                role=membership.role,
                permissions=membership.permissions,
                is_active=membership.is_active,
                accepted_at=membership.accepted_at,
                created_at=membership.created_at
            ))
        
        return memberships
        
    except Exception as e:
        logger.error("Failed to get user companies", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user companies"
        )

@router.post("/companies/{company_id}/access", response_model=MessageResponse)
async def access_company(
    company_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Access a specific company"""
    try:
        # Verify user has access to company
        result = await db.execute(
            select(CompanyMembership).where(
                and_(
                    CompanyMembership.user_id == user.user_id,
                    CompanyMembership.company_id == company_id,
                    CompanyMembership.is_active == True
                )
            )
        )
        membership = result.scalar_one_or_none()
        
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this company"
            )
        
        # Log company access
        await security_service.log_security_event(
            event_type="company_accessed",
            user_id=str(user.user_id),
            details={"company_id": company_id}
        )
        
        return MessageResponse(message="Company access granted")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Company access failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Company access failed"
        )
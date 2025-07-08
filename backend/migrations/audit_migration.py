#!/usr/bin/env python3
"""
Audit & Security Module Database Migration Script
Creates tables for audit logs, security logs, roles, user permissions, and security settings
"""

import sys
import os
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import asyncio
from sqlalchemy import text
from database.connection import engine

async def create_audit_tables():
    """Create audit and security tables"""
    
    # SQL for creating audit logs table
    audit_logs_sql = """
    CREATE TABLE IF NOT EXISTS audit_logs (
        audit_id VARCHAR(36) PRIMARY KEY,
        company_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        record_id VARCHAR(100) NOT NULL,
        action VARCHAR(20) NOT NULL,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        endpoint VARCHAR(255),
        request_method VARCHAR(10),
        change_reason VARCHAR(255),
        affected_fields JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(company_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """
    
    # SQL for creating security logs table
    security_logs_sql = """
    CREATE TABLE IF NOT EXISTS security_logs (
        log_id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        company_id VARCHAR(36),
        event_type VARCHAR(50) NOT NULL,
        success BOOLEAN DEFAULT TRUE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        endpoint VARCHAR(255),
        request_method VARCHAR(10),
        details JSON,
        risk_score INTEGER DEFAULT 0,
        threat_level VARCHAR(20) DEFAULT 'low',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (company_id) REFERENCES companies(company_id)
    );
    """
    
    # SQL for creating roles table
    roles_sql = """
    CREATE TABLE IF NOT EXISTS roles (
        role_id VARCHAR(36) PRIMARY KEY,
        company_id VARCHAR(36),
        role_name VARCHAR(100) NOT NULL,
        description TEXT,
        permissions JSON DEFAULT '{}',
        is_system_role BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        parent_role_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(company_id),
        FOREIGN KEY (parent_role_id) REFERENCES roles(role_id)
    );
    """
    
    # SQL for creating user permissions table
    user_permissions_sql = """
    CREATE TABLE IF NOT EXISTS user_permissions (
        permission_id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        company_id VARCHAR(36) NOT NULL,
        role_id VARCHAR(36),
        resource VARCHAR(100) NOT NULL,
        actions JSON DEFAULT '[]',
        conditions JSON,
        granted_by VARCHAR(36) NOT NULL,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (company_id) REFERENCES companies(company_id),
        FOREIGN KEY (role_id) REFERENCES roles(role_id),
        FOREIGN KEY (granted_by) REFERENCES users(user_id)
    );
    """
    
    # SQL for creating security settings table
    security_settings_sql = """
    CREATE TABLE IF NOT EXISTS security_settings (
        setting_id VARCHAR(36) PRIMARY KEY,
        company_id VARCHAR(36) NOT NULL,
        password_policy JSON DEFAULT '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_symbols": true, "password_history": 5}',
        session_settings JSON DEFAULT '{"timeout_minutes": 30, "max_concurrent_sessions": 3, "require_2fa": false}',
        access_control JSON DEFAULT '{"allowed_ip_ranges": [], "blocked_ip_ranges": [], "allowed_countries": [], "blocked_countries": []}',
        audit_settings JSON DEFAULT '{"log_all_actions": true, "log_sensitive_data": true, "retention_days": 2555}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(company_id)
    );
    """
    
    # Create indexes for better performance
    indexes_sql = [
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);",
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);",
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);",
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);",
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);",
        
        "CREATE INDEX IF NOT EXISTS idx_security_logs_company_id ON security_logs(company_id);",
        "CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);",
        "CREATE INDEX IF NOT EXISTS idx_security_logs_success ON security_logs(success);",
        "CREATE INDEX IF NOT EXISTS idx_security_logs_threat_level ON security_logs(threat_level);",
        "CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);",
        "CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);",
        
        "CREATE INDEX IF NOT EXISTS idx_roles_company_id ON roles(company_id);",
        "CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(role_name);",
        "CREATE INDEX IF NOT EXISTS idx_roles_is_system ON roles(is_system_role);",
        "CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);",
        
        "CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_permissions_company_id ON user_permissions(company_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_permissions_role_id ON user_permissions(role_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON user_permissions(resource);",
        "CREATE INDEX IF NOT EXISTS idx_user_permissions_is_active ON user_permissions(is_active);",
        "CREATE INDEX IF NOT EXISTS idx_user_permissions_expires_at ON user_permissions(expires_at);",
        
        "CREATE INDEX IF NOT EXISTS idx_security_settings_company_id ON security_settings(company_id);"
    ]
    
    async with engine.begin() as conn:
        try:
            print("Creating audit logs table...")
            await conn.execute(text(audit_logs_sql))
            
            print("Creating security logs table...")
            await conn.execute(text(security_logs_sql))
            
            print("Creating roles table...")
            await conn.execute(text(roles_sql))
            
            print("Creating user permissions table...")
            await conn.execute(text(user_permissions_sql))
            
            print("Creating security settings table...")
            await conn.execute(text(security_settings_sql))
            
            print("Creating indexes...")
            for index_sql in indexes_sql:
                await conn.execute(text(index_sql))
            
            print("✅ All audit and security tables created successfully!")
            
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            raise

async def insert_default_system_roles():
    """Insert default system roles"""
    
    import uuid
    from datetime import datetime
    
    # Default system roles
    default_roles = [
        {
            "role_id": str(uuid.uuid4()),
            "company_id": None,
            "role_name": "System Administrator",
            "description": "Full system access with all permissions",
            "permissions": {
                "users": ["read", "write", "delete"],
                "companies": ["read", "write", "delete"],
                "transactions": ["read", "write", "delete"],
                "reports": ["read", "write", "export"],
                "settings": ["read", "write"],
                "audit": ["read", "export"],
                "security": ["read", "write"],
                "roles": ["read", "write", "delete"],
                "permissions": ["read", "write", "delete"]
            },
            "is_system_role": True,
            "is_active": True,
            "parent_role_id": None
        },
        {
            "role_id": str(uuid.uuid4()),
            "company_id": None,
            "role_name": "Security Administrator",
            "description": "Security and audit management access",
            "permissions": {
                "users": ["read", "write"],
                "security": ["read", "write"],
                "audit": ["read", "export"],
                "roles": ["read", "write"],
                "permissions": ["read", "write"]
            },
            "is_system_role": True,
            "is_active": True,
            "parent_role_id": None
        },
        {
            "role_id": str(uuid.uuid4()),
            "company_id": None,
            "role_name": "Compliance Officer",
            "description": "Compliance and audit reporting access",
            "permissions": {
                "audit": ["read", "export"],
                "security": ["read"],
                "reports": ["read", "export"],
                "transactions": ["read"]
            },
            "is_system_role": True,
            "is_active": True,
            "parent_role_id": None
        }
    ]
    
    async with engine.begin() as conn:
        try:
            for role in default_roles:
                check_sql = "SELECT COUNT(*) FROM roles WHERE role_name = :role_name AND is_system_role = 1"
                result = await conn.execute(text(check_sql), {"role_name": role["role_name"]})
                count = result.scalar()
                
                if count == 0:
                    insert_sql = """
                    INSERT INTO roles (role_id, company_id, role_name, description, permissions, is_system_role, is_active, parent_role_id)
                    VALUES (:role_id, :company_id, :role_name, :description, :permissions, :is_system_role, :is_active, :parent_role_id)
                    """
                    
                    await conn.execute(text(insert_sql), {
                        "role_id": role["role_id"],
                        "company_id": role["company_id"],
                        "role_name": role["role_name"],
                        "description": role["description"],
                        "permissions": str(role["permissions"]).replace("'", '"'),
                        "is_system_role": role["is_system_role"],
                        "is_active": role["is_active"],
                        "parent_role_id": role["parent_role_id"]
                    })
                    
                    print(f"✅ Created system role: {role['role_name']}")
                else:
                    print(f"⚠️  System role already exists: {role['role_name']}")
            
            print("✅ Default system roles setup completed!")
            
        except Exception as e:
            print(f"❌ Error inserting default roles: {e}")
            raise

async def create_demo_audit_data():
    """Create some demo audit data for testing"""
    
    import uuid
    from datetime import datetime
    
    # Get demo company and user
    async with engine.begin() as conn:
        # Check if demo company exists
        company_result = await conn.execute(text("SELECT company_id FROM companies WHERE company_name = 'Demo Company'"))
        company_row = company_result.fetchone()
        
        if not company_row:
            print("⚠️  Demo company not found, skipping demo audit data creation")
            return
        
        company_id = company_row[0]
        
        # Check if demo user exists
        user_result = await conn.execute(text("SELECT user_id FROM users WHERE email = 'demo@quickbooks.com'"))
        user_row = user_result.fetchone()
        
        if not user_row:
            print("⚠️  Demo user not found, skipping demo audit data creation")
            return
        
        user_id = user_row[0]
        
        # Create demo audit logs
        demo_audit_logs = [
            {
                "audit_id": str(uuid.uuid4()),
                "company_id": company_id,
                "user_id": user_id,
                "table_name": "customers",
                "record_id": str(uuid.uuid4()),
                "action": "create",
                "old_values": None,
                "new_values": '{"customer_name": "ABC Company", "email": "contact@abc.com"}',
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "endpoint": "/api/companies/customers",
                "request_method": "POST",
                "change_reason": "New customer registration",
                "affected_fields": '["customer_name", "email"]'
            },
            {
                "audit_id": str(uuid.uuid4()),
                "company_id": company_id,
                "user_id": user_id,
                "table_name": "transactions",
                "record_id": str(uuid.uuid4()),
                "action": "update",
                "old_values": '{"amount": 1000.00, "status": "draft"}',
                "new_values": '{"amount": 1500.00, "status": "approved"}',
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "endpoint": "/api/companies/transactions",
                "request_method": "PUT",
                "change_reason": "Amount correction and approval",
                "affected_fields": '["amount", "status"]'
            }
        ]
        
        # Create demo security logs
        demo_security_logs = [
            {
                "log_id": str(uuid.uuid4()),
                "user_id": user_id,
                "company_id": company_id,
                "event_type": "login_success",
                "success": True,
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "endpoint": "/api/auth/login",
                "request_method": "POST",
                "details": '{"login_time": "2024-07-08T10:30:00Z"}',
                "risk_score": 0,
                "threat_level": "low"
            },
            {
                "log_id": str(uuid.uuid4()),
                "user_id": None,
                "company_id": None,
                "event_type": "login_failed",
                "success": False,
                "ip_address": "192.168.1.200",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "endpoint": "/api/auth/login",
                "request_method": "POST",
                "details": '{"attempted_email": "hacker@example.com", "failure_reason": "invalid_credentials"}',
                "risk_score": 40,
                "threat_level": "medium"
            }
        ]
        
        try:
            # Insert demo audit logs
            for audit_log in demo_audit_logs:
                insert_sql = """
                INSERT INTO audit_logs (audit_id, company_id, user_id, table_name, record_id, action, old_values, new_values, ip_address, user_agent, endpoint, request_method, change_reason, affected_fields)
                VALUES (:audit_id, :company_id, :user_id, :table_name, :record_id, :action, :old_values, :new_values, :ip_address, :user_agent, :endpoint, :request_method, :change_reason, :affected_fields)
                """
                await conn.execute(text(insert_sql), audit_log)
            
            # Insert demo security logs
            for security_log in demo_security_logs:
                insert_sql = """
                INSERT INTO security_logs (log_id, user_id, company_id, event_type, success, ip_address, user_agent, endpoint, request_method, details, risk_score, threat_level)
                VALUES (:log_id, :user_id, :company_id, :event_type, :success, :ip_address, :user_agent, :endpoint, :request_method, :details, :risk_score, :threat_level)
                """
                await conn.execute(text(insert_sql), security_log)
            
            print("✅ Demo audit and security data created successfully!")
            
        except Exception as e:
            print(f"❌ Error creating demo data: {e}")
            raise

async def main():
    """Main migration function"""
    print("🚀 Starting Audit & Security Module Migration...")
    
    try:
        # Create tables
        await create_audit_tables()
        
        # Insert default system roles
        await insert_default_system_roles()
        
        # Create demo data
        await create_demo_audit_data()
        
        print("\n✅ Audit & Security Module Migration completed successfully!")
        print("\nTables created:")
        print("- audit_logs")
        print("- security_logs")
        print("- roles")
        print("- user_permissions")
        print("- security_settings")
        print("\nDefault system roles created:")
        print("- System Administrator")
        print("- Security Administrator")
        print("- Compliance Officer")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple, Dict, Any
from models.list_management import Account, Customer, Vendor, Item, Employee
from models.user import Company
from schemas.list_management_schemas import (
    AccountCreate, AccountUpdate, AccountSearchFilters,
    CustomerCreate, CustomerUpdate, CustomerSearchFilters,
    VendorCreate, VendorUpdate, VendorSearchFilters,
    ItemCreate, ItemUpdate, ItemSearchFilters,
    EmployeeCreate, EmployeeUpdate, EmployeeSearchFilters
)
import uuid
import structlog
from datetime import datetime
from typing import Dict, Tuple
import time

logger = structlog.get_logger()

class BaseListService:
    """Base service class for list management operations"""
    
    # Class-level cache for company access verification
    _company_access_cache: Dict[Tuple[str, str], Tuple[bool, float]] = {}
    _cache_ttl = 300  # 5 minutes TTL for cache
    
    @classmethod
    async def verify_company_access(cls, db: AsyncSession, user_id: str, company_id: str) -> bool:
        """Verify user has access to company with caching"""
        try:
            # Check cache first
            cache_key = (user_id, company_id)
            current_time = time.time()
            
            if cache_key in cls._company_access_cache:
                cached_result, cached_time = cls._company_access_cache[cache_key]
                if current_time - cached_time < cls._cache_ttl:
                    logger.debug("Company access verification served from cache", user_id=user_id, company_id=company_id)
                    return cached_result
            
            # Cache miss or expired, query database
            from models.user import CompanyMembership
            
            result = await db.execute(
                select(CompanyMembership).where(
                    and_(
                        CompanyMembership.user_id == user_id,
                        CompanyMembership.company_id == company_id,
                        CompanyMembership.is_active == True
                    )
                )
            )
            membership = result.scalar_one_or_none()
            has_access = membership is not None
            
            # Cache the result
            cls._company_access_cache[cache_key] = (has_access, current_time)
            
            logger.debug("Company access verification queried and cached", user_id=user_id, company_id=company_id, has_access=has_access)
            return has_access
            
        except Exception as e:
            logger.error("Error verifying company access", error=str(e), user_id=user_id, company_id=company_id)
            return False

    @staticmethod
    async def get_company(db: AsyncSession, company_id: str) -> Optional[Company]:
        """Get company by ID"""
        result = await db.execute(
            select(Company).where(Company.company_id == company_id)
        )
        return result.scalar_one_or_none()

class AccountService(BaseListService):
    """Service for account management operations"""
    
    @staticmethod
    async def create_account(
        db: AsyncSession,
        company_id: str,
        account_data: AccountCreate
    ) -> Account:
        """Create a new account"""
        # Generate account number if not provided
        if not account_data.account_number:
            account_data.account_number = await AccountService._generate_account_number(
                db, company_id, account_data.account_type
            )
        
        account = Account(
            account_id=str(uuid.uuid4()),
            company_id=company_id,
            **account_data.dict()
        )
        
        db.add(account)
        await db.commit()
        await db.refresh(account)
        
        logger.info("Account created", account_id=account.account_id, company_id=company_id)
        return account
    
    @staticmethod
    async def get_accounts(
        db: AsyncSession,
        company_id: str,
        filters: AccountSearchFilters
    ) -> Tuple[List[Account], int]:
        """Get accounts with pagination and filtering"""
        query = select(Account).where(
            and_(
                Account.company_id == company_id,
                Account.is_active == True if filters.is_active is None else filters.is_active
            )
        )
        
        # Apply filters
        if filters.account_type:
            query = query.where(Account.account_type == filters.account_type)
        
        if filters.parent_account_id:
            query = query.where(Account.parent_account_id == filters.parent_account_id)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    Account.account_name.ilike(search_term),
                    Account.account_number.ilike(search_term),
                    Account.description.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(Account, filters.sort_by, Account.account_name)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(Account.sort_order, Account.account_name)
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        accounts = result.scalars().all()
        
        return accounts, total
    
    @staticmethod
    async def get_account_by_id(
        db: AsyncSession,
        company_id: str,
        account_id: str
    ) -> Optional[Account]:
        """Get account by ID"""
        result = await db.execute(
            select(Account).where(
                and_(
                    Account.account_id == account_id,
                    Account.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_account(
        db: AsyncSession,
        account: Account,
        account_data: AccountUpdate
    ) -> Account:
        """Update account"""
        update_data = account_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(account, field, value)
        
        await db.commit()
        await db.refresh(account)
        
        logger.info("Account updated", account_id=account.account_id)
        return account
    
    @staticmethod
    async def delete_account(
        db: AsyncSession,
        account: Account
    ) -> None:
        """Soft delete account"""
        account.is_active = False
        await db.commit()
        
        logger.info("Account deleted", account_id=account.account_id)
    
    @staticmethod
    async def merge_accounts(
        db: AsyncSession,
        source_account: Account,
        target_account: Account
    ) -> None:
        """Merge source account into target account"""
        # In a real implementation, you would:
        # 1. Move all transactions from source to target
        # 2. Update all references to source account
        # 3. Soft delete source account
        
        source_account.is_active = False
        await db.commit()
        
        logger.info(
            "Accounts merged",
            source_account_id=source_account.account_id,
            target_account_id=target_account.account_id
        )
    
    @staticmethod
    async def _generate_account_number(
        db: AsyncSession,
        company_id: str,
        account_type: str
    ) -> str:
        """Generate next account number for company and type"""
        # Basic account numbering system
        type_prefixes = {
            "assets": "1",
            "liabilities": "2",
            "equity": "3",
            "revenue": "4",
            "expenses": "5",
            "cost_of_goods_sold": "6"
        }
        
        prefix = type_prefixes.get(account_type, "9")
        
        # Get highest existing number for this type
        result = await db.execute(
            select(func.max(Account.account_number)).where(
                and_(
                    Account.company_id == company_id,
                    Account.account_number.like(f"{prefix}%")
                )
            )
        )
        
        max_number = result.scalar()
        if max_number:
            try:
                next_num = int(max_number) + 1
            except ValueError:
                next_num = int(f"{prefix}001")
        else:
            next_num = int(f"{prefix}001")
        
        return str(next_num)

class CustomerService(BaseListService):
    """Service for customer management operations"""
    
    @staticmethod
    async def create_customer(
        db: AsyncSession,
        company_id: str,
        customer_data: CustomerCreate
    ) -> Customer:
        """Create a new customer"""
        # Generate customer number if not provided
        if not customer_data.customer_number:
            customer_data.customer_number = await CustomerService._generate_customer_number(
                db, company_id
            )
        
        customer = Customer(
            customer_id=str(uuid.uuid4()),
            company_id=company_id,
            **customer_data.dict()
        )
        
        db.add(customer)
        await db.commit()
        await db.refresh(customer)
        
        logger.info("Customer created", customer_id=customer.customer_id, company_id=company_id)
        return customer
    
    @staticmethod
    async def get_customers(
        db: AsyncSession,
        company_id: str,
        filters: CustomerSearchFilters
    ) -> Tuple[List[Customer], int]:
        """Get customers with pagination and filtering"""
        query = select(Customer).where(
            and_(
                Customer.company_id == company_id,
                Customer.is_active == True if filters.is_active is None else filters.is_active
            )
        )
        
        # Apply filters
        if filters.customer_type:
            query = query.where(Customer.customer_type == filters.customer_type)
        
        if filters.city:
            query = query.where(Customer.city.ilike(f"%{filters.city}%"))
        
        if filters.state:
            query = query.where(Customer.state.ilike(f"%{filters.state}%"))
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    Customer.customer_name.ilike(search_term),
                    Customer.customer_number.ilike(search_term),
                    Customer.company_name.ilike(search_term),
                    Customer.email.ilike(search_term),
                    Customer.phone.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(Customer, filters.sort_by, Customer.customer_name)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(Customer.customer_name)
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        customers = result.scalars().all()
        
        return customers, total
    
    @staticmethod
    async def get_customer_by_id(
        db: AsyncSession,
        company_id: str,
        customer_id: str
    ) -> Optional[Customer]:
        """Get customer by ID"""
        result = await db.execute(
            select(Customer).where(
                and_(
                    Customer.customer_id == customer_id,
                    Customer.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_customer(
        db: AsyncSession,
        customer: Customer,
        customer_data: CustomerUpdate
    ) -> Customer:
        """Update customer"""
        update_data = customer_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(customer, field, value)
        
        await db.commit()
        await db.refresh(customer)
        
        logger.info("Customer updated", customer_id=customer.customer_id)
        return customer
    
    @staticmethod
    async def delete_customer(
        db: AsyncSession,
        customer: Customer
    ) -> None:
        """Soft delete customer"""
        customer.is_active = False
        await db.commit()
        
        logger.info("Customer deleted", customer_id=customer.customer_id)
    
    @staticmethod
    async def get_customer_balance(
        db: AsyncSession,
        customer_id: str,
        company_id: str = None
    ) -> float:
        """Get customer balance from actual transactions"""
        try:
            from models.transactions import Transaction, TransactionType
            from sqlalchemy import and_, func
            from decimal import Decimal
            
            # If company_id is not provided, get it from the customer
            if not company_id:
                customer = await db.execute(
                    select(Customer).where(Customer.customer_id == customer_id)
                )
                customer_obj = customer.scalar_one_or_none()
                if not customer_obj:
                    return 0.0
                company_id = customer_obj.company_id
            
            # Get invoices (positive balance)
            invoice_result = await db.execute(
                select(func.coalesce(func.sum(Transaction.balance_due), 0)).where(
                    and_(
                        Transaction.company_id == company_id,
                        Transaction.customer_id == customer_id,
                        Transaction.transaction_type == TransactionType.INVOICE,
                        Transaction.is_void == False,
                        Transaction.balance_due > 0
                    )
                )
            )
            invoice_balance = invoice_result.scalar() or Decimal('0.0')
            
            # Get credit memos (negative balance)
            credit_result = await db.execute(
                select(func.coalesce(func.sum(Transaction.balance_due), 0)).where(
                    and_(
                        Transaction.company_id == company_id,
                        Transaction.customer_id == customer_id,
                        Transaction.transaction_type == TransactionType.CREDIT_MEMO,
                        Transaction.is_void == False,
                        Transaction.balance_due > 0
                    )
                )
            )
            credit_balance = credit_result.scalar() or Decimal('0.0')
            
            # Calculate net balance (invoices - credit memos)
            net_balance = invoice_balance - credit_balance
            
            return float(net_balance)
            
        except Exception as e:
            logger.error("Error calculating customer balance", error=str(e), customer_id=customer_id)
            return 0.0
    
    @staticmethod
    async def _generate_customer_number(
        db: AsyncSession,
        company_id: str
    ) -> str:
        """Generate next customer number"""
        result = await db.execute(
            select(func.count(Customer.customer_id)).where(
                Customer.company_id == company_id
            )
        )
        count = result.scalar() or 0
        return f"CUST{count + 1:05d}"

class VendorService(BaseListService):
    """Service for vendor management operations"""
    
    @staticmethod
    async def create_vendor(
        db: AsyncSession,
        company_id: str,
        vendor_data: VendorCreate
    ) -> Vendor:
        """Create a new vendor"""
        # Generate vendor number if not provided
        if not vendor_data.vendor_number:
            vendor_data.vendor_number = await VendorService._generate_vendor_number(
                db, company_id
            )
        
        vendor = Vendor(
            vendor_id=str(uuid.uuid4()),
            company_id=company_id,
            **vendor_data.dict()
        )
        
        db.add(vendor)
        await db.commit()
        await db.refresh(vendor)
        
        logger.info("Vendor created", vendor_id=vendor.vendor_id, company_id=company_id)
        return vendor
    
    @staticmethod
    async def get_vendors(
        db: AsyncSession,
        company_id: str,
        filters: VendorSearchFilters
    ) -> Tuple[List[Vendor], int]:
        """Get vendors with pagination and filtering"""
        query = select(Vendor).where(
            and_(
                Vendor.company_id == company_id,
                Vendor.is_active == True if filters.is_active is None else filters.is_active
            )
        )
        
        # Apply filters
        if filters.vendor_type:
            query = query.where(Vendor.vendor_type == filters.vendor_type)
        
        if filters.eligible_1099 is not None:
            query = query.where(Vendor.eligible_1099 == filters.eligible_1099)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    Vendor.vendor_name.ilike(search_term),
                    Vendor.vendor_number.ilike(search_term),
                    Vendor.company_name.ilike(search_term),
                    Vendor.email.ilike(search_term),
                    Vendor.phone.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(Vendor, filters.sort_by, Vendor.vendor_name)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(Vendor.vendor_name)
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        vendors = result.scalars().all()
        
        return vendors, total
    
    @staticmethod
    async def get_vendor_by_id(
        db: AsyncSession,
        company_id: str,
        vendor_id: str
    ) -> Optional[Vendor]:
        """Get vendor by ID"""
        result = await db.execute(
            select(Vendor).where(
                and_(
                    Vendor.vendor_id == vendor_id,
                    Vendor.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_vendor(
        db: AsyncSession,
        vendor: Vendor,
        vendor_data: VendorUpdate
    ) -> Vendor:
        """Update vendor"""
        update_data = vendor_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(vendor, field, value)
        
        await db.commit()
        await db.refresh(vendor)
        
        logger.info("Vendor updated", vendor_id=vendor.vendor_id)
        return vendor
    
    @staticmethod
    async def delete_vendor(
        db: AsyncSession,
        vendor: Vendor
    ) -> None:
        """Soft delete vendor"""
        vendor.is_active = False
        await db.commit()
        
        logger.info("Vendor deleted", vendor_id=vendor.vendor_id)
    
    @staticmethod
    async def _generate_vendor_number(
        db: AsyncSession,
        company_id: str
    ) -> str:
        """Generate next vendor number"""
        result = await db.execute(
            select(func.count(Vendor.vendor_id)).where(
                Vendor.company_id == company_id
            )
        )
        count = result.scalar() or 0
        return f"VEND{count + 1:05d}"

class ItemService(BaseListService):
    """Service for item management operations"""
    
    @staticmethod
    async def create_item(
        db: AsyncSession,
        company_id: str,
        item_data: ItemCreate
    ) -> Item:
        """Create a new item"""
        # Generate item number if not provided
        if not item_data.item_number:
            item_data.item_number = await ItemService._generate_item_number(
                db, company_id
            )
        
        item = Item(
            item_id=str(uuid.uuid4()),
            company_id=company_id,
            **item_data.dict()
        )
        
        db.add(item)
        await db.commit()
        await db.refresh(item)
        
        logger.info("Item created", item_id=item.item_id, company_id=company_id)
        return item
    
    @staticmethod
    async def get_items(
        db: AsyncSession,
        company_id: str,
        filters: ItemSearchFilters
    ) -> Tuple[List[Item], int]:
        """Get items with pagination and filtering"""
        query = select(Item).where(
            and_(
                Item.company_id == company_id,
                Item.is_active == True if filters.is_active is None else filters.is_active
            )
        )
        
        # Apply filters
        if filters.item_type:
            query = query.where(Item.item_type == filters.item_type)
        
        if filters.low_stock:
            query = query.where(
                and_(
                    Item.quantity_on_hand.isnot(None),
                    Item.reorder_point.isnot(None),
                    Item.quantity_on_hand <= Item.reorder_point
                )
            )
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    Item.item_name.ilike(search_term),
                    Item.item_number.ilike(search_term),
                    Item.description.ilike(search_term),
                    Item.manufacturer.ilike(search_term),
                    Item.upc_code.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(Item, filters.sort_by, Item.item_name)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(Item.item_name)
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        items = result.scalars().all()
        
        return items, total
    
    @staticmethod
    async def get_item_by_id(
        db: AsyncSession,
        company_id: str,
        item_id: str
    ) -> Optional[Item]:
        """Get item by ID"""
        result = await db.execute(
            select(Item).where(
                and_(
                    Item.item_id == item_id,
                    Item.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_item(
        db: AsyncSession,
        item: Item,
        item_data: ItemUpdate
    ) -> Item:
        """Update item"""
        update_data = item_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(item, field, value)
        
        await db.commit()
        await db.refresh(item)
        
        logger.info("Item updated", item_id=item.item_id)
        return item
    
    @staticmethod
    async def delete_item(
        db: AsyncSession,
        item: Item
    ) -> None:
        """Soft delete item"""
        item.is_active = False
        await db.commit()
        
        logger.info("Item deleted", item_id=item.item_id)
    
    @staticmethod
    async def get_low_stock_items(
        db: AsyncSession,
        company_id: str
    ) -> List[Item]:
        """Get items with low stock"""
        result = await db.execute(
            select(Item).where(
                and_(
                    Item.company_id == company_id,
                    Item.is_active == True,
                    Item.quantity_on_hand.isnot(None),
                    Item.reorder_point.isnot(None),
                    Item.quantity_on_hand <= Item.reorder_point
                )
            ).order_by(Item.item_name)
        )
        return result.scalars().all()
    
    @staticmethod
    async def _generate_item_number(
        db: AsyncSession,
        company_id: str
    ) -> str:
        """Generate next item number"""
        result = await db.execute(
            select(func.count(Item.item_id)).where(
                Item.company_id == company_id
            )
        )
        count = result.scalar() or 0
        return f"ITEM{count + 1:05d}"

class EmployeeService(BaseListService):
    """Service for employee management operations"""
    
    @staticmethod
    async def create_employee(
        db: AsyncSession,
        company_id: str,
        employee_data: EmployeeCreate
    ) -> Employee:
        """Create a new employee"""
        # Generate employee number if not provided
        if not employee_data.employee_number:
            employee_data.employee_number = await EmployeeService._generate_employee_number(
                db, company_id
            )
        
        employee = Employee(
            employee_id=str(uuid.uuid4()),
            company_id=company_id,
            **employee_data.dict()
        )
        
        db.add(employee)
        await db.commit()
        await db.refresh(employee)
        
        logger.info("Employee created", employee_id=employee.employee_id, company_id=company_id)
        return employee
    
    @staticmethod
    async def get_employees(
        db: AsyncSession,
        company_id: str,
        filters: EmployeeSearchFilters
    ) -> Tuple[List[Employee], int]:
        """Get employees with pagination and filtering"""
        query = select(Employee).where(
            and_(
                Employee.company_id == company_id,
                Employee.is_active == True if filters.is_active is None else filters.is_active
            )
        )
        
        # Apply filters
        if filters.pay_type:
            query = query.where(Employee.pay_type == filters.pay_type)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    Employee.first_name.ilike(search_term),
                    Employee.last_name.ilike(search_term),
                    Employee.employee_number.ilike(search_term),
                    Employee.email.ilike(search_term),
                    Employee.phone.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(Employee, filters.sort_by, Employee.last_name)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(Employee.last_name, Employee.first_name)
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        employees = result.scalars().all()
        
        return employees, total
    
    @staticmethod
    async def get_employee_by_id(
        db: AsyncSession,
        company_id: str,
        employee_id: str
    ) -> Optional[Employee]:
        """Get employee by ID"""
        result = await db.execute(
            select(Employee).where(
                and_(
                    Employee.employee_id == employee_id,
                    Employee.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_employee(
        db: AsyncSession,
        employee: Employee,
        employee_data: EmployeeUpdate
    ) -> Employee:
        """Update employee"""
        update_data = employee_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(employee, field, value)
        
        await db.commit()
        await db.refresh(employee)
        
        logger.info("Employee updated", employee_id=employee.employee_id)
        return employee
    
    @staticmethod
    async def delete_employee(
        db: AsyncSession,
        employee: Employee
    ) -> None:
        """Soft delete employee"""
        employee.is_active = False
        await db.commit()
        
        logger.info("Employee deleted", employee_id=employee.employee_id)
    
    @staticmethod
    async def _generate_employee_number(
        db: AsyncSession,
        company_id: str
    ) -> str:
        """Generate next employee number"""
        result = await db.execute(
            select(func.count(Employee.employee_id)).where(
                Employee.company_id == company_id
            )
        )
        count = result.scalar() or 0
        return f"EMP{count + 1:05d}"
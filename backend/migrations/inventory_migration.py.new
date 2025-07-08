"""
Inventory Management Module Migration Script
Creates all tables and sample data for the inventory management system
"""

import sys
import os
import asyncio
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(backend_dir))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from database.connection import engine, AsyncSessionLocal, Base
from models.inventory import (
    InventoryAdjustment, PurchaseOrder, PurchaseOrderLine, InventoryReceipt,
    ReceiptLine, InventoryTransaction, InventoryLocation, ItemLocation,
    InventoryAssembly, InventoryValuation, AdjustmentType, PurchaseOrderStatus,
    ReceiptStatus, InventoryTransactionType, CostMethod
)
from models.list_management import Item, Vendor
from models.user import Company, User
import structlog

logger = structlog.get_logger()

async def create_inventory_tables():
    """Create all inventory tables"""
    try:
        # Create all tables
        async with engine.begin() as conn:
            # Drop existing inventory tables (for development only)
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS inventory_valuations")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS inventory_assemblies")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS item_locations")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS inventory_locations")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS inventory_transactions")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS receipt_lines")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS inventory_receipts")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS purchase_order_lines")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS purchase_orders")
            ))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(
                text("DROP TABLE IF EXISTS inventory_adjustments")
            ))
            
            # Create all tables including new inventory tables
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Inventory tables created successfully")
        
    except Exception as e:
        logger.error("Failed to create inventory tables", error=str(e))
        raise

async def create_sample_inventory_data():
    """Create sample inventory data for development and testing"""
    try:
        async with AsyncSessionLocal() as db:
            # Get sample company and user
            company_result = await db.execute(
                select(Company).where(Company.company_name == "Demo Company")
            )
            company = company_result.scalar_one_or_none()
            
            user_result = await db.execute(
                select(User).where(User.email == "demo@quickbooks.com")
            )
            user = user_result.scalar_one_or_none()
            
            if not company or not user:
                logger.warning("Demo company or user not found, skipping sample data creation")
                return
            
            # Create inventory locations
            main_warehouse = InventoryLocation(
                location_id=str(uuid.uuid4()),
                company_id=company.company_id,
                location_name="Main Warehouse",
                location_code="MAIN",
                location_type="warehouse",
                is_default=True,
                address={
                    "street": "123 Warehouse St",
                    "city": "Business City",
                    "state": "CA",
                    "zip": "90210"
                },
                manager_name="John Warehouse",
                phone="555-0123",
                email="warehouse@company.com"
            )
            
            retail_store = InventoryLocation(
                location_id=str(uuid.uuid4()),
                company_id=company.company_id,
                location_name="Retail Store",
                location_code="STORE",
                location_type="store",
                address={
                    "street": "456 Main St",
                    "city": "Business City",
                    "state": "CA",
                    "zip": "90210"
                },
                manager_name="Jane Store",
                phone="555-0124",
                email="store@company.com"
            )
            
            db.add(main_warehouse)
            db.add(retail_store)
            await db.flush()
            
            # Get sample items
            items_result = await db.execute(
                select(Item).where(Item.company_id == company.company_id).limit(5)
            )
            items = items_result.scalars().all()
            
            # Create item locations with inventory
            for i, item in enumerate(items):
                # Main warehouse inventory
                main_item_location = ItemLocation(
                    item_location_id=str(uuid.uuid4()),
                    item_id=item.item_id,
                    location_id=main_warehouse.location_id,
                    quantity_on_hand=Decimal(str(100 + i * 25)),
                    quantity_available=Decimal(str(90 + i * 25)),
                    quantity_on_order=Decimal(str(50)),
                    quantity_allocated=Decimal(str(10)),
                    reorder_point=Decimal(str(20 + i * 5)),
                    reorder_quantity=Decimal(str(100)),
                    max_stock_level=Decimal(str(500 + i * 100)),
                    bin_location=f"A{i+1}-B{i+1}-{i+1}",
                    aisle=f"A{i+1}",
                    shelf=f"B{i+1}",
                    average_cost=Decimal(str(10.50 + i * 2.25)),
                    last_cost=Decimal(str(11.00 + i * 2.50)),
                    total_value=Decimal(str((100 + i * 25) * (10.50 + i * 2.25)))
                )
                
                # Store inventory (smaller quantities)
                store_item_location = ItemLocation(
                    item_location_id=str(uuid.uuid4()),
                    item_id=item.item_id,
                    location_id=retail_store.location_id,
                    quantity_on_hand=Decimal(str(20 + i * 5)),
                    quantity_available=Decimal(str(18 + i * 5)),
                    quantity_allocated=Decimal(str(2)),
                    reorder_point=Decimal(str(5 + i)),
                    reorder_quantity=Decimal(str(25)),
                    max_stock_level=Decimal(str(50 + i * 10)),
                    bin_location=f"S{i+1}-{i+1}",
                    average_cost=Decimal(str(10.50 + i * 2.25)),
                    last_cost=Decimal(str(11.00 + i * 2.50)),
                    total_value=Decimal(str((20 + i * 5) * (10.50 + i * 2.25)))
                )
                
                db.add(main_item_location)
                db.add(store_item_location)
            
            # Get sample vendor
            vendor_result = await db.execute(
                select(Vendor).where(Vendor.company_id == company.company_id).limit(1)
            )
            vendor = vendor_result.scalar_one_or_none()
            
            if vendor and items:
                # Create sample purchase order
                purchase_order = PurchaseOrder(
                    purchase_order_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    po_number="PO000001",
                    vendor_id=vendor.vendor_id,
                    po_date=date.today() - timedelta(days=5),
                    expected_date=date.today() + timedelta(days=10),
                    subtotal=Decimal('1500.00'),
                    tax_amount=Decimal('120.00'),
                    total_amount=Decimal('1620.00'),
                    status=PurchaseOrderStatus.OPEN,
                    memo="Sample purchase order for inventory testing",
                    terms="Net 30",
                    created_by=user.user_id
                )
                
                db.add(purchase_order)
                await db.flush()
                
                # Create PO lines
                for i, item in enumerate(items[:3]):
                    po_line = PurchaseOrderLine(
                        po_line_id=str(uuid.uuid4()),
                        purchase_order_id=purchase_order.purchase_order_id,
                        line_number=i + 1,
                        item_id=item.item_id,
                        description=f"Purchase of {item.item_name}",
                        quantity_ordered=Decimal(str(50 + i * 10)),
                        quantity_received=Decimal('0'),
                        unit_cost=Decimal(str(10.00 + i * 2.00)),
                        line_total=Decimal(str((50 + i * 10) * (10.00 + i * 2.00)))
                    )
                    db.add(po_line)
                
                # Create sample inventory receipt
                receipt = InventoryReceipt(
                    receipt_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    receipt_number="REC000001",
                    vendor_id=vendor.vendor_id,
                    purchase_order_id=purchase_order.purchase_order_id,
                    receipt_date=date.today() - timedelta(days=2),
                    total_cost=Decimal('800.00'),
                    status=ReceiptStatus.COMPLETE,
                    vendor_invoice_number="INV-2024-001",
                    memo="Sample receipt for testing",
                    created_by=user.user_id
                )
                
                db.add(receipt)
                await db.flush()
                
                # Create receipt lines
                for i, item in enumerate(items[:2]):
                    receipt_line = ReceiptLine(
                        receipt_line_id=str(uuid.uuid4()),
                        receipt_id=receipt.receipt_id,
                        item_id=item.item_id,
                        location_id=main_warehouse.location_id,
                        quantity_received=Decimal(str(25 + i * 5)),
                        unit_cost=Decimal(str(10.00 + i * 2.00)),
                        line_total=Decimal(str((25 + i * 5) * (10.00 + i * 2.00))),
                        quality_check_status="approved"
                    )
                    db.add(receipt_line)
                
                # Create sample inventory adjustments
                adjustment = InventoryAdjustment(
                    adjustment_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    item_id=items[0].item_id,
                    location_id=main_warehouse.location_id,
                    adjustment_date=date.today() - timedelta(days=1),
                    adjustment_type=AdjustmentType.CYCLE_COUNT,
                    quantity_before=Decimal('100'),
                    quantity_after=Decimal('98'),
                    quantity_adjustment=Decimal('-2'),
                    value_before=Decimal('1050.00'),
                    value_after=Decimal('1029.00'),
                    value_adjustment=Decimal('-21.00'),
                    unit_cost=Decimal('10.50'),
                    reason_code="CYCLE_COUNT",
                    memo="Cycle count adjustment - found 2 units missing",
                    created_by=user.user_id
                )
                
                db.add(adjustment)
                
                # Create sample inventory transactions
                for i, item in enumerate(items[:3]):
                    transaction = InventoryTransaction(
                        inventory_transaction_id=str(uuid.uuid4()),
                        company_id=company.company_id,
                        item_id=item.item_id,
                        location_id=main_warehouse.location_id,
                        transaction_type=InventoryTransactionType.PURCHASE,
                        transaction_date=date.today() - timedelta(days=2),
                        quantity_change=Decimal(str(25 + i * 5)),
                        unit_cost=Decimal(str(10.00 + i * 2.00)),
                        total_cost=Decimal(str((25 + i * 5) * (10.00 + i * 2.00))),
                        balance_quantity=Decimal(str(100 + i * 25)),
                        balance_value=Decimal(str((100 + i * 25) * (10.50 + i * 2.25))),
                        cost_method=CostMethod.AVERAGE_COST,
                        reference_type="receipt",
                        reference_id=receipt.receipt_id,
                        memo="Purchase receipt transaction",
                        created_by=user.user_id
                    )
                    
                    db.add(transaction)
                
                # Create sample assembly (first item as assembly, others as components)
                if len(items) >= 3:
                    assembly1 = InventoryAssembly(
                        assembly_id=str(uuid.uuid4()),
                        assembly_item_id=items[0].item_id,
                        component_item_id=items[1].item_id,
                        quantity_needed=Decimal('2'),
                        unit_cost=Decimal('12.50'),
                        build_sequence=1
                    )
                    
                    assembly2 = InventoryAssembly(
                        assembly_id=str(uuid.uuid4()),
                        assembly_item_id=items[0].item_id,
                        component_item_id=items[2].item_id,
                        quantity_needed=Decimal('1'),
                        unit_cost=Decimal('14.75'),
                        build_sequence=2
                    )
                    
                    db.add(assembly1)
                    db.add(assembly2)
                
                # Create sample inventory valuation
                valuation = InventoryValuation(
                    valuation_id=str(uuid.uuid4()),
                    company_id=company.company_id,
                    valuation_date=date.today(),
                    cost_method=CostMethod.AVERAGE_COST,
                    total_quantity=Decimal('595'),  # Sum of all inventory
                    total_cost=Decimal('7847.50'),  # Calculated total value
                    include_inactive_items=False,
                    notes="Sample valuation for testing",
                    created_by=user.user_id
                )
                
                db.add(valuation)
            
            await db.commit()
            logger.info("Sample inventory data created successfully")
            
    except Exception as e:
        logger.error("Failed to create sample inventory data", error=str(e))
        raise

async def run_inventory_migration():
    """Run the complete inventory migration"""
    try:
        logger.info("Starting inventory management module migration...")
        
        # Create tables
        await create_inventory_tables()
        
        # Create sample data
        await create_sample_inventory_data()
        
        logger.info("Inventory management module migration completed successfully!")
        
    except Exception as e:
        logger.error("Inventory migration failed", error=str(e))
        raise

if __name__ == "__main__":
    # Run the migration
    asyncio.run(run_inventory_migration())
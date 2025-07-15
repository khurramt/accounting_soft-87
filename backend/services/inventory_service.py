from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc, text
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional, Tuple, Dict, Any
from decimal import Decimal
from datetime import datetime, date
import uuid
import structlog

from models.inventory import (
    InventoryAdjustment, PurchaseOrder, PurchaseOrderLine, InventoryReceipt,
    ReceiptLine, InventoryTransaction, InventoryLocation, ItemLocation,
    InventoryAssembly, InventoryValuation, AdjustmentType, PurchaseOrderStatus,
    ReceiptStatus, InventoryTransactionType, CostMethod
)
from models.list_management import Item, Vendor
from models.user import Company, User
from schemas.inventory_schemas import (
    InventoryAdjustmentCreate, InventoryAdjustmentUpdate,
    PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderLineCreate,
    InventoryReceiptCreate, InventoryReceiptUpdate, ReceiptLineCreate,
    InventoryTransactionCreate, InventoryLocationCreate, InventoryLocationUpdate,
    ItemLocationCreate, ItemLocationUpdate, InventoryAssemblyCreate, InventoryAssemblyUpdate,
    AssemblyBuildRequest, InventoryValuationCreate,
    InventorySearchFilters, PurchaseOrderSearchFilters, ReceiptSearchFilters,
    AdjustmentSearchFilters, TransactionSearchFilters, ReorderItem, ReorderReport
)

from typing import Dict, Tuple
import time

logger = structlog.get_logger()

class BaseInventoryService:
    """Base service class for inventory operations"""
    
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

class InventoryService(BaseInventoryService):
    """Service for general inventory operations"""
    
    @staticmethod
    async def get_inventory_summary(
        db: AsyncSession,
        company_id: str,
        location_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get inventory summary for company"""
        
        # Base query for item locations
        query = select(ItemLocation).join(Item).where(
            and_(
                Item.company_id == company_id,
                Item.is_active == True
            )
        )
        
        if location_id:
            query = query.where(ItemLocation.location_id == location_id)
        
        result = await db.execute(query)
        item_locations = result.scalars().all()
        
        total_items = len(item_locations)
        total_value = sum(il.total_value or 0 for il in item_locations)
        low_stock_items = sum(1 for il in item_locations 
                            if il.quantity_on_hand <= il.reorder_point and il.reorder_point > 0)
        negative_stock_items = sum(1 for il in item_locations if il.quantity_on_hand < 0)
        
        # Get total locations
        locations_query = select(func.count(InventoryLocation.location_id)).where(
            and_(
                InventoryLocation.company_id == company_id,
                InventoryLocation.is_active == True
            )
        )
        total_locations_result = await db.execute(locations_query)
        total_locations = total_locations_result.scalar() or 0
        
        return {
            "total_items": total_items,
            "total_value": total_value,
            "low_stock_items": low_stock_items,
            "negative_stock_items": negative_stock_items,
            "total_locations": total_locations
        }
    
    @staticmethod
    async def get_inventory_by_item(
        db: AsyncSession,
        company_id: str,
        item_id: str
    ) -> Dict[str, Any]:
        """Get inventory information for a specific item across all locations"""
        
        query = select(ItemLocation).options(
            joinedload(ItemLocation.location)
        ).where(
            and_(
                ItemLocation.item_id == item_id,
                ItemLocation.location.has(InventoryLocation.company_id == company_id)
            )
        )
        
        result = await db.execute(query)
        item_locations = result.scalars().all()
        
        total_quantity = sum(il.quantity_on_hand for il in item_locations)
        total_value = sum(il.total_value or 0 for il in item_locations)
        
        return {
            "item_id": item_id,
            "total_quantity": total_quantity,
            "total_value": total_value,
            "locations": item_locations
        }
    
    @staticmethod
    async def get_item_transactions(
        db: AsyncSession,
        company_id: str,
        item_id: str,
        filters: TransactionSearchFilters
    ) -> Tuple[List[InventoryTransaction], int]:
        """Get transaction history for an item"""
        
        query = select(InventoryTransaction).where(
            and_(
                InventoryTransaction.company_id == company_id,
                InventoryTransaction.item_id == item_id
            )
        )
        
        # Apply filters
        if filters.location_id:
            query = query.where(InventoryTransaction.location_id == filters.location_id)
        
        if filters.transaction_type:
            query = query.where(InventoryTransaction.transaction_type == filters.transaction_type)
        
        if filters.date_from:
            query = query.where(InventoryTransaction.transaction_date >= filters.date_from)
        
        if filters.date_to:
            query = query.where(InventoryTransaction.transaction_date <= filters.date_to)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(InventoryTransaction, filters.sort_by, InventoryTransaction.transaction_date)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(InventoryTransaction.transaction_date))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        transactions = result.scalars().all()
        
        return transactions, total
    
    @staticmethod
    async def calculate_inventory_valuation(
        db: AsyncSession,
        company_id: str,
        valuation_data: InventoryValuationCreate,
        user_id: str
    ) -> InventoryValuation:
        """Calculate inventory valuation using specified cost method"""
        
        # Get all items with inventory
        query = select(ItemLocation).join(Item).where(
            and_(
                Item.company_id == company_id,
                ItemLocation.quantity_on_hand > 0
            )
        )
        
        if not valuation_data.include_inactive_items:
            query = query.where(Item.is_active == True)
        
        if valuation_data.location_id:
            query = query.where(ItemLocation.location_id == valuation_data.location_id)
        
        result = await db.execute(query)
        item_locations = result.scalars().all()
        
        total_quantity = sum(il.quantity_on_hand for il in item_locations)
        
        # Calculate total cost based on cost method
        total_cost = Decimal('0')
        
        for item_location in item_locations:
            if valuation_data.cost_method == CostMethod.AVERAGE_COST:
                cost = item_location.average_cost * item_location.quantity_on_hand
            elif valuation_data.cost_method == CostMethod.FIFO:
                # For FIFO, we would need to implement cost layers
                # For now, use average cost as approximation
                cost = item_location.average_cost * item_location.quantity_on_hand
            elif valuation_data.cost_method == CostMethod.LIFO:
                # For LIFO, we would need to implement cost layers
                # For now, use last cost as approximation
                cost = item_location.last_cost * item_location.quantity_on_hand
            elif valuation_data.cost_method == CostMethod.STANDARD_COST:
                # Would need standard cost from item master
                cost = item_location.average_cost * item_location.quantity_on_hand
            else:  # Specific identification
                cost = item_location.total_value
            
            total_cost += cost
        
        # Create valuation record
        valuation = InventoryValuation(
            valuation_id=str(uuid.uuid4()),
            company_id=company_id,
            **valuation_data.dict(),
            total_quantity=total_quantity,
            total_cost=total_cost,
            created_by=user_id
        )
        
        db.add(valuation)
        await db.commit()
        await db.refresh(valuation)
        
        logger.info("Inventory valuation calculated", 
                   valuation_id=valuation.valuation_id, 
                   total_cost=total_cost)
        
    @staticmethod
    async def get_low_stock_items(
        db: AsyncSession,
        company_id: str,
        location_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get items with low stock levels"""
        
        query = select(ItemLocation).join(Item).options(
            joinedload(ItemLocation.item),
            joinedload(ItemLocation.location)
        ).where(
            and_(
                Item.company_id == company_id,
                Item.is_active == True,
                ItemLocation.reorder_point > 0,
                ItemLocation.quantity_on_hand <= ItemLocation.reorder_point
            )
        )
        
        if location_id:
            query = query.where(ItemLocation.location_id == location_id)
        
        result = await db.execute(query)
        item_locations = result.scalars().all()
        
        low_stock_items = []
        for item_location in item_locations:
            # Calculate days until stockout (simple estimation)
            if item_location.quantity_on_hand > 0:
                # Estimate based on average daily usage (placeholder calculation)
                estimated_days_remaining = max(0, int(item_location.quantity_on_hand / 1))  # Assuming 1 unit per day usage
            else:
                estimated_days_remaining = 0
            
            # Calculate suggested order quantity
            if item_location.reorder_quantity > 0:
                suggested_order_qty = item_location.reorder_quantity
            else:
                # Default suggestion: bring to 3x reorder point
                suggested_order_qty = max(0, (item_location.reorder_point * 3) - item_location.quantity_on_hand)
            
            low_stock_item = {
                "item_id": item_location.item_id,
                "item_name": item_location.item.item_name,
                "item_number": item_location.item.item_number,
                "location_id": item_location.location_id,
                "location_name": item_location.location.location_name,
                "current_quantity": float(item_location.quantity_on_hand),
                "reorder_point": float(item_location.reorder_point),
                "reorder_quantity": float(item_location.reorder_quantity or 0),
                "quantity_below_reorder": float(item_location.reorder_point - item_location.quantity_on_hand),
                "suggested_order_quantity": float(suggested_order_qty),
                "last_cost": float(item_location.last_cost or 0),
                "average_cost": float(item_location.average_cost or 0),
                "total_value": float(item_location.total_value or 0),
                "estimated_days_remaining": estimated_days_remaining,
                "preferred_vendor_id": item_location.item.preferred_vendor_id,
                "status": "critical" if item_location.quantity_on_hand <= 0 else "low"
            }
            low_stock_items.append(low_stock_item)
        
        # Sort by most critical first (lowest quantity relative to reorder point)
        low_stock_items.sort(key=lambda x: x["current_quantity"] / max(x["reorder_point"], 1))
        
        return low_stock_items

class InventoryAdjustmentService(BaseInventoryService):
    """Service for inventory adjustments"""
    
    @staticmethod
    async def create_adjustment(
        db: AsyncSession,
        company_id: str,
        adjustment_data: InventoryAdjustmentCreate,
        user_id: str
    ) -> InventoryAdjustment:
        """Create an inventory adjustment"""
        
        # Get current item location info
        current_item_location = await InventoryAdjustmentService._get_or_create_item_location(
            db, adjustment_data.item_id, adjustment_data.location_id, company_id
        )
        
        quantity_before = current_item_location.quantity_on_hand
        quantity_after = quantity_before + adjustment_data.quantity_adjustment
        value_before = current_item_location.total_value
        value_after = quantity_after * adjustment_data.unit_cost
        value_adjustment = value_after - value_before
        
        # Create adjustment record
        adjustment = InventoryAdjustment(
            adjustment_id=str(uuid.uuid4()),
            company_id=company_id,
            quantity_before=quantity_before,
            quantity_after=quantity_after,
            value_before=value_before,
            value_after=value_after,
            value_adjustment=value_adjustment,
            created_by=user_id,
            **adjustment_data.dict()
        )
        
        db.add(adjustment)
        
        # Update item location
        current_item_location.quantity_on_hand = quantity_after
        current_item_location.total_value = value_after
        if quantity_after > 0:
            current_item_location.average_cost = value_after / quantity_after
        
        # Create inventory transaction
        transaction = InventoryTransaction(
            inventory_transaction_id=str(uuid.uuid4()),
            company_id=company_id,
            item_id=adjustment_data.item_id,
            location_id=adjustment_data.location_id,
            transaction_type=InventoryTransactionType.ADJUSTMENT,
            transaction_date=adjustment_data.adjustment_date,
            quantity_change=adjustment_data.quantity_adjustment,
            unit_cost=adjustment_data.unit_cost,
            total_cost=adjustment_data.quantity_adjustment * adjustment_data.unit_cost,
            balance_quantity=quantity_after,
            balance_value=value_after,
            reference_type="adjustment",
            reference_id=adjustment.adjustment_id,
            lot_number=adjustment_data.lot_number,
            serial_number=adjustment_data.serial_number,
            memo=adjustment_data.memo,
            created_by=user_id
        )
        
        db.add(transaction)
        await db.commit()
        await db.refresh(adjustment)
        
        logger.info("Inventory adjustment created", 
                   adjustment_id=adjustment.adjustment_id,
                   quantity_change=adjustment_data.quantity_adjustment)
        
        return adjustment
    
    @staticmethod
    async def _get_or_create_item_location(
        db: AsyncSession,
        item_id: str,
        location_id: Optional[str],
        company_id: str
    ) -> ItemLocation:
        """Get or create item location record"""
        
        # If no location specified, get default location
        if not location_id:
            default_location = await db.execute(
                select(InventoryLocation).where(
                    and_(
                        InventoryLocation.company_id == company_id,
                        InventoryLocation.is_default == True,
                        InventoryLocation.is_active == True
                    )
                )
            )
            location = default_location.scalar_one_or_none()
            if location:
                location_id = location.location_id
        
        # Try to get existing item location
        result = await db.execute(
            select(ItemLocation).where(
                and_(
                    ItemLocation.item_id == item_id,
                    ItemLocation.location_id == location_id
                )
            )
        )
        
        item_location = result.scalar_one_or_none()
        
        if not item_location:
            # Create new item location
            item_location = ItemLocation(
                item_location_id=str(uuid.uuid4()),
                item_id=item_id,
                location_id=location_id,
                quantity_on_hand=Decimal('0'),
                quantity_available=Decimal('0'),
                quantity_on_order=Decimal('0'),
                quantity_allocated=Decimal('0'),
                average_cost=Decimal('0'),
                last_cost=Decimal('0'),
                total_value=Decimal('0')
            )
            db.add(item_location)
            await db.flush()
        
        return item_location
    
    @staticmethod
    async def get_adjustments(
        db: AsyncSession,
        company_id: str,
        filters: AdjustmentSearchFilters
    ) -> Tuple[List[InventoryAdjustment], int]:
        """Get inventory adjustments with filtering and pagination"""
        
        query = select(InventoryAdjustment).options(
            joinedload(InventoryAdjustment.item),
            joinedload(InventoryAdjustment.location),
            joinedload(InventoryAdjustment.created_by_user)
        ).where(InventoryAdjustment.company_id == company_id)
        
        # Apply filters
        if filters.item_id:
            query = query.where(InventoryAdjustment.item_id == filters.item_id)
        
        if filters.adjustment_type:
            query = query.where(InventoryAdjustment.adjustment_type == filters.adjustment_type)
        
        if filters.date_from:
            query = query.where(InventoryAdjustment.adjustment_date >= filters.date_from)
        
        if filters.date_to:
            query = query.where(InventoryAdjustment.adjustment_date <= filters.date_to)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.join(Item).where(
                or_(
                    Item.item_name.ilike(search_term),
                    Item.item_number.ilike(search_term),
                    InventoryAdjustment.reference_number.ilike(search_term),
                    InventoryAdjustment.memo.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(InventoryAdjustment, filters.sort_by, InventoryAdjustment.adjustment_date)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(InventoryAdjustment.adjustment_date))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        adjustments = result.scalars().all()
        
        return adjustments, total
    
    @staticmethod
    async def get_adjustment_by_id(
        db: AsyncSession,
        company_id: str,
        adjustment_id: str
    ) -> Optional[InventoryAdjustment]:
        """Get adjustment by ID"""
        
        result = await db.execute(
            select(InventoryAdjustment).options(
                joinedload(InventoryAdjustment.item),
                joinedload(InventoryAdjustment.location),
                joinedload(InventoryAdjustment.created_by_user),
                joinedload(InventoryAdjustment.approved_by_user)
            ).where(
                and_(
                    InventoryAdjustment.adjustment_id == adjustment_id,
                    InventoryAdjustment.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_adjustment(
        db: AsyncSession,
        company_id: str,
        adjustment_id: str,
        adjustment_data: InventoryAdjustmentUpdate
    ) -> Optional[InventoryAdjustment]:
        """Update an inventory adjustment"""
        
        result = await db.execute(
            select(InventoryAdjustment).where(
                and_(
                    InventoryAdjustment.adjustment_id == adjustment_id,
                    InventoryAdjustment.company_id == company_id
                )
            )
        )
        adjustment = result.scalar_one_or_none()
        
        if not adjustment:
            return None
        
        # Update fields
        for field, value in adjustment_data.dict(exclude_unset=True).items():
            setattr(adjustment, field, value)
        
        await db.commit()
        await db.refresh(adjustment)
        
        logger.info("Inventory adjustment updated", 
                   adjustment_id=adjustment_id)

class PurchaseOrderService(BaseInventoryService):
    """Service for purchase order operations"""
    
    @staticmethod
    async def create_purchase_order(
        db: AsyncSession,
        company_id: str,
        po_data: PurchaseOrderCreate,
        user_id: str
    ) -> PurchaseOrder:
        """Create a new purchase order"""
        
        # Generate PO number
        po_number = await PurchaseOrderService._generate_po_number(db, company_id)
        
        # Calculate totals
        subtotal = sum(
            line.quantity_ordered * line.unit_cost 
            for line in po_data.lines
        )
        
        # Create purchase order
        purchase_order = PurchaseOrder(
            purchase_order_id=str(uuid.uuid4()),
            company_id=company_id,
            po_number=po_number,
            subtotal=subtotal,
            total_amount=subtotal,  # Will add tax/shipping later
            created_by=user_id,
            **po_data.dict(exclude={'lines'})
        )
        
        db.add(purchase_order)
        await db.flush()
        
        # Create purchase order lines
        for i, line_data in enumerate(po_data.lines, 1):
            line_total = line_data.quantity_ordered * line_data.unit_cost
            
            po_line = PurchaseOrderLine(
                po_line_id=str(uuid.uuid4()),
                purchase_order_id=purchase_order.purchase_order_id,
                line_number=i,
                line_total=line_total,
                **line_data.dict()
            )
            db.add(po_line)
        
        await db.commit()
        await db.refresh(purchase_order)
        
        logger.info("Purchase order created", 
                   po_id=purchase_order.purchase_order_id,
                   po_number=po_number,
                   total=subtotal)
        
        return purchase_order
    
    @staticmethod
    async def _generate_po_number(db: AsyncSession, company_id: str) -> str:
        """Generate next PO number"""
        result = await db.execute(
            select(func.count(PurchaseOrder.purchase_order_id)).where(
                PurchaseOrder.company_id == company_id
            )
        )
        count = result.scalar() or 0
        return f"PO{count + 1:06d}"
    
    @staticmethod
    async def get_purchase_orders(
        db: AsyncSession,
        company_id: str,
        filters: PurchaseOrderSearchFilters
    ) -> Tuple[List[PurchaseOrder], int]:
        """Get purchase orders with filtering and pagination"""
        
        query = select(PurchaseOrder).options(
            joinedload(PurchaseOrder.vendor),
            joinedload(PurchaseOrder.created_by_user),
            selectinload(PurchaseOrder.po_lines).joinedload(PurchaseOrderLine.item)
        ).where(PurchaseOrder.company_id == company_id)
        
        # Apply filters
        if filters.vendor_id:
            query = query.where(PurchaseOrder.vendor_id == filters.vendor_id)
        
        if filters.status:
            query = query.where(PurchaseOrder.status == filters.status)
        
        if filters.date_from:
            query = query.where(PurchaseOrder.po_date >= filters.date_from)
        
        if filters.date_to:
            query = query.where(PurchaseOrder.po_date <= filters.date_to)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.join(Vendor).where(
                or_(
                    PurchaseOrder.po_number.ilike(search_term),
                    PurchaseOrder.reference_number.ilike(search_term),
                    PurchaseOrder.memo.ilike(search_term),
                    Vendor.vendor_name.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(PurchaseOrder, filters.sort_by, PurchaseOrder.po_date)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(PurchaseOrder.po_date))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        purchase_orders = result.scalars().all()
        
        return purchase_orders, total
    
    @staticmethod
    async def get_purchase_order_by_id(
        db: AsyncSession,
        company_id: str,
        po_id: str
    ) -> Optional[PurchaseOrder]:
        """Get purchase order by ID"""
        
        result = await db.execute(
            select(PurchaseOrder).options(
                joinedload(PurchaseOrder.vendor),
                joinedload(PurchaseOrder.created_by_user),
                selectinload(PurchaseOrder.po_lines).joinedload(PurchaseOrderLine.item)
            ).where(
                and_(
                    PurchaseOrder.purchase_order_id == po_id,
                    PurchaseOrder.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_purchase_order(
        db: AsyncSession,
        company_id: str,
        po_id: str,
        po_data: PurchaseOrderUpdate
    ) -> Optional[PurchaseOrder]:
        """Update a purchase order"""
        
        result = await db.execute(
            select(PurchaseOrder).where(
                and_(
                    PurchaseOrder.purchase_order_id == po_id,
                    PurchaseOrder.company_id == company_id
                )
            )
        )
        purchase_order = result.scalar_one_or_none()
        
        if not purchase_order:
            return None
        
        # Check if PO can be modified (not if already received)
        if purchase_order.status in [PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CLOSED]:
            raise ValueError("Cannot modify purchase order that has been received or closed")
        
        # Update fields
        for field, value in po_data.dict(exclude_unset=True).items():
            setattr(purchase_order, field, value)
        
        await db.commit()
        await db.refresh(purchase_order)
        
        logger.info("Purchase order updated", 
                   po_id=po_id)
        
        return purchase_order
    
    @staticmethod
    async def delete_purchase_order(
        db: AsyncSession,
        company_id: str,
        po_id: str
    ) -> bool:
        """Delete a purchase order (soft delete)"""
        
        result = await db.execute(
            select(PurchaseOrder).where(
                and_(
                    PurchaseOrder.purchase_order_id == po_id,
                    PurchaseOrder.company_id == company_id
                )
            )
        )
        purchase_order = result.scalar_one_or_none()
        
        if not purchase_order:
            return False
        
        # Check if PO can be deleted (not if partially or fully received)
        if purchase_order.status in [PurchaseOrderStatus.PARTIALLY_RECEIVED, PurchaseOrderStatus.RECEIVED]:
            raise ValueError("Cannot delete purchase order that has been partially or fully received")
        
        # Mark as cancelled instead of hard delete to maintain audit trail
        purchase_order.status = PurchaseOrderStatus.CANCELLED
        
        await db.commit()
        
        logger.info("Purchase order cancelled", 
                   po_id=po_id)
        
        return True

class InventoryReceiptService(BaseInventoryService):
    """Service for inventory receipt operations"""
    
    @staticmethod
    async def create_receipt(
        db: AsyncSession,
        company_id: str,
        receipt_data: InventoryReceiptCreate,
        user_id: str
    ) -> InventoryReceipt:
        """Create a new inventory receipt"""
        
        # Generate receipt number
        receipt_number = await InventoryReceiptService._generate_receipt_number(db, company_id)
        
        # Calculate total cost
        total_cost = sum(
            line.quantity_received * line.unit_cost 
            for line in receipt_data.lines
        )
        
        # Create inventory receipt
        receipt = InventoryReceipt(
            receipt_id=str(uuid.uuid4()),
            company_id=company_id,
            receipt_number=receipt_number,
            total_cost=total_cost,
            created_by=user_id,
            **receipt_data.dict(exclude={'lines'})
        )
        
        db.add(receipt)
        await db.flush()
        
        # Create receipt lines and update inventory
        for line_data in receipt_data.lines:
            line_total = line_data.quantity_received * line_data.unit_cost
            
            receipt_line = ReceiptLine(
                receipt_line_id=str(uuid.uuid4()),
                receipt_id=receipt.receipt_id,
                line_total=line_total,
                **line_data.dict()
            )
            db.add(receipt_line)
            
            # Update inventory
            await InventoryReceiptService._update_inventory_for_receipt(
                db, company_id, line_data, user_id
            )
            
            # Update PO line if linked
            if line_data.po_line_id:
                await InventoryReceiptService._update_po_line_received_quantity(
                    db, line_data.po_line_id, line_data.quantity_received
                )
        
        await db.commit()
        await db.refresh(receipt)
        
        logger.info("Inventory receipt created", 
                   receipt_id=receipt.receipt_id,
                   receipt_number=receipt_number,
                   total_cost=total_cost)
        
        return receipt
    
    @staticmethod
    async def get_receipts(
        db: AsyncSession,
        company_id: str,
        filters: ReceiptSearchFilters
    ) -> Tuple[List[InventoryReceipt], int]:
        """Get inventory receipts with filtering and pagination"""
        
        query = select(InventoryReceipt).options(
            joinedload(InventoryReceipt.vendor),
            joinedload(InventoryReceipt.purchase_order),
            joinedload(InventoryReceipt.created_by_user),
            selectinload(InventoryReceipt.receipt_lines).joinedload(ReceiptLine.item)
        ).where(InventoryReceipt.company_id == company_id)
        
        # Apply filters
        if filters.vendor_id:
            query = query.where(InventoryReceipt.vendor_id == filters.vendor_id)
        
        if filters.status:
            query = query.where(InventoryReceipt.status == filters.status)
        
        if filters.date_from:
            query = query.where(InventoryReceipt.receipt_date >= filters.date_from)
        
        if filters.date_to:
            query = query.where(InventoryReceipt.receipt_date <= filters.date_to)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.join(Vendor).where(
                or_(
                    InventoryReceipt.receipt_number.ilike(search_term),
                    InventoryReceipt.vendor_invoice_number.ilike(search_term),
                    InventoryReceipt.tracking_number.ilike(search_term),
                    InventoryReceipt.memo.ilike(search_term),
                    Vendor.vendor_name.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            sort_column = getattr(InventoryReceipt, filters.sort_by, InventoryReceipt.receipt_date)
            if filters.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(InventoryReceipt.receipt_date))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await db.execute(query)
        receipts = result.scalars().all()
        
        return receipts, total
    
    @staticmethod
    async def get_receipt_by_id(
        db: AsyncSession,
        company_id: str,
        receipt_id: str
    ) -> Optional[InventoryReceipt]:
        """Get receipt by ID"""
        
        result = await db.execute(
            select(InventoryReceipt).options(
                joinedload(InventoryReceipt.vendor),
                joinedload(InventoryReceipt.purchase_order),
                joinedload(InventoryReceipt.created_by_user),
                selectinload(InventoryReceipt.receipt_lines).joinedload(ReceiptLine.item)
            ).where(
                and_(
                    InventoryReceipt.receipt_id == receipt_id,
                    InventoryReceipt.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_receipt(
        db: AsyncSession,
        company_id: str,
        receipt_id: str,
        receipt_data: InventoryReceiptUpdate
    ) -> Optional[InventoryReceipt]:
        """Update an inventory receipt"""
        
        result = await db.execute(
            select(InventoryReceipt).where(
                and_(
                    InventoryReceipt.receipt_id == receipt_id,
                    InventoryReceipt.company_id == company_id
                )
            )
        )
        receipt = result.scalar_one_or_none()
        
        if not receipt:
            return None
        
        # Check if receipt can be modified (not if already complete)
        if receipt.status == ReceiptStatus.COMPLETE:
            raise ValueError("Cannot modify receipt that has been completed")
        
        # Update fields
        for field, value in receipt_data.dict(exclude_unset=True).items():
            setattr(receipt, field, value)
        
        await db.commit()
        await db.refresh(receipt)
        
        logger.info("Inventory receipt updated", 
                   receipt_id=receipt_id)
        
        return receipt
    @staticmethod
    async def _generate_receipt_number(db: AsyncSession, company_id: str) -> str:
        """Generate next receipt number"""
        result = await db.execute(
            select(func.count(InventoryReceipt.receipt_id)).where(
                InventoryReceipt.company_id == company_id
            )
        )
        count = result.scalar() or 0
        return f"REC{count + 1:06d}"
    
    @staticmethod
    async def _update_inventory_for_receipt(
        db: AsyncSession,
        company_id: str,
        line_data: ReceiptLineCreate,
        user_id: str
    ) -> None:
        """Update inventory quantities for received items"""
        
        # Get or create item location
        item_location = await InventoryAdjustmentService._get_or_create_item_location(
            db, line_data.item_id, line_data.location_id, company_id
        )
        
        # Update quantities
        old_quantity = item_location.quantity_on_hand
        new_quantity = old_quantity + line_data.quantity_received
        old_value = item_location.total_value
        
        # Calculate new average cost
        total_cost_addition = line_data.quantity_received * line_data.unit_cost
        new_total_value = old_value + total_cost_addition
        
        item_location.quantity_on_hand = new_quantity
        item_location.quantity_available = new_quantity - item_location.quantity_allocated
        item_location.total_value = new_total_value
        item_location.last_cost = line_data.unit_cost
        
        if new_quantity > 0:
            item_location.average_cost = new_total_value / new_quantity
        
        # Create inventory transaction
        transaction = InventoryTransaction(
            inventory_transaction_id=str(uuid.uuid4()),
            company_id=company_id,
            item_id=line_data.item_id,
            location_id=line_data.location_id,
            transaction_type=InventoryTransactionType.PURCHASE,
            transaction_date=date.today(),
            quantity_change=line_data.quantity_received,
            unit_cost=line_data.unit_cost,
            total_cost=total_cost_addition,
            balance_quantity=new_quantity,
            balance_value=new_total_value,
            reference_type="receipt",
            lot_number=line_data.lot_number,
            created_by=user_id
        )
        
        db.add(transaction)
    
    @staticmethod
    async def _update_po_line_received_quantity(
        db: AsyncSession,
        po_line_id: str,
        quantity_received: Decimal
    ) -> None:
        """Update received quantity on PO line"""
        
        result = await db.execute(
            select(PurchaseOrderLine).where(
                PurchaseOrderLine.po_line_id == po_line_id
            )
        )
        po_line = result.scalar_one_or_none()
        
        if po_line:
            po_line.quantity_received += quantity_received
            
            # Update PO status if fully received
            await InventoryReceiptService._update_po_status(db, po_line.purchase_order_id)
    
    @staticmethod
    async def _update_po_status(db: AsyncSession, purchase_order_id: str) -> None:
        """Update purchase order status based on received quantities"""
        
        result = await db.execute(
            select(PurchaseOrder).options(
                selectinload(PurchaseOrder.po_lines)
            ).where(PurchaseOrder.purchase_order_id == purchase_order_id)
        )
        po = result.scalar_one_or_none()
        
        if po:
            total_ordered = sum(line.quantity_ordered for line in po.po_lines)
            total_received = sum(line.quantity_received for line in po.po_lines)
            
            if total_received == 0:
                po.status = PurchaseOrderStatus.OPEN
            elif total_received >= total_ordered:
                po.status = PurchaseOrderStatus.RECEIVED
            else:
                po.status = PurchaseOrderStatus.PARTIALLY_RECEIVED

class InventoryLocationService(BaseInventoryService):
    """Service for inventory location operations"""
    
    @staticmethod
    async def create_location(
        db: AsyncSession,
        company_id: str,
        location_data: InventoryLocationCreate
    ) -> InventoryLocation:
        """Create a new inventory location"""
        
        # Generate location code if not provided
        if not location_data.location_code:
            location_code = await InventoryLocationService._generate_location_code(
                db, company_id, location_data.location_name
            )
        else:
            location_code = location_data.location_code
        
        location = InventoryLocation(
            location_id=str(uuid.uuid4()),
            company_id=company_id,
            location_code=location_code,
            **location_data.dict()
        )
        
        db.add(location)
        await db.commit()
        await db.refresh(location)
        
        logger.info("Inventory location created", 
                   location_id=location.location_id,
                   location_name=location_data.location_name)
        
        return location
    
    @staticmethod
    async def _generate_location_code(
        db: AsyncSession,
        company_id: str,
        location_name: str
    ) -> str:
        """Generate location code from name"""
        # Take first 3 letters of name and add number
        base_code = ''.join(c.upper() for c in location_name if c.isalpha())[:3]
        
        result = await db.execute(
            select(func.count(InventoryLocation.location_id)).where(
                InventoryLocation.company_id == company_id
            )
        )
        count = result.scalar() or 0
        
        return f"{base_code}{count + 1:02d}"
    
    
    @staticmethod
    async def get_locations(
        db: AsyncSession,
        company_id: str,
        is_active: Optional[bool] = None
    ) -> List[InventoryLocation]:
        """Get inventory locations for a company"""
        
        query = select(InventoryLocation).where(
            InventoryLocation.company_id == company_id
        )
        
        if is_active is not None:
            query = query.where(InventoryLocation.is_active == is_active)
        
        query = query.order_by(InventoryLocation.location_name)
        
        result = await db.execute(query)
        locations = result.scalars().all()
        
        return locations
    
    @staticmethod
    async def get_location_by_id(
        db: AsyncSession,
        company_id: str,
        location_id: str
    ) -> Optional[InventoryLocation]:
        """Get location by ID"""
        
        result = await db.execute(
            select(InventoryLocation).where(
                and_(
                    InventoryLocation.location_id == location_id,
                    InventoryLocation.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_location(
        db: AsyncSession,
        company_id: str,
        location_id: str,
        location_data: InventoryLocationUpdate
    ) -> Optional[InventoryLocation]:
        """Update an inventory location"""
        
        result = await db.execute(
            select(InventoryLocation).where(
                and_(
                    InventoryLocation.location_id == location_id,
                    InventoryLocation.company_id == company_id
                )
            )
        )
        location = result.scalar_one_or_none()
        
        if not location:
            return None
        
        # Update fields
        for field, value in location_data.dict(exclude_unset=True).items():
            setattr(location, field, value)
        
        await db.commit()
        await db.refresh(location)
        
        logger.info("Inventory location updated", 
                   location_id=location_id)
        
        return location
    @staticmethod
    async def get_location_items(
        db: AsyncSession,
        company_id: str,
        location_id: str,
        filters: InventorySearchFilters
    ) -> Tuple[List[ItemLocation], int]:
        """Get items in a specific location"""
        
        query = select(ItemLocation).join(Item).where(
            and_(
                ItemLocation.location_id == location_id,
                Item.company_id == company_id
            )
        )
        
        # Apply filters
        if filters.low_stock:
            query = query.where(
                and_(
                    ItemLocation.reorder_point > 0,
                    ItemLocation.quantity_on_hand <= ItemLocation.reorder_point
                )
            )
        
        if filters.negative_stock:
            query = query.where(ItemLocation.quantity_on_hand < 0)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    Item.item_name.ilike(search_term),
                    Item.item_number.ilike(search_term),
                    ItemLocation.bin_location.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        if filters.sort_by:
            if filters.sort_by in ['item_name', 'item_number']:
                sort_column = getattr(Item, filters.sort_by)
            else:
                sort_column = getattr(ItemLocation, filters.sort_by, ItemLocation.item_id)
            
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
        item_locations = result.scalars().all()
        
        return item_locations, total

class InventoryReorderService(BaseInventoryService):
    """Service for inventory reorder management"""
    
    @staticmethod
    async def generate_reorder_report(
        db: AsyncSession,
        company_id: str,
        location_id: Optional[str] = None
    ) -> ReorderReport:
        """Generate reorder report for items below reorder point"""
        
        query = select(ItemLocation).join(Item).where(
            and_(
                Item.company_id == company_id,
                Item.is_active == True,
                ItemLocation.reorder_point > 0,
                ItemLocation.quantity_on_hand <= ItemLocation.reorder_point
            )
        )
        
        if location_id:
            query = query.where(ItemLocation.location_id == location_id)
        
        result = await db.execute(query.options(
            joinedload(ItemLocation.item),
            joinedload(ItemLocation.location)
        ))
        item_locations = result.scalars().all()
        
        reorder_items = []
        estimated_cost = Decimal('0')
        
        for item_location in item_locations:
            # Calculate suggested order quantity
            if item_location.reorder_quantity > 0:
                suggested_qty = item_location.reorder_quantity
            else:
                # Default to difference between max level and current
                max_level = item_location.max_stock_level or (item_location.reorder_point * 3)
                suggested_qty = max_level - item_location.quantity_on_hand
            
            item_cost = suggested_qty * item_location.last_cost
            estimated_cost += item_cost
            
            reorder_item = ReorderItem(
                item_id=item_location.item_id,
                item_name=item_location.item.item_name,
                location_id=item_location.location_id,
                location_name=item_location.location.location_name,
                current_quantity=item_location.quantity_on_hand,
                reorder_point=item_location.reorder_point,
                reorder_quantity=item_location.reorder_quantity,
                preferred_vendor_id=item_location.item.preferred_vendor_id,
                suggested_order_quantity=suggested_qty
            )
            reorder_items.append(reorder_item)
        
        return ReorderReport(
            report_date=date.today(),
            items=reorder_items,
            total_items=len(reorder_items),
            estimated_cost=estimated_cost
        )
    
    @staticmethod
    async def auto_generate_purchase_orders(
        db: AsyncSession,
        company_id: str,
        user_id: str,
        vendor_id: Optional[str] = None
    ) -> List[PurchaseOrder]:
        """Automatically generate purchase orders for items below reorder point"""
        
        # Get reorder report
        reorder_report = await InventoryReorderService.generate_reorder_report(
            db, company_id
        )
        
        if not reorder_report.items:
            return []
        
        # Group by vendor
        vendor_items = {}
        for item in reorder_report.items:
            if vendor_id and item.preferred_vendor_id != vendor_id:
                continue
            
            if item.preferred_vendor_id:
                if item.preferred_vendor_id not in vendor_items:
                    vendor_items[item.preferred_vendor_id] = []
                vendor_items[item.preferred_vendor_id].append(item)
        
        purchase_orders = []
        
        for vendor_id, items in vendor_items.items():
            # Create PO lines
            po_lines = []
            for item in items:
                # Get item details for unit cost
                item_result = await db.execute(
                    select(Item).where(Item.item_id == item.item_id)
                )
                item_record = item_result.scalar_one()
                
                po_line = PurchaseOrderLineCreate(
                    item_id=item.item_id,
                    quantity_ordered=item.suggested_order_quantity,
                    unit_cost=item_record.purchase_cost or item_record.sales_price or Decimal('0')
                )
                po_lines.append(po_line)
            
            # Create purchase order
            po_data = PurchaseOrderCreate(
                vendor_id=vendor_id,
                po_date=date.today(),
                memo="Auto-generated for reorder",
                lines=po_lines
            )
            
            po = await PurchaseOrderService.create_purchase_order(
                db, company_id, po_data, user_id
            )
            purchase_orders.append(po)
        
        logger.info("Auto-generated purchase orders", 
                   count=len(purchase_orders),
                   company_id=company_id)
        
        return purchase_orders

class InventoryAssemblyService(BaseInventoryService):
    """Service for inventory assembly operations"""
    
    @staticmethod
    async def create_assembly(
        db: AsyncSession,
        assembly_data: InventoryAssemblyCreate
    ) -> InventoryAssembly:
        """Create a new inventory assembly"""
        
        assembly = InventoryAssembly(
            assembly_id=str(uuid.uuid4()),
            **assembly_data.dict()
        )
        
        db.add(assembly)
        await db.commit()
        await db.refresh(assembly)
        
        logger.info("Inventory assembly created", 
                   assembly_id=assembly.assembly_id)
        
    @staticmethod
    async def get_assemblies(
        db: AsyncSession,
        company_id: str,
        assembly_item_id: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[InventoryAssembly]:
        """Get inventory assemblies for a company"""
        
        query = select(InventoryAssembly).options(
            joinedload(InventoryAssembly.assembly_item),
            joinedload(InventoryAssembly.component_item)
        ).join(Item, InventoryAssembly.assembly_item_id == Item.item_id).where(
            Item.company_id == company_id
        )
        
        if assembly_item_id:
            query = query.where(InventoryAssembly.assembly_item_id == assembly_item_id)
        
        if is_active is not None:
            query = query.where(InventoryAssembly.is_active == is_active)
        
        query = query.order_by(InventoryAssembly.build_sequence)
        
        result = await db.execute(query)
        assemblies = result.scalars().all()
        
        return assemblies
    
    @staticmethod
    async def get_assembly_by_id(
        db: AsyncSession,
        company_id: str,
        assembly_id: str
    ) -> Optional[InventoryAssembly]:
        """Get assembly by ID"""
        
        result = await db.execute(
            select(InventoryAssembly).options(
                joinedload(InventoryAssembly.assembly_item),
                joinedload(InventoryAssembly.component_item)
            ).join(Item, InventoryAssembly.assembly_item_id == Item.item_id).where(
                and_(
                    InventoryAssembly.assembly_id == assembly_id,
                    Item.company_id == company_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_assembly(
        db: AsyncSession,
        company_id: str,
        assembly_id: str,
        assembly_data: InventoryAssemblyUpdate
    ) -> Optional[InventoryAssembly]:
        """Update an inventory assembly"""
        
        assembly = await InventoryAssemblyService.get_assembly_by_id(
            db, company_id, assembly_id
        )
        
        if not assembly:
            return None
        
        # Update fields
        for field, value in assembly_data.dict(exclude_unset=True).items():
            setattr(assembly, field, value)
        
        await db.commit()
        await db.refresh(assembly)
        
        logger.info("Inventory assembly updated", 
                   assembly_id=assembly_id)
        
        return assembly
    
    @staticmethod
    async def build_assembly(
        db: AsyncSession,
        company_id: str,
        build_request: AssemblyBuildRequest,
        user_id: str
    ) -> Dict[str, Any]:
        """Build an assembly item from components"""
        
        # Get assembly components
        result = await db.execute(
            select(InventoryAssembly).where(
                and_(
                    InventoryAssembly.assembly_item_id == build_request.assembly_item_id,
                    InventoryAssembly.is_active == True
                )
            ).order_by(InventoryAssembly.build_sequence)
        )
        assembly_components = result.scalars().all()
        
        if not assembly_components:
            raise ValueError("No active components found for assembly")
        
        transactions = []
        total_cost = Decimal('0')
        
        # Check component availability and calculate costs
        for component in assembly_components:
            required_qty = component.quantity_needed * build_request.quantity_to_build
            
            # Get component inventory
            component_location = await InventoryAdjustmentService._get_or_create_item_location(
                db, component.component_item_id, build_request.location_id, company_id
            )
            
            if component_location.quantity_on_hand < required_qty and not component.is_optional:
                raise ValueError(f"Insufficient quantity for component {component.component_item_id}")
            
            # Create transaction for component consumption
            if component_location.quantity_on_hand >= required_qty:
                transaction = InventoryTransaction(
                    inventory_transaction_id=str(uuid.uuid4()),
                    company_id=company_id,
                    item_id=component.component_item_id,
                    location_id=build_request.location_id,
                    transaction_type=InventoryTransactionType.ASSEMBLY,
                    transaction_date=build_request.build_date,
                    quantity_change=-required_qty,
                    unit_cost=component.unit_cost,
                    total_cost=-required_qty * component.unit_cost,
                    balance_quantity=component_location.quantity_on_hand - required_qty,
                    balance_value=component_location.total_value - (required_qty * component.unit_cost),
                    reference_type="assembly_build",
                    memo=build_request.memo,
                    created_by=user_id
                )
                
                db.add(transaction)
                transactions.append(transaction)
                
                # Update component inventory
                component_location.quantity_on_hand -= required_qty
                component_location.total_value -= required_qty * component.unit_cost
                
                total_cost += required_qty * component.unit_cost
        
        # Create transaction for assembled item creation
        assembly_location = await InventoryAdjustmentService._get_or_create_item_location(
            db, build_request.assembly_item_id, build_request.location_id, company_id
        )
        
        assembly_transaction = InventoryTransaction(
            inventory_transaction_id=str(uuid.uuid4()),
            company_id=company_id,
            item_id=build_request.assembly_item_id,
            location_id=build_request.location_id,
            transaction_type=InventoryTransactionType.ASSEMBLY,
            transaction_date=build_request.build_date,
            quantity_change=build_request.quantity_to_build,
            unit_cost=total_cost / build_request.quantity_to_build if build_request.quantity_to_build > 0 else Decimal('0'),
            total_cost=total_cost,
            balance_quantity=assembly_location.quantity_on_hand + build_request.quantity_to_build,
            balance_value=assembly_location.total_value + total_cost,
            reference_type="assembly_build",
            memo=build_request.memo,
            created_by=user_id
        )
        
        db.add(assembly_transaction)
        transactions.append(assembly_transaction)
        
        # Update assembly inventory
        assembly_location.quantity_on_hand += build_request.quantity_to_build
        assembly_location.total_value += total_cost
        if assembly_location.quantity_on_hand > 0:
            assembly_location.average_cost = assembly_location.total_value / assembly_location.quantity_on_hand
        
        await db.commit()
        
        logger.info("Assembly built", 
                   assembly_item_id=build_request.assembly_item_id,
                   quantity=build_request.quantity_to_build,
                   total_cost=total_cost)
        
        return {
            "build_id": str(uuid.uuid4()),
            "assembly_item_id": build_request.assembly_item_id,
            "quantity_built": build_request.quantity_to_build,
            "total_cost": total_cost,
            "build_date": build_request.build_date,
            "status": "completed",
            "memo": build_request.memo,
            "transactions": transactions
        }
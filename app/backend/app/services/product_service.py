"""
Product service containing business logic for product operations.

This service layer separates business logic from API routing logic,
making the code more testable and maintainable.
"""

from decimal import Decimal

from app.core.logging_config import StructuredLogger
from app.data.seed_products import get_seed_products
from app.models.product import Product

# Initialize structured logger for this module
logger = StructuredLogger(__name__)

# In-memory product storage (in a real app, this would be a database)
_PRODUCTS_DATABASE: list[Product] = get_seed_products()


def get_all_products() -> list[Product]:
    """
    Retrieve all products from the catalog.

    This function returns all available products without any filtering.
    It logs the operation for debugging and monitoring purposes.

    Returns:
        List of all Product objects in the catalog

    Example:
        >>> products = get_all_products()
        >>> len(products)
        30
        >>> products[0].product_name
        'Wireless Bluetooth Mouse'
    """
    logger.info(
        "retrieving_all_products", total_products_in_database=len(_PRODUCTS_DATABASE), operation="get_all_products"
    )

    logger.info(
        "products_retrieved_successfully", products_returned=len(_PRODUCTS_DATABASE), operation="get_all_products"
    )

    return _PRODUCTS_DATABASE


def get_filtered_products(
    min_price_usd: Decimal | None = None,
    max_price_usd: Decimal | None = None,
    category: str | None = None,
    search_keyword: str | None = None,
    sort_by: str | None = None,
) -> list[Product]:
    """
    Retrieve products from the catalog with optional filtering and sorting.

    All filter parameters are optional. When multiple filters are provided,
    they are combined (AND logic). When no filters are provided, all products
    are returned (same as get_all_products).

    Args:
        min_price_usd: Return only products with price >= this value
        max_price_usd: Return only products with price <= this value
        category: Return only products in this category
        search_keyword: Return products whose name or description contains
                        this keyword (case-insensitive)
        sort_by: Sort order - one of "price_asc", "price_desc",
                 "name_asc", "name_desc"

    Returns:
        Filtered (and optionally sorted) list of Product objects

    Example:
        >>> products = get_filtered_products(category="electronics", max_price_usd=Decimal("50"))
        >>> all(p.product_category == "electronics" for p in products)
        True
    """
    logger.info(
        "filtering_products",
        total_products_in_database=len(_PRODUCTS_DATABASE),
        min_price_usd=str(min_price_usd) if min_price_usd is not None else None,
        max_price_usd=str(max_price_usd) if max_price_usd is not None else None,
        category=category,
        search_keyword=search_keyword,
        sort_by=sort_by,
        operation="get_filtered_products",
    )

    products = list(_PRODUCTS_DATABASE)

    if min_price_usd is not None:
        products = [p for p in products if p.product_price_usd >= min_price_usd]

    if max_price_usd is not None:
        products = [p for p in products if p.product_price_usd <= max_price_usd]

    if category is not None:
        products = [p for p in products if p.product_category == category]

    if search_keyword is not None:
        kw = search_keyword.lower()
        products = [
            p for p in products if kw in p.product_name.lower() or kw in p.product_description.lower()
        ]

    if sort_by == "price_asc":
        products.sort(key=lambda p: p.product_price_usd)
    elif sort_by == "price_desc":
        products.sort(key=lambda p: p.product_price_usd, reverse=True)
    elif sort_by == "name_asc":
        products.sort(key=lambda p: p.product_name.lower())
    elif sort_by == "name_desc":
        products.sort(key=lambda p: p.product_name.lower(), reverse=True)

    logger.info(
        "products_filtered_successfully",
        products_returned=len(products),
        operation="get_filtered_products",
    )

    return products

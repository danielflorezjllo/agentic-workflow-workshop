"""
Product service containing business logic for product operations.

This service layer separates business logic from API routing logic,
making the code more testable and maintainable.
"""

from decimal import Decimal

from app.core.logging_config import StructuredLogger
from app.data.seed_products import get_seed_products
from app.models.product import Product, ProductCategory

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
    category: ProductCategory | None = None,
    search_keyword: str | None = None,
    sort_by: str | None = None,
) -> list[Product]:
    """
    Retrieve products with optional filtering and sorting applied.

    All parameters are optional. When none are provided the full catalog is
    returned, preserving backwards compatibility with get_all_products().

    Args:
        min_price_usd: Inclusive lower bound on product_price_usd
        max_price_usd: Inclusive upper bound on product_price_usd
        category: Exact category match
        search_keyword: Case-insensitive substring match against product_name
            and product_description
        sort_by: One of "price_asc", "price_desc", "name_asc", "name_desc"

    Returns:
        Filtered (and optionally sorted) list of Product objects
    """
    logger.info(
        "filtering_products",
        total_products_in_database=len(_PRODUCTS_DATABASE),
        filter_min_price=str(min_price_usd) if min_price_usd is not None else None,
        filter_max_price=str(max_price_usd) if max_price_usd is not None else None,
        filter_category=category,
        filter_search_keyword=search_keyword,
        filter_sort_by=sort_by,
        operation="get_filtered_products",
    )

    products: list[Product] = list(_PRODUCTS_DATABASE)

    # Apply price filters
    if min_price_usd is not None:
        products = [p for p in products if p.product_price_usd >= min_price_usd]

    if max_price_usd is not None:
        products = [p for p in products if p.product_price_usd <= max_price_usd]

    # Apply category filter
    if category is not None:
        products = [p for p in products if p.product_category == category]

    # Apply keyword search (case-insensitive, name and description)
    if search_keyword is not None:
        keyword_lower = search_keyword.lower()
        products = [
            p
            for p in products
            if keyword_lower in p.product_name.lower() or keyword_lower in p.product_description.lower()
        ]

    # Apply sorting
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

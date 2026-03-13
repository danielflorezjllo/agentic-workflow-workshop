"""
Product service containing business logic for product operations.

This service layer separates business logic from API routing logic,
making the code more testable and maintainable.
"""

from decimal import Decimal

from app.core.logging_config import StructuredLogger
from app.data.seed_products import get_seed_products
from app.models.product import Product, ProductSortOrder

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


def filter_products(
    min_price_usd: Decimal | None = None,
    max_price_usd: Decimal | None = None,
    category: str | None = None,
    search_keyword: str | None = None,
    sort_by: ProductSortOrder | None = None,
) -> list[Product]:
    """
    Retrieve products filtered by the given criteria.

    Chains optional filters on the in-memory product list and applies
    an optional sort order before returning the result.

    Args:
        min_price_usd: Keep products with price >= this value
        max_price_usd: Keep products with price <= this value
        category: Keep products matching this category exactly
        search_keyword: Case-insensitive substring match on name or description
        sort_by: One of "price_asc", "price_desc", "name_asc", "name_desc"

    Returns:
        Filtered (and optionally sorted) list of Product objects
    """
    logger.info(
        "filtering_products",
        min_price=str(min_price_usd) if min_price_usd is not None else None,
        max_price=str(max_price_usd) if max_price_usd is not None else None,
        category=category,
        search_keyword=search_keyword,
        sort_by=sort_by,
        operation="filter_products",
    )

    results: list[Product] = list(_PRODUCTS_DATABASE)

    if min_price_usd is not None:
        results = [p for p in results if p.product_price_usd >= min_price_usd]

    if max_price_usd is not None:
        results = [p for p in results if p.product_price_usd <= max_price_usd]

    if category is not None:
        results = [p for p in results if p.product_category == category]

    if search_keyword is not None:
        keyword_lower = search_keyword.lower()
        results = [
            p
            for p in results
            if keyword_lower in p.product_name.lower() or keyword_lower in p.product_description.lower()
        ]

    if sort_by is not None:
        if sort_by == "price_asc":
            results.sort(key=lambda p: p.product_price_usd)
        elif sort_by == "price_desc":
            results.sort(key=lambda p: p.product_price_usd, reverse=True)
        elif sort_by == "name_asc":
            results.sort(key=lambda p: p.product_name.lower())
        elif sort_by == "name_desc":
            results.sort(key=lambda p: p.product_name.lower(), reverse=True)

    logger.info(
        "products_filtered_successfully",
        products_returned=len(results),
        operation="filter_products",
    )

    return results

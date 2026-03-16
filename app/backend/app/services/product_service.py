"""
Product service containing business logic for product operations.

This service layer separates business logic from API routing logic,
making the code more testable and maintainable.
"""

from collections.abc import Callable
from decimal import Decimal
from typing import Any

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
    Retrieve products matching the given filter criteria.

    All filters are optional; omitting them returns all products. When multiple
    filters are provided they are combined with AND semantics.

    Args:
        min_price_usd: Include products with price >= this value.
        max_price_usd: Include products with price <= this value.
        category: Include only products in this category.
        search_keyword: Case-insensitive substring match against name and description.
        sort_by: One of "price_asc", "price_desc", "name_asc", "name_desc".

    Returns:
        Filtered (and optionally sorted) list of Product objects.

    Example:
        >>> products = get_filtered_products(category="electronics", max_price_usd=Decimal("50"))
        >>> all(p.product_category == "electronics" for p in products)
        True
    """
    logger.info(
        "filtering_products",
        min_price_usd=str(min_price_usd) if min_price_usd is not None else None,
        max_price_usd=str(max_price_usd) if max_price_usd is not None else None,
        category=category,
        search_keyword=search_keyword,
        sort_by=sort_by,
        total_products_in_database=len(_PRODUCTS_DATABASE),
        operation="get_filtered_products",
    )

    results = list(_PRODUCTS_DATABASE)

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

    sort_key_map: dict[str, tuple[Callable[[Product], Any], bool]] = {
        "price_asc": (lambda p: p.product_price_usd, False),
        "price_desc": (lambda p: p.product_price_usd, True),
        "name_asc": (lambda p: p.product_name.lower(), False),
        "name_desc": (lambda p: p.product_name.lower(), True),
    }

    if sort_by is not None and sort_by in sort_key_map:
        key_fn, reverse = sort_key_map[sort_by]
        results = sorted(results, key=key_fn, reverse=reverse)

    logger.info(
        "products_filtered_successfully",
        products_returned=len(results),
        operation="get_filtered_products",
    )

    return results

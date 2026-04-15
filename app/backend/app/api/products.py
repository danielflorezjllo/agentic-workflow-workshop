"""
Product API endpoints.

This module defines all HTTP endpoints related to product operations.
Each endpoint delegates business logic to the service layer.
"""

from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.core.logging_config import StructuredLogger
from app.models.error import ErrorResponse
from app.models.product import ProductCategory, ProductListResponse
from app.services import product_service

# Initialize router for product endpoints
router = APIRouter(prefix="/api/products", tags=["products"])

# Initialize structured logger
logger = StructuredLogger(__name__)


@router.get("", response_model=ProductListResponse)
async def get_products(
    min_price_usd: Decimal | None = Query(default=None, gt=0, description="Minimum price filter (inclusive)"),
    max_price_usd: Decimal | None = Query(default=None, gt=0, description="Maximum price filter (inclusive)"),
    category: ProductCategory | None = Query(default=None, description="Filter by product category"),
    search_keyword: str | None = Query(default=None, min_length=1, description="Search keyword for name/description"),
    sort_by: Literal["price_asc", "price_desc", "name_asc", "name_desc"] | None = Query(
        default=None, description="Sort order for results"
    ),
) -> ProductListResponse | JSONResponse:
    """
    Get products from the catalog with optional filtering and sorting.

    All query parameters are optional. When no filters are applied,
    all products are returned. Multiple filters are combined with AND logic.

    Args:
        min_price_usd: Only return products with price >= this value
        max_price_usd: Only return products with price <= this value
        category: Only return products in this category
        search_keyword: Only return products whose name or description
                        contains this keyword (case-insensitive)
        sort_by: Sort order (price_asc, price_desc, name_asc, name_desc)

    Returns:
        ProductListResponse containing filtered products and total count

    Raises:
        400: If min_price_usd > max_price_usd (invalid price range)

    Example Response:
        {
            "products": [...],
            "total_count": 8
        }
    """
    logger.info(
        "api_request_received",
        endpoint="/api/products",
        http_method="GET",
        operation="get_products",
        min_price_usd=str(min_price_usd) if min_price_usd is not None else None,
        max_price_usd=str(max_price_usd) if max_price_usd is not None else None,
        category=category,
        search_keyword=search_keyword,
        sort_by=sort_by,
    )

    # Validate price range: min cannot exceed max
    if min_price_usd is not None and max_price_usd is not None and min_price_usd > max_price_usd:
        logger.error(
            "invalid_price_range",
            min_price_usd=str(min_price_usd),
            max_price_usd=str(max_price_usd),
            operation="get_products",
            fix_suggestion="Ensure min_price_usd is less than or equal to max_price_usd",
        )
        error = ErrorResponse(
            error_code="invalid_price_range",
            error_message="Minimum price cannot exceed maximum price",
            error_details={"min_price": str(min_price_usd), "max_price": str(max_price_usd)},
        )
        return JSONResponse(status_code=400, content=error.model_dump())

    # Delegate to service layer for business logic
    products = product_service.get_filtered_products(
        min_price_usd=min_price_usd,
        max_price_usd=max_price_usd,
        category=category,
        search_keyword=search_keyword,
        sort_by=sort_by,
    )

    logger.info(
        "api_response_prepared", endpoint="/api/products", products_count=len(products), operation="get_products"
    )

    return ProductListResponse(products=products, total_count=len(products))

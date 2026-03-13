"""
Product API endpoints.

This module defines all HTTP endpoints related to product operations.
Each endpoint delegates business logic to the service layer.
"""

from decimal import Decimal

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
    min_price_usd: Decimal | None = Query(default=None, description="Minimum product price (inclusive)", gt=0),
    max_price_usd: Decimal | None = Query(default=None, description="Maximum product price (inclusive)", gt=0),
    category: ProductCategory | None = Query(default=None, description="Filter by product category"),
    search_keyword: str | None = Query(default=None, description="Keyword search in name and description"),
    sort_by: str | None = Query(
        default=None,
        description="Sort order: price_asc, price_desc, name_asc, name_desc",
        pattern="^(price_asc|price_desc|name_asc|name_desc)$",
    ),
) -> ProductListResponse | JSONResponse:
    """
    Get products from the catalog with optional filtering.

    Supports filtering by price range, category, keyword search, and sorting.
    When no filters are provided, all products are returned.

    Returns:
        ProductListResponse containing list of products and total count

    Raises:
        HTTP 400: If min_price_usd > max_price_usd (invalid price range)
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

    # Validate price range
    if min_price_usd is not None and max_price_usd is not None and min_price_usd > max_price_usd:
        error = ErrorResponse(
            error_code="invalid_price_range",
            error_message="Minimum price cannot exceed maximum price",
            error_details={
                "min_price_usd": str(min_price_usd),
                "max_price_usd": str(max_price_usd),
            },
        )
        logger.error(
            "invalid_price_range",
            min_price_usd=str(min_price_usd),
            max_price_usd=str(max_price_usd),
            operation="get_products",
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

"""
Product API endpoints.

This module defines all HTTP endpoints related to product operations.
Each endpoint delegates business logic to the service layer.
"""

from decimal import Decimal
from typing import Annotated

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
    min_price_usd: Annotated[Decimal | None, Query(description="Minimum price filter (inclusive)", gt=0)] = None,
    max_price_usd: Annotated[Decimal | None, Query(description="Maximum price filter (inclusive)", gt=0)] = None,
    category: Annotated[ProductCategory | None, Query(description="Filter by product category")] = None,
    search_keyword: Annotated[
        str | None, Query(description="Keyword search in product name and description")
    ] = None,
    sort_by: Annotated[
        str | None,
        Query(
            description="Sort order: price_asc, price_desc, name_asc, name_desc",
            pattern="^(price_asc|price_desc|name_asc|name_desc)$",
        ),
    ] = None,
) -> ProductListResponse | JSONResponse:
    """
    Get products from the catalog with optional filtering and sorting.

    All query parameters are optional. When none are provided all products are
    returned (backwards compatible). Filters are combined with AND semantics.

    Args:
        min_price_usd: Only return products with price >= this value.
        max_price_usd: Only return products with price <= this value.
        category: Only return products in this category.
        search_keyword: Case-insensitive keyword search in name and description.
        sort_by: Sort order for results (price_asc, price_desc, name_asc, name_desc).

    Returns:
        ProductListResponse containing list of matching products and total count.

    Raises:
        HTTPException 400: When min_price_usd > max_price_usd.
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

    # Validate that min_price_usd does not exceed max_price_usd
    if min_price_usd is not None and max_price_usd is not None and min_price_usd > max_price_usd:
        logger.warning(
            "invalid_price_range",
            min_price_usd=str(min_price_usd),
            max_price_usd=str(max_price_usd),
            operation="get_products",
        )
        error = ErrorResponse(
            error_code="invalid_price_range",
            error_message="Minimum price cannot exceed maximum price",
            error_details={"min_price_usd": str(min_price_usd), "max_price_usd": str(max_price_usd)},
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

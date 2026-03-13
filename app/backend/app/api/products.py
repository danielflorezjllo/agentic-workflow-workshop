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
from app.models.product import ProductCategory, ProductListResponse, ProductSortOrder
from app.services import product_service

# Initialize router for product endpoints
router = APIRouter(prefix="/api/products", tags=["products"])

# Initialize structured logger
logger = StructuredLogger(__name__)


@router.get("", response_model=ProductListResponse)
async def get_products(
    min_price_usd: Decimal | None = Query(default=None, ge=0, description="Minimum price filter"),
    max_price_usd: Decimal | None = Query(default=None, ge=0, description="Maximum price filter"),
    category: ProductCategory | None = Query(default=None, description="Filter by category"),
    search_keyword: str | None = Query(default=None, min_length=1, max_length=200, description="Search keyword"),
    sort_by: ProductSortOrder | None = Query(default=None, description="Sort order"),
) -> ProductListResponse | JSONResponse:
    """
    Get products from the catalog with optional filtering and sorting.

    Supports filtering by price range, category, and keyword search.
    Returns all products when no filters are provided.

    Returns:
        ProductListResponse containing list of filtered products and total count
        JSONResponse with ErrorResponse on validation errors (400)
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
        logger.error(
            "validation_failed",
            error_code="invalid_price_range",
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
    products = product_service.filter_products(min_price_usd, max_price_usd, category, search_keyword, sort_by)

    logger.info(
        "api_response_prepared", endpoint="/api/products", products_count=len(products), operation="get_products"
    )

    return ProductListResponse(products=products, total_count=len(products))

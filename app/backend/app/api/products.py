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
from app.models.product import ProductListResponse
from app.services import product_service

# Initialize router for product endpoints
router = APIRouter(prefix="/api/products", tags=["products"])

# Initialize structured logger
logger = StructuredLogger(__name__)

# Valid values for category and sort_by parameters
_VALID_CATEGORIES = {"electronics", "clothing", "home", "sports", "books"}
_VALID_SORT_OPTIONS = {"price_asc", "price_desc", "name_asc", "name_desc"}


@router.get("", response_model=ProductListResponse)
async def get_products(
    min_price_usd: Annotated[Decimal | None, Query(gt=0, description="Minimum price filter")] = None,
    max_price_usd: Annotated[Decimal | None, Query(gt=0, description="Maximum price filter")] = None,
    category: Annotated[str | None, Query(description="Product category filter")] = None,
    search_keyword: Annotated[str | None, Query(min_length=1, description="Search keyword")] = None,
    sort_by: Annotated[str | None, Query(description="Sort order")] = None,
) -> ProductListResponse | JSONResponse:
    """
    Get products from the catalog with optional filtering and sorting.

    Returns:
        ProductListResponse containing list of products and total count,
        or JSONResponse with error details for invalid parameters.
    """
    logger.info(
        "api_request_received",
        endpoint="/api/products",
        http_method="GET",
        min_price_usd=str(min_price_usd) if min_price_usd is not None else None,
        max_price_usd=str(max_price_usd) if max_price_usd is not None else None,
        filter_category=category,
        search_keyword=search_keyword,
        sort_by=sort_by,
        operation="get_products",
    )

    # Validate: min price cannot exceed max price
    if min_price_usd is not None and max_price_usd is not None and min_price_usd > max_price_usd:
        error = ErrorResponse(
            error_code="invalid_price_range",
            error_message="Minimum price cannot exceed maximum price",
            error_details={"min_price_usd": str(min_price_usd), "max_price_usd": str(max_price_usd)},
        )
        return JSONResponse(status_code=400, content=error.model_dump(mode="json"))

    # Validate: category must be one of the valid values
    if category is not None and category not in _VALID_CATEGORIES:
        error = ErrorResponse(
            error_code="invalid_category",
            error_message=f"Invalid category '{category}'. Must be one of: {', '.join(sorted(_VALID_CATEGORIES))}",
            error_details={"provided_category": category, "valid_categories": sorted(_VALID_CATEGORIES)},
        )
        return JSONResponse(status_code=400, content=error.model_dump(mode="json"))

    # Validate: sort_by must be one of the valid values
    if sort_by is not None and sort_by not in _VALID_SORT_OPTIONS:
        error = ErrorResponse(
            error_code="invalid_sort_option",
            error_message=f"Invalid sort option '{sort_by}'. Must be one of: {', '.join(sorted(_VALID_SORT_OPTIONS))}",
            error_details={"provided_sort_by": sort_by, "valid_sort_options": sorted(_VALID_SORT_OPTIONS)},
        )
        return JSONResponse(status_code=400, content=error.model_dump(mode="json"))

    # Delegate to service layer for business logic
    products = product_service.filter_products(
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

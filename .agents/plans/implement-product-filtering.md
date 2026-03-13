# Feature: Product Catalog Filtering (FEAT-1234 + FEAT-1235)

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files. Follow the `product_` prefix convention for all product-related fields.

## Feature Description

Add server-side filtering, search, and sorting to the product catalog API (`GET /api/products`) and build a frontend filter interface that sends query parameters to the backend and displays filtered results with proper loading, empty, and error states.

## User Story

As a **catalog shopper**
I want to **filter products by price, category, keyword, and sort order**
So that **I can quickly find the products I'm interested in**

## Problem Statement

`GET /api/products` currently returns all 30 products with no filtering. Users have no way to narrow results by price range, category, or search terms, and cannot control sort order.

## Solution Statement

Extend the existing endpoint with optional query parameters (`min_price_usd`, `max_price_usd`, `category`, `search_keyword`, `sort_by`). Add a `filter_products()` function in the service layer. On the frontend, create a `ProductFilters` component using React Hook Form + Zod + existing shadcn primitives, and update the API client to pass filter params as query strings.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Backend API route, service layer, frontend App state, API client, new filter component
**Dependencies**: No new libraries — all required packages are already installed (FastAPI, Pydantic, React Hook Form, Zod, shadcn/ui)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — YOU MUST READ THESE BEFORE IMPLEMENTING

**Backend:**

- `app/backend/app/api/products.py` (lines 1–65) — Current route handler; you will add query params here
- `app/backend/app/services/product_service.py` (lines 1–45) — Current `get_all_products()`; you will add `filter_products()` here
- `app/backend/app/models/product.py` (lines 1–95) — `Product`, `ProductCategory`, `ProductListResponse` models
- `app/backend/app/models/error.py` (lines 1–55) — `ErrorResponse` model (use for 400 errors)
- `app/backend/app/core/logging_config.py` (lines 1–80) — `StructuredLogger` usage pattern
- `app/backend/app/data/seed_products.py` (lines 1–120) — 30 seed products, 5 categories, prices $5.99–$499.99
- `app/backend/app/main.py` (lines 60–92) — Router registration & CORS setup
- `app/backend/tests/test_products_filtering.py` (lines 1–195) — **Pre-written filter tests with `@pytest.mark.skip`** — remove skips to activate
- `app/backend/tests/test_products_basic.py` (lines 1–80) — Existing basic tests (must not break)
- `app/backend/tests/conftest.py` — `test_client` fixture
- `app/backend/AGENTS.md` — Backend conventions

**Frontend:**

- `app/frontend/src/App.tsx` (lines 1–182) — Main component with state management, `loadProducts()`, layout
- `app/frontend/src/lib/api-client.ts` (lines 1–120) — `fetchProducts()` function; update to accept filter params
- `app/frontend/src/types/product.ts` (lines 1–96) — `Product`, `ProductListResponse`, **`ProductFilterParams` already stubbed** (lines 80–96)
- `app/frontend/src/types/error.ts` (lines 1–65) — `ErrorResponse`, `ApiError` class
- `app/frontend/src/components/ProductGrid.tsx` (lines 1–90) — Grid with loading/empty/success states
- `app/frontend/src/components/ProductCard.tsx` (lines 1–100) — Individual product card
- `app/frontend/src/lib/logger.ts` (lines 1–60) — Frontend structured logger (mirrors backend)
- `app/frontend/src/components/ui/select.tsx` — shadcn Select (for category + sort dropdowns)
- `app/frontend/src/components/ui/input.tsx` — shadcn Input (for price + search)
- `app/frontend/src/components/ui/button.tsx` — shadcn Button (for apply/clear)
- `app/frontend/src/components/ui/form.tsx` — shadcn Form (FormField, FormItem, FormLabel, FormControl, FormMessage)
- `app/frontend/src/components/ui/label.tsx` — shadcn Label
- `app/frontend/AGENTS.md` — Frontend conventions

### New Files to Create

- `app/frontend/src/components/ProductFilters.tsx` — Filter form component (React Hook Form + Zod + shadcn)

### Existing Files to Modify

| File                                           | Change                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `app/backend/app/api/products.py`              | Add optional query params, validation, call `filter_products()`                     |
| `app/backend/app/services/product_service.py`  | Add `filter_products()` function                                                    |
| `app/backend/tests/test_products_filtering.py` | Remove `@pytest.mark.skip` decorators                                               |
| `app/frontend/src/lib/api-client.ts`           | Update `fetchProducts()` to accept `ProductFilterParams` and build query string     |
| `app/frontend/src/App.tsx`                     | Add filter state, wire `ProductFilters` component, pass filters to `loadProducts()` |
| `app/frontend/src/components/ProductGrid.tsx`  | No changes needed (already handles empty state)                                     |

### Patterns to Follow

**Backend Naming Convention:**

- All product fields use `product_` prefix: `product_name`, `product_price_usd`, `product_category`
- Query params use snake_case: `min_price_usd`, `max_price_usd`, `search_keyword`, `sort_by`
- The tests already use these exact param names — do NOT deviate

**Backend Error Handling Pattern:**

```python
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from app.models.error import ErrorResponse

# Return ErrorResponse as JSON with appropriate status code
error = ErrorResponse(
    error_code="invalid_price_range",
    error_message="Minimum price cannot exceed maximum price",
    error_details={"min_price_usd": str(min_price), "max_price_usd": str(max_price)}
)
return JSONResponse(status_code=400, content=error.model_dump())
```

**Backend Logging Pattern:**

```python
logger = StructuredLogger(__name__)
logger.info("filtering_products", filter_category="electronics", min_price_usd="25.00", total_before_filter=30)
```

**Frontend Logging Pattern:**

```typescript
import { logger } from "@/lib/logger";
logger.info("filters_applied", {
  category: "electronics",
  min_price: 25,
  operation: "apply_filters",
});
```

**Frontend API Client Pattern:**

```typescript
// Build URL with query params
const params = new URLSearchParams();
if (filters?.category) params.append("category", filters.category);
const url = `${API_BASE_URL}${endpoint}?${params.toString()}`;
```

**Category Values (exact strings):**
`"electronics"`, `"clothing"`, `"home"`, `"sports"`, `"books"`

**Sort Values (for sort_by param):**
`"price_asc"`, `"price_desc"`, `"name_asc"`, `"name_desc"`

**Monetary Values:**

- Backend: `Decimal` type, use `float()` for comparisons
- Frontend: received as string in JSON, use `parseFloat()` for display
- Query params: sent as numbers (e.g., `?min_price_usd=25`)

---

## IMPLEMENTATION PLAN

### Phase 1: Backend — Service Layer (filter logic)

Add `filter_products()` to `product_service.py` that accepts optional filter params, chains filters on the in-memory list, and returns the filtered + sorted result.

### Phase 2: Backend — API Route (query params + validation)

Update `products.py` route to accept optional query parameters, validate them (min > max → 400), and delegate to `filter_products()`.

### Phase 3: Backend — Activate Tests

Remove `@pytest.mark.skip` from all tests in `test_products_filtering.py` and verify all pass.

### Phase 4: Frontend — API Client Update

Update `fetchProducts()` in `api-client.ts` to accept optional `ProductFilterParams` and build query string.

### Phase 5: Frontend — Filter Component

Create `ProductFilters.tsx` using React Hook Form + Zod schema + shadcn components.

### Phase 6: Frontend — App Integration

Wire `ProductFilters` into `App.tsx` — add filter state, pass to `loadProducts()`, render the form above the grid.

### Phase 7: Validation — Full Stack

Run all backend tests, frontend lint/build, and manual browser testing.

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `app/backend/app/services/product_service.py`

Add `filter_products()` function below the existing `get_all_products()`.

- **IMPLEMENT**: Function signature:
  ```python
  def filter_products(
      min_price_usd: Decimal | None = None,
      max_price_usd: Decimal | None = None,
      category: str | None = None,
      search_keyword: str | None = None,
      sort_by: str | None = None,
  ) -> list[Product]:
  ```
- **IMPLEMENT**: Start with full `_PRODUCTS_DATABASE` list, then chain filters:
  1. If `min_price_usd` → keep products where `product_price_usd >= min_price_usd`
  2. If `max_price_usd` → keep products where `product_price_usd <= max_price_usd`
  3. If `category` → keep products where `product_category == category`
  4. If `search_keyword` → keep products where keyword appears in `product_name.lower()` or `product_description.lower()` (case-insensitive)
  5. If `sort_by` → sort results:
     - `"price_asc"` → sort by `product_price_usd` ascending
     - `"price_desc"` → sort by `product_price_usd` descending
     - `"name_asc"` → sort by `product_name` ascending (case-insensitive)
     - `"name_desc"` → sort by `product_name` descending (case-insensitive)
- **IMPORTS**: `from decimal import Decimal` (already have Product import)
- **LOGGING**: Log at start (`"filtering_products"` event with all param values) and end (`"products_filtered_successfully"` with count)
- **PATTERN**: Mirror `get_all_products()` logging style from same file
- **GOTCHA**: Compare `Decimal` to `Decimal` — the query param will arrive as `Decimal` from the route layer
- **VALIDATE**: `cd app/backend && uv run python -c "from app.services.product_service import filter_products; print(len(filter_products()))"`

### Task 2: UPDATE `app/backend/app/api/products.py`

Replace the existing `get_products()` route handler with one that accepts optional query params.

- **IMPLEMENT**: New signature with FastAPI `Query` parameters:

  ```python
  from decimal import Decimal
  from fastapi import Query
  from fastapi.responses import JSONResponse
  from app.models.error import ErrorResponse

  @router.get("", response_model=ProductListResponse)
  async def get_products(
      min_price_usd: Decimal | None = Query(default=None, gt=0, description="Minimum price filter"),
      max_price_usd: Decimal | None = Query(default=None, gt=0, description="Maximum price filter"),
      category: str | None = Query(default=None, description="Product category filter"),
      search_keyword: str | None = Query(default=None, min_length=1, description="Search keyword"),
      sort_by: str | None = Query(default=None, description="Sort order"),
  ) -> ProductListResponse | JSONResponse:
  ```

- **IMPLEMENT**: Validation before calling service:
  1. If both `min_price_usd` and `max_price_usd` provided and `min_price_usd > max_price_usd`:
     - Return `JSONResponse(status_code=400, content=ErrorResponse(error_code="invalid_price_range", error_message="Minimum price cannot exceed maximum price", error_details={...}).model_dump(mode="json"))`
  2. If `category` provided and not in valid categories → Return 400 with `error_code="invalid_category"`
  3. If `sort_by` provided and not in valid sort values → Return 400 with `error_code="invalid_sort_option"`
- **IMPLEMENT**: On valid input, call `product_service.filter_products(...)` and return `ProductListResponse`
- **LOGGING**: Log the request with all filter params; log the response with count
- **PATTERN**: Follow existing `logger.info("api_request_received", ...)` pattern in this file
- **GOTCHA**: The test expects `error_code` at the top level of the JSON response (not nested under `detail`). Use `JSONResponse` directly, NOT `HTTPException` — `HTTPException` wraps errors under `{"detail": ...}` which doesn't match the test assertions
- **GOTCHA**: Use `ErrorResponse.model_dump(mode="json")` to ensure the timestamp serializes correctly
- **VALIDATE**: `cd app/backend && uv run python -c "from app.main import app; print('routes ok')"`

### Task 3: UPDATE `app/backend/tests/test_products_filtering.py`

Remove all `@pytest.mark.skip(reason="Not implemented yet - this is your exercise!")` decorators (8 total). Keep the test functions and their content exactly as-is.

- **IMPLEMENT**: Delete the 8 lines containing `@pytest.mark.skip` — one before each test function
- **GOTCHA**: Do NOT modify the test bodies — they define the exact API contract
- **VALIDATE**: `cd app/backend && uv run pytest tests/test_products_filtering.py -v`

### Task 4: VALIDATE backend — Run full test suite

- **VALIDATE**: `cd app/backend && uv run pytest -v`
- **EXPECTED**: All tests in `test_products_basic.py` AND `test_products_filtering.py` pass
- **VALIDATE**: `cd app/backend && uv run ruff check .`
- **VALIDATE**: `cd app/backend && uv run ruff format --check .`

### Task 5: UPDATE `app/frontend/src/lib/api-client.ts`

Update `fetchProducts()` to accept optional `ProductFilterParams` and build a query string.

- **IMPLEMENT**: Change the function signature:

  ```typescript
  import type { ProductFilterParams, ProductListResponse } from "@/types/product";

  export async function fetchProducts(filters?: ProductFilterParams): Promise<ProductListResponse> {
  ```

- **IMPLEMENT**: Build query string from filters before the fetch call:
  ```typescript
  const params = new URLSearchParams();
  if (filters?.minimum_price_usd !== undefined)
    params.append("min_price_usd", String(filters.minimum_price_usd));
  if (filters?.maximum_price_usd !== undefined)
    params.append("max_price_usd", String(filters.maximum_price_usd));
  if (filters?.category) params.append("category", filters.category);
  if (filters?.search_keyword)
    params.append("search_keyword", filters.search_keyword);
  if (filters?.sort_by) params.append("sort_by", filters.sort_by);
  const queryString = params.toString();
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`;
  ```
- **LOGGING**: Include filter params in the existing `"fetching_products"` log event
- **PATTERN**: Follow existing error handling and logging patterns in this file
- **GOTCHA**: The `ProductFilterParams` interface uses `minimum_price_usd`/`maximum_price_usd` (frontend naming) but the backend expects `min_price_usd`/`max_price_usd` (query param naming) — map correctly in the URLSearchParams
- **VALIDATE**: `cd app/frontend && bun run check`

### Task 6: CREATE `app/frontend/src/components/ProductFilters.tsx`

Create the filter form component using React Hook Form + Zod + shadcn primitives.

- **IMPLEMENT**: Zod schema for form validation:

  ```typescript
  import { z } from "zod";

  const filterSchema = z
    .object({
      minimum_price_usd: z.string().optional(),
      maximum_price_usd: z.string().optional(),
      category: z.string().optional(),
      search_keyword: z.string().optional(),
      sort_by: z.string().optional(),
    })
    .refine(
      (data) => {
        const min = data.minimum_price_usd
          ? parseFloat(data.minimum_price_usd)
          : undefined;
        const max = data.maximum_price_usd
          ? parseFloat(data.maximum_price_usd)
          : undefined;
        if (min !== undefined && max !== undefined) return min <= max;
        return true;
      },
      {
        message: "Minimum price cannot exceed maximum price",
        path: ["minimum_price_usd"],
      },
    );
  ```

- **IMPLEMENT**: Component with React Hook Form:
  ```typescript
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  ```
- **IMPLEMENT**: UI layout — a responsive grid/flex form with:
  1. Search input (keyword) — `Input` component, `type="text"`, placeholder "Search products..."
  2. Min price input — `Input` component, `type="number"`, step="0.01", min="0"
  3. Max price input — `Input` component, `type="number"`, step="0.01", min="0"
  4. Category select — `Select` component with options: All Categories, Electronics, Clothing, Home, Sports, Books
  5. Sort by select — `Select` component with options: Default, Price: Low to High, Price: High to Low, Name: A to Z, Name: Z to A
  6. Apply Filters button — `Button` component, variant="default"
  7. Clear Filters button — `Button` component, variant="outline"
- **IMPLEMENT**: Props interface:
  ```typescript
  interface ProductFiltersProps {
    onApplyFilters: (filters: ProductFilterParams) => void;
    onClearFilters: () => void;
    loading: boolean;
  }
  ```
- **IMPLEMENT**: `onSubmit` handler:
  - Convert form string values to `ProductFilterParams` (parse numbers, map empty strings to undefined)
  - Log filter application: `logger.info("filters_applied", { ...filterValues })`
  - Call `onApplyFilters(params)`
- **IMPLEMENT**: `onClear` handler:
  - `form.reset()` to clear all fields
  - Log: `logger.info("filters_cleared", { operation: "clear_filters" })`
  - Call `onClearFilters()`
- **IMPORTS**: Use `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/select`, `@/components/ui/label`, `@/lib/logger`, `@/types/product`
- **PATTERN**: Use shadcn `Select`/`SelectTrigger`/`SelectContent`/`SelectItem`/`SelectValue` — NOT native `<select>` (follow existing component conventions)
- **PATTERN**: Use native form handling with `useForm` register for text/number inputs. For shadcn Select (which doesn't expose a native input), use `setValue` + `watch` from react-hook-form or Controller
- **GOTCHA**: shadcn Select is a Radix controlled component — it doesn't work with `register()`. Use `Controller` from react-hook-form or manual `setValue`/`watch`
- **GOTCHA**: Biome linter is active — no unused imports, no `any` types, use `type` imports where appropriate
- **VALIDATE**: `cd app/frontend && bun run check`

### Task 7: UPDATE `app/frontend/src/App.tsx`

Integrate the filter component into the main app.

- **IMPLEMENT**: Import `ProductFilters` and `ProductFilterParams`
  ```typescript
  import { ProductFilters } from "@/components/ProductFilters";
  import type { ProductFilterParams } from "@/types/product";
  ```
- **IMPLEMENT**: Add filter state:
  ```typescript
  const [filters, setFilters] = useState<ProductFilterParams | undefined>(
    undefined,
  );
  ```
- **IMPLEMENT**: Update `loadProducts` to accept optional filters and pass them to `fetchProducts()`:
  ```typescript
  const loadProducts = useCallback(
    async (filterParams?: ProductFilterParams) => {
      // ... existing loading logic ...
      const response = await fetchProducts(filterParams);
      // ...
    },
    [],
  );
  ```
- **IMPLEMENT**: Create handler functions:

  ```typescript
  const handleApplyFilters = useCallback(
    (newFilters: ProductFilterParams) => {
      setFilters(newFilters);
      loadProducts(newFilters);
    },
    [loadProducts],
  );

  const handleClearFilters = useCallback(() => {
    setFilters(undefined);
    loadProducts();
  }, [loadProducts]);
  ```

- **IMPLEMENT**: Render `ProductFilters` above the product grid, inside `<main>`:
  ```tsx
  <ProductFilters
    onApplyFilters={handleApplyFilters}
    onClearFilters={handleClearFilters}
    loading={loading}
  />
  ```
- **IMPLEMENT**: Update the header subtitle to show filter status:
  ```tsx
  {
    loading
      ? "Loading products..."
      : error
        ? "Error loading products"
        : filters
          ? `Showing ${products.length} filtered products`
          : `Browse our collection of ${products.length} products`;
  }
  ```
- **LOGGING**: Log filter operations in the handlers
- **PATTERN**: Follow existing `useCallback` + `useState` patterns in this file
- **GOTCHA**: `loadProducts` is in the `useEffect` dependency array — make sure the initial load still works with no filters
- **VALIDATE**: `cd app/frontend && bun run check`

### Task 8: VALIDATE frontend — Lint and Build

- **VALIDATE**: `cd app/frontend && bun run check`
- **VALIDATE**: `cd app/frontend && bun run build`

### Task 9: VALIDATE full stack — Manual Browser Testing with Agent Browser

Start both servers and test the full filtering flow in the browser.

- **SETUP**: Start backend: `cd app/backend && uv run python run_api.py` (background)
- **SETUP**: Start frontend: `cd app/frontend && bun dev` (background)
- **TEST**: Open `http://localhost:3000` — verify all 30 products load
- **TEST**: Enter "wireless" in search → Apply → verify only wireless products shown
- **TEST**: Select category "electronics" → Apply → verify only electronics shown
- **TEST**: Enter min price 50, max price 200 → Apply → verify price range
- **TEST**: Select sort "Price: Low to High" → Apply → verify ordering
- **TEST**: Combine: category "books" + sort "Name: A to Z" → Apply → verify
- **TEST**: Click Clear Filters → verify all 30 products return
- **TEST**: Enter min price 500, max price 10 → Apply → verify validation error shown
- **TEST**: Enter search with no results (e.g., "xyznonexistent") → Apply → verify empty state

Use Agent Browser (or Playwright MCP) to automate these manual checks.

---

## TESTING STRATEGY

### Unit Tests (Backend — Already Written)

All 8 tests in `test_products_filtering.py` cover:

- Min price filter only
- Max price filter only
- Price range (both min + max)
- Category filter
- Keyword search (case-insensitive, name + description)
- Multiple params combined (category + max price)
- Invalid price range → 400 error with `error_code: "invalid_price_range"`
- No filters → all 30 products (backwards compatibility)

Plus 4 existing tests in `test_products_basic.py` (must not regress):

- Returns 200
- Correct JSON structure
- Returns 30 products
- Product objects have required fields

### Edge Cases

- Empty search keyword (zero-length) → should be ignored (treated as no filter)
- Category with wrong case → should return 400 (exact match)
- Price of 0 → `gt=0` on Query should reject
- Negative price → `gt=0` on Query should reject
- Sort with no other filters → should sort all 30 products
- All filters producing 0 results → return `{ products: [], total_count: 0 }`

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
# Backend
cd app/backend && uv run ruff check .
cd app/backend && uv run ruff format --check .

# Frontend
cd app/frontend && bun run check
```

### Level 2: Backend Tests

```bash
cd app/backend && uv run pytest -v
```

### Level 3: Frontend Build

```bash
cd app/frontend && bun run build
```

### Level 4: Manual Validation (Agent Browser / Playwright MCP)

1. Start backend: `cd app/backend && uv run python run_api.py`
2. Start frontend: `cd app/frontend && bun dev`
3. Open `http://localhost:3000`
4. Test each filter type individually
5. Test combined filters
6. Test clear filters
7. Test validation error (min > max)
8. Test empty results
9. Verify loading state appears during filter operations
10. Check browser console for structured JSON logs

### Level 5: Direct API Validation

```bash
# No filters (backward compat)
curl -s http://localhost:8000/api/products | python3 -m json.tool | head -5

# Category filter
curl -s "http://localhost:8000/api/products?category=electronics" | python3 -m json.tool | head -5

# Price range
curl -s "http://localhost:8000/api/products?min_price_usd=50&max_price_usd=150" | python3 -m json.tool | head -5

# Invalid range (expect 400)
curl -s -w "\nHTTP Status: %{http_code}\n" "http://localhost:8000/api/products?min_price_usd=100&max_price_usd=50"

# Keyword search
curl -s "http://localhost:8000/api/products?search_keyword=wireless" | python3 -m json.tool | head -5

# Sort
curl -s "http://localhost:8000/api/products?sort_by=price_asc" | python3 -m json.tool | head -20

# Combined
curl -s "http://localhost:8000/api/products?category=electronics&max_price_usd=50&sort_by=price_asc" | python3 -m json.tool
```

---

## ACCEPTANCE CRITERIA

### FEAT-1234 (Backend)

- [x] All 8 filtering tests pass (`uv run pytest tests/test_products_filtering.py -v`)
- [x] All 4 basic tests still pass (`uv run pytest tests/test_products_basic.py -v`)
- [x] Invalid price range (min > max) returns HTTP 400 with `error_code: "invalid_price_range"`
- [x] No filters = all 30 products (backwards compatible)
- [x] Follows existing layered architecture (route → service → data)
- [x] Structured logging for filter operations
- [x] Ruff check and format pass

### FEAT-1235 (Frontend)

- [x] Price filtering interface sends `min_price_usd` / `max_price_usd` query params
- [x] Category selection sends `category` query param
- [x] Search input sends `search_keyword` query param
- [x] Sort options send `sort_by` query param
- [x] Multiple filters work together (combined)
- [x] Clear filters returns to showing all products
- [x] Validation errors displayed (min > max price)
- [x] Empty state shown when no products match
- [x] Loading state shown during filter operations
- [x] All filter interactions logged as structured JSON to console
- [x] Biome check passes
- [x] Build succeeds

---

## COMPLETION CHECKLIST

- [ ] Task 1: `filter_products()` added to service layer
- [ ] Task 2: Route handler updated with query params + validation
- [ ] Task 3: Test skip decorators removed
- [ ] Task 4: All backend tests pass + ruff clean
- [ ] Task 5: `fetchProducts()` accepts filter params
- [ ] Task 6: `ProductFilters.tsx` component created
- [ ] Task 7: `App.tsx` integrated with filters
- [ ] Task 8: Frontend lint + build pass
- [ ] Task 9: Manual browser testing confirms full flow

---

## NOTES

- **Query param naming mismatch**: Frontend `ProductFilterParams` uses `minimum_price_usd`/`maximum_price_usd` while backend expects `min_price_usd`/`max_price_usd`. The API client must map between these when building the query string.
- **ErrorResponse format**: Use `JSONResponse` with `ErrorResponse.model_dump(mode="json")` — do NOT use `HTTPException` because `HTTPException` wraps the error under `{"detail": ...}` which doesn't match the test expectations.
- **shadcn Select + React Hook Form**: Radix Select doesn't expose a native input, so `register()` won't work. Use `Controller` from react-hook-form or manual `setValue`/`watch` to control Select values.
- **Decimal handling**: FastAPI `Query(gt=0)` with `Decimal` type will auto-validate that prices are positive. The service layer receives `Decimal` values directly.
- **Sort stability**: Python's `sorted()` is stable, so products with equal sort keys maintain their original order.

/**
 * FilterPanel component for filtering and sorting products.
 *
 * Provides controls for:
 * - Keyword search (product name and description)
 * - Category selection
 * - Price range (min / max)
 * - Sort order
 * - Clear all filters
 *
 * All filter changes call the onFiltersChange callback so the parent
 * component can reload products with the updated parameters.
 */

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logger } from "@/lib/logger";
import type { ProductFilterParams } from "@/types/product";

interface FilterPanelProps {
  /** Called whenever the user applies or clears filters */
  onFiltersChange: (filters: ProductFilterParams) => void;

  /** Whether a filter operation is currently in progress */
  loading: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "home", label: "Home" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
] as const;

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
] as const;

/** Sentinel value used by shadcn Select to represent "no selection" */
const NONE_VALUE = "__none__";

/**
 * Product filter / sort panel.
 *
 * Keeps local draft state; the parent is only notified when the user
 * explicitly clicks "Apply Filters" or "Clear Filters".
 */
export function FilterPanel({ onFiltersChange, loading }: FilterPanelProps) {
  const searchId = useId();
  const categoryId = useId();
  const sortId = useId();

  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [category, setCategory] = useState<string>(NONE_VALUE);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>(NONE_VALUE);
  const [validationError, setValidationError] = useState<string | null>(null);

  /** Build ProductFilterParams from current form state, omitting empty values. */
  function buildFilters(): ProductFilterParams | null {
    const filters: ProductFilterParams = {};

    const parsedMin = minPrice !== "" ? parseFloat(minPrice) : undefined;
    const parsedMax = maxPrice !== "" ? parseFloat(maxPrice) : undefined;

    if (parsedMin !== undefined && (Number.isNaN(parsedMin) || parsedMin <= 0)) {
      setValidationError("Minimum price must be a positive number.");
      return null;
    }
    if (parsedMax !== undefined && (Number.isNaN(parsedMax) || parsedMax <= 0)) {
      setValidationError("Maximum price must be a positive number.");
      return null;
    }
    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      setValidationError("Minimum price cannot exceed maximum price.");
      return null;
    }

    setValidationError(null);

    if (parsedMin !== undefined) {
      filters.min_price_usd = parsedMin;
    }
    if (parsedMax !== undefined) {
      filters.max_price_usd = parsedMax;
    }
    if (category !== NONE_VALUE) {
      filters.category = category as ProductFilterParams["category"];
    }
    if (searchKeyword.trim()) {
      filters.search_keyword = searchKeyword.trim();
    }
    if (sortBy !== NONE_VALUE) {
      filters.sort_by = sortBy as ProductFilterParams["sort_by"];
    }

    return filters;
  }

  function handleApply() {
    const filters = buildFilters();
    if (filters === null) {
      return;
    }

    logger.info("filter_panel_apply", {
      filters,
      operation: "handleApply",
      component: "FilterPanel",
    });

    onFiltersChange(filters);
  }

  function handleClear() {
    setSearchKeyword("");
    setCategory(NONE_VALUE);
    setMinPrice("");
    setMaxPrice("");
    setSortBy(NONE_VALUE);
    setValidationError(null);

    logger.info("filter_panel_clear", {
      operation: "handleClear",
      component: "FilterPanel",
    });

    onFiltersChange({});
  }

  return (
    <div className="bg-card border rounded-lg p-4 mb-6 space-y-4">
      <h2 className="text-lg font-semibold">Filter &amp; Sort</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Keyword search */}
        <div className="space-y-1.5">
          <Label htmlFor={searchId}>Search</Label>
          <Input
            id={searchId}
            placeholder="Search products…"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor={categoryId}>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id={categoryId}>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>All categories</SelectItem>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price range */}
        <div className="space-y-1.5">
          <Label>Price Range (USD)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              min={0}
              step="0.01"
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full"
              aria-label="Minimum price"
            />
            <span className="text-muted-foreground text-sm">–</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              min={0}
              step="0.01"
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full"
              aria-label="Maximum price"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-1.5">
          <Label htmlFor={sortId}>Sort By</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id={sortId}>
              <SelectValue placeholder="Default order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>Default order</SelectItem>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button onClick={handleApply} disabled={loading}>
          {loading ? "Loading…" : "Apply Filters"}
        </Button>
        <Button variant="outline" onClick={handleClear} disabled={loading}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

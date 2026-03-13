/**
 * FilterForm component for filtering and sorting the product catalog.
 *
 * Features:
 * - Keyword search input
 * - Category selector (all categories or a specific one)
 * - Minimum and maximum price inputs
 * - Sort order selector
 * - Apply and Clear buttons
 *
 * Validation (via Zod + React Hook Form):
 * - Prices must be positive numbers
 * - min_price_usd must not exceed max_price_usd
 *
 * Logging:
 * - All filter interactions are logged as structured JSON
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logger } from "@/lib/logger";
import type { ProductFilterParams } from "@/types/product";

/** Zod schema for filter form validation */
const filterSchema = z
  .object({
    search_keyword: z.string().optional(),
    category: z.enum(["", "electronics", "clothing", "home", "sports", "books"]).optional(),
    min_price_usd: z
      .string()
      .optional()
      .transform((val) => (val === "" || val === undefined ? undefined : Number(val)))
      .pipe(z.number().positive("Minimum price must be a positive number").optional()),
    max_price_usd: z
      .string()
      .optional()
      .transform((val) => (val === "" || val === undefined ? undefined : Number(val)))
      .pipe(z.number().positive("Maximum price must be a positive number").optional()),
    sort_by: z.enum(["", "price_asc", "price_desc", "name_asc", "name_desc"]).optional(),
  })
  .refine(
    (data) => {
      if (data.min_price_usd !== undefined && data.max_price_usd !== undefined) {
        return data.min_price_usd <= data.max_price_usd;
      }
      return true;
    },
    {
      message: "Minimum price cannot exceed maximum price",
      path: ["min_price_usd"],
    }
  );

type FilterFormValues = z.input<typeof filterSchema>;
type FilterFormOutput = z.output<typeof filterSchema>;

interface FilterFormProps {
  /** Called when the user applies filters */
  onApply: (filters: ProductFilterParams) => void;
  /** Called when the user clears all filters */
  onClear: () => void;
  /** Whether the product list is currently loading */
  loading: boolean;
}

/**
 * Product filter form with search, category, price range, and sort controls.
 *
 * @param onApply - Callback with applied filter params
 * @param onClear - Callback when filters are cleared
 * @param loading - Disable controls while loading
 */
export function FilterForm({ onApply, onClear, loading }: FilterFormProps) {
  const formId = useId();
  const ids = {
    search_keyword: `${formId}-search`,
    category: `${formId}-category`,
    sort_by: `${formId}-sort`,
    min_price_usd: `${formId}-min-price`,
    max_price_usd: `${formId}-max-price`,
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search_keyword: "",
      category: "",
      min_price_usd: "",
      max_price_usd: "",
      sort_by: "",
    },
  });

  const onSubmit = (data: FilterFormOutput) => {
    const filters: ProductFilterParams = {};

    if (data.search_keyword) {
      filters.search_keyword = data.search_keyword;
    }
    if (data.category && data.category !== "") {
      filters.category = data.category as ProductFilterParams["category"];
    }
    if (data.min_price_usd !== undefined) {
      filters.min_price_usd = data.min_price_usd;
    }
    if (data.max_price_usd !== undefined) {
      filters.max_price_usd = data.max_price_usd;
    }
    if (data.sort_by && data.sort_by !== "") {
      filters.sort_by = data.sort_by as ProductFilterParams["sort_by"];
    }

    logger.info("filter_applied", {
      filters,
      operation: "FilterForm.onSubmit",
      component: "FilterForm",
    });

    onApply(filters);
  };

  const handleClear = () => {
    reset({
      search_keyword: "",
      category: "",
      min_price_usd: "",
      max_price_usd: "",
      sort_by: "",
    });

    logger.info("filter_cleared", {
      operation: "FilterForm.handleClear",
      component: "FilterForm",
    });

    onClear();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border rounded-lg p-4 mb-6 space-y-4"
      aria-label="Product filters"
    >
      <h2 className="text-lg font-semibold">Filter Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search keyword */}
        <div className="space-y-1">
          <Label htmlFor={ids.search_keyword}>Search</Label>
          <Input
            id={ids.search_keyword}
            type="text"
            placeholder="Search products..."
            disabled={loading}
            {...register("search_keyword")}
          />
        </div>

        {/* Category selector */}
        <div className="space-y-1">
          <Label htmlFor={ids.category}>Category</Label>
          <Select
            disabled={loading}
            onValueChange={(value) => setValue("category", value as FilterFormValues["category"])}
          >
            <SelectTrigger id={ids.category}>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="books">Books</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort order */}
        <div className="space-y-1">
          <Label htmlFor={ids.sort_by}>Sort By</Label>
          <Select
            disabled={loading}
            onValueChange={(value) => setValue("sort_by", value as FilterFormValues["sort_by"])}
          >
            <SelectTrigger id={ids.sort_by}>
              <SelectValue placeholder="Default order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default order</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name_asc">Name: A to Z</SelectItem>
              <SelectItem value="name_desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min price */}
        <div className="space-y-1">
          <Label htmlFor={ids.min_price_usd}>Min Price (USD)</Label>
          <Input
            id={ids.min_price_usd}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={loading}
            aria-invalid={!!errors.min_price_usd}
            {...register("min_price_usd")}
          />
          {errors.min_price_usd && <p className="text-sm text-destructive">{errors.min_price_usd.message}</p>}
        </div>

        {/* Max price */}
        <div className="space-y-1">
          <Label htmlFor={ids.max_price_usd}>Max Price (USD)</Label>
          <Input
            id={ids.max_price_usd}
            type="number"
            min="0"
            step="0.01"
            placeholder="Any"
            disabled={loading}
            aria-invalid={!!errors.max_price_usd}
            {...register("max_price_usd")}
          />
          {errors.max_price_usd && <p className="text-sm text-destructive">{errors.max_price_usd.message}</p>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Apply Filters"}
        </Button>
        <Button type="button" variant="outline" onClick={handleClear} disabled={loading}>
          Clear Filters
        </Button>
      </div>
    </form>
  );
}

/**
 * ProductFilters component for filtering the product catalog.
 *
 * Provides inputs for keyword search, category, price range, and sort order.
 * Uses React Hook Form with Zod validation. Calls parent callbacks on apply/clear.
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
      const min = data.minimum_price_usd ? parseFloat(data.minimum_price_usd) : undefined;
      const max = data.maximum_price_usd ? parseFloat(data.maximum_price_usd) : undefined;
      if (min !== undefined && max !== undefined) {
        return min <= max;
      }
      return true;
    },
    {
      message: "Minimum price cannot exceed maximum price",
      path: ["minimum_price_usd"],
    }
  );

type FilterFormValues = z.infer<typeof filterSchema>;

interface ProductFiltersProps {
  onApplyFilters: (filters: ProductFilterParams) => void;
  onClearFilters: () => void;
  loading: boolean;
}

/**
 * ProductFilters component.
 *
 * Renders a filter form above the product grid. Validates price range
 * client-side and converts form values to ProductFilterParams on submit.
 */
export function ProductFilters({ onApplyFilters, onClearFilters, loading }: ProductFiltersProps) {
  const searchId = useId();
  const minPriceId = useId();
  const maxPriceId = useId();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      minimum_price_usd: "",
      maximum_price_usd: "",
      category: "",
      search_keyword: "",
      sort_by: "",
    },
  });

  const categoryValue = watch("category");
  const sortByValue = watch("sort_by");

  function onSubmit(data: FilterFormValues) {
    const filters: ProductFilterParams = {};

    if (data.minimum_price_usd) {
      filters.minimum_price_usd = parseFloat(data.minimum_price_usd);
    }
    if (data.maximum_price_usd) {
      filters.maximum_price_usd = parseFloat(data.maximum_price_usd);
    }
    if (data.category) {
      filters.category = data.category as ProductFilterParams["category"];
    }
    if (data.search_keyword) {
      filters.search_keyword = data.search_keyword;
    }
    if (data.sort_by) {
      filters.sort_by = data.sort_by as ProductFilterParams["sort_by"];
    }

    logger.info("filters_applied", { filters, operation: "apply_filters", component: "ProductFilters" });
    onApplyFilters(filters);
  }

  function handleClear() {
    reset();
    logger.info("filters_cleared", { operation: "clear_filters", component: "ProductFilters" });
    onClearFilters();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 rounded-lg border bg-card p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Search keyword */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={searchId}>Search</Label>
          <Input id={searchId} placeholder="Search products..." {...register("search_keyword")} />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <Label>Category</Label>
          <Select
            value={categoryValue ?? ""}
            onValueChange={(val) => setValue("category", val, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="books">Books</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort by */}
        <div className="flex flex-col gap-1">
          <Label>Sort By</Label>
          <Select value={sortByValue ?? ""} onValueChange={(val) => setValue("sort_by", val, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name_asc">Name: A-Z</SelectItem>
              <SelectItem value="name_desc">Name: Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min price */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={minPriceId}>Min Price ($)</Label>
          <Input
            id={minPriceId}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("minimum_price_usd")}
          />
          {errors.minimum_price_usd && <p className="text-sm text-destructive">{errors.minimum_price_usd.message}</p>}
        </div>

        {/* Max price */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={maxPriceId}>Max Price ($)</Label>
          <Input
            id={maxPriceId}
            type="number"
            step="0.01"
            min="0"
            placeholder="999.99"
            {...register("maximum_price_usd")}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={loading}>
          Apply Filters
        </Button>
        <Button type="button" variant="outline" onClick={handleClear} disabled={loading}>
          Clear Filters
        </Button>
      </div>
    </form>
  );
}

/**
 * ProductFilters component for filtering the product catalog.
 *
 * Provides a form with:
 * - Keyword search input
 * - Min/max price inputs
 * - Category select
 * - Sort order select
 * - Apply and Clear buttons
 *
 * Uses React Hook Form + Zod for validation, and shadcn/ui primitives.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
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

export function ProductFilters({ onApplyFilters, onClearFilters, loading }: ProductFiltersProps) {
  const uid = useId();
  const searchId = `${uid}-search`;
  const minPriceId = `${uid}-min-price`;
  const maxPriceId = `${uid}-max-price`;
  const categoryId = `${uid}-category`;
  const sortById = `${uid}-sort-by`;

  const {
    register,
    handleSubmit,
    control,
    reset,
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

  const onSubmit = (data: FilterFormValues) => {
    const params: ProductFilterParams = {};

    if (data.minimum_price_usd) {
      params.minimum_price_usd = parseFloat(data.minimum_price_usd);
    }
    if (data.maximum_price_usd) {
      params.maximum_price_usd = parseFloat(data.maximum_price_usd);
    }
    if (data.category && data.category !== "all") {
      params.category = data.category as ProductFilterParams["category"];
    }
    if (data.search_keyword) {
      params.search_keyword = data.search_keyword;
    }
    if (data.sort_by && data.sort_by !== "default") {
      params.sort_by = data.sort_by as ProductFilterParams["sort_by"];
    }

    logger.info("filters_applied", {
      category: params.category,
      search_keyword: params.search_keyword,
      min_price: params.minimum_price_usd,
      max_price: params.maximum_price_usd,
      sort_by: params.sort_by,
      operation: "apply_filters",
    });

    onApplyFilters(params);
  };

  const onClear = () => {
    reset();

    logger.info("filters_cleared", { operation: "clear_filters" });

    onClearFilters();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-card border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Search keyword */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={searchId}>Search</Label>
          <Input id={searchId} type="text" placeholder="Search products..." {...register("search_keyword")} />
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
          {errors.minimum_price_usd && <p className="text-destructive text-xs">{errors.minimum_price_usd.message}</p>}
        </div>

        {/* Max price */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={maxPriceId}>Max Price ($)</Label>
          <Input
            id={maxPriceId}
            type="number"
            step="0.01"
            min="0"
            placeholder="9999.99"
            {...register("maximum_price_usd")}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={categoryId}>Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id={categoryId}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Sort by */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={sortById}>Sort By</Label>
          <Controller
            name="sort_by"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id={sortById}>
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name_asc">Name: A to Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <Button type="submit" variant="default" disabled={loading}>
          Apply Filters
        </Button>
        <Button type="button" variant="outline" onClick={onClear} disabled={loading}>
          Clear Filters
        </Button>
      </div>
    </form>
  );
}

export default ProductFilters;

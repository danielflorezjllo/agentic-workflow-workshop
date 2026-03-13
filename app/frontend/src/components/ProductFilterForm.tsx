/**
 * ProductFilterForm component for filtering and sorting the product catalog.
 *
 * Uses React Hook Form + Zod for validation.
 * Sends structured log events on apply and clear.
 *
 * Supports:
 * - Minimum / maximum price range
 * - Category selection
 * - Keyword search
 * - Sort order
 * - Apply and clear actions
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logger } from "@/lib/logger";
import type { ProductCategory, ProductFilterParams } from "@/types/product";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const filterSchema = z
  .object({
    minimum_price_usd: z
      .string()
      .optional()
      .refine((v) => v === undefined || v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
        message: "Minimum price must be a non-negative number",
      }),
    maximum_price_usd: z
      .string()
      .optional()
      .refine((v) => v === undefined || v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
        message: "Maximum price must be a non-negative number",
      }),
    category: z.string().optional(),
    search_keyword: z.string().optional(),
    sort_by: z.string().optional(),
  })
  .refine(
    (data) => {
      const min = data.minimum_price_usd ? Number(data.minimum_price_usd) : undefined;
      const max = data.maximum_price_usd ? Number(data.maximum_price_usd) : undefined;
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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductFilterFormProps {
  /** Called when the user applies filters */
  onApplyFilters: (filters: ProductFilterParams) => void;
  /** Called when the user clears all filters */
  onClearFilters: () => void;
  /** Whether a filter operation is in progress */
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "home", label: "Home" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
];

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "name_desc", label: "Name: Z → A" },
];

const EMPTY_FORM: FilterFormValues = {
  minimum_price_usd: "",
  maximum_price_usd: "",
  category: "",
  search_keyword: "",
  sort_by: "",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Render the product filter / sort form.
 *
 * @param onApplyFilters - Callback invoked with validated filter params
 * @param onClearFilters - Callback invoked when all filters are cleared
 * @param loading - Disables form while a fetch is in progress
 */
export function ProductFilterForm({ onApplyFilters, onClearFilters, loading }: ProductFilterFormProps) {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: EMPTY_FORM,
  });

  function handleSubmit(values: FilterFormValues) {
    const filters: ProductFilterParams = {};

    if (values.minimum_price_usd && values.minimum_price_usd !== "") {
      filters.minimum_price_usd = Number(values.minimum_price_usd);
    }
    if (values.maximum_price_usd && values.maximum_price_usd !== "") {
      filters.maximum_price_usd = Number(values.maximum_price_usd);
    }
    if (values.category && values.category !== "") {
      filters.category = values.category as ProductCategory;
    }
    if (values.search_keyword && values.search_keyword.trim() !== "") {
      filters.search_keyword = values.search_keyword.trim();
    }
    if (values.sort_by && values.sort_by !== "") {
      filters.sort_by = values.sort_by as ProductFilterParams["sort_by"];
    }

    logger.info("filter_applied", {
      filters,
      operation: "apply_filters",
      component: "ProductFilterForm",
    });

    onApplyFilters(filters);
  }

  function handleClear() {
    form.reset(EMPTY_FORM);

    logger.info("filters_cleared", {
      operation: "clear_filters",
      component: "ProductFilterForm",
    });

    onClearFilters();
  }

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filter Products</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Price range row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minimum_price_usd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Price (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maximum_price_usd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Price (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="Any" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category and sort row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sort_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort By</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Default order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Keyword search */}
          <FormField
            control={form.control}
            name="search_keyword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Search by name or description..." {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading}>
              {loading ? "Filtering…" : "Apply Filters"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClear} disabled={loading}>
              Clear Filters
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

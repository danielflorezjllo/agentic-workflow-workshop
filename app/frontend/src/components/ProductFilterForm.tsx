/**
 * ProductFilterForm component for filtering the product catalog.
 *
 * Provides controls for:
 * - Minimum and maximum price range inputs
 * - Category selector (all categories or a specific one)
 * - Keyword search input
 * - Sort order selector
 * - Apply and Clear buttons
 *
 * Uses React Hook Form with Zod validation so users get immediate
 * feedback when they enter invalid filter values (e.g. min > max).
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
      .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
      .pipe(z.number().positive("Must be a positive number").optional()),

    maximum_price_usd: z
      .string()
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
      .pipe(z.number().positive("Must be a positive number").optional()),

    category: z.enum(["all", "electronics", "clothing", "home", "sports", "books"]).optional().default("all"),

    search_keyword: z.string().optional().default(""),

    sort_by: z.enum(["none", "price_asc", "price_desc", "name_asc", "name_desc"]).optional().default("none"),
  })
  .refine(
    (data) => {
      if (data.minimum_price_usd !== undefined && data.maximum_price_usd !== undefined) {
        return data.minimum_price_usd <= data.maximum_price_usd;
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
  /** Called when user submits valid filter values */
  onApplyFilters: (filters: ProductFilterParams) => void;
  /** Called when user clears all filters */
  onClearFilters: () => void;
  /** Whether a product fetch is currently in progress */
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders filter controls for the product catalog.
 *
 * @param onApplyFilters - Callback with validated filter params
 * @param onClearFilters - Callback to reset to unfiltered state
 * @param loading - Disables controls while a fetch is in progress
 */
export function ProductFilterForm({ onApplyFilters, onClearFilters, loading }: ProductFilterFormProps) {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      minimum_price_usd: undefined,
      maximum_price_usd: undefined,
      category: "all",
      search_keyword: "",
      sort_by: "none",
    },
  });

  // Build ProductFilterParams from validated form values and pass to parent
  function handleSubmit(values: FilterFormValues) {
    const filters: ProductFilterParams = {};

    if (values.minimum_price_usd !== undefined) {
      filters.minimum_price_usd = values.minimum_price_usd;
    }
    if (values.maximum_price_usd !== undefined) {
      filters.maximum_price_usd = values.maximum_price_usd;
    }
    if (values.category && values.category !== "all") {
      filters.category = values.category as ProductCategory;
    }
    if (values.search_keyword && values.search_keyword.trim() !== "") {
      filters.search_keyword = values.search_keyword.trim();
    }
    if (values.sort_by && values.sort_by !== "none") {
      filters.sort_by = values.sort_by as ProductFilterParams["sort_by"];
    }

    logger.info("filter_form_submitted", {
      filters,
      operation: "ProductFilterForm",
    });

    onApplyFilters(filters);
  }

  function handleClear() {
    form.reset({
      minimum_price_usd: undefined,
      maximum_price_usd: undefined,
      category: "all",
      search_keyword: "",
      sort_by: "none",
    });

    logger.info("filter_form_cleared", {
      operation: "ProductFilterForm",
    });

    onClearFilters();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-card border rounded-lg p-4 mb-6 space-y-4">
        <h2 className="text-lg font-semibold">Filter Products</h2>

        {/* Price range row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minimum_price_usd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Price (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="e.g. 10"
                    disabled={loading}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
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
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="e.g. 200"
                    disabled={loading}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category, search, sort row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="search_keyword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g. wireless" disabled={loading} {...field} />
                </FormControl>
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
                <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Default order" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Default order</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="name_asc">Name: A–Z</SelectItem>
                    <SelectItem value="name_desc">Name: Z–A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={loading}>
            {loading ? "Loading…" : "Apply Filters"}
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={handleClear}>
            Clear Filters
          </Button>
        </div>
      </form>
    </Form>
  );
}

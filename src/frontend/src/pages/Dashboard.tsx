import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Package, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useAllProducts, useLowStockProducts } from "../hooks/useQueries";

export default function Dashboard() {
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: lowStock, isLoading: lowStockLoading } = useLowStockProducts();

  const totalProducts = useMemo(() => products?.length ?? 0, [products]);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Overview of your wholesale inventory
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <Card
            data-ocid="dashboard.total_products.card"
            className="stat-card-glow border-border hover:border-primary/30 transition-colors"
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <div className="text-blue-400 bg-muted/50 p-2 rounded-md">
                <Package className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="font-display text-3xl font-bold text-blue-400">
                  {totalProducts}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35 }}
        >
          <Card
            data-ocid="dashboard.low_stock_count.card"
            className="stat-card-glow border-border hover:border-primary/30 transition-colors"
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock Alerts
              </CardTitle>
              <div className="text-destructive bg-muted/50 p-2 rounded-md">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {lowStockLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="font-display text-3xl font-bold text-destructive">
                  {lowStock?.length ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <CardTitle className="font-display text-base">
                Low Stock Alerts (≤ 10 units)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !lowStock || lowStock.length === 0 ? (
              <div
                data-ocid="dashboard.low_stock.empty_state"
                className="py-12 text-center"
              >
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  All products are well stocked!
                </p>
              </div>
            ) : (
              <Table data-ocid="dashboard.low_stock.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((product, idx) => (
                    <TableRow
                      key={product.id.toString()}
                      data-ocid={`dashboard.low_stock.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right font-bold text-destructive">
                        {Number(product.currentStock)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">
                          Reorder Now
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* All Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
      >
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="font-display text-base">
              All Products — Stock Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {productsLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No products yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const isLow = Number(p.currentStock) <= 10;
                    return (
                      <TableRow
                        key={p.id.toString()}
                        className={isLow ? "bg-destructive/5" : ""}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isLow && (
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                            )}
                            {p.name}
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${isLow ? "text-destructive" : ""}`}
                        >
                          {Number(p.currentStock)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

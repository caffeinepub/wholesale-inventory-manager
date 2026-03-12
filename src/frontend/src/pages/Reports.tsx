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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { MovementType } from "../backend";
import { useAllProducts, useReport } from "../hooks/useQueries";

type Period = "weekly" | "monthly" | "yearly";

function getPeriodRange(period: Period): {
  start: bigint;
  end: bigint;
  label: string;
} {
  const now = Date.now();
  const days = period === "weekly" ? 7 : period === "monthly" ? 30 : 365;
  const start = BigInt(now - days * 24 * 60 * 60 * 1000) * 1_000_000n;
  const end = BigInt(now) * 1_000_000n;
  const label =
    period === "weekly"
      ? "Last 7 Days"
      : period === "monthly"
        ? "Last 30 Days"
        : "Last 365 Days";
  return { start, end, label };
}

export default function Reports() {
  const [period, setPeriod] = useState<Period>("monthly");
  const { data: products } = useAllProducts();

  const { start, end, label } = useMemo(() => getPeriodRange(period), [period]);
  const { data: report, isLoading } = useReport(start, end, true);

  function formatDate(ts: bigint) {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getProductName(productId: bigint) {
    return (
      products?.find((p) => p.id === productId)?.name ?? `Product #${productId}`
    );
  }

  const overallSummary = report?.overallSummary;
  const sortedMovements = [...(report?.movements ?? [])].sort((a, b) =>
    b.timestamp > a.timestamp ? 1 : -1,
  );
  const productSummaries = report?.productSummaries ?? [];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="font-display text-2xl font-bold">Reports</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Inventory movement analysis and summaries
        </p>
      </motion.div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList className="grid w-full max-w-xs grid-cols-3">
          <TabsTrigger data-ocid="reports.weekly.tab" value="weekly">
            Weekly
          </TabsTrigger>
          <TabsTrigger data-ocid="reports.monthly.tab" value="monthly">
            Monthly
          </TabsTrigger>
          <TabsTrigger data-ocid="reports.yearly.tab" value="yearly">
            Yearly
          </TabsTrigger>
        </TabsList>

        {(["weekly", "monthly", "yearly"] as Period[]).map((p) => (
          <TabsContent key={p} value={p} className="mt-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="stat-card-glow">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Stock In
                      </CardTitle>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <p className="font-display text-3xl font-bold text-green-500">
                        +{Number(overallSummary?.totalIn ?? 0n)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {label}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="stat-card-glow">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Stock Out
                      </CardTitle>
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                      <p className="font-display text-3xl font-bold text-destructive">
                        -{Number(overallSummary?.totalOut ?? 0n)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {label}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="stat-card-glow">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Net Change
                      </CardTitle>
                      <Minus className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const net = Number(overallSummary?.netChange ?? 0n);
                        return (
                          <p
                            className={`font-display text-3xl font-bold ${
                              net > 0
                                ? "text-green-500"
                                : net < 0
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {net >= 0 ? `+${net}` : net}
                          </p>
                        );
                      })()}
                      <p className="text-xs text-muted-foreground mt-1">
                        {label}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Per-Product Summary */}
              {productSummaries.length > 0 && (
                <Card>
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="font-display text-base">
                      Per-Product Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">In</TableHead>
                          <TableHead className="text-right">Out</TableHead>
                          <TableHead className="text-right">Net</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productSummaries.map(([productId, summary], idx) => {
                          const net = Number(summary.netChange);
                          return (
                            <TableRow
                              key={productId.toString()}
                              data-ocid={`reports.product_summary.item.${idx + 1}`}
                            >
                              <TableCell className="font-medium">
                                {getProductName(productId)}
                              </TableCell>
                              <TableCell className="text-right text-green-500">
                                +{Number(summary.totalIn)}
                              </TableCell>
                              <TableCell className="text-right text-destructive">
                                -{Number(summary.totalOut)}
                              </TableCell>
                              <TableCell
                                className={`text-right font-semibold ${
                                  net > 0
                                    ? "text-green-500"
                                    : net < 0
                                      ? "text-destructive"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {net >= 0 ? `+${net}` : net}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Movements Table */}
              <Card>
                <CardHeader className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base">
                      Movement Details
                    </CardTitle>
                    <Badge variant="outline">
                      {sortedMovements.length} records
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-6 space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : sortedMovements.length === 0 ? (
                    <div className="py-12 text-center">
                      <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">
                        No movements in this period
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMovements.map((mv, idx) => {
                          const isIn =
                            mv.movementType === MovementType.stockIn ||
                            (mv.movementType as string) === "stockIn";
                          return (
                            <TableRow
                              key={mv.id.toString()}
                              data-ocid={`reports.movement.item.${idx + 1}`}
                            >
                              <TableCell className="text-muted-foreground text-sm">
                                {formatDate(mv.timestamp)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {getProductName(mv.productId)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={isIn ? "default" : "destructive"}
                                  className={`text-xs ${
                                    isIn
                                      ? "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30 border-0"
                                      : ""
                                  }`}
                                >
                                  {isIn ? (
                                    <>
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      In
                                    </>
                                  ) : (
                                    <>
                                      <TrendingDown className="w-3 h-3 mr-1" />
                                      Out
                                    </>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell
                                className={`text-right font-semibold ${
                                  isIn ? "text-green-500" : "text-destructive"
                                }`}
                              >
                                {isIn
                                  ? `+${Number(mv.quantity)}`
                                  : `-${Number(mv.quantity)}`}
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

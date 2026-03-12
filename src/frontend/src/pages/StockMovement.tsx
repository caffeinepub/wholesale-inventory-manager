import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftRight,
  Loader2,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { MovementType } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProducts,
  useMovementsForProduct,
  useRecordStockMovement,
} from "../hooks/useQueries";

export default function StockMovement() {
  const { data: products } = useAllProducts();
  const recordMovement = useRecordStockMovement();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [movementType, setMovementType] = useState<string>("stockIn");
  const [quantity, setQuantity] = useState("");

  const selectedBigInt = selectedProductId ? BigInt(selectedProductId) : null;
  const { data: movements, isLoading: movementsLoading } =
    useMovementsForProduct(selectedBigInt);

  const selectedProduct = products?.find(
    (p) => p.id.toString() === selectedProductId,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBigInt || !quantity) return;
    try {
      await recordMovement.mutateAsync({
        productId: selectedBigInt,
        movementType:
          movementType === "stockIn" ? MovementType.stockIn : MovementType.out,
        quantity: BigInt(Number.parseInt(quantity)),
        note: "",
      });
      toast.success("Stock movement recorded");
      setQuantity("");
    } catch {
      toast.error("Failed to record movement");
    }
  }

  function formatTimestamp(ts: bigint) {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleString();
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          <h1 className="font-display text-2xl font-bold">Stock Movement</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Record stock-in and stock-out transactions
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-display text-base">
                Record Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Product</Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger data-ocid="movement.product.select">
                      <SelectValue placeholder="Select a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (
                        <SelectItem
                          key={p.id.toString()}
                          value={p.id.toString()}
                        >
                          {p.name} — {Number(p.currentStock)} units
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 text-sm">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      Current stock:
                    </span>
                    <span className="font-semibold">
                      {Number(selectedProduct.currentStock)} units
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Movement Type</Label>
                  <Select value={movementType} onValueChange={setMovementType}>
                    <SelectTrigger data-ocid="movement.type.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stockIn">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          Stock In
                        </div>
                      </SelectItem>
                      <SelectItem value="out">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-destructive" />
                          Stock Out
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    data-ocid="movement.quantity.input"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  data-ocid="movement.submit_button"
                  className="w-full"
                  disabled={
                    !isLoggedIn ||
                    !selectedProductId ||
                    !quantity ||
                    recordMovement.isPending
                  }
                >
                  {recordMovement.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Recording...
                    </>
                  ) : (
                    "Record Movement"
                  )}
                </Button>
                {!isLoggedIn && (
                  <p className="text-xs text-center text-muted-foreground">
                    Sign in to record movements
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Movement History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="h-full">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-display text-base">
                {selectedProduct
                  ? `History — ${selectedProduct.name}`
                  : "Movement History"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {!selectedProductId ? (
                <div className="py-12 text-center">
                  <ArrowLeftRight className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Select a product to view history
                  </p>
                </div>
              ) : movementsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : !movements || movements.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground text-sm">
                    No movements recorded yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...movements]
                    .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))
                    .map((mv) => {
                      const isIn =
                        mv.movementType === MovementType.stockIn ||
                        (mv.movementType as string) === "stockIn";
                      return (
                        <div
                          key={mv.id.toString()}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isIn
                              ? "border-green-500/20 bg-green-500/5"
                              : "border-destructive/20 bg-destructive/5"
                          }`}
                        >
                          <div
                            className={
                              isIn ? "text-green-500" : "text-destructive"
                            }
                          >
                            {isIn ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <Badge
                              variant={isIn ? "default" : "destructive"}
                              className={`text-xs ${
                                isIn
                                  ? "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30 border-0"
                                  : ""
                              }`}
                            >
                              {isIn
                                ? `+${Number(mv.quantity)}`
                                : `-${Number(mv.quantity)}`}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(mv.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Package, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProducts,
  useCreateProduct,
  useDeleteProduct,
} from "../hooks/useQueries";

export default function Inventory() {
  const { data: products, isLoading } = useAllProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function openAdd() {
    setAmount("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number.parseInt(amount);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await createProduct.mutateAsync({
        name: `Entry #${Date.now()}`,
        category: "footwear",
        sku: "",
        unit: "pairs",
        costPrice: 0,
        sellingPrice: 0,
        reorderLevel: 0n,
        initialQuantity: BigInt(qty),
      });
      toast.success("Inventory added");
      setModalOpen(false);
    } catch {
      toast.error("Failed to add inventory");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success("Entry deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-bold">Inventory</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {products?.length ?? 0} entries
          </p>
        </div>
        <Button
          data-ocid="inventory.add_button"
          onClick={isLoggedIn ? openAdd : undefined}
          disabled={!isLoggedIn}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Inventory
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !products || products.length === 0 ? (
            <div
              data-ocid="inventory.empty_state"
              className="py-16 text-center"
            >
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-lg font-semibold">
                No inventory yet
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Add your first inventory entry
              </p>
            </div>
          ) : (
            <Table data-ocid="inventory.table">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead className="text-right">Amount (pairs)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, idx) => (
                  <TableRow
                    key={product.id.toString()}
                    data-ocid={`inventory.item.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {Number(product.currentStock)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        data-ocid={`inventory.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => isLoggedIn && setDeleteTarget(product)}
                        disabled={!isLoggedIn}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>

      {/* Add Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="inventory.modal" className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-display">Add Inventory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-amount">Amount (pairs)</Label>
              <Input
                id="inv-amount"
                data-ocid="inventory.amount.input"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                data-ocid="inventory.cancel_button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="inventory.submit_button"
                disabled={createProduct.isPending}
              >
                {createProduct.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Entry?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this inventory entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="inventory.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="inventory.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

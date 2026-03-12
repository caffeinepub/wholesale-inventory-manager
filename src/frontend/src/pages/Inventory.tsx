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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "../hooks/useQueries";

const FOOTWEAR_TYPES = [
  "Sneakers",
  "Running Shoes",
  "Boots",
  "Sandals",
  "Slippers",
  "Loafers",
  "Heels",
  "Flats",
  "Oxfords",
  "Sports Shoes",
  "Formal Shoes",
  "Casual Shoes",
  "Children's Shoes",
  "Other",
];

interface ProductForm {
  name: string;
  quantity: string;
  footwearType: string;
}

const emptyForm: ProductForm = { name: "", quantity: "", footwearType: "" };

export default function Inventory() {
  const { data: products, isLoading } = useAllProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const filtered =
    products?.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  function openAdd() {
    setEditProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      name: p.name,
      quantity: Number(p.currentStock).toString(),
      footwearType: p.category,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.footwearType) {
      toast.error("Please select a footwear type");
      return;
    }
    try {
      if (editProduct) {
        await updateProduct.mutateAsync({
          id: editProduct.id,
          name: form.name.trim(),
          category: form.footwearType,
          sku: editProduct.sku,
          unit: editProduct.unit,
          costPrice: editProduct.costPrice,
          sellingPrice: editProduct.sellingPrice,
          reorderLevel: editProduct.reorderLevel,
        });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync({
          name: form.name.trim(),
          category: form.footwearType,
          sku: "",
          unit: "pairs",
          costPrice: 0,
          sellingPrice: 0,
          reorderLevel: 0n,
          initialQuantity: BigInt(Number.parseInt(form.quantity) || 0),
        });
        toast.success("Product added");
      }
      setModalOpen(false);
    } catch {
      toast.error("Failed to save product");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    }
  }

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-bold">
              Footwear Inventory
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {products?.length ?? 0} products total
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-52"
              data-ocid="inventory.search_input"
            />
          </div>
          <Button
            data-ocid="inventory.add_button"
            onClick={isLoggedIn ? openAdd : undefined}
            disabled={!isLoggedIn}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Footwear
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="inventory.empty_state"
              className="py-16 text-center"
            >
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-lg font-semibold">
                No products found
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {search
                  ? "Try a different search"
                  : "Add your first footwear product"}
              </p>
            </div>
          ) : (
            <Table data-ocid="inventory.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Footwear Type</TableHead>
                  <TableHead className="text-right">Stock (pairs)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product, idx) => {
                  const isLow = Number(product.currentStock) <= 10;
                  return (
                    <TableRow
                      key={product.id.toString()}
                      data-ocid={`inventory.item.${idx + 1}`}
                      className={
                        isLow ? "bg-destructive/5 hover:bg-destructive/10" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isLow && (
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                          )}
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${isLow ? "text-destructive" : ""}`}
                      >
                        {Number(product.currentStock)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            data-ocid={`inventory.edit_button.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => isLoggedIn && openEdit(product)}
                            disabled={!isLoggedIn}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            data-ocid={`inventory.delete_button.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              isLoggedIn && setDeleteTarget(product)
                            }
                            disabled={!isLoggedIn}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="product.modal" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editProduct ? "Edit Footwear Product" : "Add Footwear Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="prod-name">Product Name</Label>
              <Input
                id="prod-name"
                data-ocid="product.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Nike Air Max"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-type">Footwear Type</Label>
              <Select
                value={form.footwearType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, footwearType: v }))
                }
              >
                <SelectTrigger id="prod-type" data-ocid="product.type.select">
                  <SelectValue placeholder="Select footwear type" />
                </SelectTrigger>
                <SelectContent>
                  {FOOTWEAR_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-qty">
                {editProduct
                  ? "Current Stock (pairs)"
                  : "Initial Quantity (pairs)"}
              </Label>
              <Input
                id="prod-qty"
                data-ocid="product.quantity.input"
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                placeholder="0"
                disabled={!!editProduct}
              />
              {editProduct && (
                <p className="text-xs text-muted-foreground">
                  Use Stock Movements to adjust quantity.
                </p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                data-ocid="product.cancel_button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="product.submit_button"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editProduct ? "Save" : "Add Product"}
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
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>{" "}
              and its history.
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

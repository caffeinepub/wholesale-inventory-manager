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
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "wholesale_customers";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  purchaseDate: string;
  lastPaymentDate: string;
  outstandingBalance: number;
}

interface CustomerForm {
  name: string;
  phone: string;
  address: string;
  purchaseDate: string;
  lastPaymentDate: string;
  outstandingBalance: string;
}

const emptyForm: CustomerForm = {
  name: "",
  phone: "",
  address: "",
  purchaseDate: "",
  lastPaymentDate: "",
  outstandingBalance: "",
};

function loadCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : [];
  } catch {
    return [];
  }
}

function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCustomers(loadCustomers());
  }, []);

  function setField(key: keyof CustomerForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openAdd() {
    setEditCustomer(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: Customer) {
    setEditCustomer(c);
    setForm({
      name: c.name,
      phone: c.phone,
      address: c.address,
      purchaseDate: c.purchaseDate,
      lastPaymentDate: c.lastPaymentDate,
      outstandingBalance: c.outstandingBalance.toString(),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: Customer = {
        id: editCustomer?.id ?? crypto.randomUUID(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        purchaseDate: form.purchaseDate,
        lastPaymentDate: form.lastPaymentDate,
        outstandingBalance: Number.parseFloat(form.outstandingBalance) || 0,
      };
      const next = editCustomer
        ? customers.map((c) => (c.id === editCustomer.id ? updated : c))
        : [...customers, updated];
      setCustomers(next);
      saveCustomers(next);
      toast.success(editCustomer ? "Customer updated" : "Customer added");
      setModalOpen(false);
    } catch {
      toast.error("Failed to save customer");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const next = customers.filter((c) => c.id !== deleteTarget.id);
    setCustomers(next);
    saveCustomers(next);
    toast.success("Customer deleted");
    setDeleteTarget(null);
  }

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const fmtDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-bold">Customers</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {customers.length} customers total
          </p>
        </div>
        <Button
          data-ocid="customers.add_button"
          onClick={openAdd}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="border border-border rounded-lg overflow-hidden">
          {customers.length === 0 ? (
            <div
              data-ocid="customers.empty_state"
              className="py-16 text-center"
            >
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-lg font-semibold">
                No customers yet
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Add your first customer to get started
              </p>
            </div>
          ) : (
            <Table data-ocid="customers.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date of Purchase</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead className="text-right">
                    Outstanding Balance
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer, idx) => {
                  const hasBalance = customer.outstandingBalance > 0;
                  return (
                    <TableRow
                      key={customer.id}
                      data-ocid={`customers.item.${idx + 1}`}
                      className={
                        hasBalance ? "bg-amber-500/8 hover:bg-amber-500/12" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {hasBalance && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          )}
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.phone || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDate(customer.purchaseDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDate(customer.lastPaymentDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {hasBalance ? (
                          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30 border-0 font-semibold">
                            {fmt.format(customer.outstandingBalance)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {fmt.format(0)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            data-ocid={`customers.edit_button.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(customer)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            data-ocid={`customers.delete_button.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(customer)}
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
        <DialogContent data-ocid="customer.modal" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editCustomer ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="cust-name">Name</Label>
                <Input
                  id="cust-name"
                  data-ocid="customer.name.input"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Maria Santos"
                  required
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="cust-phone">Phone</Label>
                <Input
                  id="cust-phone"
                  data-ocid="customer.phone.input"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="e.g. +1 555-0123"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="cust-address">Address</Label>
                <Input
                  id="cust-address"
                  data-ocid="customer.address.input"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="e.g. 123 Market St, Manila"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-purchase">Date of Purchase</Label>
                <Input
                  id="cust-purchase"
                  data-ocid="customer.purchase_date.input"
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setField("purchaseDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-payment">Last Payment Date</Label>
                <Input
                  id="cust-payment"
                  data-ocid="customer.last_payment_date.input"
                  type="date"
                  value={form.lastPaymentDate}
                  onChange={(e) => setField("lastPaymentDate", e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="cust-balance">Outstanding Balance ($)</Label>
                <Input
                  id="cust-balance"
                  data-ocid="customer.outstanding_balance.input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.outstandingBalance}
                  onChange={(e) =>
                    setField("outstandingBalance", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                data-ocid="customer.cancel_button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="customer.submit_button"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editCustomer ? "Save Changes" : "Add Customer"}
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
              Delete Customer?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong>{" "}
              from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="customers.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="customers.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

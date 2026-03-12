import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import Layout from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { useAllProducts, useCreateProduct } from "./hooks/useQueries";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import StockMovement from "./pages/StockMovement";

type Page = "dashboard" | "inventory" | "movements" | "reports" | "customers";

const SAMPLE_PRODUCTS = [
  {
    name: "Jasmine Rice 25kg",
    category: "",
    sku: "",
    unit: "",
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0n,
    initialQuantity: 120n,
  },
  {
    name: "Refined Cooking Oil 5L",
    category: "",
    sku: "",
    unit: "",
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0n,
    initialQuantity: 85n,
  },
  {
    name: "Granulated Sugar 50kg",
    category: "",
    sku: "",
    unit: "",
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0n,
    initialQuantity: 60n,
  },
  {
    name: "All-Purpose Flour 25kg",
    category: "",
    sku: "",
    unit: "",
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0n,
    initialQuantity: 7n,
  },
  {
    name: "Iodized Salt 1kg",
    category: "",
    sku: "",
    unit: "",
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0n,
    initialQuantity: 250n,
  },
  {
    name: "Canned Sardines (Case/48)",
    category: "",
    sku: "",
    unit: "",
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0n,
    initialQuantity: 5n,
  },
];

function SeedProducts() {
  const { data: products, isLoading } = useAllProducts();
  const createProduct = useCreateProduct();
  const { actor } = useActor();
  const seeded = useRef(false);

  useEffect(() => {
    if (isLoading || !actor || !products || seeded.current) return;
    if (products.length === 0) {
      seeded.current = true;
      const seed = async () => {
        for (const p of SAMPLE_PRODUCTS) {
          try {
            await createProduct.mutateAsync(p);
          } catch {
            // ignore
          }
        }
      };
      seed();
    } else {
      seeded.current = true;
    }
  }, [isLoading, actor, products, createProduct]);

  return null;
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <>
      <SeedProducts />
      <Layout currentPage={page} onNavigate={setPage}>
        {page === "dashboard" && <Dashboard />}
        {page === "inventory" && <Inventory />}
        {page === "movements" && <StockMovement />}
        {page === "reports" && <Reports />}
        {page === "customers" && <Customers />}
      </Layout>
      <Toaster richColors position="top-right" />
    </>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MovementType } from "../backend";
import { useActor } from "./useActor";

export function useAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLowStockProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["lowStockProducts"],
    queryFn: async () => {
      if (!actor) return [];
      // Low stock = currentStock <= 10
      const all = await actor.getAllProducts();
      return all.filter((p) => Number(p.currentStock) <= 10);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMovementsForProduct(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["movements", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return [];
      return actor.getMovementsForProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useReport(
  startTime: bigint,
  endTime: bigint,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["report", startTime.toString(), endTime.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getReport(startTime, endTime);
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      sku: string;
      unit: string;
      costPrice: number;
      sellingPrice: number;
      reorderLevel: bigint;
      initialQuantity?: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      const id = await actor.createProduct(
        data.name,
        data.category,
        data.sku,
        data.unit,
        data.costPrice,
        data.sellingPrice,
        data.reorderLevel,
        BigInt(Date.now()) * 1_000_000n,
      );
      // If initial quantity provided, record a stock-in movement
      if (data.initialQuantity && data.initialQuantity > 0n) {
        await actor.recordStockMovement(
          id,
          MovementType.stockIn,
          data.initialQuantity,
          "Initial stock",
          BigInt(Date.now()) * 1_000_000n,
        );
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["lowStockProducts"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      category: string;
      sku: string;
      unit: string;
      costPrice: number;
      sellingPrice: number;
      reorderLevel: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(
        data.id,
        data.name,
        data.category,
        data.sku,
        data.unit,
        data.costPrice,
        data.sellingPrice,
        data.reorderLevel,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["lowStockProducts"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["lowStockProducts"] });
    },
  });
}

export function useRecordStockMovement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      productId: bigint;
      movementType: MovementType;
      quantity: bigint;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.recordStockMovement(
        data.productId,
        data.movementType,
        data.quantity,
        data.note,
        BigInt(Date.now()) * 1_000_000n,
      );
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["lowStockProducts"] });
      qc.invalidateQueries({
        queryKey: ["movements", vars.productId.toString()],
      });
    },
  });
}

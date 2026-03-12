import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ReportResult {
    productSummaries: Array<[bigint, ReportSummary]>;
    overallSummary: ReportSummary;
    movements: Array<StockMovement>;
}
export interface StockMovement {
    id: bigint;
    note: string;
    productId: bigint;
    movementType: MovementType;
    timestamp: bigint;
    quantity: bigint;
}
export interface ReportSummary {
    totalIn: bigint;
    totalOut: bigint;
    netChange: bigint;
}
export interface Product {
    id: bigint;
    sku: string;
    name: string;
    createdAt: bigint;
    unit: string;
    sellingPrice: number;
    category: string;
    reorderLevel: bigint;
    currentStock: bigint;
    costPrice: number;
}
export enum MovementType {
    out = "out",
    stockIn = "stockIn"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(name: string, category: string, sku: string, unit: string, costPrice: number, sellingPrice: number, reorderLevel: bigint, createdAt: bigint): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserRole(): Promise<UserRole>;
    getLowStockProducts(): Promise<Array<Product>>;
    getMovementsForProduct(productId: bigint): Promise<Array<StockMovement>>;
    getProduct(id: bigint): Promise<Product | null>;
    getReport(startTime: bigint, endTime: bigint): Promise<ReportResult>;
    isCallerAdmin(): Promise<boolean>;
    recordStockMovement(productId: bigint, movementType: MovementType, quantity: bigint, note: string, timestamp: bigint): Promise<bigint>;
    updateProduct(id: bigint, name: string, category: string, sku: string, unit: string, costPrice: number, sellingPrice: number, reorderLevel: bigint): Promise<void>;
}

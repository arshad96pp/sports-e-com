export interface AdminDashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: { id: string; name: string; stock: number }[];
}

export interface StatsRepository {
  getDashboardStats(): Promise<AdminDashboardStats>;
}

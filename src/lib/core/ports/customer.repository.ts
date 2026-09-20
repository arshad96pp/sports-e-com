export interface CustomerDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerQueryParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerQueryResult {
  customers: CustomerDTO[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface CustomerRepository {
  listCustomers(params?: CustomerQueryParams): Promise<CustomerQueryResult>;
  setCustomerActive(userId: string, isActive: boolean): Promise<void>;
}

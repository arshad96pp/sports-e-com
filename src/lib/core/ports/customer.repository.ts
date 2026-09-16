export interface CustomerDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerRepository {
  listCustomers(): Promise<CustomerDTO[]>;
  setCustomerActive(userId: string, isActive: boolean): Promise<void>;
}

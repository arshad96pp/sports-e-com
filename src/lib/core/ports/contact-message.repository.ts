export interface ContactMessageDTO {
  id: string;
  fullName: string;
  email: string;
  /** Normalized "+91XXXXXXXXXX", or null for rows saved before this field existed. */
  phone: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactMessageInput {
  fullName: string;
  email: string;
  /** Normalized "+91XXXXXXXXXX" — normalize before calling, this layer stores as-is. */
  phone: string;
  message: string;
}

export interface AdminContactMessageQueryParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminContactMessageQueryResult {
  messages: ContactMessageDTO[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface ContactMessageRepository {
  /** Public insert path — called with no admin session (anonymous Contact form submission). */
  createContactMessage(input: CreateContactMessageInput): Promise<ContactMessageDTO>;
  listContactMessages(params?: AdminContactMessageQueryParams): Promise<AdminContactMessageQueryResult>;
  getContactMessageById(id: string): Promise<ContactMessageDTO | null>;
}

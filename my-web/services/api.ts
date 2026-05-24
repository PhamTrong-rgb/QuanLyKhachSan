import { fetchApi } from '../lib/api-client';
import { 
  Room, 
  Booking, 
  Customer, 
  Service, 
  User, 
  Staff, 
  Transaction 
} from '../types';

export const apiService = {
  // --- Rooms ---
  getRooms: () => fetchApi<Room[]>('/rooms'),
  getRoomById: (id: string) => fetchApi<Room>(`/rooms/${id}`),
  updateRoom: (id: string, data: Partial<Room>) => 
    fetchApi<Room>(`/rooms/${id}`, { method: 'PATCH', data }),
  searchRooms: (params: Record<string, string>) => {
    const queryStr = new URLSearchParams(params).toString();
    return fetchApi<Room[]>(`/rooms/search?${queryStr}`);
  },

  // --- Bookings ---
  getBookings: () => fetchApi<Booking[]>('/bookings'),
  createBooking: (data: Omit<Booking, 'id'>) => 
    fetchApi<Booking>('/bookings', { method: 'POST', data }),
  updateBooking: (id: string, data: Partial<Booking>) => 
    fetchApi<Booking>(`/bookings/${id}`, { method: 'PATCH', data }),
  deleteBooking: (id: string) => 
    fetchApi<Booking>(`/bookings/${id}`, { method: 'DELETE' }),

  // --- Booking Services ---
  getBookingServices: (id: string) => fetchApi<Booking[]>(`/bookings/${id}/services`),
  addBookingService: (id: string, data: any) => 
    fetchApi<Booking[]>(`/bookings/${id}/services`, { method: 'POST', data }),

  // --- Customers ---
  getCustomers: () => fetchApi<Customer[]>('/customers'),
  createCustomer: (data: Omit<Customer, 'id'>) => 
    fetchApi<Customer>('/customers', { method: 'POST', data }),
  updateCustomer: (id: string, data: Partial<Customer>) => 
    fetchApi<Customer>(`/customers/${id}`, { method: 'PATCH', data }),
  deleteCustomer: (id: string) => 
    fetchApi<Customer>(`/customers/${id}`, { method: 'DELETE' }),

  // --- Services ---
  getServices: () => fetchApi<Service[]>('/services'),

  // --- Staff / Users ---
  getUsers: () => fetchApi<User[]>('/users'),
  getStaff: () => fetchApi<Staff[]>('/staff'),
  deleteStaff: (id: string) => fetchApi<Staff>(`/staff/${id}`, { method: 'DELETE' }),
  updateStaffRole: (id: string, role: string) => 
    fetchApi<Staff>(`/staff/${id}/role`, { method: 'PATCH', data: { role } }),
  getMe: () => fetchApi<Staff>('/me'),
  login: (credentials: any) => fetchApi<Staff>('/auth/login', { method: 'POST', data: credentials }),

  // --- Transactions / Stats ---
  getTransactions: () => fetchApi<Transaction[]>('/transactions'),
  getTransactionSummary: () => fetchApi<Transaction[]>('/transactions/summary'),
  getStats: () => fetchApi<any>('/stats'),
};

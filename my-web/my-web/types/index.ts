export interface Transaction {
  id: number;
  type: string;
  amount: number;
  category: string;
  bookingId: number;
  description: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  avatar: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Booking {
  id: string;
  roomId: number;
  customerName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
}

export interface Service {
  id: string;
  serviceName: string;
  price: number;
  description: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phonenumber: string;
  email: string;
  idCard: string;
}

export interface Room {
  id: string;
  roomNumber: number;
  type: string;
  price: number | string;
  status: string;
  image: string;
  maxGuests?: number;
  view?: string;
}

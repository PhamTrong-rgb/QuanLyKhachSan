"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDBData, modifyDBData } from '../actions/db';
import { pushAdminNotification } from '@/lib/hotel-storage';
import type { AdminNotification } from '@/lib/hotel-storage';

export interface Customer {
  id: string;
  fullName: string;
  phonenumber: string;
  email: string;
  idCard?: string;
}

// Interfaces
export interface Room {
  id: string;
  type: string;
  status: string;
  price: string;
  maxGuests: number;
  view: string;
}

export interface Booking {
  id: string;
  guest: string;
  phone: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: string;
  description: string;
  adminNote?: string;
}

export interface Invoice {
  id: string;
  guest: string;
  amount: string;
  status: string;
  date: string;
  roomId?: string;
  details?: { name: string; price: number }[];
}

export interface ServiceRequest {
  id: string;
  guest: string;
  room: string;
  type: string;
  status: string;
  time: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  status: string;
  avatar: string;
}

export interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  paymentMethod: string;
  user: string;
  note: string;
}

interface HotelContextType {
  rooms: Room[];
  addRoom: (room: Room) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;

  guests: Customer[];
  addGuest: (guest: Customer) => void;
  updateGuest: (guest: Customer) => void;
  deleteGuest: (id: string) => void;

  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (id: string) => void;

  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;

  requests: ServiceRequest[];
  addRequest: (req: ServiceRequest) => void;
  updateRequest: (req: ServiceRequest) => void;
  deleteRequest: (id: string) => void;

  employees: Employee[];
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;

  transactions: Transaction[];
  addTransaction: (txn: Transaction) => void;
  updateTransaction: (txn: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);



export function HotelProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [rooms, setRoomsState] = useState<Room[]>([]);
  const [guests, setGuestsState] = useState<Customer[]>([]);
  const [bookings, setBookingsState] = useState<Booking[]>([]);
  const [invoices, setInvoicesState] = useState<Invoice[]>([]);
  const [requests, setRequestsState] = useState<ServiceRequest[]>([]);
  const [employees, setEmployeesState] = useState<Employee[]>([]);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);

  const fetchDB = () => {
    getDBData().then(data => {
      setRoomsState(data.rooms || []);
      setGuestsState(data.guests || []);
      setBookingsState(data.bookings || []);
      setInvoicesState(data.invoices || []);
      setRequestsState(data.requests || []);
      setEmployeesState(data.employees || []);
      setTransactionsState(data.transactions || []);
      setIsLoaded(true);
    });
  };

  useEffect(() => {
    fetchDB();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hotelManagement.adminNotifications' || e.key === 'hotelManagement.userNotifications' || e.key === 'force_db_refresh') {
        fetchDB();
      }
    };
    
    // Custom event to trigger reload in the same tab if needed
    const handleForceReload = () => fetchDB();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('forceDBReload', handleForceReload);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('forceDBReload', handleForceReload);
    };
  }, []);

  const execDB = (model: string, action: 'add'|'update'|'delete', data: any) => {
    modifyDBData(model, action, data).then(() => {
      localStorage.setItem('force_db_refresh', Date.now().toString());
    });
  };

  const notify = (title: string, message: string, type: 'booking' | 'service' | 'checkout' | 'alert' = 'alert', link: string = '/') => {
    if (typeof window !== "undefined") {
      const notif: AdminNotification = { id: Date.now(), type, title, message, time: "Vừa xong", link };
      pushAdminNotification(notif);
      const event = new CustomEvent("newNotification", {
        detail: notif
      });
      window.dispatchEvent(event);
    }
  };

  // CRUD for Rooms
  const addRoom = (room: Room) => { const newVal = [room, ...rooms]; setRoomsState(newVal); execDB('rooms', 'add', room); notify("Phòng mới", `Đã thêm phòng ${room.id}`, "alert", "/rooms"); };
  const updateRoom = (room: Room) => { const newVal = rooms.map(r => r.id === room.id ? room : r); setRoomsState(newVal); execDB('rooms', 'update', room); notify("Cập nhật phòng", `Phòng ${room.id} được cập nhật`, "alert", "/rooms"); };
  const deleteRoom = (id: string) => { const newVal = rooms.filter(r => r.id !== id); setRoomsState(newVal); execDB('rooms', 'delete', id); notify("Xóa phòng", `Đã xóa phòng ${id}`, "alert", "/rooms"); };

  // CRUD for Guests
  const addGuest = async (guest: Customer) => { 
    const mockCustomer = { ...guest, id: `KH00${guests.length + 1}` };
    const newVal = [mockCustomer, ...guests];
    setGuestsState(newVal);
    execDB('guests', 'add', mockCustomer);
    notify("Khách hàng mới", `Đã lưu khách ${guest.fullName}`, "alert", "/guests");
  };
  const updateGuest = async (guest: Customer) => { 
    const newVal = guests.map(g => g.id === guest.id ? guest : g);
    setGuestsState(newVal);
    execDB('guests', 'update', guest);
    notify("Cập nhật khách", `Đã cập nhật thông tin khách ${guest.fullName}`, "alert", "/guests");
  };
  const deleteGuest = async (id: string) => { 
    const newVal = guests.filter(g => g?.id !== id);
    setGuestsState(newVal);
    execDB('guests', 'delete', id);
    notify("Xóa khách", `Đã xóa khách ${id}`, "alert", "/guests");
  };

  // CRUD for Bookings
  const addBooking = (booking: Booking) => { 
    const newVal = [booking, ...bookings]; 
    setBookingsState(newVal); 
    execDB('bookings', 'add', booking); 
    notify("Đặt phòng mới", `Đơn đặt phòng ${booking.id}`, "booking", "/bookings"); 

    if (booking.status === "Đã xác nhận" || booking.status === "Đã Check-in" || booking.status === "Đã thanh toán") {
      const existingGuest = guests.find(g => g.phonenumber === booking.phone || g.fullName === booking.guest);
      if (!existingGuest && booking.guest) {
        addGuest({ id: "", fullName: booking.guest, phonenumber: booking.phone || "", email: "" });
      }
    }
  };
  const updateBooking = (booking: Booking) => { 
    const newVal = bookings.map(b => b.id === booking.id ? booking : b); 
    setBookingsState(newVal); 
    execDB('bookings', 'update', booking); 
    notify("Cập nhật Booking", `Đơn ${booking.id} đã được thay đổi`, "booking", "/bookings"); 

    if (booking.status === "Đã xác nhận" || booking.status === "Đã Check-in" || booking.status === "Đã thanh toán") {
      const existingGuest = guests.find(g => g.phonenumber === booking.phone || g.fullName === booking.guest);
      if (!existingGuest && booking.guest) {
        addGuest({ id: "", fullName: booking.guest, phonenumber: booking.phone || "", email: "" });
      }
    }
  };
  const deleteBooking = (id: string) => { const newVal = bookings.filter(b => b.id !== id); setBookingsState(newVal); execDB('bookings', 'delete', id); notify("Hủy Booking", `Đã hủy đơn ${id}`, "alert", "/bookings"); };

  // CRUD for Invoices
  const addInvoice = (invoice: Invoice) => { const newVal = [invoice, ...invoices]; setInvoicesState(newVal); execDB('invoices', 'add', invoice); notify("Hóa đơn mới", `Khởi tạo hóa đơn ${invoice.id}`, "checkout", "/invoices"); };
  const updateInvoice = (invoice: Invoice) => { const newVal = invoices.map(i => i.id === invoice.id ? invoice : i); setInvoicesState(newVal); execDB('invoices', 'update', invoice); notify("Cập nhật hóa đơn", `Hóa đơn ${invoice.id} đã cập nhật`, "checkout", "/invoices"); };
  const deleteInvoice = (id: string) => { const newVal = invoices.filter(i => i.id !== id); setInvoicesState(newVal); execDB('invoices', 'delete', id); notify("Xóa hóa đơn", `Đã xóa hóa đơn ${id}`, "alert", "/invoices"); };

  // CRUD for Requests
  const addRequest = (req: ServiceRequest) => { const newVal = [req, ...requests]; setRequestsState(newVal); execDB('requests', 'add', req); notify("Yêu cầu dịch vụ mới", `Phòng ${req.room} yêu cầu ${req.type}`, "service", "/services"); };
  const updateRequest = (req: ServiceRequest) => { const newVal = requests.map(r => r.id === req.id ? req : r); setRequestsState(newVal); execDB('requests', 'update', req); notify("Trạng thái dịch vụ", `Yêu cầu ${req.id} đã thay đổi`, "service", "/services"); };
  const deleteRequest = (id: string) => { const newVal = requests.filter(r => r.id !== id); setRequestsState(newVal); execDB('requests', 'delete', id); notify("Xóa yêu cầu", `Đã xóa yêu cầu ${id}`, "alert", "/services"); };

  // CRUD for Employees
  const addEmployee = (emp: Employee) => { const newVal = [emp, ...employees]; setEmployeesState(newVal); execDB('employees', 'add', emp); notify("Nhân sự mới", `Đã thêm nhân viên ${emp.name}`, "alert", "/employees"); };
  const updateEmployee = (emp: Employee) => { const newVal = employees.map(e => e.id === emp.id ? emp : e); setEmployeesState(newVal); execDB('employees', 'update', emp); notify("Cập nhật nhân sự", `Hồ sơ ${emp.name} đã cập nhật`, "alert", "/employees"); };
  const deleteEmployee = (id: string) => { const newVal = employees.filter(e => e.id !== id); setEmployeesState(newVal); execDB('employees', 'delete', id); notify("Xóa nhân sự", `Đã xóa nhân viên ${id}`, "alert", "/employees"); };

  // CRUD for Transactions
  const addTransaction = (txn: Transaction) => { const newVal = [txn, ...transactions]; setTransactionsState(newVal); execDB('transactions', 'add', txn); notify("Giao dịch mới", `Đã thêm giao dịch ${txn.id}`, "checkout", "/transactions"); };
  const updateTransaction = (txn: Transaction) => { const newVal = transactions.map(t => t.id === txn.id ? txn : t); setTransactionsState(newVal); execDB('transactions', 'update', txn); notify("Cập nhật giao dịch", `Giao dịch ${txn.id} đã thay đổi`, "checkout", "/transactions"); };
  const deleteTransaction = (id: string) => { const newVal = transactions.filter(t => t.id !== id); setTransactionsState(newVal); execDB('transactions', 'delete', id); notify("Hủy giao dịch", `Đã xóa giao dịch ${id}`, "alert", "/transactions"); };

  return (
    <HotelContext.Provider value={{
      rooms, addRoom, updateRoom, deleteRoom,
      guests, addGuest, updateGuest, deleteGuest,
      bookings, addBooking, updateBooking, deleteBooking,
      invoices, addInvoice, updateInvoice, deleteInvoice,
      requests, addRequest, updateRequest, deleteRequest,
      employees, addEmployee, updateEmployee, deleteEmployee,
      transactions, addTransaction, updateTransaction, deleteTransaction
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}

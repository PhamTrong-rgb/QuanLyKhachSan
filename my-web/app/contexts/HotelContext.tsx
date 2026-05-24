"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDBData, modifyDBData } from '../actions/db';
import { DEFAULT_PUBLIC_ROOMS } from '@/lib/hotel-storage';
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
      // If server DB has no rooms, fallback to default public rooms so admin view isn't empty
      setRoomsState((data.rooms && data.rooms.length > 0) ? data.rooms : DEFAULT_PUBLIC_ROOMS);
      setGuestsState(data.guests || []);
      setBookingsState(data.bookings || []);
      setInvoicesState(data.invoices || []);
      setRequestsState(data.requests || []);
      setEmployeesState(data.employees || []);
      setTransactionsState(data.transactions || []);

      // Backfill transactions from paid invoices if missing
      try {
        const existingTxDesc = (data.transactions || []).map((t: any) => t.description || '');
        const paidInvoices = (data.invoices || []).filter((inv: any) => inv.status === 'Đã thanh toán');
        const missing = paidInvoices.filter((inv: any) => !existingTxDesc.some((d: string) => d.includes(inv.id)));
        if (missing.length > 0) {
          missing.forEach((inv: any) => {
            const amount = parseInt(String(inv.amount).replace(/[^0-9]/g, '') || '0', 10);
            const txn = {
              id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
              type: 'income',
              description: `Thanh toán hóa đơn ${inv.id} (${inv.guest})`,
              amount,
              date: new Date().toLocaleDateString('vi-VN'),
              time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              status: 'completed',
              paymentMethod: 'Cash',
              user: 'SYSTEM',
              note: ''
            };
            modifyDBData('transactions', 'add', txn);
          });
          // refetch after write
          setTimeout(() => fetchDB(), 300);
        }
      } catch (err) {
        // ignore backfill errors
      }
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
  const parseAmount = (amt: string | number | undefined) => {
    if (!amt && amt !== 0) return 0;
    if (typeof amt === 'number') return amt;
    const cleaned = String(amt).replace(/[^0-9]/g, '');
    return parseInt(cleaned || '0', 10);
  };

  const addInvoice = (invoice: Invoice) => {
    const newVal = [invoice, ...invoices];
    setInvoicesState(newVal);
    execDB('invoices', 'add', invoice);
    notify("Hóa đơn mới", `Khởi tạo hóa đơn ${invoice.id}`, "checkout", "/invoices");

    // Nếu hóa đơn được đánh là đã thanh toán ngay khi tạo, tự động sinh giao dịch thu
    if (invoice.status === 'Đã thanh toán') {
      const amount = parseAmount(invoice.amount);
      const txn = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'income',
        description: `Thanh toán hóa đơn ${invoice.id} (${invoice.guest})`,
        amount,
        date: new Date().toLocaleDateString('vi-VN'),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        paymentMethod: 'Cash',
        user: 'SYSTEM',
        note: ''
      } as Transaction;
      const newTx = [txn, ...transactions];
      setTransactionsState(newTx);
      execDB('transactions', 'add', txn);
      notify("Giao dịch mới", `Đã ghi nhận thu: ${amount.toLocaleString('vi-VN')} VNĐ`, "checkout", "/transactions");
    }
  };

  const updateInvoice = (invoice: Invoice) => {
    const existing = invoices.find(i => i.id === invoice.id);
    const newVal = invoices.map(i => i.id === invoice.id ? invoice : i);
    setInvoicesState(newVal);
    execDB('invoices', 'update', invoice);
    notify("Cập nhật hóa đơn", `Hóa đơn ${invoice.id} đã cập nhật`, "checkout", "/invoices");

    // Nếu trạng thái chuyển từ chưa thanh toán -> đã thanh toán, sinh giao dịch
    if (existing && existing.status !== 'Đã thanh toán' && invoice.status === 'Đã thanh toán') {
      const amount = parseAmount(invoice.amount);
      const txn = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'income',
        description: `Thanh toán hóa đơn ${invoice.id} (${invoice.guest})`,
        amount,
        date: new Date().toLocaleDateString('vi-VN'),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        paymentMethod: 'Cash',
        user: 'SYSTEM',
        note: ''
      } as Transaction;
      const newTx = [txn, ...transactions];
      setTransactionsState(newTx);
      execDB('transactions', 'add', txn);
      notify("Giao dịch mới", `Đã ghi nhận thu: ${amount.toLocaleString('vi-VN')} VNĐ`, "checkout", "/transactions");
    }
  };
  const deleteInvoice = (id: string) => { const newVal = invoices.filter(i => i.id !== id); setInvoicesState(newVal); execDB('invoices', 'delete', id); notify("Xóa hóa đơn", `Đã xóa hóa đơn ${id}`, "alert", "/invoices"); };

  // CRUD for Requests
  const addRequest = (req: ServiceRequest) => { 
    const newVal = [req, ...requests]; 
    setRequestsState(newVal); 
    execDB('requests', 'add', req); 
    notify("Yêu cầu dịch vụ mới", `Phòng ${req.room} yêu cầu ${req.type}`, "service", "/services"); 

    // Automatically create or update invoice for this service request
    try {
      const SERVICE_PRICE_MAP: Record<string, number> = {
        'Dọn dẹp phòng': 50000,
        'Gọi Đồ Ăn': 150000,
        'Massage thư giãn': 500000,
        'Yêu cầu khác': 0
      };
      const price = SERVICE_PRICE_MAP[req.type] || 0;

      // Find if there is an existing invoice for this guest or room
      const existingInvoice = invoices.find(inv => 
        (req.guest && inv.guest.toLowerCase().includes(req.guest.toLowerCase())) || 
        (req.room && inv.roomId === req.room)
      );

      if (existingInvoice) {
        // Append service to existing invoice details
        const updatedDetails = [...(existingInvoice.details || [])];
        updatedDetails.push({ name: `Dịch vụ: ${req.type}`, price });

        // Recalculate amount
        const currentAmount = parseInt(String(existingInvoice.amount).replace(/[^0-9]/g, '') || '0', 10);
        const newAmount = currentAmount + price;
        const newAmountStr = new Intl.NumberFormat('vi-VN').format(newAmount);

        const updatedInvoice = {
          ...existingInvoice,
          amount: newAmountStr,
          details: updatedDetails
        };
        updateInvoice(updatedInvoice);
      } else {
        // No existing invoice. Try to find a booking to compute room price
        const booking = bookings.find(b => 
          (req.room && b.room === req.room) || 
          (req.guest && b.guest.toLowerCase().includes(req.guest.toLowerCase()))
        );
        const room = rooms.find(r => r.id === (req.room || booking?.room));
        const roomPrice = room ? parseInt(String(room.price).replace(/[^0-9]/g, '') || '0', 10) : 0;

        // Compute nights
        let days = 1;
        if (booking && booking.checkIn && booking.checkOut) {
          const parseToDate = (s: string) => {
            if (!s) return null;
            if (s.includes('-')) {
              const d = new Date(s);
              return isNaN(d.getTime()) ? null : d;
            }
            if (s.includes('/')) {
              const parts = s.split('/');
              if (parts.length === 3) {
                const day = parseInt(parts[0], 10) || 0;
                const month = (parseInt(parts[1], 10) || 1) - 1;
                const year = parseInt(parts[2], 10) || 0;
                const d = new Date(year, month, day);
                return isNaN(d.getTime()) ? null : d;
              }
            }
            const d = new Date(s);
            return isNaN(d.getTime()) ? null : d;
          };
          const inDate = parseToDate(booking.checkIn);
          const outDate = parseToDate(booking.checkOut);
          if (inDate && outDate) {
            const diffMs = outDate.getTime() - inDate.getTime();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            days = diffDays > 0 ? diffDays : 1;
          }
        }

        const roomTotal = roomPrice * days;
        const totalAmount = roomTotal + price;
        const newAmountStr = new Intl.NumberFormat('vi-VN').format(totalAmount);

        const details = [];
        if (roomTotal > 0) {
          details.push({ name: `Tiền phòng ${room?.id || req.room} (${days} đêm)`, price: roomTotal });
        }
        details.push({ name: `Dịch vụ: ${req.type}`, price });

        const newInvoice = {
          id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          guest: req.guest || booking?.guest || `Khách phòng ${req.room}`,
          roomId: req.room || booking?.room || "",
          amount: newAmountStr,
          status: "Chưa thanh toán",
          date: new Date().toLocaleDateString('vi-VN'),
          details: details
        };
        addInvoice(newInvoice);
      }
    } catch (e) {
      console.error("Error auto-updating invoice for service request:", e);
    }
  };
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

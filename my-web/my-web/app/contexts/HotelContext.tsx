"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../../services/api';
import { Customer } from '../../types';

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
  const [rooms, setRooms] = useState<Room[]>([
    { id: "101", type: "Tiêu chuẩn", status: "Sẵn sàng", price: "2,500,000", maxGuests: 2, view: "Thành phố" },
    { id: "102", type: "Cao cấp", status: "Đang phục vụ", price: "3,800,000", maxGuests: 3, view: "Biển" },
    { id: "103", type: "Thượng lưu", status: "Đang dọn", price: "8,500,000", maxGuests: 4, view: "Biển & Hồ Bơi" },
    { id: "104", type: "Tiêu chuẩn", status: "Sẵn sàng", price: "2,500,000", maxGuests: 2, view: "Nội khu" },
    { id: "201", type: "Cao cấp", status: "Sẵn sàng", price: "3,800,000", maxGuests: 3, view: "Biển" },
    { id: "205", type: "Tổng thống", status: "Đang dọn", price: "25,000,000", maxGuests: 6, view: "Toàn cảnh VIP" }
  ]);

  const [guests, setGuests] = useState<Customer[]>([]);

  useEffect(() => {
    apiService.getCustomers()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setGuests(data);
        } else {
          // Fallback dữ liệu tạm nếu API chết / không có data
          setGuests([
            { id: "KH001", fullName: "Nguyễn Văn A", phonenumber: "0901234567", email: "a.nguyen@email.com", idCard: "079012345678" },
            { id: "KH002", fullName: "Trần Thị B", phonenumber: "0912345678", email: "b.tran@email.com", idCard: "079087654321" }
          ]);
        }
      })
      .catch(err => console.error("Lỗi khi tải danh sách khách hàng:", err));
  }, []);

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([
    { id: "NV001", name: "Nguyễn Văn Tuấn", role: "Quản lý Khách sạn", department: "Ban Giám Đốc", phone: "0901 234 567", email: "tuan.nguyen@luxe.com", status: "active", avatar: "T" },
    { id: "NV002", name: "Trần Thị Mai", role: "Trưởng bộ phận Lễ tân", department: "Lễ tân", phone: "0912 345 678", email: "mai.tran@luxe.com", status: "active", avatar: "M" },
    { id: "NV003", name: "Lê Hoàng Nam", role: "Nhân viên Buồng phòng", department: "Buồng phòng", phone: "0987 654 321", email: "nam.le@luxe.com", status: "on_leave", avatar: "N" },
    { id: "NV004", name: "Phạm Thu Hà", role: "Nhân viên Kế toán", department: "Tài chính", phone: "0933 444 555", email: "ha.pham@luxe.com", status: "active", avatar: "H" },
    { id: "NV005", name: "Đinh Công Thành", role: "Bảo vệ ca đêm", department: "An ninh", phone: "0977 888 999", email: "thanh.dinh@luxe.com", status: "inactive", avatar: "T" }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "TXN-9021", type: "income", description: "Thanh toán phòng STD-102 (Nguyễn Văn A)", amount: 2500000, date: "18/04/2026", time: "14:30", status: "completed", paymentMethod: "Credit Card", user: "NV002", note: "Thanh toán toàn bộ" },
    { id: "TXN-9020", type: "expense", description: "Chi trả tiền điện tháng 3/2026", amount: 15300000, date: "18/04/2026", time: "09:15", status: "completed", paymentMethod: "Chuyển khoản", user: "NV004", note: "Chuyển EVN" },
    { id: "TXN-9019", type: "income", description: "Thanh toán phòng VIP-301, Dịch vụ Spa", amount: 6800000, date: "17/04/2026", time: "19:40", status: "completed", paymentMethod: "Cash", user: "NV002", note: "Khách lẻ" },
    { id: "TXN-9018", type: "expense", description: "Bảo trì thang máy tầng 2", amount: 1200000, date: "17/04/2026", time: "11:00", status: "completed", paymentMethod: "Chuyển khoản", user: "NV001", note: "Bảo trì định kỳ" },
    { id: "TXN-9017", type: "income", description: "Cọc giữ phòng DEL-205 (Trần Thị B)", amount: 1000000, date: "16/04/2026", time: "16:20", status: "pending", paymentMethod: "Credit Card", user: "NV002", note: "Đã nhận cọc" }
  ]);

  const notify = (title: string, message: string, type: 'booking' | 'service' | 'checkout' | 'alert' = 'alert', link: string = '/') => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("newNotification", {
        detail: { id: Date.now() + Math.random(), type, title, message, time: "Vừa xong", link }
      });
      window.dispatchEvent(event);
    }
  };

  // CRUD for Rooms
  const addRoom = (room: Room) => { setRooms(prev => [room, ...prev]); notify("Phòng mới", `Đã thêm phòng ${room.id}`, "alert", "/rooms"); };
  const updateRoom = (room: Room) => { setRooms(prev => prev.map(r => r.id === room.id ? room : r)); notify("Cập nhật phòng", `Phòng ${room.id} được cập nhật`, "alert", "/rooms"); };
  const deleteRoom = (id: string) => { setRooms(prev => prev.filter(r => r.id !== id)); notify("Xóa phòng", `Đã xóa phòng ${id}`, "alert", "/rooms"); };

  // CRUD for Guests
  const addGuest = async (guest: Customer) => { 
    try {
      const { id, ...data } = guest;
      const newCustomer = await apiService.createCustomer(data as any);
      if (newCustomer) {
        setGuests(prev => [newCustomer as any, ...prev]);
        notify("Khách hàng mới", `Đã thêm khách ${guest.fullName}`, "alert", "/guests");
      } else {
        // Fallback local
        const mockCustomer = { ...guest, id: `KH00${guests.length + 1}` };
        setGuests(prev => [mockCustomer, ...prev]);
        notify("Khách hàng mới (Local)", `Đã lưu tạm khách ${guest.fullName}`, "alert", "/guests");
      }
    } catch (e) { console.error(e); }
  };
  const updateGuest = async (guest: Customer) => { 
    try {
      const res = await apiService.updateCustomer(guest.id, guest);
      if (res) {
        setGuests(prev => prev.map(g => g.id === guest.id ? (res as any) : g));
        notify("Cập nhật khách", `Cập nhật thông tin khách ${guest.fullName}`, "alert", "/guests");
      } else {
        // Fallback local
        setGuests(prev => prev.map(g => g.id === guest.id ? guest : g));
        notify("Cập nhật khách (Local)", `Đã lưu tạm thông tin khách ${guest.fullName}`, "alert", "/guests");
      }
    } catch (e) { console.error(e); }
  };
  const deleteGuest = async (id: string) => { 
    try {
      const res = await apiService.deleteCustomer(id);
      setGuests(prev => prev.filter(g => g?.id !== id));
      if (res) {
        notify("Xóa khách", `Đã xóa khách ${id}`, "alert", "/guests");
      } else {
        notify("Xóa khách (Local)", `Đã xóa tạm khách ${id}`, "alert", "/guests");
      }
    } catch (e) { console.error(e); }
  };

  // CRUD for Bookings
  const addBooking = (booking: Booking) => { setBookings(prev => [booking, ...prev]); notify("Đặt phòng mới", `Đơn đặt phòng ${booking.id}`, "booking", "/bookings"); };
  const updateBooking = (booking: Booking) => { setBookings(prev => prev.map(b => b.id === booking.id ? booking : b)); notify("Cập nhật Booking", `Đơn ${booking.id} đã được thay đổi`, "booking", "/bookings"); };
  const deleteBooking = (id: string) => { setBookings(prev => prev.filter(b => b.id !== id)); notify("Hủy Booking", `Đã hủy đơn ${id}`, "alert", "/bookings"); };

  // CRUD for Invoices
  const addInvoice = (invoice: Invoice) => { setInvoices(prev => [invoice, ...prev]); notify("Hóa đơn mới", `Khởi tạo hóa đơn ${invoice.id}`, "checkout", "/invoices"); };
  const updateInvoice = (invoice: Invoice) => { setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i)); notify("Cập nhật hóa đơn", `Hóa đơn ${invoice.id} đã cập nhật`, "checkout", "/invoices"); };
  const deleteInvoice = (id: string) => { setInvoices(prev => prev.filter(i => i.id !== id)); notify("Xóa hóa đơn", `Đã xóa hóa đơn ${id}`, "alert", "/invoices"); };

  // CRUD for Requests
  const addRequest = (req: ServiceRequest) => { setRequests(prev => [req, ...prev]); notify("Yêu cầu dịch vụ mới", `Phòng ${req.room} yêu cầu ${req.type}`, "service", "/services"); };
  const updateRequest = (req: ServiceRequest) => { setRequests(prev => prev.map(r => r.id === req.id ? req : r)); notify("Trạng thái dịch vụ", `Yêu cầu ${req.id} đã thay đổi`, "service", "/services"); };
  const deleteRequest = (id: string) => { setRequests(prev => prev.filter(r => r.id !== id)); notify("Xóa yêu cầu", `Đã xóa yêu cầu ${id}`, "alert", "/services"); };

  // CRUD for Employees
  const addEmployee = (emp: Employee) => { setEmployees(prev => [emp, ...prev]); notify("Nhân sự mới", `Đã thêm nhân viên ${emp.name}`, "alert", "/employees"); };
  const updateEmployee = (emp: Employee) => { setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e)); notify("Cập nhật nhân sự", `Hồ sơ ${emp.name} đã cập nhật`, "alert", "/employees"); };
  const deleteEmployee = (id: string) => { setEmployees(prev => prev.filter(e => e.id !== id)); notify("Xóa nhân sự", `Đã xóa nhân viên ${id}`, "alert", "/employees"); };

  // CRUD for Transactions
  const addTransaction = (txn: Transaction) => { setTransactions(prev => [txn, ...prev]); notify("Giao dịch mới", `Đã thêm giao dịch ${txn.id}`, "checkout", "/transactions"); };
  const updateTransaction = (txn: Transaction) => { setTransactions(prev => prev.map(t => t.id === txn.id ? txn : t)); notify("Cập nhật giao dịch", `Giao dịch ${txn.id} đã thay đổi`, "checkout", "/transactions"); };
  const deleteTransaction = (id: string) => { setTransactions(prev => prev.filter(t => t.id !== id)); notify("Hủy giao dịch", `Đã xóa giao dịch ${id}`, "alert", "/transactions"); };

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

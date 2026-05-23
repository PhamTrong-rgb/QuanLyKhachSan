export interface PublicRoom {
  id: string;
  type: string;
  status: string;
  price: string;
  maxGuests: number;
  view: string;
}

export interface PublicBooking {
  id: string;
  guest: string;
  phone: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: string;
  description: string;
}

export interface AdminNotification {
  id: number;
  type: "booking" | "service" | "checkout" | "alert";
  title: string;
  message: string;
  time: string;
  link: string;
}

export const HOTEL_STORAGE_KEYS = {
  rooms: "hotelManagement.rooms",
  bookings: "hotelManagement.bookings",
  adminNotifications: "hotelManagement.adminNotifications",
  userNotifications: "hotelManagement.userNotifications",
};

export const ADMIN_ACCOUNTS = [
  { email: "admin@hotel.vn", password: "12345678", name: "Admin System", role: "Quản trị viên" },
  { email: "manager@hotel.vn", password: "manager123", name: "Hotel Manager", role: "Quản lý khách sạn" },
  { email: "owner@hotel.vn", password: "owner123", name: "Hotel Owner", role: "Chủ khách sạn" },
];

export const DEFAULT_PUBLIC_ROOMS: PublicRoom[] = [
  { id: "101", type: "Tiêu chuẩn", status: "Sẵn sàng", price: "2,500,000", maxGuests: 2, view: "Thành phố" },
  { id: "102", type: "Cao cấp", status: "Đang phục vụ", price: "3,800,000", maxGuests: 3, view: "Biển" },
  { id: "103", type: "Thượng lưu", status: "Đang dọn", price: "8,500,000", maxGuests: 4, view: "Biển & Hồ Bơi" },
  { id: "104", type: "Tiêu chuẩn", status: "Sẵn sàng", price: "2,500,000", maxGuests: 2, view: "Nội khu" },
  { id: "201", type: "Cao cấp", status: "Sẵn sàng", price: "3,800,000", maxGuests: 3, view: "Biển" },
  { id: "205", type: "Tổng thống", status: "Đang dọn", price: "25,000,000", maxGuests: 6, view: "Toàn cảnh VIP" },
];

export function readJsonStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) return fallback;

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getPublicRooms() {
  return readJsonStorage<PublicRoom[]>(HOTEL_STORAGE_KEYS.rooms, DEFAULT_PUBLIC_ROOMS);
}

export function getPublicBookings() {
  return readJsonStorage<PublicBooking[]>(HOTEL_STORAGE_KEYS.bookings, []);
}

export function savePublicBooking(booking: PublicBooking) {
  const bookings = getPublicBookings();
  writeJsonStorage(HOTEL_STORAGE_KEYS.bookings, [booking, ...bookings]);
}

export function pushAdminNotification(notification: AdminNotification) {
  const notifications = readJsonStorage<AdminNotification[]>(HOTEL_STORAGE_KEYS.adminNotifications, []);
  writeJsonStorage(HOTEL_STORAGE_KEYS.adminNotifications, [notification, ...notifications]);
}

export function pushUserNotification(notification: AdminNotification) {
  const notifications = readJsonStorage<AdminNotification[]>(HOTEL_STORAGE_KEYS.userNotifications, []);
  writeJsonStorage(HOTEL_STORAGE_KEYS.userNotifications, [notification, ...notifications]);
}

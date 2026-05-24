"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Search, Bell, CheckCircle, Info, Clock, AlertTriangle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { AdminNotification, HOTEL_STORAGE_KEYS, readJsonStorage, writeJsonStorage } from "@/lib/hotel-storage";

type NotificationItem = AdminNotification & {
  icon: ReactNode;
};

const defaultNotifications: AdminNotification[] = [
  { id: 1, type: "booking", title: "Đặt phòng mới", message: "Khách hàng vừa đặt phòng VIP 205", time: "5 phút trước", link: "/bookings" },
  { id: 2, type: "service", title: "Yêu cầu dịch vụ", message: "Phòng 102 yêu cầu Room Service", time: "15 phút trước", link: "/services" },
  { id: 3, type: "checkout", title: "Khách trả phòng", message: "Báo trả phòng STD 102", time: "1 giờ trước", link: "/invoices" },
  { id: 4, type: "alert", title: "Bảo trì khẩn", message: "Phòng 104 báo lỗi thiết bị", time: "2 giờ trước", link: "/rooms" },
];

function getNotificationIcon(type: AdminNotification["type"]) {
  if (type === "booking") return <CheckCircle className="text-[var(--color-success)]" size={18}/>;
  if (type === "service") return <Clock className="text-[var(--color-warning)]" size={18}/>;
  if (type === "alert") return <AlertTriangle className="text-[var(--color-danger)]" size={18}/>;
  if (type === "checkout") return <CheckCircle className="text-[var(--color-primary)]" size={18}/>;
  return <Info className="text-[var(--color-primary)]" size={18}/>;
}

function hydrateNotifications(notifications: AdminNotification[]): NotificationItem[] {
  return notifications.map((notification) => ({
    ...notification,
    icon: getNotificationIcon(notification.type),
  }));
}

function persistNotifications(notifications: NotificationItem[]) {
  writeJsonStorage(
    HOTEL_STORAGE_KEYS.adminNotifications,
    notifications.map(({ icon, ...notification }) => notification),
  );
}

export default function Header() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [sessionUserName, setSessionUserName] = useState("Người dùng rỗng");
  const [userRole, setUserRole] = useState("Quản trị viên");
  const [hotelLogo, setHotelLogo] = useState<string | null>(null);
  const [hotelName, setHotelName] = useState("Grand Luxe");
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => hydrateNotifications(defaultNotifications));
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSessionUserName(localStorage.getItem("userName") || "Người dùng rỗng");
      setUserRole(localStorage.getItem("userRole") || "Quản trị viên");
      setHotelLogo(localStorage.getItem("hotelLogo"));
      setHotelName(localStorage.getItem("hotelName") || "Grand Luxe");
      const storedNotifications = readJsonStorage<AdminNotification[]>(HOTEL_STORAGE_KEYS.adminNotifications, []);
      setNotifications(hydrateNotifications(storedNotifications));
    }, 0);

    const handleLogoUpdate = () => {
      setHotelLogo(localStorage.getItem("hotelLogo"));
    };
    window.addEventListener("hotelLogoUpdated", handleLogoUpdate);

    const handleDataUpdate = () => {
      setHotelName(localStorage.getItem("hotelName") || "Grand Luxe");
    };
    window.addEventListener("hotelDataUpdated", handleDataUpdate);

    const handleNewNotification = (e: Event) => {
      const detail = (e as CustomEvent<AdminNotification>).detail;
      setNotifications(prev => {
        const next = [{ ...detail, icon: getNotificationIcon(detail.type) }, ...prev];
        persistNotifications(next);
        return next;
      });
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === HOTEL_STORAGE_KEYS.adminNotifications) {
        const storedNotifications = readJsonStorage<AdminNotification[]>(HOTEL_STORAGE_KEYS.adminNotifications, []);
        setNotifications(hydrateNotifications(storedNotifications));
      }
    };

    window.addEventListener("newNotification", handleNewNotification);
    window.addEventListener("storage", handleStorageChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAlertOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.clearTimeout(timeout);
      window.removeEventListener("hotelLogoUpdated", handleLogoUpdate);
      window.removeEventListener("hotelDataUpdated", handleDataUpdate);
      window.removeEventListener("newNotification", handleNewNotification);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userType");
    router.push("/login");
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      persistNotifications(next);
      return next;
    });
    setIsAlertOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications([]);
    writeJsonStorage(HOTEL_STORAGE_KEYS.adminNotifications, []);
    setIsAlertOpen(false);
  };

  return (
    <header className="h-24 flex items-center justify-between px-6 z-30 neo-surface m-4 mb-0 flex-shrink-0">
      <div className="flex items-center gap-8">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 min-w-12 neo-surface-sm flex items-center justify-center text-[var(--color-primary)] font-bold text-2xl overflow-hidden">
            {hotelLogo ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-primary)]">
                <img src={hotelLogo} alt="Hotel Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
               hotelName.charAt(0)
            )}
          </div>
          <div>
            <h1 className="font-bold text-[var(--color-text)] text-xl tracking-wide whitespace-nowrap">{hotelName}</h1>
            <p className="text-[10px] text-[var(--color-primary)] font-bold tracking-widest uppercase whitespace-nowrap">Quản lý nội bộ</p>
          </div>
        </Link>

        {/* SEARCH */}
        <div className="neo-input flex items-center px-4 py-2 w-96 ml-4">
          <Search className="text-[var(--color-text)] opacity-70 mr-2" size={20} />
          <input 
            type="text" 
            placeholder="Tìm phòng, khách hàng hoặc mã..." 
            className="bg-transparent border-none outline-none w-full text-[var(--color-text)] font-medium placeholder:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsAlertOpen(!isAlertOpen)} className="neo-button p-3 rounded-full relative flex items-center justify-center">
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-[var(--color-danger)] rounded-full border-2 border-[var(--color-surface)]"></span>}
          </button>
          
          {isAlertOpen && (
            <div className="absolute right-0 mt-4 w-80 neo-surface z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 border border-white/20">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-[var(--color-text)]">Thông báo hệ thống</h3>
                {notifications.length > 0 && (
                  <span className="bg-[var(--color-danger)] text-white text-xs font-bold px-2 py-0.5 rounded-lg">{notifications.length} MỚI</span>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[var(--color-text)] opacity-50 font-medium text-sm">Không có thông báo mới.</div>
                ) : (
                  notifications.map((notif) => (
                    <Link key={notif.id} href={notif.link} onClick={() => handleNotificationClick(notif.id)} className="flex gap-4 p-4 border-b border-white/10 hover:neo-pressed transition-all group m-2 rounded-xl">
                      <div className="mt-1 flex-shrink-0 neo-surface-sm p-1.5 flex items-center justify-center">{notif.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text)]">{notif.title}</p>
                        <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-[11px] font-medium opacity-50 mt-1.5">{notif.time}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 text-center">
                  <button className="text-xs font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity" onClick={markAllAsRead}>Đánh dấu đã đọc tất cả</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 cursor-default pl-6 border-l border-[rgba(0,0,0,0.1)]">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-[var(--color-text)]">{sessionUserName}</p>
            <p className="text-[10px] font-bold text-[var(--color-primary)] tracking-widest uppercase">{userRole}</p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="neo-surface-sm p-3 text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-all group" 
            title="Đăng xuất"
          >
             <LogOut size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}

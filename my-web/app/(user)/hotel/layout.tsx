"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CalendarCheck, DoorOpen, Home, LogOut, UserRound, Bell, CheckCircle, Clock, AlertTriangle, Info } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { AdminNotification, HOTEL_STORAGE_KEYS, readJsonStorage, writeJsonStorage } from "@/lib/hotel-storage";

type NotificationItem = AdminNotification & {
  icon: React.ReactNode;
};

function getNotificationIcon(type: AdminNotification["type"]) {
  if (type === "booking") return <CheckCircle className="text-[var(--color-success)]" size={18} />;
  if (type === "service") return <Clock className="text-[var(--color-warning)]" size={18} />;
  if (type === "alert") return <AlertTriangle className="text-[var(--color-danger)]" size={18} />;
  if (type === "checkout") return <CheckCircle className="text-[var(--color-primary)]" size={18} />;
  return <Info className="text-[var(--color-primary)]" size={18} />;
}

function hydrateNotifications(notifications: AdminNotification[]): NotificationItem[] {
  return notifications.map((notification) => ({
    ...notification,
    icon: getNotificationIcon(notification.type),
  }));
}

const navItems = [
  { href: "/hotel", label: "Trang chủ", icon: Home },
  { href: "/hotel/rooms", label: "Thông tin phòng", icon: DoorOpen },
  { href: "/hotel/book", label: "Đặt phòng", icon: CalendarCheck },
];

export default function UserHotelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hotelName, setHotelName] = useState("Grand Luxe");
  const [hotelLogo, setHotelLogo] = useState<string | null>(null);
  const [userName, setUserName] = useState("Khách hàng");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem("userName")) {
      router.push("/login");
    }

    const timeout = window.setTimeout(() => {
      setHotelName(localStorage.getItem("hotelName") || "Grand Luxe");
      setHotelLogo(localStorage.getItem("hotelLogo"));
      setUserName(localStorage.getItem("userName") || "Khách hàng");

      const storedNotifications = readJsonStorage<AdminNotification[]>(HOTEL_STORAGE_KEYS.userNotifications, []);
      setNotifications(hydrateNotifications(storedNotifications));
    }, 0);

    const handleNewNotification = (e: Event) => {
      const detail = (e as CustomEvent<AdminNotification>).detail;
      setNotifications(prev => {
        const next = [{ ...detail, icon: getNotificationIcon(detail.type) }, ...prev];
        writeJsonStorage(HOTEL_STORAGE_KEYS.userNotifications, next.map(({ icon, ...notif }) => notif));
        return next;
      });
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === HOTEL_STORAGE_KEYS.userNotifications) {
        const storedNotifications = readJsonStorage<AdminNotification[]>(HOTEL_STORAGE_KEYS.userNotifications, []);
        setNotifications(hydrateNotifications(storedNotifications));
      }
    };

    window.addEventListener("newUserNotification", handleNewNotification);
    window.addEventListener("storage", handleStorageChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAlertOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("newUserNotification", handleNewNotification);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [router]);

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      writeJsonStorage(HOTEL_STORAGE_KEYS.userNotifications, next.map(({ icon, ...notif }) => notif));
      return next;
    });
    setIsAlertOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications([]);
    writeJsonStorage(HOTEL_STORAGE_KEYS.userNotifications, []);
    setIsAlertOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userType");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[var(--color-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/hotel" className="flex items-center gap-3">
            <div className="neo-surface-sm flex h-12 w-12 items-center justify-center overflow-hidden text-[var(--color-primary)]">
              {hotelLogo ? (
                <img src={hotelLogo} alt="Hotel Logo" className="h-full w-full object-cover" />
              ) : (
                <Building2 size={24} />
              )}
            </div>
            <div>
              <p className="text-lg font-black leading-none">{hotelName}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Hotel experience</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${isActive ? "neo-pressed text-[var(--color-primary)]" : "hover:neo-surface-sm opacity-75 hover:opacity-100"
                    }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsAlertOpen(!isAlertOpen)} className="neo-button p-2.5 rounded-full relative flex items-center justify-center">
                <Bell size={18} />
                {notifications.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[var(--color-danger)] rounded-full border-2 border-[var(--color-surface)]"></span>}
              </button>

              {isAlertOpen && (
                <div className="absolute right-0 mt-4 w-80 neo-surface z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 border border-white/20">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold text-[var(--color-text)]">Thông báo</h3>
                    {notifications.length > 0 && (
                      <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">{notifications.length} MỚI</span>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scroll">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-[var(--color-text)] opacity-50 font-medium text-sm">Không có thông báo.</div>
                    ) : (
                      notifications.map((notif) => (
                        <Link key={notif.id} href={notif.link} onClick={() => handleNotificationClick(notif.id)} className="flex gap-3 p-4 border-b border-white/10 hover:neo-pressed transition-all group m-2 rounded-xl">
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
                    <div className="p-3 text-center border-t border-white/10">
                      <button className="text-xs font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity" onClick={markAllAsRead}>Đánh dấu đã đọc tất cả</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden items-center gap-2 text-sm font-bold md:flex pl-3 border-l border-black/10">
              <UserRound size={16} className="text-[var(--color-primary)]" />
              <span>{userName}</span>
            </div>
            <button onClick={handleLogout} className="neo-button flex items-center gap-2 px-4 py-2 text-sm">
              <LogOut size={16} />
              Thoát
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 pb-4 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${isActive ? "neo-pressed text-[var(--color-primary)]" : "neo-surface-sm"
                  }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}

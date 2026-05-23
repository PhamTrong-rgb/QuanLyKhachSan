"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, CheckCircle, Info, Clock, AlertTriangle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";

export default function Header() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [sessionUserName, setSessionUserName] = useState("Người dùng rỗng");
  const [userRole, setUserRole] = useState("Quản trị viên");
  const [hotelLogo, setHotelLogo] = useState<string | null>(null);
  const [hotelName, setHotelName] = useState("Grand Luxe");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const userLocal = localStorage.getItem("userName");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (userLocal) setSessionUserName(userLocal);

    const roleLocal = localStorage.getItem("userRole");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (roleLocal) setUserRole(roleLocal);

    // Load hotel logo
    const savedLogo = localStorage.getItem("hotelLogo");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (savedLogo) setHotelLogo(savedLogo);

    const savedName = localStorage.getItem("hotelName");
    if (savedName) setHotelName(savedName);

    const handleLogoUpdate = () => {
      setHotelLogo(localStorage.getItem("hotelLogo"));
    };
    window.addEventListener("hotelLogoUpdated", handleLogoUpdate);

    const handleDataUpdate = () => {
      setHotelName(localStorage.getItem("hotelName") || "Grand Luxe");
    };
    window.addEventListener("hotelDataUpdated", handleDataUpdate);

    const handleNewNotification = (e: any) => {
      const detail = e.detail;
      let icon = <Info className="text-[var(--color-primary)]" size={18}/>;
      if (detail.type === 'booking') icon = <CheckCircle className="text-[var(--color-success)]" size={18}/>;
      else if (detail.type === 'service') icon = <Clock className="text-[var(--color-warning)]" size={18}/>;
      else if (detail.type === 'alert') icon = <AlertTriangle className="text-[var(--color-danger)]" size={18}/>;
      else if (detail.type === 'checkout') icon = <CheckCircle className="text-[var(--color-primary)]" size={18}/>;
      
      setNotifications(prev => [{ ...detail, icon }, ...prev]);
    };
    window.addEventListener("newNotification", handleNewNotification);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAlertOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("hotelLogoUpdated", handleLogoUpdate);
      window.removeEventListener("hotelDataUpdated", handleDataUpdate);
      window.removeEventListener("newNotification", handleNewNotification);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  const [notifications, setNotifications] = useState([
    { id: 1, type: "booking", title: "Đặt phòng mới", message: "Khách hàng vừa đặt phòng VIP 205", time: "5 phút trước", icon: <CheckCircle className="text-[var(--color-success)]" size={18}/>, link: "/bookings" },
    { id: 2, type: "service", title: "Yêu cầu dịch vụ", message: "Phòng 102 yêu cầu Room Service", time: "15 phút trước", icon: <Clock className="text-[var(--color-warning)]" size={18}/>, link: "/services" },
    { id: 3, type: "checkout", title: "Khách trả phòng", message: "Báo trả phòng STD 102", time: "1 giờ trước", icon: <Info className="text-[var(--color-primary)]" size={18}/>, link: "/invoices" },
    { id: 4, type: "alert", title: "Bảo trì khẩn", message: "Phòng 104 báo lỗi thiết bị", time: "2 giờ trước", icon: <AlertTriangle className="text-[var(--color-danger)]" size={18}/>, link: "/rooms" },
  ]);

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setIsAlertOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications([]);
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


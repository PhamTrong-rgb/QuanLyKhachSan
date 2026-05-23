"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BedDouble, Users, CalendarDays, Settings, FileText, ConciergeBell, Briefcase, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: <Home size={20} />, label: 'Trang chủ', href: '/' },
    { icon: <BedDouble size={20} />, label: 'Sơ đồ phòng', href: '/rooms' },
    { icon: <CalendarDays size={20} />, label: 'Lịch đặt', href: '/bookings' },
    { icon: <Users size={20} />, label: 'Khách lưu trú', href: '/guests' },
    { icon: <ConciergeBell size={20} />, label: 'Dịch vụ', href: '/services' },
    { icon: <FileText size={20} />, label: 'Hóa đơn', href: '/invoices' },
    { icon: <Wallet size={20} />, label: 'Giao dịch', href: '/transactions' },
    { icon: <Briefcase size={20} />, label: 'Nhân viên', href: '/employees' },
    { icon: <Settings size={20} />, label: 'Cài đặt', href: '/settings' },
  ];

  return (
    <aside className={`m-4 h-[calc(100vh-2rem-96px)] flex flex-col transition-[width] duration-300 ease-out z-20 relative flex-shrink-0 ${isCollapsed ? 'w-[84px]' : 'w-[260px]'}`}>
      
      {/* Nút thu gọn / mở rộng */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className={`absolute -right-3.5 top-8 w-7 h-7 neo-surface rounded-full flex items-center justify-center text-[var(--color-text)] hover:text-[var(--color-primary)] transition-all z-30 shadow-md cursor-pointer`}
        title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Block 2: Menu Navigation */}
      <nav className="neo-surface flex-1 py-4 px-3 space-y-2 overflow-y-auto custom-scroll overflow-x-hidden relative h-full">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link 
              key={index} 
              href={item.href} 
              title={isCollapsed ? item.label : ""}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3.5 rounded-xl transition-all duration-300 group ${isActive ? 'neo-pressed text-[var(--color-primary)]' : 'hover:neo-surface-sm text-[var(--color-text)] opacity-70 hover:opacity-100'}`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} w-full min-w-max`}>
                <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)] group-hover:text-[var(--color-primary)]'}`}>
                  {item.icon}
                </span>
                <span className={`transition-[max-width,opacity,margin] duration-300 ease-out overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-4'} ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


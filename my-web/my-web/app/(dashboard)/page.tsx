"use client";

import { useState } from "react";
import { TrendingUp, Users, DollarSign, CalendarCheck, CreditCard, Download, MapPin } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataSets: any = {
  week: [
    { name: 'T2', revenue: 15200000, profit: 8000000 },
    { name: 'T3', revenue: 18500000, profit: 10000000 },
    { name: 'T4', revenue: 12000000, profit: 5000000 },
    { name: 'T5', revenue: 22000000, profit: 12000000 },
    { name: 'T6', revenue: 28900000, profit: 16000000 },
    { name: 'T7', revenue: 35000000, profit: 21000000 },
    { name: 'CN', revenue: 31000000, profit: 19000000 },
  ],
  month: [
    { name: 'Tuần 1', revenue: 85200000, profit: 48000000 },
    { name: 'Tuần 2', revenue: 78500000, profit: 41000000 },
    { name: 'Tuần 3', revenue: 92000000, profit: 55000000 },
    { name: 'Tuần 4', revenue: 112000000, profit: 62000000 },
  ],
  year: [
    { name: 'Q1', revenue: 350200000, profit: 180000000 },
    { name: 'Q2', revenue: 418500000, profit: 210000000 },
    { name: 'Q3', revenue: 492000000, profit: 255000000 },
    { name: 'Q4', revenue: 512000000, profit: 282000000 },
  ]
};

const roomStatusData = [
  { name: 'Đang dùng', value: 85 },
  { name: 'Trống', value: 30 },
  { name: 'Kiểm tra', value: 25 },
];
const COLORS = ['#006666', '#00A63D', '#FE9900']; // Neumorphism palette

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="neo-surface p-4 rounded-xl">
        <p className="text-[var(--color-text)] font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: index===0 ? 'var(--color-primary)' : 'var(--color-success)' }}>
            {entry.name === 'revenue' ? 'Doanh Thu:' : 'Lợi Nhuận:'} {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Home() {
  const { guests, rooms, bookings } = useHotel();
  const [timeRange, setTimeRange] = useState('week');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const stats = [
    { title: "Doanh thu", value: "162.6 Tr", trend: "+20.1%", icon: <DollarSign size={22} className="text-[var(--color-primary)]"/>, color: "neo-surface-sm", link: "/invoices" },
    { title: "Công suất phòng", value: `${Math.round((rooms.filter(r => r.status === 'Đang phục vụ' || r.status === 'Đang dọn').length / (rooms.length || 1)) * 100)}%`, trend: "+5%", icon: <TrendingUp size={22} className="text-[var(--color-success)]"/>, color: "neo-surface-sm", link: "/rooms" },
    { title: "Tổng Khách", value: `${guests.length}`, trend: "+2", icon: <Users size={22} className="text-[var(--color-warning)]"/>, color: "neo-surface-sm", link: "/guests" },
    { title: "Đơn đặt phòng", value: `${bookings.length}`, trend: "+1", icon: <CalendarCheck size={22} className="text-[var(--color-danger)]"/>, color: "neo-surface-sm", link: "/bookings" },
  ];

  const handleExportContent = () => {
    const csvContent = "Ma Phong,Loai Phong,Khach Hang,Doanh Thu,Trang Thai\n101,Standard,Nguyen Van A,2500000,Dang o\n102,Deluxe,Tran Thi B,3800000,Dang o";
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bao_Cao_GrandLuxe_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCalendar = () => {
    const daysArr = Array.from({length: 30}, (_, i) => i + 1); 
    return (
      <div className="grid grid-cols-7 gap-3 mt-4 relative">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-[var(--color-text)] opacity-70">{d}</div>
        ))}
        {Array(3).fill(null).map((_, i) => <div key={`empty-${i}`}></div>)}
        {daysArr.map((day) => {
          let bgClass = "neo-surface hover:neo-pressed text-[var(--color-text)] opacity-80 hover:opacity-100"; 
          if (day === 17) bgClass = "neo-button-primary text-white";
          else if ([5, 12, 19, 26].includes(day)) bgClass = "neo-pressed text-[var(--color-success)] font-bold";
          else if ([2, 10, 20].includes(day)) bgClass = "neo-surface text-[var(--color-warning)] font-medium border-2 border-dashed border-[var(--color-warning)]";
          return (
            <div 
              key={day} 
              onClick={() => setSelectedDate(day)}
              className={`h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all text-xs font-bold ${bgClass}`} 
            >
              {day}
            </div>
          );
        })}
      </div>
    );
  }

  const generateModalRoomData = (day: number) => {
    if ([5, 12, 19, 26].includes(day)) {
      return { occupied: ["101", "102", "103", "201", "205", "301"], free: ["104"] };
    }
    if ([2, 10, 20].includes(day)) {
      return { occupied: ["102", "205"], free: ["101", "103", "104", "201", "301"] };
    }
    return { occupied: ["102", "103", "205"], free: ["101", "104", "201", "301"] };
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-[var(--color-text)] opacity-70 mt-1.5 font-normal">Theo dõi hoạt động kinh doanh của khách sạn.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExportContent} className="neo-button px-5 py-3 rounded-xl flex items-center gap-2">
            <Download size={18}/> Báo cáo
          </button>
          <Link href="/invoices" className="neo-button-primary px-5 py-3 rounded-xl flex items-center gap-2">
            <CreditCard size={18}/> Hóa đơn mới
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link href={stat.link} key={i}>
            <div className="neo-surface p-6 rounded-2xl transition-all cursor-pointer h-full flex flex-col justify-between group hover:neo-pressed">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[11px] font-bold text-[var(--color-text)] opacity-70 mb-2 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-[var(--color-text)]">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between text-sm pt-4 border-t border-white/20">
                <div className="flex items-center">
                  <span className="font-bold text-[var(--color-success)] text-xs">{stat.trend}</span>
                  <span className="text-[var(--color-text)] opacity-50 font-normal text-xs ml-2">so với tháng trước</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          <div className="neo-surface rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">Biểu đồ tài chính</h2>
                <p className="text-sm font-normal text-[var(--color-text)] opacity-70 mt-1">Giao dịch thu vào và lợi nhuận</p>
              </div>
              <Select 
                value={timeRange} 
                onChange={setTimeRange} 
                className="w-40 neo-input py-2.5 px-4 font-bold"
                options={[
                  { value: "week", label: "7 Ngày Qua" },
                  { value: "month", label: "Tháng Nay" },
                  { value: "year", label: "Năm Nay" }
                ]}
              />
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={dataSets[timeRange]} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text)', fontWeight: 500, fontSize: 12, opacity: 0.7}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text)', fontWeight: 500, fontSize: 12, opacity: 0.7}} dx={-10} tickFormatter={(val) => `${val / 1000000}M`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" stroke="var(--color-success)" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="neo-surface rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">Lịch phòng Tháng 04</h2>
                <p className="text-sm font-normal text-[var(--color-text)] opacity-70 mt-1 cursor-help">Các mốc ngày tương tác</p>
              </div>
            </div>
            {renderCalendar()}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="neo-surface rounded-2xl p-8">
             <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Trạng thái phòng</h2>
             <div className="h-[200px] w-full my-6">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={roomStatusData} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                    {roomStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: 'var(--color-surface)', boxShadow: '5px 5px 10px #c4c2c1, -5px -5px 10px #ffffff'}} itemStyle={{color: 'var(--color-text)'}}/>
                </PieChart>
              </ResponsiveContainer>
             </div>
             <div className="grid grid-cols-1 gap-3 mt-4">
               {roomStatusData.map((item, index) => (
                 <div key={index} className="flex items-center justify-between p-3 neo-pressed rounded-xl">
                   <div className="flex items-center gap-3">
                     <div className="w-4 h-4 rounded-full " style={{backgroundColor: COLORS[index]}}></div>
                     <span className="text-sm font-bold text-[var(--color-text)]">{item.name}</span>
                   </div>
                   <span className="font-extrabold text-[var(--color-text)] text-sm">{item.value}%</span>
                 </div>
               ))}
             </div>
          </div>

          <div className="neo-surface rounded-2xl p-8 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Logs Cập Nhật</h2>
            </div>
            <div className="space-y-4">
              {[
                { name: "Sảnh Lễ Tân", room: "Tầng 1", desc: "Xác nhận Check-in cho 4 khách.", time: "10:30 AM" },
                { name: "Hệ thống Booking", room: "VIP", desc: "Tiếp nhận 1 đơn phòng qua Cổng C.", time: "09:45 AM" },
                { name: "Phòng KT", room: "ALL", desc: "Kiểm tra điện lưới thành công.", time: "08:00 AM" }
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-white/20 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl neo-surface-sm flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-[var(--color-primary)]"/>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[var(--color-text)]">{act.name}</h4>
                    <p className="text-xs font-normal text-[var(--color-text)] opacity-70 mt-1 max-w-[150px] truncate">{act.desc}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-[10px] font-bold text-[var(--color-text)] opacity-50">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={selectedDate !== null} onClose={() => setSelectedDate(null)} title={`Phân Bổ Kế Hoạch - ${selectedDate}/04/2026`}>
        {selectedDate && (
          <div className="space-y-6">
            <div className="p-5 neo-pressed rounded-xl flex items-center justify-between">
              <span className="font-bold text-sm text-[var(--color-text)] opacity-70">Hiệu suất phòng dự kiến:</span>
              <span className="text-xl font-extrabold text-[var(--color-primary)]">{Math.round((generateModalRoomData(selectedDate).occupied.length / 7) * 100)}%</span>
            </div>
            
            <div>
               <h4 className="text-sm font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">Phòng Hoạt Động ({generateModalRoomData(selectedDate).occupied.length})</h4>
               <div className="flex flex-wrap gap-3">
                 {generateModalRoomData(selectedDate).occupied.map(r => (
                    <Link href="/bookings" key={r} onClick={() => setSelectedDate(null)} className="neo-button px-4 py-2 text-sm text-[var(--color-success)] hover:text-white hover:bg-[var(--color-success)]">
                      {r}
                    </Link>
                 ))}
               </div>
            </div>

            <div>
               <h4 className="text-sm font-bold text-[var(--color-text)] mb-3 mt-6 flex items-center gap-2">Phòng Trống ({generateModalRoomData(selectedDate).free.length})</h4>
               <div className="flex flex-wrap gap-3">
                 {generateModalRoomData(selectedDate).free.map(r => (
                    <Link href="/rooms" key={r} onClick={() => setSelectedDate(null)} className="neo-pressed px-4 py-2 text-[var(--color-text)] opacity-80 hover:opacity-100 font-bold text-sm">
                      {r}
                    </Link>
                 ))}
               </div>
            </div>

            <div className="pt-6 border-t border-white/20 flex justify-end">
              <button onClick={() => setSelectedDate(null)} className="neo-button px-6 py-2">Đóng Panel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

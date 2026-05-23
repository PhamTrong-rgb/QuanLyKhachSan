"use client";

import { useState } from "react";
import { TrendingUp, Users, DollarSign, CalendarCheck, CreditCard, Download, MapPin } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

const COLORS = ['#006666', '#00A63D', '#FE9900'];

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
  const { guests, rooms, bookings, invoices, transactions, requests } = useHotel();
  const [timeRange, setTimeRange] = useState('week');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // --- Dynamic stats from real data ---
  const totalRevenue = invoices
    .filter(i => i.status === 'Đã thanh toán')
    .reduce((sum, i) => sum + (parseInt(i.amount.replace(/[^0-9]/g, '')) || 0), 0);

  const occupiedRooms = rooms.filter(r => r.status === 'Đang phục vụ' || r.status === 'Đang dọn').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  const pendingBookings = bookings.filter(b => b.status === 'Chờ duyệt').length;

  const formatRevenue = (val: number) => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} Tỷ`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} Tr`;
    return val.toLocaleString('vi-VN');
  };

  const stats = [
    { title: "Doanh thu (Đã TT)", value: totalRevenue > 0 ? formatRevenue(totalRevenue) : "0 ₫", sub: `${invoices.filter(i=>i.status==='Đã thanh toán').length} hóa đơn`, icon: <DollarSign size={22} className="text-[var(--color-primary)]"/>, color: "neo-surface-sm", link: "/invoices" },
    { title: "Công suất phòng", value: rooms.length > 0 ? `${occupancyRate}%` : "--", sub: `${occupiedRooms}/${rooms.length} phòng`, icon: <TrendingUp size={22} className="text-[var(--color-success)]"/>, color: "neo-surface-sm", link: "/rooms" },
    { title: "Tổng Khách", value: `${guests.length}`, sub: "khách hàng", icon: <Users size={22} className="text-[var(--color-warning)]"/>, color: "neo-surface-sm", link: "/guests" },
    { title: "Đơn đặt phòng", value: `${bookings.length}`, sub: pendingBookings > 0 ? `${pendingBookings} chờ duyệt` : "Tất cả đã xử lý", icon: <CalendarCheck size={22} className="text-[var(--color-danger)]"/>, color: "neo-surface-sm", link: "/bookings" },
  ];

  // --- Dynamic chart data from transactions ---
  const now = new Date();
  const buildWeekData = () => {
    const days = ['CN','T2','T3','T4','T5','T6','T7'];
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(now); d.setDate(now.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('vi-VN');
      const revenue = transactions.filter(t => t.type==='income' && t.date===dateStr).reduce((s,t)=>s+t.amount,0);
      const profit = Math.round(revenue * 0.6);
      return { name: days[d.getDay()], revenue, profit };
    });
  };
  const buildMonthData = () => {
    return Array.from({length: 4}, (_, i) => {
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - (3-i)*7 - 6);
      const weekEnd = new Date(now); weekEnd.setDate(now.getDate() - (3-i)*7);
      const revenue = transactions.filter(t => {
        if(t.type !== 'income') return false;
        const parts = t.date.split('/'); if(parts.length<3) return false;
        const d = new Date(+parts[2],+parts[1]-1,+parts[0]);
        return d >= weekStart && d <= weekEnd;
      }).reduce((s,t)=>s+t.amount,0);
      return { name: `Tuần ${i+1}`, revenue, profit: Math.round(revenue*0.6) };
    });
  };
  const buildYearData = () => {
    return ['Q1','Q2','Q3','Q4'].map((q, i) => {
      const startM = i*3; const endM = startM+2;
      const revenue = transactions.filter(t => {
        if(t.type !== 'income') return false;
        const parts = t.date.split('/'); if(parts.length<3) return false;
        const m = +parts[1]-1;
        return m >= startM && m <= endM;
      }).reduce((s,t)=>s+t.amount,0);
      return { name: q, revenue, profit: Math.round(revenue*0.6) };
    });
  };
  const dynamicDataSets: any = { week: buildWeekData(), month: buildMonthData(), year: buildYearData() };

  // --- Dynamic room status for pie chart ---
  const availableRooms = rooms.filter(r => r.status === 'Sẵn sàng').length;
  const servingRooms = rooms.filter(r => r.status === 'Đang phục vụ').length;
  const cleaningRooms = rooms.filter(r => r.status === 'Đang dọn').length;
  const roomStatusData = rooms.length > 0 ? [
    { name: 'Đang phục vụ', value: servingRooms, count: servingRooms },
    { name: 'Sẵn sàng', value: availableRooms, count: availableRooms },
    { name: 'Đang dọn', value: cleaningRooms, count: cleaningRooms },
  ].filter(i => i.value > 0) : [];

  const handleExportContent = () => {
    const headers = ["Mã Phòng","Loại Phòng","Trạng Thái","Giá/Đêm"];
    const rows = rooms.map(r => [r.id, r.type, r.status, r.price]);
    const csv = "\uFEFF" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BaoCao_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
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
          <button onClick={handleExportContent} className="neo-button px-5 py-3 rounded-xl flex items-center gap-2 active:scale-95 transition-transform">
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
                <span className="text-[var(--color-text)] opacity-50 font-normal text-xs">{stat.sub}</span>
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
                <p className="text-sm font-normal text-[var(--color-text)] opacity-70 mt-1">Doanh thu và lợi nhuận thực tế</p>
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
                <AreaChart data={dynamicDataSets[timeRange]} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
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
               {rooms.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[200px] opacity-40">
                   <p className="text-sm font-bold text-[var(--color-text)]">Chưa có phòng nào</p>
                   <p className="text-xs font-bold text-[var(--color-text)] mt-1">Thêm phòng tại mục Quản lý Phòng</p>
                 </div>
               ) : (
                 <>
                   <div className="h-[200px] w-full my-6">
                     <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                       <PieChart>
                         <Pie data={roomStatusData} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                           {roomStatusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: 'var(--color-surface)', boxShadow: '5px 5px 10px #c4c2c1, -5px -5px 10px #ffffff'}} itemStyle={{color: 'var(--color-text)'}} formatter={(val: any, name: any, props: any) => [`${props.payload.count} phòng`, name]}/>
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-1 gap-3 mt-4">
                     {roomStatusData.map((item, index) => (
                       <div key={index} className="flex items-center justify-between p-3 neo-pressed rounded-xl">
                         <div className="flex items-center gap-3">
                           <div className="w-4 h-4 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                           <span className="text-sm font-bold text-[var(--color-text)]">{item.name}</span>
                         </div>
                         <span className="font-extrabold text-[var(--color-text)] text-sm">{item.count} / {rooms.length}</span>
                       </div>
                     ))}
                     <div className="flex items-center justify-between p-3 neo-surface-sm rounded-xl">
                       <span className="text-xs font-bold text-[var(--color-text)] opacity-60">Tổng số phòng</span>
                       <span className="font-extrabold text-[var(--color-text)] text-sm">{rooms.length} phòng</span>
                     </div>
                   </div>
                 </>
               )}
             </div>

          <div className="neo-surface rounded-2xl p-8 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Hoạt động gần đây</h2>
            </div>
            <div className="space-y-4">
              {(() => {
                const recentLogs = [
                  ...bookings.slice(0, 3).map(b => ({
                    icon: <CalendarCheck size={16} className="text-[var(--color-primary)]"/>,
                    title: b.guest,
                    desc: `Đặt phòng ${b.room} — ${b.status}`,
                    time: b.checkIn || '—'
                  })),
                  ...requests.slice(0, 2).map(r => ({
                    icon: <MapPin size={16} className="text-[var(--color-warning)]"/>,
                    title: `Phòng ${r.room}`,
                    desc: `${r.type} — ${r.status}`,
                    time: r.time || '—'
                  }))
                ].slice(0, 4);

                if (recentLogs.length === 0) return (
                  <div className="flex flex-col items-center justify-center py-8 opacity-40">
                    <MapPin size={32} className="text-[var(--color-text)] mb-2"/>
                    <p className="text-sm font-bold text-[var(--color-text)]">Chưa có hoạt động nào</p>
                    <p className="text-xs font-bold text-[var(--color-text)] mt-1 opacity-70">Dữ liệu sẽ hiển thị khi có đơn đặt phòng</p>
                  </div>
                );

                return recentLogs.map((act, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-white/20 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-xl neo-surface-sm flex items-center justify-center flex-shrink-0">
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[var(--color-text)] truncate">{act.title}</h4>
                      <p className="text-xs font-normal text-[var(--color-text)] opacity-70 mt-1 truncate">{act.desc}</p>
                    </div>
                    <div className="text-right whitespace-nowrap flex-shrink-0">
                      <p className="text-[10px] font-bold text-[var(--color-text)] opacity-50">{act.time}</p>
                    </div>
                  </div>
                 ));
              })()}
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
              <button onClick={() => setSelectedDate(null)} className="neo-button px-6 py-2 active:scale-95 transition-transform">Đóng Panel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

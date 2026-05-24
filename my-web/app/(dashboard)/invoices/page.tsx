"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, FileText, CheckCircle, Clock, Trash2, Edit, Printer, Receipt, X } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

export default function InvoicesPage() {
  const { invoices, addInvoice, updateInvoice, deleteInvoice, bookings, updateBooking, rooms, requests } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [hotelName, setHotelName] = useState("GRAND LUXE HOTEL");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setHotelName((localStorage.getItem("hotelName") || "GRAND LUXE HOTEL").toUpperCase());
    }, 0);

    const handleDataUpdate = () => {
      const updatedName = localStorage.getItem("hotelName");
      setHotelName(updatedName ? updatedName.toUpperCase() : "GRAND LUXE HOTEL");
    };
    window.addEventListener("hotelDataUpdated", handleDataUpdate);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("hotelDataUpdated", handleDataUpdate);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<any>({ id: "", guest: "", amount: "", status: "Chưa thanh toán", date: "", roomId: "", details: [] });
  
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [customServices, setCustomServices] = useState<{id: string, name: string, price: number | ''}[]>([]);
  
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const [invoiceToPrint, setInvoiceToPrint] = useState<any>(null);

  const filteredInvoices = invoices.filter(i => 
    i.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.guest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBookings = bookings;

  const openAdd = () => {
    setIsEdit(false);
    setSelectedBookingId("");
    setCustomServices([]);
    setCheckInDate("");
    setCheckOutDate("");
    setCurrentInvoice({ id: `MÃ-CHỜ`, guest: "", amount: "", status: "Chưa thanh toán", date: new Date().toLocaleDateString('vi-VN'), roomId: "", details: [] });
    setIsModalOpen(true);
  };

  const openEdit = (inv: any) => {
    setIsEdit(true);
    setCurrentInvoice(inv);
    
    const booking = bookings.find(b => b.guest === inv.guest);
    if (booking) {
      setSelectedBookingId(booking.id);
      setCheckInDate(booking.checkIn || "");
      setCheckOutDate(booking.checkOut || "");
    } else {
      setSelectedBookingId("");
      setCheckInDate("");
      setCheckOutDate("");
    }

    const srvs = (inv.details || []).filter((d: any) => !d.name.startsWith("Tiền phòng")).map((d: any, idx: number) => ({
      id: Date.now().toString() + idx,
      name: d.name.replace("Dịch vụ: ", ""),
      price: d.price
    }));
    setCustomServices(srvs);

    setIsModalOpen(true);
  };

  const selectedBookingData = useMemo(() => {
    if (!selectedBookingId) return null;
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (!booking) return null;

    const room = rooms.find(r => r.id === booking.room);
    const roomPrice = room ? parseInt(String(room.price).replace(/[^0-9]/g, '')) : 0;

    // Compute nights correctly using Date objects. Accepts 'YYYY-MM-DD' or 'DD/MM/YYYY'.
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

    const inDate = parseToDate(checkInDate);
    const outDate = parseToDate(checkOutDate);
    let days = 1;
    if (inDate && outDate) {
      const diffMs = outDate.getTime() - inDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      days = diffDays > 0 ? diffDays : 1;
    }

    const roomTotal = roomPrice * days;
    const servicesTotal = customServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const totalAmount = roomTotal + servicesTotal;

    return { booking, room, roomPrice, days, roomTotal, servicesTotal, totalAmount };
  }, [selectedBookingId, bookings, rooms, customServices, checkInDate, checkOutDate]);

  const addCustomService = () => {
    setCustomServices([...customServices, { id: Date.now().toString(), name: "", price: "" }]);
  };

  const removeCustomService = (id: string) => {
    setCustomServices(customServices.filter(s => s.id !== id));
  };

  const updateCustomService = (id: string, field: 'name' | 'price', value: string) => {
    setCustomServices(customServices.map(s => {
      if (s.id === id) {
        return { ...s, [field]: field === 'price' ? (value ? parseInt(value) : "") : value };
      }
      return s;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingData) return;

    const details = [
      { name: `Tiền phòng ${selectedBookingData.room?.id} (${selectedBookingData.days} đêm)`, price: selectedBookingData.roomTotal }
    ];
    
    customServices.forEach(srv => {
      if (srv.name.trim() !== "") {
        details.push({ name: `Dịch vụ: ${srv.name}`, price: Number(srv.price) || 0 });
      }
    });

    const newAmountStr = new Intl.NumberFormat('vi-VN').format(selectedBookingData.totalAmount);

    if (selectedBookingData.booking) {
       updateBooking({
         ...selectedBookingData.booking,
         checkIn: checkInDate,
         checkOut: checkOutDate,
       });
    }

    if (isEdit) {
      updateInvoice({
        ...currentInvoice,
        amount: newAmountStr,
        details: details
      });
    } else {
      const newInvoice = {
        id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        guest: selectedBookingData.booking.guest,
        roomId: selectedBookingData.room?.id || "",
        amount: newAmountStr,
        status: currentInvoice.status,
        date: new Date().toLocaleDateString('vi-VN'),
        details: details
      };
      addInvoice(newInvoice);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa hóa đơn mã ${id}?`)) {
      deleteInvoice(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            <FileText size={28} className="text-[var(--color-primary)]" />
            Quản lý Hóa đơn
          </h1>
          <p className="text-sm font-medium text-[var(--color-text)] opacity-70 mt-1">Tính toán và xuất hóa đơn dựa trên phòng & dịch vụ.</p>
        </div>
        <button onClick={openAdd} className="neo-button-primary px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Plus size={18} /> Lập Hóa đơn mới
        </button>
      </div>

      <div className="neo-surface rounded-2xl">
        <div className="p-5 border-b border-white/20">
          <div className="relative max-w-md w-full neo-input flex items-center px-4 py-2">
            <Search className="text-[var(--color-text)] opacity-50 mr-2" size={18} />
            <input type="text" placeholder="Tìm mã hoặc tên khách..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-[var(--color-text)] font-medium placeholder:opacity-50" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[var(--color-text)] opacity-70 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 px-6">Mã Hóa Đơn</th>
                <th className="p-4">Khách hàng / Phòng</th>
                <th className="p-4">Ngày lập</th>
                <th className="p-4 text-right">Tổng tiền</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-sm">
              {filteredInvoices.length === 0 ? (
                 <tr><td colSpan={6} className="p-6 text-center text-[var(--color-text)] opacity-50 font-bold">Không có hóa đơn nào.</td></tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:neo-pressed transition-all">
                  <td className="p-4 px-6 font-bold text-[var(--color-text)] tracking-wider">
                    <div className="neo-surface-sm text-[var(--color-text)] px-3 py-1.5 rounded-lg w-max text-sm">
                      {inv.id}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-[var(--color-text)] font-bold text-sm">{inv.guest}</p>
                    {inv.roomId && <p className="text-[var(--color-text)] opacity-60 font-bold text-xs mt-1">Phòng: {inv.roomId}</p>}
                  </td>
                  <td className="p-4 text-[var(--color-text)] opacity-70 font-bold text-sm">{inv.date}</td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-[var(--color-text)] text-lg">{inv.amount}</span> <span className="text-xs text-[var(--color-text)] opacity-50 font-bold">VNĐ</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold neo-pressed gap-1.5 ${
                      inv.status === "Đã thanh toán" ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"
                    }`}>
                      {inv.status === "Đã thanh toán" ? <CheckCircle size={12}/> : <Clock size={12}/>} {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-center align-middle">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => setInvoiceToPrint(inv)} title="Xuất hóa đơn" className="p-2 text-[var(--color-primary)] neo-surface-sm hover:neo-pressed rounded-xl transition-all cursor-pointer active:scale-95">
                        <Printer size={16} />
                      </button>
                      <button onClick={() => openEdit(inv)} title="Chỉnh sửa" className="p-2 text-[var(--color-text)] opacity-70 hover:opacity-100 neo-surface-sm hover:neo-pressed rounded-xl transition-all cursor-pointer active:scale-95">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(inv.id)} title="Xóa" className="p-2 text-[var(--color-danger)] neo-surface-sm hover:neo-pressed rounded-xl transition-all cursor-pointer active:scale-95">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!invoiceToPrint} onClose={() => setInvoiceToPrint(null)} title="Phiếu Thu (Invoice)">
        {invoiceToPrint && (
          <div className="p-4 space-y-6">
            <div className="text-center border-b border-white/20 pb-4">
              <h2 className="text-2xl font-black text-[var(--color-text)] uppercase">{hotelName}</h2>
              <p className="text-[var(--color-text)] opacity-60 text-sm mt-1">123 Phố Nghỉ Dưỡng, Biển Xanh</p>
              <p className="text-[var(--color-text)] opacity-60 text-sm">Điện thoại: 0123.456.789</p>
            </div>
            <div className="flex justify-between items-start text-sm">
              <div>
                <p><span className="font-bold text-[var(--color-text)] opacity-70">Khách hàng:</span> {invoiceToPrint.guest}</p>
                <p className="mt-1"><span className="font-bold text-[var(--color-text)] opacity-70">Phòng:</span> {invoiceToPrint.roomId || "N/A"}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold text-[var(--color-text)] opacity-70">Mã hóa đơn:</span> {invoiceToPrint.id}</p>
                <p className="mt-1"><span className="font-bold text-[var(--color-text)] opacity-70">Ngày lập:</span> {invoiceToPrint.date}</p>
              </div>
            </div>
            
            <table className="w-full text-sm">
              <thead className="neo-surface-sm text-[var(--color-text)] opacity-80 font-bold">
                <tr>
                  <th className="py-2 px-3 text-left rounded-l-lg">Nội dung</th>
                  <th className="py-2 px-3 text-right rounded-r-lg">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {invoiceToPrint.details && invoiceToPrint.details.length > 0 ? invoiceToPrint.details.map((dt: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-bold text-[var(--color-text)]">{dt.name}</td>
                    <td className="py-3 px-3 text-right font-bold text-[var(--color-text)]">{new Intl.NumberFormat('vi-VN').format(dt.price)} đ</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="py-3 px-3 font-bold text-[var(--color-text)]">Tổng chi phí (Gộp)</td>
                    <td className="py-3 px-3 text-right font-bold text-[var(--color-text)]">{invoiceToPrint.amount} đ</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center neo-surface-sm p-4 rounded-xl">
              <span className="font-bold text-[var(--color-text)] opacity-70 uppercase">Tổng cộng:</span>
              <span className="text-xl font-black text-[var(--color-text)]">{invoiceToPrint.amount} VNĐ</span>
            </div>
            
            <div className="pt-4 text-center">
              <p className="italic text-[var(--color-text)] opacity-50 text-xs">Cảm ơn quý khách đã sử dụng dịch vụ của {hotelName}!</p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => setInvoiceToPrint(null)} className="px-6 py-2 text-[var(--color-text)] font-bold hover:neo-pressed rounded-xl transition-all active:scale-95">Đóng</button>
                <button onClick={() => { alert("Đang kết nối với máy in..."); setInvoiceToPrint(null); }} className="px-6 py-2 neo-button-primary rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95">
                  <Printer size={18}/> In Hóa Đơn
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? `Cập nhật hóa đơn: ${currentInvoice.id}` : "Lập Hóa Đơn Cho Khách"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Khách hàng lưu trú</label>
            <Select 
              disabled={isEdit}
              value={selectedBookingId} 
              onChange={(val) => {
                setSelectedBookingId(val);
                const booking = bookings.find((item) => item.id === val);
                setCheckInDate(booking?.checkIn || "");
                setCheckOutDate(booking?.checkOut || "");

                // Prefill service costs from service requests for this booking's room/guest
                const SERVICE_PRICE_MAP: Record<string, number> = {
                  'Dọn dẹp phòng': 50000,
                  'Gọi Đồ Ăn': 150000,
                  'Massage thư giãn': 500000,
                  'Yêu cầu khác': 0
                };

                if (booking) {
                  const related = (requests || []).filter(r => (r.room === booking.room) || (r.guest === booking.guest));
                  if (related.length > 0) {
                    const pre = related.map((r, idx) => ({ id: r.id || `svc-${idx}`, name: r.type, price: SERVICE_PRICE_MAP[r.type] || 0 }));
                    setCustomServices(pre);
                  } else {
                    setCustomServices([]);
                  }
                } else {
                  setCustomServices([]);
                }
                setSelectedBookingId(val);
              }} 
              className={`w-full neo-input py-2.5 px-4 ${isEdit ? "opacity-50" : ""}`}
              placeholder="-- Chọn Đơn đặt phòng --"
              options={activeBookings.map(b => ({
                value: b.id,
                label: `${b.guest} (Phòng ${b.room} - Mã: ${b.id})`
              }))}
            />
          </div>

          {selectedBookingData && (
            <div className="neo-surface-sm p-5 rounded-2xl space-y-5">
              <div className="grid grid-cols-2 gap-5 pb-4 border-b border-white/20">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Ngày Check-in</label>
                  <input 
                    type="text" 
                    value={checkInDate} 
                    onChange={(e) => setCheckInDate(e.target.value)} 
                    placeholder="VD: 20/04"
                    className="w-full neo-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Ngày Check-out</label>
                  <input 
                    type="text" 
                    value={checkOutDate} 
                    onChange={(e) => setCheckOutDate(e.target.value)} 
                    placeholder="VD: 22/04"
                    className="w-full neo-input"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-sm font-bold text-[var(--color-text)] opacity-80">Tiền phòng ({selectedBookingData.days} đêm)</span>
                <span className="font-bold text-[var(--color-text)]">{new Intl.NumberFormat('vi-VN').format(selectedBookingData.roomTotal)} VNĐ</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-[var(--color-text)] opacity-80">Các dịch vụ phát sinh:</p>
                  <button type="button" onClick={addCustomService} className="text-xs font-bold text-[var(--color-primary)] hover:opacity-80 neo-surface-sm px-3 py-1.5 rounded-lg transition-all active:scale-95">
                    + Thêm dịch vụ
                  </button>
                </div>

                {customServices.length === 0 ? (
                  <p className="text-xs italic text-[var(--color-text)] opacity-50 text-center py-2">Khách không sử dụng dịch vụ nào.</p>
                ) : (
                  customServices.map((srv) => (
                    <div key={srv.id} className="flex justify-between items-center gap-2 neo-input px-3 py-2">
                      <input 
                        type="text" 
                        placeholder="Tên dịch vụ..." 
                        value={srv.name}
                        onChange={(e) => updateCustomService(srv.id, 'name', e.target.value)}
                        className="flex-1 bg-transparent border-none text-[var(--color-text)] font-medium outline-none text-sm"
                      />
                      <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                        <input 
                          type="number" 
                          placeholder="Giá" 
                          value={srv.price}
                          onChange={(e) => updateCustomService(srv.id, 'price', e.target.value)}
                          className="w-24 bg-transparent border-none text-right text-[var(--color-text)] font-bold outline-none text-sm"
                        />
                        <span className="text-xs font-bold text-[var(--color-text)] opacity-50">VNĐ</span>
                        <button type="button" onClick={() => removeCustomService(srv.id)} className="p-1.5 text-[var(--color-danger)] hover:bg-white/10 rounded-lg transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/20">
                <span className="text-base font-black text-[var(--color-text)] uppercase">Tổng cộng</span>
                <span className="text-xl font-black text-[var(--color-primary)]">{new Intl.NumberFormat('vi-VN').format(selectedBookingData.totalAmount)} VNĐ</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Trạng thái thanh toán</label>
              <Select 
                value={currentInvoice.status} 
                onChange={(val) => setCurrentInvoice({...currentInvoice, status: val})} 
                className="w-full neo-input py-2.5 px-4"
                options={[
                  { value: "Chưa thanh toán", label: "Chưa thanh toán" },
                  { value: "Đã thanh toán", label: "Đã thanh toán" }
                ]}
              />
            </div>
            <div>
               <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Ngày lập</label>
               <input type="text" readOnly value={currentInvoice.date} className="w-full neo-input opacity-50 cursor-not-allowed" />
            </div>
          </div>
          <div className="pt-6 border-t border-white/20 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[var(--color-text)] font-bold hover:neo-pressed rounded-xl transition-all active:scale-95">Hủy</button>
            <button type="submit" className="px-6 py-2 neo-button-primary active:scale-95 transition-transform flex items-center gap-2">
              <Receipt size={16}/> Lưu Hóa Đơn
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

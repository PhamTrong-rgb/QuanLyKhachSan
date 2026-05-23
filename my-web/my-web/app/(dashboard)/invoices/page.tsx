"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, FileText, CheckCircle, Clock, Trash2, Edit, Printer, Receipt, X } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

export default function InvoicesPage() {
  const { invoices, addInvoice, updateInvoice, deleteInvoice, bookings, updateBooking, rooms } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [hotelName, setHotelName] = useState("GRAND LUXE HOTEL");

  useEffect(() => {
    const savedName = localStorage.getItem("hotelName");
    if (savedName) setHotelName(savedName.toUpperCase());

    const handleDataUpdate = () => {
      const updatedName = localStorage.getItem("hotelName");
      setHotelName(updatedName ? updatedName.toUpperCase() : "GRAND LUXE HOTEL");
    };
    window.addEventListener("hotelDataUpdated", handleDataUpdate);
    return () => window.removeEventListener("hotelDataUpdated", handleDataUpdate);
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
    
    // Tìm booking của khách hàng này
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

    // Lấy lại các dịch vụ từ details (bỏ qua Tiền phòng)
    const srvs = (inv.details || []).filter((d: any) => !d.name.startsWith("Tiền phòng")).map((d: any, idx: number) => ({
      id: Date.now().toString() + idx,
      name: d.name.replace("Dịch vụ: ", ""),
      price: d.price
    }));
    setCustomServices(srvs);

    setIsModalOpen(true);
  };

  // Cập nhật ngày tháng khi chọn khách hàng
  useEffect(() => {
    if (selectedBookingId && !isEdit) {
      const b = bookings.find(x => x.id === selectedBookingId);
      if (b) {
        setCheckInDate(b.checkIn);
        setCheckOutDate(b.checkOut);
      }
    }
  }, [selectedBookingId, isEdit, bookings]);

  // Tính toán dữ liệu hóa đơn
  const selectedBookingData = useMemo(() => {
    if (!selectedBookingId) return null;
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (!booking) return null;

    const room = rooms.find(r => r.id === booking.room);
    const roomPrice = room ? parseInt(room.price.replace(/,/g, '')) : 0;
    
    // Tính số ngày
    let days = 1;
    if (checkInDate && checkOutDate) {
      const inDay = parseInt(checkInDate.split('/')[0]) || 0;
      const outDay = parseInt(checkOutDate.split('/')[0]) || 0;
      if (outDay > inDay) days = outDay - inDay;
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

    // 1. Tạo details mảng
    const details = [
      { name: `Tiền phòng ${selectedBookingData.room?.id} (${selectedBookingData.days} đêm)`, price: selectedBookingData.roomTotal }
    ];
    
    customServices.forEach(srv => {
      if (srv.name.trim() !== "") {
        details.push({ name: `Dịch vụ: ${srv.name}`, price: Number(srv.price) || 0 });
      }
    });

    const newAmountStr = new Intl.NumberFormat('vi-VN').format(selectedBookingData.totalAmount);

    // 2. Cập nhật ngày tháng trong Booking luôn
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
      <div className="flex justify-between items-center bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileText size={24} className="text-slate-700"/> Quản lý Hóa đơn
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Tính toán và xuất hóa đơn dựa trên phòng & dịch vụ.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 focus-within:border-slate-500 transition-all">
            <Search className="text-slate-400 mr-2" size={16} />
            <input type="text" placeholder="Tìm mã/Tên khách..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none font-medium text-sm text-slate-800 w-48" />
          </div>
          <button onClick={openAdd} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-[1.2rem] text-sm font-medium flex items-center gap-2 cursor-pointer shadow-md">
            <Plus size={18} /> Lập Hóa đơn mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr className="text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold border-r border-slate-200">Mã Hóa Đơn</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200">Khách hàng / Phòng</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200">Ngày lập</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200 text-right">Tổng tiền</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200 text-center">Trạng thái</th>
              <th className="px-4 py-4 font-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-10 font-medium text-slate-500">Không có hóa đơn nào.</td></tr>
            ) : filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900 tracking-wider">
                  <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg w-max border border-slate-200 text-sm">
                    {inv.id}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-800 font-bold text-sm">{inv.guest}</p>
                  {inv.roomId && <p className="text-slate-500 font-medium text-xs mt-1">Phòng: {inv.roomId}</p>}
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium text-sm">{inv.date}</td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-slate-900 text-lg">{inv.amount}</span> <span className="text-xs text-slate-500 font-bold">VNĐ</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase w-max mx-auto flex items-center justify-center gap-1.5 border ${
                    inv.status === "Đã thanh toán" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}>
                    {inv.status === "Đã thanh toán" ? <CheckCircle size={12}/> : <Clock size={12}/>} {inv.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setInvoiceToPrint(inv)} title="Xuất hóa đơn" className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer">
                      <Printer size={16} />
                    </button>
                    <button onClick={() => openEdit(inv)} title="Chỉnh sửa" className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(inv.id)} title="Xóa" className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Xuất Hóa Đơn */}
      <Modal isOpen={!!invoiceToPrint} onClose={() => setInvoiceToPrint(null)} title="Phiếu Thu (Invoice)">
        {invoiceToPrint && (
          <div className="p-4 space-y-6">
            <div className="text-center border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase">{hotelName}</h2>
              <p className="text-slate-500 text-sm mt-1">123 Phố Nghỉ Dưỡng, Biển Xanh</p>
              <p className="text-slate-500 text-sm">Điện thoại: 0123.456.789</p>
            </div>
            <div className="flex justify-between items-start text-sm">
              <div>
                <p><span className="font-bold text-slate-700">Khách hàng:</span> {invoiceToPrint.guest}</p>
                <p className="mt-1"><span className="font-bold text-slate-700">Phòng:</span> {invoiceToPrint.roomId || "N/A"}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold text-slate-700">Mã hóa đơn:</span> {invoiceToPrint.id}</p>
                <p className="mt-1"><span className="font-bold text-slate-700">Ngày lập:</span> {invoiceToPrint.date}</p>
              </div>
            </div>
            
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">Nội dung</th>
                  <th className="py-2 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceToPrint.details && invoiceToPrint.details.length > 0 ? invoiceToPrint.details.map((dt: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 text-slate-800">{dt.name}</td>
                    <td className="py-3 px-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(dt.price)} đ</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="py-3 px-3 text-slate-800">Tổng chi phí (Gộp)</td>
                    <td className="py-3 px-3 text-right font-medium">{invoiceToPrint.amount} đ</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 uppercase">Tổng cộng:</span>
              <span className="text-xl font-black text-slate-900">{invoiceToPrint.amount} VNĐ</span>
            </div>
            
            <div className="pt-4 text-center">
              <p className="italic text-slate-500 text-xs">Cảm ơn quý khách đã sử dụng dịch vụ của {hotelName}!</p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => setInvoiceToPrint(null)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Đóng</button>
                <button onClick={() => { alert("Đang kết nối với máy in..."); setInvoiceToPrint(null); }} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-200">
                  <Printer size={18}/> In Hóa Đơn
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Thêm/Sửa Hóa Đơn */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? `Cập nhật hóa đơn: ${currentInvoice.id}` : "Lập Hóa Đơn Cho Khách"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Khách hàng lưu trú</label>
            <Select 
              disabled={isEdit}
              value={selectedBookingId} 
              onChange={(val) => {
                setSelectedBookingId(val);
                setCustomServices([]); 
              }} 
              className={`w-full bg-slate-50 border border-slate-300 rounded-[1.2rem] px-4 py-3 text-sm font-medium outline-none transition-all ${isEdit ? "" : "focus-within:border-slate-500 focus-within:bg-white"}`}
              placeholder="-- Chọn Đơn đặt phòng --"
              options={activeBookings.map(b => ({
                value: b.id,
                label: `${b.guest} (Phòng ${b.room} - Mã: ${b.id})`
              }))}
            />
          </div>

          {selectedBookingData && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
              
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ngày Check-in</label>
                  <input 
                    type="text" 
                    value={checkInDate} 
                    onChange={(e) => setCheckInDate(e.target.value)} 
                    placeholder="VD: 20/04"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ngày Check-out</label>
                  <input 
                    type="text" 
                    value={checkOutDate} 
                    onChange={(e) => setCheckOutDate(e.target.value)} 
                    placeholder="VD: 22/04"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-600">Tiền phòng ({selectedBookingData.days} đêm)</span>
                <span className="font-bold text-slate-900">{new Intl.NumberFormat('vi-VN').format(selectedBookingData.roomTotal)} VNĐ</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-800">Các dịch vụ phát sinh:</p>
                  <button type="button" onClick={addCustomService} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg transition-colors">
                    + Thêm dịch vụ
                  </button>
                </div>

                {customServices.length === 0 ? (
                  <p className="text-xs italic text-slate-500 text-center py-2">Khách không sử dụng dịch vụ nào.</p>
                ) : (
                  customServices.map((srv) => (
                    <div key={srv.id} className="flex justify-between items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                      <input 
                        type="text" 
                        placeholder="Tên dịch vụ..." 
                        value={srv.name}
                        onChange={(e) => updateCustomService(srv.id, 'name', e.target.value)}
                        className="flex-1 border-none bg-transparent px-2 py-1.5 text-sm font-medium outline-none"
                      />
                      <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
                        <input 
                          type="number" 
                          placeholder="Giá tiền" 
                          value={srv.price}
                          onChange={(e) => updateCustomService(srv.id, 'price', e.target.value)}
                          className="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-right font-medium outline-none focus:border-slate-500"
                        />
                        <span className="text-xs font-bold text-slate-400">VNĐ</span>
                        <button type="button" onClick={() => removeCustomService(srv.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-base font-black text-slate-900 uppercase">Tổng cộng</span>
                <span className="text-xl font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(selectedBookingData.totalAmount)} VNĐ</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Trạng thái thanh toán</label>
              <Select 
                value={currentInvoice.status} 
                onChange={(val) => setCurrentInvoice({...currentInvoice, status: val})} 
                className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none"
                options={[
                  { value: "Chưa thanh toán", label: "Chưa thanh toán" },
                  { value: "Đã thanh toán", label: "Đã thanh toán" }
                ]}
              />
            </div>
            <div>
               <label className="block text-sm font-bold text-slate-800 mb-1">Ngày lập</label>
               <input type="text" readOnly value={currentInvoice.date} className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] px-3 py-2 text-sm font-medium text-slate-400 outline-none cursor-not-allowed" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-[1.2rem] text-sm font-bold hover:bg-slate-200 cursor-pointer transition-colors">Hủy</button>
            <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 text-sm font-bold rounded-[1.2rem] hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-2 shadow-md">
              <Receipt size={16}/> Lưu Hóa Đơn
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Search, Edit, Trash2, CalendarHeart, Plus } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";
import { pushUserNotification } from "@/lib/hotel-storage";
import type { AdminNotification } from "@/lib/hotel-storage";

export default function BookingsPage() {
  const { bookings, addBooking, updateBooking, deleteBooking, guests } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [currentBooking, setCurrentBooking] = useState({ id: "", guest: "", phone: "", room: "101", checkIn: "", checkOut: "", status: "Chờ thanh toán", description: "" });

  const filteredBookings = bookings.filter(b => 
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.guest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditModal = (booking: any) => {
    setCurrentBooking(booking);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const openReviewModal = (booking: any) => {
    setCurrentBooking(booking);
    setReviewNote(booking.adminNote || "");
    setIsReviewModalOpen(true);
  };

  const handleReview = (action: "Đã xác nhận" | "Từ chối") => {
    const updatedBooking = { ...currentBooking, status: action, adminNote: reviewNote };
    updateBooking(updatedBooking);
    
    if (typeof window !== "undefined") {
      const notif: AdminNotification = {
        id: Date.now(),
        type: action === "Đã xác nhận" ? "booking" : "alert",
        title: `Đơn đặt phòng ${action}`,
        message: `Quản lý đã ${action.toLowerCase()} đơn đặt phòng ${currentBooking.id}.` + (reviewNote ? ` Ghi chú: ${reviewNote}` : ""),
        time: "Vừa xong",
        link: "/hotel",
      };
      pushUserNotification(notif);
      window.dispatchEvent(new CustomEvent("newUserNotification", { detail: notif }));
    }

    setIsReviewModalOpen(false);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentBooking({ id: `BK-${String(bookings.length + 1).padStart(3, '0')}`, guest: "", phone: "", room: "101", checkIn: "", checkOut: "", status: "Chờ thanh toán", description: "" });
    setIsModalOpen(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateBooking(currentBooking);
    } else {
      addBooking(currentBooking);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn đặt phòng mã ${id}?`)) {
      deleteBooking(id);
    }
  };

  const guestOptions = guests.map(g => ({ value: g.fullName, label: `${g.fullName} - SĐT: ${g.phonenumber}` }));
  if (currentBooking.guest && !guests.find(g => g.fullName === currentBooking.guest)) {
    guestOptions.push({ value: currentBooking.guest, label: `${currentBooking.guest} (Khách ngoài hệ thống)` });
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            <CalendarHeart size={28} className="text-[var(--color-primary)]" />
            Quản lý Đặt phòng
          </h1>
          <p className="text-sm font-medium text-[var(--color-text)] opacity-70 mt-1">Quản lý và theo dõi các đơn đặt phòng của khách.</p>
        </div>
        <button onClick={handleOpenAdd} className="neo-button-primary px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Plus size={18} /> Đặt phòng
        </button>
      </div>

      <div className="neo-surface rounded-2xl">
        <div className="p-5 border-b border-white/20">
          <div className="relative max-w-md w-full neo-input flex items-center px-4 py-2">
            <Search className="text-[var(--color-text)] opacity-50 mr-2" size={18} />
            <input type="text" placeholder="Tìm mã đơn hoặc Tên khách..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-[var(--color-text)] font-medium placeholder:opacity-50" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[var(--color-text)] opacity-70 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 px-6">Mã Đặt Phòng</th>
                <th className="p-4 text-center">Mã Phòng</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4 w-1/4">Ghi chú</th>
                <th className="p-4 text-center">Tình Trạng</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-sm">
               {filteredBookings.length === 0 ? (
                 <tr><td colSpan={6} className="p-6 text-center text-[var(--color-text)] opacity-50 font-bold">Không có đơn đặt phòng nào.</td></tr>
               ) : filteredBookings.map((b) => (
                <tr key={b.id} className="hover:neo-pressed transition-all">
                  <td className="p-4 px-6">
                    <p className="font-bold text-[var(--color-text)]">{b.id}</p>
                    <p className="font-bold text-[var(--color-text)] opacity-80 mt-1 text-sm">{b.guest}</p>
                    <p className="text-[10px] font-bold text-[var(--color-text)] opacity-60 mt-1 flex items-center gap-1.5"><span className="opacity-70 text-xs">📞</span> {b.phone}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-[var(--color-text)] opacity-90 px-3 py-1.5 neo-surface-sm rounded-xl text-sm inline-block min-w-[70px]">
                      {b.room}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2 text-xs font-bold text-[var(--color-text)] opacity-80">
                      <p className="flex gap-2 items-center"><span className="text-[10px] opacity-60 w-16">CHECK-IN</span> {b.checkIn}</p>
                      <p className="flex gap-2 items-center"><span className="text-[10px] opacity-60 w-16">CHECK-OUT</span> {b.checkOut}</p>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <p className="text-xs font-bold text-[var(--color-text)] opacity-60 leading-relaxed border-l-2 border-white/20 pl-3 italic">
                      &quot;{b.description || 'Không có ghi chú.'}&quot;
                    </p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold neo-pressed ${
                      b.status === "Đã xác nhận" || b.status === "Đã thanh toán" ? "text-[var(--color-success)]" :
                      b.status === "Từ chối" ? "text-[var(--color-danger)]" :
                      "text-[var(--color-text)] opacity-60"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-center align-middle">
                    <div className="flex flex-col gap-2 items-center">
                      {b.status === "Chờ quản lý xác nhận" && (
                        <button onClick={() => openReviewModal(b)} className="text-xs font-bold text-[var(--color-primary)] hover:text-white px-3 py-1.5 rounded-xl neo-surface-sm hover:bg-[var(--color-primary)] transition-all flex justify-center items-center gap-1.5 cursor-pointer active:scale-95">
                          <CalendarHeart size={14} /> Duyệt đơn
                        </button>
                      )}
                      <button onClick={() => openEditModal(b)} className="text-xs font-bold text-[var(--color-text)] opacity-70 hover:opacity-100 hover:text-[var(--color-primary)] px-3 py-1.5 rounded-xl neo-surface-sm hover:neo-pressed transition-all flex justify-center items-center gap-1.5 cursor-pointer active:scale-95">
                        <Edit size={14} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="text-xs font-bold text-[var(--color-danger)] opacity-80 hover:opacity-100 px-3 py-1.5 rounded-xl neo-surface-sm hover:neo-pressed transition-all flex justify-center items-center gap-1.5 cursor-pointer active:scale-95">
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? `Cập nhật Đặt phòng: ${currentBooking.id}` : "Tạo Đơn Đặt Phòng Mới"}>
        <form onSubmit={handleSubmitBooking} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Tên khách hàng</label>
              <Select 
                value={currentBooking.guest} 
                onChange={(val) => {
                  const selectedGuest = guests.find(g => g.fullName === val);
                  setCurrentBooking({
                    ...currentBooking, 
                    guest: val,
                    phone: selectedGuest ? selectedGuest.phonenumber : currentBooking.phone
                  });
                }} 
                className="w-full neo-input py-2.5 px-4"
                options={guestOptions}
                placeholder="-- Chọn khách --"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Số điện thoại</label>
              <input required type="tel" value={currentBooking.phone} onChange={(e) => setCurrentBooking({...currentBooking, phone: e.target.value})} className="w-full neo-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Mã phòng</label>
              <input required type="text" value={currentBooking.room} onChange={(e) => setCurrentBooking({...currentBooking, room: e.target.value})} className="w-full neo-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Trạng thái</label>
              <Select 
                value={currentBooking.status} 
                onChange={(val) => setCurrentBooking({...currentBooking, status: val})} 
                className="w-full neo-input py-2.5 px-4"
                options={[
                  { value: "Chờ quản lý xác nhận", label: "Chờ xác nhận" },
                  { value: "Từ chối", label: "Từ chối" },
                  { value: "Chờ thanh toán", label: "Chờ thanh toán" },
                  { value: "Đã xác nhận", label: "Đã xác nhận" },
                  { value: "Đã Check-in", label: "Đã Check-in" },
                  { value: "Đã thanh toán", label: "Đã thanh toán" }
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Ngày Check-in</label>
              <input required type="text" placeholder="VD: 25/04" value={currentBooking.checkIn} onChange={(e) => setCurrentBooking({...currentBooking, checkIn: e.target.value})} className="w-full neo-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Ngày Check-out</label>
              <input required type="text" placeholder="VD: 28/04" value={currentBooking.checkOut} onChange={(e) => setCurrentBooking({...currentBooking, checkOut: e.target.value})} className="w-full neo-input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Ghi chú</label>
            <textarea rows={2} value={currentBooking.description} onChange={(e) => setCurrentBooking({...currentBooking, description: e.target.value})} className="w-full neo-input resize-none"></textarea>
          </div>
          <div className="pt-6 border-t border-white/20 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[var(--color-text)] font-bold hover:neo-pressed rounded-xl transition-all active:scale-95">Hủy</button>
            <button type="submit" className="px-6 py-2 neo-button-primary active:scale-95 transition-transform flex items-center gap-2">
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Duyệt đơn: ${currentBooking.id}`}>
        <div className="space-y-5">
          <div className="neo-surface-sm p-4 rounded-xl text-sm text-[var(--color-text)] font-bold opacity-80">
            <p><strong className="opacity-100">Khách hàng:</strong> {currentBooking.guest}</p>
            <p className="mt-2"><strong className="opacity-100">Phòng:</strong> {currentBooking.room}</p>
            <p className="mt-2"><strong className="opacity-100">Lịch trình:</strong> {currentBooking.checkIn} đến {currentBooking.checkOut}</p>
            {currentBooking.description && (
              <p className="mt-3 opacity-60 italic">&quot;{currentBooking.description}&quot;</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Ghi chú của quản lý (Gửi cho khách)</label>
            <textarea 
              rows={3} 
              value={reviewNote} 
              onChange={(e) => setReviewNote(e.target.value)} 
              placeholder="Lý do từ chối hoặc ghi chú thêm (không bắt buộc)"
              className="w-full neo-input resize-none"
            ></textarea>
          </div>
          <div className="pt-6 border-t border-white/20 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-5 py-2 text-[var(--color-text)] font-bold hover:neo-pressed rounded-xl transition-all active:scale-95">Hủy</button>
            <button type="button" onClick={() => handleReview("Từ chối")} className="px-5 py-2 text-[var(--color-danger)] font-bold hover:neo-pressed rounded-xl transition-all active:scale-95">
              Từ chối
            </button>
            <button type="button" onClick={() => handleReview("Đã xác nhận")} className="px-6 py-2 neo-button-primary active:scale-95 transition-transform flex items-center gap-2">
              Xác nhận Booking
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

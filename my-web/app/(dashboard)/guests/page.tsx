"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users, FileText } from "lucide-react";
import Modal from "@/components/ui/modal";
import { useHotel } from "@/app/contexts/HotelContext";

export default function GuestsPage() {
  const { guests, bookings, addGuest, updateGuest, deleteGuest } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentGuest, setCurrentGuest] = useState({ id: "", fullName: "", phonenumber: "", email: "", idCard: "" });

  const filteredGuests = guests.filter(g => {
    if (!g) return false;
    return g.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           g.phonenumber?.includes(searchQuery) ||
           g.idCard?.includes(searchQuery);
  });

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentGuest({ id: "", fullName: "", phonenumber: "", email: "", idCard: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guest: any) => {
    setIsEdit(true);
    setCurrentGuest({ ...guest, idCard: guest.idCard || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateGuest(currentGuest);
    } else {
      addGuest(currentGuest);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Bạn có chắc muốn xóa khách hàng mã ${id}? Hành động này không thể hoàn tác.`)) {
      deleteGuest(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            <Users size={28} className="text-[var(--color-primary)]" />
            Danh Sách Khách Hàng
          </h1>
          <p className="text-sm font-medium text-[var(--color-text)] opacity-70 mt-1">Quản lý danh sách khách hàng và thông tin liên lạc.</p>
        </div>
        <button onClick={handleOpenAdd} className="neo-button-primary px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Plus size={18} /> Thêm Khách hàng
        </button>
      </div>

      <div className="neo-surface rounded-2xl">
        <div className="p-5 border-b border-white/20">
          <div className="relative max-w-md w-full neo-input flex items-center px-4 py-2">
            <Search className="text-[var(--color-text)] opacity-50 mr-2" size={18} />
            <input type="text" placeholder="Tìm tên, SĐT hoặc CCCD..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-[var(--color-text)] font-medium placeholder:opacity-50" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[var(--color-text)] opacity-70 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 px-6">Khách Hàng</th>
                <th className="p-4">Liên lạc</th>
                <th className="p-4">CCCD / Passport</th>
                <th className="p-4 text-center">Phòng đang ở</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-sm">
              {filteredGuests.length === 0 ? (
                 <tr><td colSpan={5} className="p-6 text-center text-[var(--color-text)] opacity-50 font-bold">Không có khách hàng nào.</td></tr>
              ) : filteredGuests.map((g) => {
                const activeBooking = bookings.find(b => b.phone === g.phonenumber || b.guest === g.fullName);
                const currentRoom = activeBooking ? activeBooking.room : "Trống";

                return (
                <tr key={g.id} className="hover:neo-pressed transition-all">
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full neo-surface-sm text-[var(--color-primary)] flex items-center justify-center font-bold text-lg shrink-0">
                        {g.fullName ? g.fullName.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-text)]">{g.fullName}</p>
                        <p className="text-xs text-[var(--color-text)] opacity-50 font-bold mt-0.5">{g.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--color-text)] font-bold">
                    <p className="flex items-center gap-1.5"><span className="opacity-70 text-xs">📞</span> {g.phonenumber}</p>
                    <p className="text-xs opacity-70 mt-1 flex items-center gap-1.5"><span className="opacity-70 text-xs">📧</span> {g.email || "Không có"}</p>
                  </td>
                  <td className="p-4 text-[var(--color-text)] font-bold opacity-80 flex items-center gap-2 mt-3">
                    <FileText size={14} className="opacity-50" /> {g.idCard || "Chưa cập nhật"}
                  </td>

                  <td className="p-4 text-center">
                    {currentRoom === "Trống" ? (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold neo-pressed text-[var(--color-text)] opacity-50">
                        Chưa đặt phòng
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold neo-pressed text-[var(--color-success)]">
                        Phòng {currentRoom}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center align-middle">
                    <div className="flex flex-col gap-2 items-center">
                      <button onClick={() => handleOpenEdit(g)} className="text-xs font-bold text-[var(--color-text)] opacity-70 hover:opacity-100 hover:text-[var(--color-primary)] px-3 py-1.5 rounded-xl neo-surface-sm hover:neo-pressed transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                        <Edit size={14} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(g.id)} className="text-xs font-bold text-[var(--color-danger)] opacity-80 hover:opacity-100 px-3 py-1.5 rounded-xl neo-surface-sm hover:neo-pressed transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Cập nhật Khách hàng" : "Thêm Khách hàng"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Tên Khách hàng</label>
              <input required type="text" value={currentGuest.fullName} onChange={(e) => setCurrentGuest({...currentGuest, fullName: e.target.value})} className="w-full neo-input" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Số điện thoại</label>
              <input required type="tel" value={currentGuest.phonenumber} onChange={(e) => setCurrentGuest({...currentGuest, phonenumber: e.target.value})} className="w-full neo-input" placeholder="09xxxx" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Email</label>
              <input type="email" value={currentGuest.email} onChange={(e) => setCurrentGuest({...currentGuest, email: e.target.value})} className="w-full neo-input" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">CCCD / Passport</label>
              <input type="text" value={currentGuest.idCard || ""} onChange={(e) => setCurrentGuest({...currentGuest, idCard: e.target.value})} className="w-full neo-input" placeholder="Số giấy tờ tùy thân" />
            </div>
          </div>
          <div className="pt-6 border-t border-white/20 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[var(--color-text)] font-bold hover:neo-pressed rounded-xl transition-all active:scale-95">Hủy</button>
            <button type="submit" className="px-6 py-2 neo-button-primary active:scale-95 transition-transform flex items-center gap-2">
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

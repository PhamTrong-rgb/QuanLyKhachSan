"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
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
           g.phonenumber?.includes(searchQuery);
  });

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentGuest({ id: "", fullName: "", phonenumber: "", email: "", idCard: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guest: any) => {
    setIsEdit(true);
    setCurrentGuest(guest);
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
      <div className="flex justify-between items-center bg-white p-6 rounded-[1.5rem]  border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users size={24} className="text-slate-700"/> Danh Sách Khách Hàng
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Quản lý danh sách khách hàng và thông tin liên lạc.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2  focus-within:border-slate-500 transition-all">
            <Search className="text-slate-400 mr-2" size={16} />
            <input type="text" placeholder="Gõ tên hoặc SĐT..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none font-medium w-48 text-sm text-slate-800" />
          </div>
          <button onClick={handleOpenAdd} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-[1.2rem] text-sm font-medium flex items-center gap-2 cursor-pointer">
            <Plus size={18} /> Thêm Khách hàng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200  overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr className="text-xs uppercase">
              <th className="px-6 py-4 font-bold border-r border-slate-200">ID / Khách Hàng</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200">Thông tin liên lạc</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200 text-center">CCCD / CMND</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200 text-center">Phòng đang ở</th>
              <th className="px-4 py-4 font-bold text-center">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredGuests.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-10 font-medium text-slate-500">Không có khách hàng nào.</td></tr>
            ) : filteredGuests.map((g) => {
              // Tìm phòng đang ở từ danh sách Bookings
              const activeBooking = bookings.find(b => b.phone === g.phonenumber || b.guest === g.fullName);
              const currentRoom = activeBooking ? activeBooking.room : "Trống";

              return (
              <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-md border border-slate-200">
                      {g.fullName ? g.fullName.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{g.fullName}</p>
                      <p className="font-medium text-slate-500 text-xs mt-0.5 tracking-wider">{g.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-800 font-medium text-sm flex items-center gap-2">📞 {g.phonenumber}</p>
                  <p className="text-slate-500 font-normal text-xs mt-1">📧 {g.email}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm ">{g.idCard || "Chưa cập nhật"}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  {currentRoom === "Trống" ? (
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase block w-max mx-auto border bg-white text-slate-500 border-slate-300">
                      Chưa đặt phòng
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase block w-max mx-auto border bg-slate-900 text-white border-slate-900">
                      Phòng {currentRoom}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleOpenEdit(g)} className="w-full py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <Edit size={14} /> Chỉnh sửa
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="w-full py-1.5 px-3 text-xs font-medium text-red-600 hover:text-red-700 bg-white border border-slate-200 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Cập nhật Khách hàng" : "Thêm Khách hàng"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Tên Khách hàng</label>
            <input required type="text" value={currentGuest.fullName} onChange={(e) => setCurrentGuest({...currentGuest, fullName: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Số điện thoại</label>
              <input required type="tel" value={currentGuest.phonenumber} onChange={(e) => setCurrentGuest({...currentGuest, phonenumber: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">CCCD / CMND</label>
              <input type="text" value={currentGuest.idCard} onChange={(e) => setCurrentGuest({...currentGuest, idCard: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Email</label>
            <input type="email" value={currentGuest.email} onChange={(e) => setCurrentGuest({...currentGuest, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-[1.2rem] text-sm font-medium hover:bg-slate-200 cursor-pointer">Hủy</button>
            <button type="submit" className="bg-slate-900 text-white px-5 py-2 text-sm font-medium rounded-[1.2rem] hover:bg-slate-800 cursor-pointer">
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

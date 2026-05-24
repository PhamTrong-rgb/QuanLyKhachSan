"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, BedDouble, Filter, Loader2, Image as ImageIcon } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";
import { formatVND } from '@/lib/format';

export default function RoomsPage() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useHotel();
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [currentRoom, setCurrentRoom] = useState({ id: "", type: "Tiêu chuẩn", status: "Sẵn sàng", price: "", maxGuests: 2, view: "" });

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.id.includes(searchQuery) || room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "Tất cả" || room.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    addRoom(currentRoom);
    setIsAddModalOpen(false);
    setCurrentRoom({ id: "", type: "Tiêu chuẩn", status: "Sẵn sàng", price: "", maxGuests: 2, view: "" });
  };

  const openEditModal = (room: any) => {
    setCurrentRoom(room);
    setIsEditModalOpen(true);
  };

  const handleEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoom(currentRoom);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn loại bỏ mã phòng ${id}?`)) {
      deleteRoom(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            <BedDouble size={28} className="text-[var(--color-primary)]" />
            Quản Lý Buồng Phòng
          </h1>
          <p className="text-sm font-medium text-[var(--color-text)] opacity-70 mt-1">Theo dõi, tìm kiếm và chỉnh sửa dữ liệu phòng.</p>
        </div>
        <button onClick={() => { setCurrentRoom({ id: "", type: "Tiêu chuẩn", status: "Sẵn sàng", price: "", maxGuests: 2, view: "" }); setIsAddModalOpen(true); }} className="neo-button-primary px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Plus size={18} /> Thêm Phòng
        </button>
      </div>

      <div className="neo-surface rounded-2xl">
        <div className="p-5 border-b border-white/20 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full neo-input flex items-center px-4 py-2">
            <Search className="text-[var(--color-text)] opacity-50 mr-2" size={18} />
            <input type="text" placeholder="Tìm theo mã/loại..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-[var(--color-text)] font-medium placeholder:opacity-50" />
          </div>
          <div className="relative">
             <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)] opacity-50 pointer-events-none z-10"/>
             <Select 
                value={filterStatus} 
                onChange={setFilterStatus} 
                className="w-48 pl-11 pr-4 py-3 neo-input font-bold"
                options={[
                  { value: "Tất cả", label: "Tất cả trạng thái" },
                  { value: "Sẵn sàng", label: "Chỉ Sẵn sàng" },
                  { value: "Đang phục vụ", label: "Chỉ Đang phục vụ" },
                  { value: "Đang dọn", label: "Chỉ Đang dọn" }
                ]}
             />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[var(--color-text)] opacity-70 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 px-6 w-1/4">Phòng</th>
                <th className="p-4 text-center">Số người</th>
                <th className="p-4">Hình ảnh / Hướng</th>
                <th className="p-4">Giá / Đêm</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-[var(--color-text)] opacity-50 font-bold">
                    <Loader2 className="animate-spin text-[var(--color-primary)] mx-auto mb-3" size={32} />
                    <p>Đang tải dữ liệu phòng...</p>
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-[var(--color-text)] opacity-50 font-bold">Không có kết quả phòng nào khớp với tìm kiếm.</td></tr>
              ) : filteredRooms.map((room) => (
                <tr key={room.id} className="hover:neo-pressed transition-all">
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 neo-surface-sm rounded-xl flex items-center justify-center font-bold text-[var(--color-primary)] text-lg">
                        {room.id}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-text)]">{room.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-[var(--color-text)] font-bold opacity-80">
                      {room.maxGuests} Người
                    </span>
                  </td>
                  <td className="p-4">
                    {room.view && room.view.startsWith("http") ? (
                       <div className="w-20 h-14 rounded-lg overflow-hidden neo-surface border border-white/10">
                         <img src={room.view} alt={`Phòng ${room.id}`} className="w-full h-full object-cover" />
                       </div>
                    ) : (
                      <span className="text-xs font-bold text-[var(--color-text)] opacity-60 flex items-center gap-1.5"><ImageIcon size={14}/> {room.view || "Chưa có"}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[var(--color-text)]">{formatVND(room.price)}đ</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold neo-pressed ${
                      room.status === "Sẵn sàng" ? "text-[var(--color-success)]" :
                      room.status === "Đang phục vụ" ? "text-[var(--color-warning)]" :
                      "text-[var(--color-text)] opacity-60"
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="p-4 text-center align-middle">
                    <div className="flex flex-col gap-2 items-center">
                      <button onClick={() => openEditModal(room)} className="text-xs font-bold text-[var(--color-text)] opacity-70 hover:opacity-100 hover:text-[var(--color-primary)] px-3 py-1.5 rounded-xl neo-surface-sm hover:neo-pressed transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                        <Edit size={14} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(room.id)} className="text-xs font-bold text-[var(--color-danger)] opacity-80 hover:opacity-100 px-3 py-1.5 rounded-xl neo-surface-sm hover:neo-pressed transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
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

      <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => {setIsAddModalOpen(false); setIsEditModalOpen(false)}} title={isEditModalOpen ? `Chỉnh sửa phòng: ${currentRoom.id}` : "Thêm phòng mới"}>
        <form onSubmit={isEditModalOpen ? handleEditRoom : handleAddRoom} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Mã phòng</label>
              <input required disabled={isEditModalOpen} type="text" value={currentRoom.id} onChange={(e) => setCurrentRoom({...currentRoom, id: e.target.value})} className="w-full neo-input disabled:opacity-50 disabled:cursor-not-allowed" placeholder="VD: 301" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Loại phòng</label>
              <Select 
                value={currentRoom.type} 
                onChange={(val) => setCurrentRoom({...currentRoom, type: val})} 
                className="w-full neo-input py-2.5 px-4"
                options={[
                  { value: "Tiêu chuẩn", label: "Tiêu chuẩn (Standard)" },
                  { value: "Cao cấp", label: "Cao cấp (Deluxe)" },
                  { value: "Thượng lưu", label: "Thượng lưu (Suite)" },
                  { value: "Tổng thống", label: "Tổng thống (President)" }
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Số người tối đa</label>
              <input required type="number" min="1" value={currentRoom.maxGuests} onChange={(e) => setCurrentRoom({...currentRoom, maxGuests: Number(e.target.value)})} className="w-full neo-input" placeholder="2" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Trạng thái</label>
              <Select 
                value={currentRoom.status} 
                onChange={(val) => setCurrentRoom({...currentRoom, status: val})} 
                className="w-full neo-input py-2.5 px-4"
                options={[
                  { value: "Sẵn sàng", label: "Sẵn sàng" },
                  { value: "Đang phục vụ", label: "Đang phục vụ" },
                  { value: "Đang dọn", label: "Đang dọn" }
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Hình ảnh / Hướng</label>
              <input required type="text" value={currentRoom.view} onChange={(e) => setCurrentRoom({...currentRoom, view: e.target.value})} className="w-full neo-input" placeholder="URL hình ảnh hoặc Hướng nhìn" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Giá phòng (VNĐ)</label>
              <input required type="text" value={currentRoom.price} onChange={(e) => setCurrentRoom({...currentRoom, price: e.target.value})} className="w-full neo-input" placeholder="Giá tiền" />
            </div>
          </div>
          <div className="pt-6 border-t border-white/20 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => {setIsAddModalOpen(false); setIsEditModalOpen(false)}} className="px-5 py-2 text-[var(--color-text)] font-bold hover:neo-pressed rounded-xl transition-all active:scale-95">Hủy</button>
            <button type="submit" className="px-6 py-2 neo-button-primary active:scale-95 transition-transform flex items-center gap-2">
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, BedDouble, Filter, Loader2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import { apiService } from "@/services/api";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

export default function RoomsPage() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useHotel();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Optionally fetch from API, but we are using Context now. 
    // If you want to sync context with API, you would do it in HotelProvider.
    // For now, we skip local fetching to rely on global state.
  }, []);

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
      <div className="flex justify-between items-center bg-white p-6 rounded-[1.5rem]  border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BedDouble size={24} className="text-slate-700"/> Quản Lý Buồng Phòng
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-normal">Theo dõi, tìm kiếm và chỉnh sửa dữ liệu phòng.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2  focus-within:border-slate-500 transition-all">
            <Search className="text-slate-400 mr-2" size={16} />
            <input type="text" placeholder="Tìm theo mã/loại..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none font-medium w-40 text-sm text-slate-800" />
          </div>
          <div className="relative flex items-center bg-white border border-slate-300 rounded-[1.2rem] py-2 hover:border-slate-400 transition-all cursor-pointer">
             <Filter size={16} className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"/>
             <Select 
                value={filterStatus} 
                onChange={setFilterStatus} 
                className="w-48 pl-10 pr-4 text-sm font-medium text-slate-800"
                options={[
                  { value: "Tất cả", label: "Tất cả trạng thái" },
                  { value: "Sẵn sàng", label: "Chỉ Sẵn sàng" },
                  { value: "Đang phục vụ", label: "Chỉ Đang phục vụ" },
                  { value: "Đang dọn", label: "Chỉ Đang dọn" }
                ]}
             />
          </div>
          <button onClick={() => { setCurrentRoom({ id: "", type: "Tiêu chuẩn", status: "Sẵn sàng", price: "", maxGuests: 2, view: "" }); setIsAddModalOpen(true); }} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-[1.2rem] text-sm font-medium  transition-all flex items-center gap-2">
            <Plus size={18} /> Thêm Phòng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200  overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr className="text-xs uppercase">
              <th className="px-6 py-4 font-bold border-r border-slate-200 w-1/4">Phòng</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200 text-center">Số người</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200">Hướng nhìn</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200">Giá / Đêm</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200 text-center">Trạng Thái</th>
              <th className="px-4 py-4 font-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-slate-500 bg-slate-50">
                  <Loader2 className="animate-spin text-slate-400 mx-auto mb-3" size={32} />
                  <p className="font-medium">Đang tải dữ liệu phòng...</p>
                </td>
              </tr>
            ) : filteredRooms.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500 bg-slate-50 font-medium">Không có kết quả phòng nào khớp với tìm kiếm.</td></tr>
            ) : filteredRooms.map((room) => (
              <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-200  rounded-2xl flex items-center justify-center font-bold text-slate-900 text-lg">
                      {room.id}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{room.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-slate-700 text-sm font-medium">
                    {room.maxGuests} Người
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {room.view}
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-sm text-slate-900">{room.price}đ</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border block w-max mx-auto ${
                    room.status === "Sẵn sàng" ? "bg-white text-slate-700 border-slate-300" :
                    room.status === "Đang phục vụ" ? "bg-slate-900 text-white border-slate-900" :
                    "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEditModal(room)} className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <Edit size={14} /> Chỉnh sửa
                    </button>
                    <button onClick={() => handleDelete(room.id)} className="text-xs font-medium text-red-600 hover:text-red-700 bg-white border border-slate-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => {setIsAddModalOpen(false); setIsEditModalOpen(false)}} title={isEditModalOpen ? `Chỉnh sửa phòng: ${currentRoom.id}` : "Thêm phòng mới"}>
        <form onSubmit={isEditModalOpen ? handleEditRoom : handleAddRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Mã phòng</label>
              <input required disabled={isEditModalOpen} type="text" value={currentRoom.id} onChange={(e) => setCurrentRoom({...currentRoom, id: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500 disabled:opacity-50" placeholder="VD: 301" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Loại phòng</label>
              <Select 
                value={currentRoom.type} 
                onChange={(val) => setCurrentRoom({...currentRoom, type: val})} 
                className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none"
                options={[
                  { value: "Tiêu chuẩn", label: "Tiêu chuẩn (Standard)" },
                  { value: "Cao cấp", label: "Cao cấp (Deluxe)" },
                  { value: "Thượng lưu", label: "Thượng lưu (Suite)" },
                  { value: "Tổng thống", label: "Tổng thống (President)" }
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Số người tối đa</label>
              <input required type="number" min="1" value={currentRoom.maxGuests} onChange={(e) => setCurrentRoom({...currentRoom, maxGuests: Number(e.target.value)})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" placeholder="2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Trạng thái</label>
              <Select 
                value={currentRoom.status} 
                onChange={(val) => setCurrentRoom({...currentRoom, status: val})} 
                className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none"
                options={[
                  { value: "Sẵn sàng", label: "Sẵn sàng" },
                  { value: "Đang phục vụ", label: "Đang phục vụ" },
                  { value: "Đang dọn", label: "Đang dọn" }
                ]}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Hướng nhìn</label>
            <input required type="text" value={currentRoom.view} onChange={(e) => setCurrentRoom({...currentRoom, view: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Giá phòng (VNĐ)</label>
            <input required type="text" value={currentRoom.price} onChange={(e) => setCurrentRoom({...currentRoom, price: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={() => {setIsAddModalOpen(false); setIsEditModalOpen(false)}} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-[1.2rem] transition-colors cursor-pointer">Hủy</button>
            <button type="submit" className="bg-slate-900 text-white px-5 py-2 text-sm font-medium rounded-[1.2rem]  hover:bg-slate-800 transition-colors cursor-pointer">
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

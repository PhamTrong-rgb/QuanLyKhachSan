"use client";

import { useState } from "react";
import { Search, Edit, Trash2, CalendarHeart, Plus } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

export default function BookingsPage() {
  const { bookings, addBooking, updateBooking, deleteBooking, guests } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentBooking, setCurrentBooking] = useState({ id: "", guest: "", phone: "", room: "101", checkIn: "", checkOut: "", status: "Chờ thanh toán", description: "" });

  const filteredBookings = bookings.filter(b => 
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.guest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditModal = (booking: any) => {
    setCurrentBooking(booking);
    setIsEdit(true);
    setIsModalOpen(true);
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

  // Tạo danh sách options cho Select Khách hàng
  // Nếu booking hiện tại có khách không nằm trong danh sách guests, vẫn hiển thị nó để không bị mất data cũ
  const guestOptions = guests.map(g => ({ value: g.fullName, label: `${g.fullName} - SĐT: ${g.phonenumber}` }));
  if (currentBooking.guest && !guests.find(g => g.fullName === currentBooking.guest)) {
    guestOptions.push({ value: currentBooking.guest, label: `${currentBooking.guest} (Khách ngoài hệ thống)` });
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[1.5rem]  border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <CalendarHeart size={24} className="text-slate-700"/> Quản lý Đặt phòng
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-normal">Quản lý và theo dõi các đơn đặt phòng của khách.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2  focus-within:border-slate-500 transition-all">
            <Search className="text-slate-400 mr-2" size={16} />
            <input type="text" placeholder="Tìm mã đơn/Tên khách..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none font-medium w-48 text-sm text-slate-800" />
          </div>
          <button onClick={handleOpenAdd} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-[1.2rem] text-sm font-medium flex items-center gap-2 cursor-pointer">
            <Plus size={18} /> Đặt phòng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200  overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr className="text-xs uppercase">
              <th className="px-6 py-4 font-bold border-r border-slate-200">Mã Đặt Phòng</th>
              <th className="px-4 py-4 font-bold border-r border-slate-200 text-center">Mã Phòng</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200">Thời gian</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200 w-1/4">Ghi chú</th>
              <th className="px-4 py-4 font-bold border-r border-slate-200 text-center">Tình Trạng</th>
              <th className="px-4 py-4 font-bold text-center">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {filteredBookings.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-10 font-medium text-slate-500">Không có đơn đặt phòng nào.</td></tr>
             ) : filteredBookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 text-sm">{b.id}</p>
                  <p className="font-medium text-slate-700 mt-0.5 text-sm">{b.guest}</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 bg-slate-100 border border-slate-200 w-max px-2 py-0.5 rounded-lg">📞 {b.phone}</p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-slate-800 px-3 py-1 bg-white border border-slate-300 rounded-[1rem] text-sm  inline-block min-w-[70px]">
                    {b.room}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1.5 text-xs font-medium">
                    <p className="text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 flex gap-2 w-max rounded-lg items-center "><span className="text-[10px] font-bold text-slate-400">CHECK-IN</span> {b.checkIn}</p>
                    <p className="text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 flex gap-2 w-max rounded-lg items-center "><span className="text-[10px] font-bold text-slate-400">CHECK-OUT</span> {b.checkOut}</p>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <p className="text-xs font-normal text-slate-600 leading-relaxed border-l-2 border-slate-300 pl-3 italic">
                    &quot;{b.description || 'Không có ghi chú.'}&quot;
                  </p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-2 py-1.5 rounded-lg text-[10px]  font-bold uppercase block ${
                    b.status === "Đã xác nhận" || b.status === "Đã thanh toán" ? "bg-slate-900 text-white" :
                    "bg-white text-slate-700 border border-slate-300"
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEditModal(b)} className="w-full py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex justify-center items-center gap-1.5 cursor-pointer">
                      <Edit size={14} /> Chỉnh sửa
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="w-full py-1.5 px-3 text-xs font-medium text-red-600 hover:text-red-700 bg-white border border-slate-200 hover:bg-red-50 rounded-xl transition-colors flex justify-center items-center gap-1.5 cursor-pointer">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? `Cập nhật Đặt phòng: ${currentBooking.id}` : "Tạo Đơn Đặt Phòng Mới"}>
        <form onSubmit={handleSubmitBooking} className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-bold text-slate-800">Tên khách hàng</label>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">Vui lòng tạo ở mục Khách lưu trú trước</span>
            </div>
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
              className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus-within:border-slate-500"
              options={guestOptions}
              placeholder="-- Chọn khách hàng đã có --"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Số điện thoại</label>
              <input required type="tel" value={currentBooking.phone} onChange={(e) => setCurrentBooking({...currentBooking, phone: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Mã phòng</label>
              <input required type="text" value={currentBooking.room} onChange={(e) => setCurrentBooking({...currentBooking, room: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Ngày Check-in</label>
              <input required type="text" placeholder="VD: 25/04" value={currentBooking.checkIn} onChange={(e) => setCurrentBooking({...currentBooking, checkIn: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Ngày Check-out</label>
              <input required type="text" placeholder="VD: 28/04" value={currentBooking.checkOut} onChange={(e) => setCurrentBooking({...currentBooking, checkOut: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Trạng thái</label>
            <Select 
              value={currentBooking.status} 
              onChange={(val) => setCurrentBooking({...currentBooking, status: val})} 
              className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none"
              options={[
                { value: "Chờ thanh toán", label: "Chờ thanh toán" },
                { value: "Đã xác nhận", label: "Đã xác nhận" },
                { value: "Đã Check-in", label: "Đã Check-in" },
                { value: "Đã thanh toán", label: "Đã thanh toán" }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Ghi chú</label>
            <textarea rows={2} value={currentBooking.description} onChange={(e) => setCurrentBooking({...currentBooking, description: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500 resize-none"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
           <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-[1.2rem] transition-colors cursor-pointer">Hủy</button>
            <button type="submit" className="bg-slate-900 text-white px-5 py-2 text-sm font-medium rounded-[1.2rem] hover:bg-slate-800 transition-colors cursor-pointer">
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

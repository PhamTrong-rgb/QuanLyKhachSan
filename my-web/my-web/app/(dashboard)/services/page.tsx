"use client";

import { useState } from "react";
import { Search, ConciergeBell, Plus, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

export default function ServicesPage() {
  const { requests, addRequest, updateRequest, deleteRequest } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRequest, setCurrentRequest] = useState({ id: "", guest: "", room: "", type: "Dọn dẹp phòng", time: "", status: "Chờ xử lý" });

  const filteredRequests = requests.filter(r => 
     r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
     r.room.includes(searchQuery)
  );

  const openAdd = () => {
    setIsEdit(false);
    setCurrentRequest({ id: "", guest: "", room: "", type: "Dọn dẹp phòng", time: new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}), status: "Chờ xử lý" });
    setIsModalOpen(true);
  };

  const openEdit = (req: any) => {
    setIsEdit(true);
    setCurrentRequest(req);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateRequest(currentRequest);
    } else {
      addRequest({ ...currentRequest, id: `SRV-${Math.floor(100 + Math.random() * 900)}` });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Bạn có chắc muốn xóa dịch vụ số ${id}?`)) {
      deleteRequest(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Chờ xử lý": return <span className="px-3 py-1 bg-white text-slate-600 border border-slate-300 rounded-xl text-[10px] font-bold uppercase ">{status}</span>;
      case "Đang thực hiện": return <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-400 rounded-xl text-[10px] font-bold uppercase ">{status}</span>;
      case "Hoàn tất": return <span className="px-3 py-1 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase ">{status}</span>;
      default: return <span className="px-3 py-1 bg-white text-slate-400 border border-slate-200 rounded-xl text-[10px] font-bold uppercase ">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[1.5rem]  border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ConciergeBell size={24} className="text-slate-700"/> Quản lý Dịch vụ
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-normal">Quản lý các yêu cầu dịch vụ của khách hàng.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2  focus-within:border-slate-500 transition-all">
            <Search className="text-slate-400 mr-2" size={16} />
            <input type="text" placeholder="Tìm mã hoặc phòng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none font-medium text-sm text-slate-800 w-48" />
          </div>
          <button onClick={openAdd} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-[1.2rem] text-sm font-medium  flex items-center gap-2 cursor-pointer">
            <Plus size={18} /> Thêm Yêu cầu
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200  overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr className="text-xs uppercase">
              <th className="px-6 py-4 font-bold border-r border-slate-200">Mã Dịch Vụ</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200">Loại Yêu Cầu</th>
              <th className="px-4 py-4 font-bold border-r border-slate-200 text-center">Phòng</th>
              <th className="px-6 py-4 font-bold border-r border-slate-200 w-1/5 text-center">Thời gian</th>
              <th className="px-4 py-4 font-bold border-r border-slate-200 text-center">Trạng Thái</th>
              <th className="px-4 py-4 font-bold text-center">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-10 font-medium text-slate-500">Không có yêu cầu dịch vụ nào.</td></tr>
            ) : filteredRequests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 text-sm tracking-wider">{r.id}</p>
                  <p className="font-medium text-slate-500 text-xs mt-0.5">{r.guest}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-700 text-sm">{r.type}</p>
                </td>
                <td className="px-4 py-4 text-center">
                   <div className="inline-block bg-white text-slate-800 px-3 py-1 border border-slate-300 rounded-lg font-bold text-sm ">
                     {r.room}
                   </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-slate-600 text-xs font-medium bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 ">
                    {r.time}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  {getStatusBadge(r.status)}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEdit(r)} className="w-full py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl  transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <Edit size={14} /> Sửa
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="w-full py-1.5 px-3 text-xs font-medium text-red-600 hover:text-red-700 bg-white border border-slate-200 hover:bg-red-50 rounded-xl  transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? `Cập nhật dịch vụ` : "Thêm dịch vụ mới"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Tên Khách Hàng</label>
              <input required type="text" value={currentRequest.guest} onChange={(e) => setCurrentRequest({...currentRequest, guest: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Phòng</label>
              <input required type="text" value={currentRequest.room} onChange={(e) => setCurrentRequest({...currentRequest, room: e.target.value})} className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none focus:border-slate-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Loại Dịch Vụ</label>
            <Select 
              value={currentRequest.type} 
              onChange={(val) => setCurrentRequest({...currentRequest, type: val})} 
              className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none"
              options={[
                { value: "Dọn dẹp phòng", label: "Dọn dẹp phòng" },
                { value: "Gọi Đồ Ăn", label: "Gọi Đồ Ăn" },
                { value: "Massage thư giãn", label: "Massage thư giãn" },
                { value: "Yêu cầu khác", label: "Yêu cầu khác" }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Trạng Thái</label>
              <Select 
                value={currentRequest.status} 
                onChange={(val) => setCurrentRequest({...currentRequest, status: val})} 
                className="w-full bg-white border border-slate-300 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none"
                options={[
                  { value: "Chờ xử lý", label: "Chờ xử lý" },
                  { value: "Đang thực hiện", label: "Đang thực hiện" },
                  { value: "Hoàn tất", label: "Hoàn tất" }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Giờ yêu cầu</label>
              <input required type="text" value={currentRequest.time} onChange={(e) => setCurrentRequest({...currentRequest, time: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] px-3 py-2 text-sm font-medium outline-none" />
            </div>
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

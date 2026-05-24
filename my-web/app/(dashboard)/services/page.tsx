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
      case "Chờ xử lý": return <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase block bg-white text-[var(--color-text)] border border-slate-300 shadow-sm">{status}</span>;
      case "Đang thực hiện": return <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase block text-[var(--color-warning)] neo-pressed">{status}</span>;
      case "Hoàn tất": return <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase block text-[var(--color-success)] neo-pressed">{status}</span>;
      default: return <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase block text-[var(--color-text)] opacity-60 neo-pressed">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            <ConciergeBell size={28} className="text-[var(--color-primary)]" />
            Quản lý Dịch vụ
          </h1>
          <p className="text-sm font-medium text-[var(--color-text)] opacity-70 mt-1">Quản lý các yêu cầu dịch vụ của khách hàng.</p>
        </div>
        <button onClick={openAdd} className="neo-button-primary px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Plus size={18} /> Thêm Yêu cầu
        </button>
      </div>

      <div className="neo-surface rounded-2xl">
        <div className="p-5 border-b border-white/20">
          <div className="relative max-w-md w-full neo-input flex items-center px-4 py-2">
            <Search className="text-[var(--color-text)] opacity-50 mr-2" size={18} />
            <input type="text" placeholder="Tìm mã hoặc phòng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-[var(--color-text)] font-medium placeholder:opacity-50" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[var(--color-text)] opacity-70 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 px-6">Mã Dịch Vụ</th>
                <th className="p-4">Loại Yêu Cầu</th>
                <th className="p-4 text-center">Phòng</th>
                <th className="p-4 w-1/5 text-center">Thời gian</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-sm">
              {filteredRequests.length === 0 ? (
                 <tr><td colSpan={6} className="p-6 text-center text-[var(--color-text)] opacity-50 font-bold">Không có yêu cầu dịch vụ nào.</td></tr>
              ) : filteredRequests.map((r) => (
                <tr key={r.id} className="hover:neo-pressed transition-all">
                  <td className="p-4 px-6">
                    <p className="font-bold text-[var(--color-text)] tracking-wider">{r.id}</p>
                    <p className="font-bold text-[var(--color-text)] opacity-70 text-xs mt-1">{r.guest}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[var(--color-text)] text-sm">{r.type}</p>
                  </td>
                  <td className="p-4 text-center">
                     <div className="inline-block neo-surface-sm text-[var(--color-text)] px-3 py-1.5 rounded-xl font-bold text-sm">
                       {r.room}
                     </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-[var(--color-text)] opacity-80 text-xs font-bold neo-surface-sm px-3 py-1.5 rounded-lg">
                      {r.time}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(r.status)}
                  </td>
                  <td className="p-4 text-center align-middle">
                    <div className="flex flex-col gap-2 items-center">
                      <button onClick={() => openEdit(r)} className="text-xs font-bold text-[var(--color-text)] opacity-70 hover:opacity-100 hover:text-[var(--color-primary)] px-3 py-1.5 rounded-xl neo-surface-sm hover:neo-pressed transition-all flex justify-center items-center gap-1.5 cursor-pointer active:scale-95">
                        <Edit size={14} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="text-xs font-bold text-[var(--color-danger)] opacity-80 hover:opacity-100 px-3 py-1.5 rounded-xl neo-surface-sm hover:neo-pressed transition-all flex justify-center items-center gap-1.5 cursor-pointer active:scale-95">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? `Cập nhật dịch vụ` : "Thêm dịch vụ mới"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Tên Khách Hàng</label>
              <input required type="text" value={currentRequest.guest} onChange={(e) => setCurrentRequest({...currentRequest, guest: e.target.value})} className="w-full neo-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Phòng</label>
              <input required type="text" value={currentRequest.room} onChange={(e) => setCurrentRequest({...currentRequest, room: e.target.value})} className="w-full neo-input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Loại Dịch Vụ</label>
            <Select 
              value={currentRequest.type} 
              onChange={(val) => setCurrentRequest({...currentRequest, type: val})} 
              className="w-full neo-input py-2.5 px-4"
              options={[
                { value: "Dọn dẹp phòng", label: "Dọn dẹp phòng" },
                { value: "Gọi Đồ Ăn", label: "Gọi Đồ Ăn" },
                { value: "Massage thư giãn", label: "Massage thư giãn" },
                { value: "Yêu cầu khác", label: "Yêu cầu khác" }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Trạng Thái</label>
              <Select 
                value={currentRequest.status} 
                onChange={(val) => setCurrentRequest({...currentRequest, status: val})} 
                className="w-full neo-input py-2.5 px-4"
                options={[
                  { value: "Chờ xử lý", label: "Chờ xử lý" },
                  { value: "Đang thực hiện", label: "Đang thực hiện" },
                  { value: "Hoàn tất", label: "Hoàn tất" }
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Giờ yêu cầu</label>
              <input required type="text" value={currentRequest.time} onChange={(e) => setCurrentRequest({...currentRequest, time: e.target.value})} className="w-full neo-input" />
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

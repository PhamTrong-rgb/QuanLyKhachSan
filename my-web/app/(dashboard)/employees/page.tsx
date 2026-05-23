"use client";

import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, UserCheck, UserX, Shield, Trash2, Save } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useHotel();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Trạng thái cho Edit Modal
  const [editDept, setEditDept] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.id.toLowerCase().includes(searchTerm.toLowerCase()) || emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      deleteEmployee(id);
      setSelectedEmployee(null);
    }
  };

  const handleOpenEdit = (emp: any) => {
    setSelectedEmployee(emp);
    setEditDept(emp.department);
    setEditStatus(emp.status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Nhân viên</h1>
          <p className="text-sm font-medium text-[var(--color-text)] opacity-70 mt-1">Quản lý danh sách và quyền hạn nhân viên trong khách sạn.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="neo-button-primary px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Plus size={18} /> Thêm nhân viên
        </button>
      </div>

      <div className="neo-surface rounded-2xl">
        <div className="p-5 border-b border-white/20 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full neo-input flex items-center px-4 py-2">
            <Search className="text-[var(--color-text)] opacity-50 mr-2" size={18} />
            <input
              type="text"
              placeholder="Tìm tên, mã hoặc phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-[var(--color-text)] font-medium placeholder:opacity-50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)] opacity-50 pointer-events-none z-10" size={16} />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-48 pl-11 pr-4 py-3 neo-input font-bold"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Đang làm việc" },
                { value: "probation", label: "Thử việc" },
                { value: "on_leave", label: "Nghỉ phép" },
                { value: "inactive", label: "Đã nghỉ" }
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[var(--color-text)] opacity-70 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 px-6">Nhân viên</th>
                <th className="p-4">Chức vụ & Phòng ban</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-sm">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:neo-pressed transition-all">
                  <td className="p-4 px-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full neo-surface-sm text-[var(--color-primary)] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                      {emp.avatar && emp.avatar.startsWith("http") ? (
                        <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                      ) : (
                        emp.avatar || emp.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--color-text)]">{emp.name}</p>
                      <p className="text-xs text-[var(--color-text)] opacity-50 font-bold">{emp.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[var(--color-text)] flex items-center gap-1.5"><Shield size={14} className="opacity-50" /> {emp.role}</p>
                    <p className="text-xs text-[var(--color-text)] opacity-70 mt-0.5">{emp.department}</p>
                  </td>
                  <td className="p-4 text-[var(--color-text)] font-bold">
                    {emp.phone}
                  </td>
                  <td className="p-4">
                    {emp.status === "active" && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg neo-pressed text-[var(--color-success)] text-xs font-bold"><UserCheck size={14} /> Đang làm việc</span>}
                    {emp.status === "probation" && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg neo-pressed text-[var(--color-primary)] text-xs font-bold"><UserCheck size={14} /> Thử việc</span>}
                    {emp.status === "on_leave" && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg neo-pressed text-[var(--color-warning)] text-xs font-bold"><UserX size={14} /> Nghỉ phép</span>}
                    {emp.status === "inactive" && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg neo-pressed text-[var(--color-text)] opacity-50 text-xs font-bold"><UserX size={14} /> Đã nghỉ</span>}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleOpenEdit(emp)} className="p-2 text-[var(--color-text)] opacity-50 hover:opacity-100 hover:text-[var(--color-warning)] hover:neo-pressed rounded-lg transition-all cursor-pointer active:scale-90">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[var(--color-text)] opacity-50 font-bold">Không tìm thấy nhân viên nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title="Thông tin nhân viên">
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-center gap-5 neo-pressed p-5 rounded-xl">
              <div className="w-16 h-16 rounded-full neo-surface flex items-center justify-center font-bold text-2xl text-[var(--color-primary)] overflow-hidden shrink-0">
                {selectedEmployee.avatar && selectedEmployee.avatar.startsWith("http") ? (
                  <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-full h-full object-cover" />
                ) : (
                  selectedEmployee.avatar || selectedEmployee.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--color-text)]">{selectedEmployee.name}</h3>
                <p className="text-[var(--color-text)] opacity-70 text-sm font-bold">{selectedEmployee.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Số điện thoại</label>
                <input type="text" defaultValue={selectedEmployee.phone} className="w-full neo-input" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Email</label>
                <input type="email" defaultValue={selectedEmployee.email} className="w-full neo-input" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Phòng ban</label>
                <Select
                  value={editDept}
                  onChange={setEditDept}
                  className="w-full neo-input py-2.5 px-4"
                  options={[
                    { value: "Lễ tân", label: "Lễ tân" },
                    { value: "Buồng phòng", label: "Buồng phòng" },
                    { value: "Nhà hàng", label: "Nhà hàng" },
                    { value: "Bếp", label: "Bếp" },
                    { value: "Kỹ thuật", label: "Kỹ thuật" },
                    { value: "An ninh", label: "An ninh" },
                    { value: "Tài chính", label: "Tài chính" },
                    { value: "Nhân sự", label: "Nhân sự" },
                    { value: "Ban Giám Đốc", label: "Ban Giám Đốc" },
                    { value: "Khác", label: "Khác" }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Trạng thái</label>
                <Select
                  value={editStatus}
                  onChange={setEditStatus}
                  className="w-full neo-input py-2.5 px-4"
                  options={[
                    { value: "active", label: "Đang làm việc" },
                    { value: "probation", label: "Thử việc" },
                    { value: "on_leave", label: "Nghỉ phép" },
                    { value: "inactive", label: "Đã nghỉ" }
                  ]}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/20 flex justify-between">
              <button onClick={() => handleDelete(selectedEmployee.id)} className="px-5 py-2 text-[var(--color-danger)] font-bold hover:neo-pressed rounded-xl transition-all flex items-center gap-2 active:scale-95">
                <Trash2 size={18} /> Xóa
              </button>
              <div className="flex gap-3">
                <button onClick={() => setSelectedEmployee(null)} className="px-5 py-2 text-[var(--color-text)] font-bold hover:neo-pressed rounded-xl transition-all active:scale-95">Hủy</button>
                <button onClick={() => {
                  updateEmployee({
                    ...selectedEmployee,
                    department: editDept,
                    status: editStatus
                  });
                  setSelectedEmployee(null);
                }} className="px-6 py-2 neo-button-primary flex items-center gap-2 active:scale-95 transition-transform">
                  <Save size={18} /> Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Thêm nhân viên mới">
        <form onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as typeof e.target & {
            name: { value: string };
            phone: { value: string };
            role: { value: string };
          };
          const newEmp = {
            id: `NV${String(employees.length + 1).padStart(3, '0')}`,
            name: target.name.value,
            phone: target.phone.value,
            role: target.role.value,
            department: "Khác",
            email: "",
            status: "active",
            avatar: target.name.value.charAt(0).toUpperCase()
          };
          addEmployee(newEmp);
          setIsAdding(false);
        }} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Họ và Tên</label>
            <input required name="name" type="text" placeholder="Nhập tên nhân viên" className="w-full neo-input" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Số điện thoại</label>
              <input required name="phone" type="text" placeholder="Số điện thoại" className="w-full neo-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Chức vụ</label>
              <input required name="role" type="text" placeholder="Chức vụ" className="w-full neo-input" />
            </div>
          </div>

          <div className="pt-6 border-t border-white/20 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2 text-[var(--color-text)] font-bold hover:neo-pressed rounded-xl transition-all active:scale-95">Hủy</button>
            <button type="submit" className="px-6 py-2 neo-button-primary active:scale-95 transition-transform">
              Thêm mới
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

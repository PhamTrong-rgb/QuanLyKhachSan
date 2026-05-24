"use client";

import { useState } from "react";
import { Download, Search, TrendingUp, TrendingDown, Clock, Filter, CheckCircle2, ArrowRightLeft, FileText, Printer } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

export default function TransactionsPage() {
  const { transactions } = useHotel();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  const filteredTransactions = transactions.filter(t => {
    const matchTab = activeTab === 'all' || t.type === activeTab;
    const matchSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = dateFilter === 'all' ? true : dateFilter === 'today' ? t.date === "18/04/2026" : t.date === "17/04/2026";
    return matchTab && matchSearch && matchDate;
  });

  const handleExportCSV = () => {
    const headers = ["Mã GD", "Loại", "Nội dung", "Số tiền (VND)", "Ngày", "Giờ", "Trạng thái", "Phương thức"];
    const records = filteredTransactions.map(t => [
      t.id, t.type, `"${t.description}"`, t.amount, t.date, t.time, t.status, t.paymentMethod
    ]);
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + records.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Xuat_File_Giao_Dich_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Giao dịch</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Quản lý các khoản thu chi, hóa đơn và dòng tiền.</p>
        </div>
        <button onClick={handleExportCSV} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium  transition-all flex items-center gap-2">
          <Download size={18} /> Xuất thống kê
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
         <div className="bg-white p-6 rounded-2xl border border-slate-200  relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><TrendingUp size={80}/></div>
            <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Tổng thu (Tháng)</p>
            <h3 className="text-3xl font-bold text-slate-900">342.500.000₫</h3>
            <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">+12.5% so với tháng trước</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200  relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><TrendingDown size={80}/></div>
            <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Tổng chi (Tháng)</p>
            <h3 className="text-3xl font-bold text-slate-900">85.200.000₫</h3>
            <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">+4.2% so với tháng trước</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200  relative overflow-hidden bg-slate-900 text-white border-none">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><ArrowRightLeft size={80}/></div>
            <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Lợi nhuận ròng</p>
            <h3 className="text-3xl font-bold text-white">257.300.000₫</h3>
            <p className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">+15.8% so với tháng trước</p>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200  overflow-hidden">
        <div className="p-2 border-b border-slate-100 flex overflow-x-auto">
           {['all', 'income', 'expense'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {tab === 'all' ? 'Tất cả giao dịch' : tab === 'income' ? 'Khoản thu' : 'Khoản chi'}
              </button>
           ))}
        </div>
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã giao dịch hoặc nội dung..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10" size={16} />
            <Select 
              value={dateFilter} 
              onChange={setDateFilter} 
              className="w-48 pl-11 pr-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl hover:bg-slate-50 font-medium transition-colors"
              options={[
                { value: "all", label: "Tất cả thời gian" },
                { value: "today", label: "Hôm nay (18/04)" },
                { value: "yesterday", label: "Hôm qua (17/04)" }
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 px-6">Mã GD</th>
                <th className="p-4">Nội dung</th>
                <th className="p-4 text-right">Số tiền</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} onClick={() => setSelectedTxn(txn)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="p-4 px-6">
                    <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{txn.id}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{txn.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{txn.type === 'income' ? 'Khách hàng thanh toán' : 'Chi phí vận hành'}</p>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-bold text-base ${txn.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {txn.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(txn.amount)}₫
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-700">{txn.date}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{txn.time}</p>
                  </td>
                  <td className="p-4">
                    {txn.status === "completed" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100"><CheckCircle2 size={14}/> Hoàn tất</span>}
                    {txn.status === "pending" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100"><Clock size={14}/> Chờ xử lý</span>}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">Không tìm thấy giao dịch nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} title={`Chi tiết giao dịch: ${selectedTxn?.id}`}>
        {selectedTxn && (
          <div className="space-y-6">
             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedTxn.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-700'}`}>
                    <FileText size={24}/>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 block">{selectedTxn.type === 'income' ? 'Biên lai thu' : 'Phiếu chi'}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{selectedTxn.date} - {selectedTxn.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số tiền</p>
                  <p className={`font-bold text-2xl ${selectedTxn.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>{new Intl.NumberFormat('vi-VN').format(selectedTxn.amount)}₫</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Nội dung giao dịch</p>
                  <p className="font-medium text-slate-900">{selectedTxn.description}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Trạng thái</p>
                  <p className="font-bold text-slate-900">
                    {selectedTxn.status === "completed" ? "Đã thành công" : "Đang chờ xử lý"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Thanh toán qua</p>
                  <p className="font-medium text-slate-900">{selectedTxn.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Người thực hiện</p>
                  <p className="font-medium text-slate-900">{selectedTxn.user}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1">Ghi chú thêm</p>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-700 mt-1 min-h-[60px]">
                    {selectedTxn.note}
                  </div>
                </div>
             </div>

             <div className="pt-4 border-t border-slate-100 flex justify-between gap-3">
               <button className="flex-1 py-2.5 text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                 <Printer size={18}/> In biên lai
               </button>
               <button onClick={() => setSelectedTxn(null)} className="flex-1 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
                 Đóng
               </button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

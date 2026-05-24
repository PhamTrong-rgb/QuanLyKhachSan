"use client";

import { useState } from "react";
import { Download, Search, TrendingUp, TrendingDown, Clock, CheckCircle2, ArrowRightLeft, FileText, Printer } from "lucide-react";
import Modal from "@/components/ui/modal";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";

export default function TransactionsPage() {
  const { transactions } = useHotel();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  const todayStr = new Date().toLocaleDateString('vi-VN');
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('vi-VN');

  const filteredTransactions = transactions.filter(t => {
    const matchTab = activeTab === 'all' || t.type === activeTab;
    const matchSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = dateFilter === 'all' ? true : dateFilter === 'today' ? t.date === todayStr : t.date === yesterdayStr;
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

  // --- Dynamic stats ---
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTxns = transactions.filter(t => {
    const parts = t.date.split('/'); if (parts.length < 3) return false;
    return +parts[1] - 1 === currentMonth && +parts[2] === currentYear;
  });
  const totalIncome = monthlyTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthlyTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const fmtVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + '₫';

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            <ArrowRightLeft size={28} className="text-[var(--color-primary)]" />
            Giao dịch
          </h1>
          <p className="text-sm font-medium text-[var(--color-text)] opacity-70 mt-1">Quản lý các khoản thu chi, hóa đơn và dòng tiền.</p>
        </div>
        <button onClick={handleExportCSV} className="neo-button-primary px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Download size={18} /> Xuất thống kê
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="neo-surface p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><TrendingUp size={80} /></div>
          <p className="text-[11px] font-bold text-[var(--color-text)] opacity-60 mb-2 uppercase tracking-wider">Tổng thu (Tháng này)</p>
          <h3 className="text-3xl font-bold text-[var(--color-text)]">{totalIncome > 0 ? fmtVND(totalIncome) : '0₫'}</h3>
          <p className="mt-2 text-xs font-bold text-[var(--color-text)] opacity-50">{monthlyTxns.filter(t=>t.type==='income').length} giao dịch</p>
        </div>
        <div className="neo-surface p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><TrendingDown size={80} /></div>
          <p className="text-[11px] font-bold text-[var(--color-text)] opacity-60 mb-2 uppercase tracking-wider">Tổng chi (Tháng này)</p>
          <h3 className="text-3xl font-bold text-[var(--color-text)]">{totalExpense > 0 ? fmtVND(totalExpense) : '0₫'}</h3>
          <p className="mt-2 text-xs font-bold text-[var(--color-text)] opacity-50">{monthlyTxns.filter(t=>t.type==='expense').length} giao dịch</p>
        </div>
        <div className="neo-surface p-6 rounded-2xl relative overflow-hidden bg-[var(--color-primary)]/10">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-[var(--color-primary)]"><ArrowRightLeft size={80} /></div>
          <p className="text-[11px] font-bold text-[var(--color-text)] opacity-80 mb-2 uppercase tracking-wider">Lợi nhuận ròng</p>
          <h3 className={`text-3xl font-bold ${netProfit >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-danger)]'}`}>{fmtVND(netProfit)}</h3>
          <p className="mt-2 text-xs font-bold text-[var(--color-text)] opacity-50">{transactions.length} tổng giao dịch</p>
        </div>
      </div>

      <div className="neo-surface rounded-2xl overflow-hidden">
        <div className="p-2 border-b border-white/20 flex overflow-x-auto">
          {['all', 'income', 'expense'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text)] opacity-60 hover:opacity-100'}`}
            >
              {tab === 'all' ? 'Tất cả giao dịch' : tab === 'income' ? 'Khoản thu' : 'Khoản chi'}
            </button>
          ))}
        </div>
        <div className="p-5 border-b border-white/20 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full neo-input flex items-center px-4 py-2">
            <Search className="text-[var(--color-text)] opacity-50 mr-2" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã giao dịch hoặc nội dung..."
              className="w-full bg-transparent border-none text-[var(--color-text)] font-medium outline-none placeholder:opacity-50"
            />
          </div>
          <div className="relative">
          <Select
              value={dateFilter}
              onChange={setDateFilter}
              className="w-52 neo-input py-2.5 px-4"
              options={[
                { value: "all", label: "Tất cả thời gian" },
                { value: "today", label: `Hôm nay (${todayStr})` },
                { value: "yesterday", label: `Hôm qua (${yesterdayStr})` }
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[var(--color-text)] opacity-70 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 px-6">Mã GD</th>
                <th className="p-4">Nội dung</th>
                <th className="p-4 text-right">Số tiền</th>
                <th className="p-4 text-center">Thời gian</th>
                <th className="p-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-sm">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} onClick={() => setSelectedTxn(txn)} className="hover:neo-pressed transition-all cursor-pointer group active:opacity-70">
                  <td className="p-4 px-6">
                    <span className="font-bold text-[var(--color-text)] tracking-wider group-hover:text-[var(--color-primary)] transition-colors">{txn.id}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[var(--color-text)]">{txn.description}</p>
                    <p className="text-xs font-bold text-[var(--color-text)] opacity-60 mt-0.5">{txn.type === 'income' ? 'Khách hàng thanh toán' : 'Chi phí vận hành'}</p>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-black text-base ${txn.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>
                      {txn.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(txn.amount)}₫
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <p className="font-bold text-[var(--color-text)] opacity-90">{txn.date}</p>
                    <p className="text-[10px] font-bold text-[var(--color-text)] opacity-60 mt-0.5">{txn.time}</p>
                  </td>
                  <td className="p-4 text-center">
                    {txn.status === "completed" && <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--color-success)] text-xs font-bold neo-pressed"><CheckCircle2 size={14} /> Hoàn tất</span>}
                    {txn.status === "pending" && <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--color-warning)] text-xs font-bold neo-pressed"><Clock size={14} /> Chờ xử lý</span>}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center font-bold text-[var(--color-text)] opacity-50">Không tìm thấy giao dịch nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} title={`Chi tiết giao dịch: ${selectedTxn?.id}`}>
        {selectedTxn && (
          <div className="space-y-6">
            <div className="flex justify-between items-center neo-surface-sm p-5 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center neo-pressed ${selectedTxn.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text)] text-lg block">{selectedTxn.type === 'income' ? 'Biên lai thu' : 'Phiếu chi'}</h3>
                  <p className="text-xs font-bold text-[var(--color-text)] opacity-60 mt-0.5">{selectedTxn.date} - {selectedTxn.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[var(--color-text)] opacity-50 uppercase tracking-wider mb-1">Số tiền</p>
                <p className={`font-black text-2xl ${selectedTxn.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>{new Intl.NumberFormat('vi-VN').format(selectedTxn.amount)}₫</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm">
              <div>
                <p className="text-[var(--color-text)] opacity-60 font-bold mb-1 text-[11px] uppercase tracking-wider">Nội dung giao dịch</p>
                <p className="font-bold text-[var(--color-text)]">{selectedTxn.description}</p>
              </div>
              <div>
                <p className="text-[var(--color-text)] opacity-60 font-bold mb-1 text-[11px] uppercase tracking-wider">Trạng thái</p>
                <p className="font-bold text-[var(--color-text)]">
                  {selectedTxn.status === "completed" ? "Đã thành công" : "Đang chờ xử lý"}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-text)] opacity-60 font-bold mb-1 text-[11px] uppercase tracking-wider">Thanh toán qua</p>
                <p className="font-bold text-[var(--color-text)]">{selectedTxn.paymentMethod}</p>
              </div>
              <div>
                <p className="text-[var(--color-text)] opacity-60 font-bold mb-1 text-[11px] uppercase tracking-wider">Người thực hiện</p>
                <p className="font-bold text-[var(--color-text)]">{selectedTxn.user}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[var(--color-text)] opacity-60 font-bold mb-1 text-[11px] uppercase tracking-wider">Ghi chú thêm</p>
                <div className="neo-input p-4 rounded-xl text-[var(--color-text)] font-medium mt-1 min-h-[60px]">
                  {selectedTxn.note || "Không có ghi chú"}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/20 flex justify-between gap-3">
              <button className="flex-1 py-3 text-[var(--color-text)] font-bold neo-surface-sm hover:neo-pressed rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                <Printer size={18} /> In biên lai
              </button>
              <button onClick={() => setSelectedTxn(null)} className="flex-1 py-3 neo-button-primary rounded-xl font-bold transition-transform active:scale-95">
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

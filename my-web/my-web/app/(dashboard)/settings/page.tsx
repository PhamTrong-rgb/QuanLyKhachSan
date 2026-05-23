"use client";

import { Save, UploadCloud, X, Image as ImageIcon, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";

export default function SettingsPage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [hotelName, setHotelName] = useState("Grand Luxe Hotel");
  const [hotelDescription, setHotelDescription] = useState("Khách sạn 5 sao mang phong cách thiết kế hiện đại, cung cấp dịch vụ lưu trú cao cấp tại trung tâm.");
  const [isSaved, setIsSaved] = useState(false);

  // Password modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Khôi phục data từ localStorage nếu có
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogo = localStorage.getItem("hotelLogo");
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (savedLogo) setAvatarUrl(savedLogo);

      const savedCover = localStorage.getItem("loginCoverImage");
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (savedCover) setCoverUrl(savedCover);

      const savedName = localStorage.getItem("hotelName");
      if (savedName) setHotelName(savedName);

      const savedDesc = localStorage.getItem("hotelDescription");
      if (savedDesc) setHotelDescription(savedDesc);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') setAvatarUrl(reader.result as string);
        else setCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (avatarUrl) localStorage.setItem("hotelLogo", avatarUrl);
    else localStorage.removeItem("hotelLogo");

    if (coverUrl) localStorage.setItem("loginCoverImage", coverUrl);
    else localStorage.removeItem("loginCoverImage");

    localStorage.setItem("hotelName", hotelName);
    localStorage.setItem("hotelDescription", hotelDescription);
    
    // Phát event để hệ thống biết cập nhật
    window.dispatchEvent(new Event("hotelDataUpdated"));
    window.dispatchEvent(new Event("hotelLogoUpdated"));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleChangePassword = () => {
    setPasswordError("");
    setPasswordSuccess("");
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp.");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    const currentUserEmail = localStorage.getItem("userEmail");
    if (!currentUserEmail) {
      setPasswordError("Lỗi: Không xác định được phiên đăng nhập.");
      return;
    }

    // Logic kiểm tra và cập nhật cho Admin
    if (currentUserEmail === "admin@hotel.vn") {
      const currentAdminPassword = localStorage.getItem("adminPassword") || "12345678";
      if (oldPassword !== currentAdminPassword) {
        setPasswordError("Mật khẩu hiện tại không đúng!");
        return;
      }
      // Lưu mật khẩu mới của admin
      localStorage.setItem("adminPassword", newPassword);
    } else {
      // Logic kiểm tra và cập nhật cho User bình thường đã đăng ký
      const usersJSON = localStorage.getItem("registeredUsers");
      let users = usersJSON ? JSON.parse(usersJSON) : [];
      
      const userIndex = users.findIndex((u: any) => u.email === currentUserEmail);
      if (userIndex === -1) {
        setPasswordError("Không tìm thấy thông tin tài khoản của bạn.");
        return;
      }
      
      if (users[userIndex].password !== oldPassword) {
        setPasswordError("Mật khẩu hiện tại không đúng!");
        return;
      }
      
      // Lưu mật khẩu mới của user
      users[userIndex].password = newPassword;
      localStorage.setItem("registeredUsers", JSON.stringify(users));
    }

    // Mô phỏng loading
    setTimeout(() => {
      setPasswordSuccess("Đổi mật khẩu thành công!");
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSuccess("");
      }, 1500);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h1>
        <button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium  shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer">
          <Save size={20} /> {isSaved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 max-w-4xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Thông tin khách sạn & Hiển thị</h2>
        
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo */}
            <div className="flex flex-col gap-2">
              <div>
                <h3 className="font-medium text-slate-800">Logo / Ảnh đại diện</h3>
                <p className="text-sm text-slate-500 mt-1">Sử dụng cho menu bên trái (tỉ lệ 1:1, max 2MB).</p>
              </div>
              <div className="relative group cursor-pointer inline-block w-32 mt-2">
                <input type="file" id="avatarUpload" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                <label htmlFor="avatarUpload" className="w-32 h-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:border-amber-500 hover:text-amber-600 transition-colors overflow-hidden relative cursor-pointer">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <UploadCloud size={28} className="mb-1" />
                      <span className="text-xs font-medium">Tải Logo</span>
                    </>
                  )}
                </label>
                {avatarUrl && (
                  <button 
                    onClick={() => setAvatarUrl(null)}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Cover Image cho Đăng nhập */}
            <div className="flex flex-col gap-2">
              <div>
                <h3 className="font-medium text-slate-800">Ảnh nền trang Đăng nhập</h3>
                <p className="text-sm text-slate-500 mt-1">Ảnh kích thước lớn dùng làm ảnh bìa trang đăng nhập.</p>
              </div>
              <div className="relative group cursor-pointer inline-block w-full max-w-[280px] mt-2">
                <input type="file" id="coverUpload" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
                <label htmlFor="coverUpload" className="w-full h-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:border-amber-500 hover:text-amber-600 transition-colors overflow-hidden relative cursor-pointer">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon size={28} className="mb-1" />
                      <span className="text-xs font-medium">Tải Ảnh bìa</span>
                    </>
                  )}
                </label>
                {coverUrl && (
                  <button 
                    onClick={() => setCoverUrl(null)}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên khách sạn</label>
              <input value={hotelName} onChange={(e) => setHotelName(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-amber-500 px-4 py-2.5 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại liên hệ</label>
              <input type="text" defaultValue="028 1234 5678" className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-amber-500 px-4 py-2.5 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
            <input type="text" defaultValue="123 Nguyễn Văn Linh, Đà Nẵng" className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-amber-500 px-4 py-2.5 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn (Hiển thị ở trang Đăng nhập)</label>
            <textarea value={hotelDescription} onChange={(e) => setHotelDescription(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-amber-500 px-4 py-2.5 outline-none resize-none"></textarea>
          </div>
          
          <div className="pt-4 mt-6 border-t border-slate-100">
            <h3 className="text-md font-semibold text-slate-800 mb-4">Mật khẩu & Bảo mật</h3>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-amber-600 hover:text-amber-700 font-medium border border-amber-200 hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Đổi mật khẩu bảo mật
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Đổi mật khẩu">
        <div className="space-y-4 mt-2">
          {passwordError && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-200 font-medium">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm border border-emerald-200 font-medium">
              {passwordSuccess}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-[var(--color-text)] opacity-80 mb-1.5">Mật khẩu hiện tại</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full neo-input text-[var(--color-text)] rounded-xl px-4 py-3 outline-none" 
                placeholder="Nhập mật khẩu hiện tại"
              />
              <Lock className="absolute right-4 top-3.5 text-[var(--color-text)] opacity-40" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--color-text)] opacity-80 mb-1.5">Mật khẩu mới</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full neo-input text-[var(--color-text)] rounded-xl px-4 py-3 outline-none" 
                placeholder="Nhập mật khẩu mới"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--color-text)] opacity-80 mb-1.5">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full neo-input text-[var(--color-text)] rounded-xl px-4 py-3 outline-none" 
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm font-medium flex items-center gap-1.5 text-[var(--color-text)] opacity-70 hover:opacity-100 transition-opacity"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            </button>
          </div>

          <div className="pt-6 mt-4 border-t border-white/10 flex justify-end gap-3">
            <button 
              onClick={() => setIsPasswordModalOpen(false)} 
              className="neo-button px-5 py-2.5 rounded-xl font-bold text-[var(--color-text)]"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleChangePassword}
              className="neo-button-primary px-5 py-2.5 rounded-xl font-bold text-white shadow-lg flex items-center gap-2"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

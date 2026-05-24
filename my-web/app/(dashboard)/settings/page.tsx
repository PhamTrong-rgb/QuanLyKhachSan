"use client";

import { Save, UploadCloud, X, Image as ImageIcon, Lock, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAvatarUrl(localStorage.getItem("hotelLogo"));
      setCoverUrl(localStorage.getItem("loginCoverImage"));
      setHotelName(localStorage.getItem("hotelName") || "Grand Luxe Hotel");
      setHotelDescription(localStorage.getItem("hotelDescription") || "Khách sạn 5 sao mang phong cách thiết kế hiện đại, cung cấp dịch vụ lưu trú cao cấp tại trung tâm.");
    }, 0);

    return () => window.clearTimeout(timeout);
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
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      
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
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            Cài đặt hệ thống
          </h1>
          <p className="text-sm font-medium text-[var(--color-text)] opacity-70 mt-1">Cấu hình hiển thị và thông tin khách sạn.</p>
        </div>
        <button onClick={handleSave} className="neo-button-primary px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Save size={20} /> {isSaved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>
      </div>

      <div className="neo-surface p-8 rounded-2xl max-w-4xl">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-6 border-b border-white/20 pb-4">Thông tin khách sạn & Hiển thị</h2>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo */}
            <div className="flex flex-col gap-2">
              <div>
                <h3 className="font-bold text-[var(--color-text)]">Logo / Ảnh đại diện</h3>
                <p className="text-xs font-bold text-[var(--color-text)] opacity-60 mt-1">Sử dụng cho menu bên trái (tỉ lệ 1:1, max 2MB).</p>
              </div>
              <div className="relative group cursor-pointer inline-block w-32 mt-2">
                <input type="file" id="avatarUpload" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                <label htmlFor="avatarUpload" className="w-32 h-32 neo-surface-sm rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-[var(--color-text)] opacity-70 hover:opacity-100 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors overflow-hidden relative cursor-pointer">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <UploadCloud size={28} className="mb-1" />
                      <span className="text-xs font-bold">Tải Logo</span>
                    </>
                  )}
                </label>
                {avatarUrl && (
                  <button 
                    onClick={() => setAvatarUrl(null)}
                    className="absolute -top-2 -right-2 bg-[var(--color-danger)] text-white p-1 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Cover Image cho Đăng nhập */}
            <div className="flex flex-col gap-2">
              <div>
                <h3 className="font-bold text-[var(--color-text)]">Ảnh nền trang Đăng nhập</h3>
                <p className="text-xs font-bold text-[var(--color-text)] opacity-60 mt-1">Ảnh kích thước lớn dùng làm ảnh bìa trang đăng nhập.</p>
              </div>
              <div className="relative group cursor-pointer inline-block w-full max-w-[280px] mt-2">
                <input type="file" id="coverUpload" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
                <label htmlFor="coverUpload" className="w-full h-32 neo-surface-sm rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-[var(--color-text)] opacity-70 hover:opacity-100 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors overflow-hidden relative cursor-pointer">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon size={28} className="mb-1" />
                      <span className="text-xs font-bold">Tải Ảnh bìa</span>
                    </>
                  )}
                </label>
                {coverUrl && (
                  <button 
                    onClick={() => setCoverUrl(null)}
                    className="absolute -top-2 -right-2 bg-[var(--color-danger)] text-white p-1 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-white/20">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Tên khách sạn</label>
              <input value={hotelName} onChange={(e) => setHotelName(e.target.value)} type="text" className="w-full neo-input" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Số điện thoại liên hệ</label>
              <input type="text" defaultValue="028 1234 5678" className="w-full neo-input" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Địa chỉ</label>
            <input type="text" defaultValue="123 Nguyễn Văn Linh, Đà Nẵng" className="w-full neo-input" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] opacity-70 uppercase mb-2">Mô tả ngắn (Hiển thị ở trang Đăng nhập)</label>
            <textarea value={hotelDescription} onChange={(e) => setHotelDescription(e.target.value)} rows={3} className="w-full neo-input resize-none py-3"></textarea>
          </div>
          
          <div className="pt-4 mt-6 border-t border-white/20">
            <h3 className="text-md font-bold text-[var(--color-text)] mb-4">Mật khẩu & Bảo mật</h3>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-[var(--color-primary)] font-bold px-4 py-2 rounded-xl neo-surface-sm hover:neo-pressed transition-all active:scale-95 cursor-pointer"
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

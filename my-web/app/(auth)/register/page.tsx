"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Mail, ShieldAlert, Building2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  
  const [hotelData, setHotelData] = useState({
    name: "Grand Luxe",
    description: "Hệ thống quản trị hạ tầng khách sạn cao cấp.",
    coverImage: "https://images.unsplash.com/photo-1542314831-c6a4d402288b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    logo: null as string | null
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setHotelData({
        name: localStorage.getItem("hotelName") || "Grand Luxe",
        description: localStorage.getItem("hotelDescription") || "Hệ thống quản trị hạ tầng khách sạn cao cấp.",
        coverImage: localStorage.getItem("loginCoverImage") || "https://images.unsplash.com/photo-1542314831-c6a4d402288b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        logo: localStorage.getItem("hotelLogo") || null
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
       // Save to mock database
       const usersJSON = localStorage.getItem("registeredUsers");
       const users = usersJSON ? JSON.parse(usersJSON) : [];
       
       if (users.some((u: any) => u.email === formData.email)) {
          setError("Email này đã được đăng ký trên hệ thống!");
          return;
       }

       users.push({ ...formData, role: "Khách hàng" });
       localStorage.setItem("registeredUsers", JSON.stringify(users));
       alert("Khởi tạo tài khoản thành công! Phê duyệt tự động hoàn tất.");
       router.push("/login");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--color-background)]">
      {/* Right Column - Hotel Image & Info (Reversed for variation) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-end p-12 order-2">
        <div className="absolute inset-0 z-0">
          <img src={hotelData.coverImage} alt="Hotel Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/90 via-[var(--color-primary)]/40 to-black/10"></div>
        </div>
        
        <div className="relative z-10 text-white max-w-xl animate-in slide-in-from-bottom-8 duration-700 fade-in">
           {hotelData.logo && (
             <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden mb-6 border border-white/20 shadow-xl">
               <img src={hotelData.logo} alt="Logo" className="w-full h-full object-cover" />
             </div>
           )}
           {!hotelData.logo && (
             <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-extrabold text-4xl mb-6 shadow-xl border border-white/30">
               <Building2 size={40} />
             </div>
           )}
           <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">{hotelData.name}</h1>
           <p className="text-lg text-white/90 leading-relaxed drop-shadow">{hotelData.description}</p>
        </div>
      </div>

      {/* Left Column - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden order-1">
        {/* Decorative elements for the form side */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

        <div className="w-full max-w-md p-10 neo-surface flex flex-col relative z-10">
          
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-[var(--color-text)] mb-2 tracking-tight">Đăng ký</h2>
            <p className="text-[var(--color-primary)] font-bold text-xs uppercase tracking-[0.2em]">
              Tạo tài khoản khách hàng
            </p>
          </div>

          {error && (
            <div className="w-full neo-pressed border-l-4 border-l-[var(--color-danger)] text-[var(--color-danger)] text-sm font-bold px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
              <ShieldAlert size={18}/> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5 w-full">
            <div>
              <label className="block text-sm font-bold text-[var(--color-text)] mb-2 pl-1">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)] opacity-50 z-10" size={18} />
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  type="text" 
                  className="w-full neo-input py-3.5 text-sm font-medium transition-all" 
                  style={{ paddingLeft: "3rem" }}
                  placeholder="Nguyễn Văn A" 
                />
              </div>
            </div>
             <div>
               <label className="block text-sm font-bold text-[var(--color-text)] mb-2 pl-1">Email</label>
               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)] opacity-50 z-10" size={18} />
                 <input 
                   required 
                   value={formData.email} 
                   onChange={(e) => setFormData({...formData, email: e.target.value})} 
                   type="email" 
                   className="w-full neo-input py-3.5 text-sm font-medium transition-all" 
                   style={{ paddingLeft: "3rem" }}
                   placeholder="admin@hotel.vn" 
                 />
               </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--color-text)] mb-2 pl-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)] opacity-50 z-10" size={18} />
                <input 
                  required 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  type="password" 
                  className="w-full neo-input py-3.5 text-sm font-medium transition-all" 
                  style={{ paddingLeft: "3rem" }}
                  placeholder="Tối thiểu 8 ký tự" 
                />
              </div>
            </div>
            <button type="submit" className="w-full neo-button-primary py-4 rounded-xl transition-all mt-6 text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              Đăng ký tài khoản
            </button>
          </form>

          <p className="text-[var(--color-text)] opacity-80 font-medium text-sm mt-8 text-center">
            Đã có tài khoản? <Link href="/login" className="text-[var(--color-primary)] font-bold hover:underline transition-all">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

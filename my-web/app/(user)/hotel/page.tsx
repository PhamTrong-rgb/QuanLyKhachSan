"use client";

import Link from "next/link";
import { CalendarCheck, DoorOpen, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicRooms, PublicRoom } from "@/lib/hotel-storage";

export default function HotelHomePage() {
  const [hotelName, setHotelName] = useState("Grand Luxe");
  const [hotelDescription, setHotelDescription] = useState("Khách sạn cao cấp với không gian lưu trú tinh tế, dịch vụ tận tâm và trải nghiệm đặt phòng thuận tiện.");
  const [coverImage, setCoverImage] = useState("https://images.unsplash.com/photo-1542314831-c6a4d402288b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80");
  const [rooms, setRooms] = useState<PublicRoom[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setHotelName(localStorage.getItem("hotelName") || "Grand Luxe");
      setHotelDescription(localStorage.getItem("hotelDescription") || "Khách sạn cao cấp với không gian lưu trú tinh tế, dịch vụ tận tâm và trải nghiệm đặt phòng thuận tiện.");
      setCoverImage(localStorage.getItem("loginCoverImage") || "https://images.unsplash.com/photo-1542314831-c6a4d402288b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80");
      setRooms(getPublicRooms().slice(0, 3));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div>
      <section className="relative min-h-[620px] overflow-hidden">
        <img src={coverImage} alt={hotelName} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-5 pb-16 pt-24 text-white">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
              <Star size={16} className="text-[var(--color-warning)]" />
              Trải nghiệm lưu trú cao cấp
            </div>
            <h1 className="text-5xl font-black leading-tight md:text-7xl">{hotelName}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">{hotelDescription}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/hotel/book" className="rounded-xl bg-[var(--color-primary)] px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:opacity-90">
                Đặt phòng ngay
              </Link>
              <Link href="/hotel/rooms" className="rounded-xl bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-900 transition hover:bg-white/90">
                Xem phòng
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-5 py-10 md:grid-cols-3">
        {[
          { icon: DoorOpen, title: "Không gian riêng tư", desc: "Phòng nghỉ được bố trí rõ ràng, dễ chọn theo nhu cầu lưu trú." },
          { icon: ShieldCheck, title: "Xác nhận bởi quản lý", desc: "Mỗi yêu cầu đặt phòng sẽ được bộ phận khách sạn kiểm tra và xác nhận." },
          { icon: Sparkles, title: "Dịch vụ đồng bộ", desc: "Thông tin phòng, khách hàng và đặt phòng được chuyển thẳng tới trang quản lý." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="neo-surface p-6">
              <div className="neo-pressed mb-5 flex h-12 w-12 items-center justify-center text-[var(--color-primary)]">
                <Icon size={22} />
              </div>
              <h2 className="text-xl font-black">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 opacity-70">{item.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">Phòng nổi bật</h2>
            <p className="mt-2 text-sm font-medium opacity-70">Chọn phòng phù hợp và gửi yêu cầu đặt phòng tới quản lý.</p>
          </div>
          <Link href="/hotel/rooms" className="neo-button hidden px-5 py-3 text-sm md:inline-flex">
            Xem tất cả
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {rooms.map((room) => (
            <Link href={`/hotel/book?room=${room.id}`} key={room.id} className="neo-surface block overflow-hidden transition hover:scale-[1.01]">
              <div className="h-44 bg-[var(--color-primary)]/10">
                <img src={`https://images.unsplash.com/photo-${room.id === "205" ? "1590490360182-c33d57733427" : room.id === "103" ? "1591088398332-8a7791972843" : "1566073771259-6a8506099945"}?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80`} alt={room.type} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">Phòng {room.id}</p>
                    <h3 className="mt-1 text-xl font-black">{room.type}</h3>
                  </div>
                  <span className="rounded-lg bg-white px-3 py-1 text-xs font-black text-[var(--color-primary)]">{room.status}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm opacity-70">
                  <MapPin size={16} />
                  {room.view}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-lg font-black">{room.price}đ</p>
                  <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]">
                    <CalendarCheck size={16} />
                    Đặt phòng
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

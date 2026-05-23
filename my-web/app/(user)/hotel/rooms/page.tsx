"use client";

import Link from "next/link";
import { BedDouble, CalendarCheck, Filter, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Select from "@/components/ui/select";
import { getPublicRooms, PublicRoom } from "@/lib/hotel-storage";
import { formatVND } from '@/lib/format';

const roomImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1591088398332-8a7791972843?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
];

export default function HotelRoomsPage() {
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const timeout = window.setTimeout(() => setRooms(getPublicRooms()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const filteredRooms = useMemo(() => {
    if (statusFilter === "all") return rooms;
    return rooms.filter((room) => room.status === statusFilter);
  }, [rooms, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--color-primary)]">Room collection</p>
          <h1 className="mt-3 text-4xl font-black">Thông tin phòng</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 opacity-70">
            Danh sách phòng được đồng bộ từ trang quản lý. Người dùng có thể chọn phòng và gửi yêu cầu đặt phòng để quản lý xác nhận.
          </p>
        </div>

        <div className="neo-input flex items-center gap-3 px-4 py-3 rounded-2xl">
          <Filter size={18} className="opacity-60" />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-48 text-sm font-bold"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "Sẵn sàng", label: "Sẵn sàng" },
              { value: "Đang phục vụ", label: "Đang phục vụ" },
              { value: "Đang dọn", label: "Đang dọn" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredRooms.map((room, index) => (
          <article key={room.id} className="neo-surface overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
              <img src={roomImages[index % roomImages.length]} alt={room.type} className="h-64 w-full object-cover md:h-full" />
              <div className="flex flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)]">Phòng {room.id}</p>
                    <h2 className="mt-2 text-2xl font-black">{room.type}</h2>
                  </div>
                  <span className={`rounded-xl px-3 py-1.5 text-xs font-black ${
                    room.status === "Sẵn sàng" ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-600"
                  }`}>
                    {room.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="neo-pressed flex items-center gap-2 p-3">
                    <Users size={17} className="text-[var(--color-primary)]" />
                    Tối đa {room.maxGuests} khách
                  </div>
                  <div className="neo-pressed flex items-center gap-2 p-3">
                    <BedDouble size={17} className="text-[var(--color-primary)]" />
                    View {room.view}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-50">Giá mỗi đêm</p>
                    <p className="mt-1 text-2xl font-black">{formatVND(room.price)}đ</p>
                  </div>
                  <Link href={`/hotel/rooms/${room.id}`} className="neo-button-primary flex items-center gap-2 px-5 py-3 text-sm">
                    <CalendarCheck size={18} />
                    Đặt phòng
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

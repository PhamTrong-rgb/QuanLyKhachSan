"use client";

import Link from "next/link";
import { CalendarCheck, CheckCircle2, DoorOpen, Phone, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Select from "@/components/ui/select";
import { useHotel } from "@/app/contexts/HotelContext";
import { getPublicRooms } from '@/lib/hotel-storage';
import { formatVND } from '@/lib/format';

export default function HotelBookingPage() {
  const { rooms, addBooking, bookings } = useHotel();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    guest: "",
    phone: "",
    room: "101",
    checkIn: "",
    checkOut: "",
    description: "",
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const urlRoom = new URLSearchParams(window.location.search).get("room");
      const publicRooms = getPublicRooms();
      const sourceRooms = (rooms && rooms.length > 0) ? rooms : publicRooms;

      // prefer URL param if it exists and matches an available room id
      const selectedRoom = urlRoom && sourceRooms.find(r => r.id === urlRoom) ? urlRoom : (sourceRooms[0]?.id || "101");

      setFormData((prev) => ({
        ...prev,
        guest: localStorage.getItem("userName") || "",
        room: selectedRoom,
      }));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [rooms]);

  const combinedRooms = (rooms && rooms.length > 0) ? rooms : getPublicRooms();

  const selectedRoom = useMemo(
    () => combinedRooms.find((room) => room.id === formData.room),
    [combinedRooms, formData.room],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const bookingId = `WEB-${String(bookings.length + 1).padStart(4, "0")}`;
    const booking = {
      id: bookingId,
      guest: formData.guest.trim(),
      phone: formData.phone.trim(),
      room: formData.room,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      status: "Chờ quản lý xác nhận",
      description: formData.description || "Đặt phòng từ trang người dùng",
    };

    addBooking(booking);

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-3xl items-center px-5 py-12">
        <div className="neo-surface w-full p-8 text-center">
          <div className="neo-pressed mx-auto mb-6 flex h-16 w-16 items-center justify-center text-[var(--color-success)]">
            <CheckCircle2 size={34} />
          </div>
          <h1 className="text-3xl font-black">Đã gửi yêu cầu đặt phòng</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 opacity-70">
            Thông tin đặt phòng đã được chuyển tới trang quản lý. Quản lý khách sạn sẽ kiểm tra và xác nhận trạng thái đặt phòng trong hệ thống admin.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/hotel" className="neo-button px-5 py-3 text-sm">Về trang chủ</Link>
            <Link href="/hotel/rooms" className="neo-button-primary px-5 py-3 text-sm">Xem thêm phòng</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 lg:grid-cols-[1fr_420px]">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--color-primary)]">Booking request</p>
        <h1 className="mt-3 text-4xl font-black">Đặt phòng</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-70">
          Gửi thông tin đặt phòng để bộ phận quản lý xác nhận. Trạng thái ban đầu sẽ là chờ quản lý xác nhận.
        </p>

        <form onSubmit={handleSubmit} className="neo-surface mt-8 grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-black">Họ và tên</label>
            <div className="neo-input flex items-center gap-3">
              <UserRound size={18} className="opacity-50" />
              <input
                required
                value={formData.guest}
                onChange={(event) => setFormData({ ...formData, guest: event.target.value })}
                className="w-full bg-transparent text-sm font-bold outline-none"
                placeholder="Nguyễn Văn A"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">Số điện thoại</label>
            <div className="neo-input flex items-center gap-3">
              <Phone size={18} className="opacity-50" />
              <input
                required
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                className="w-full bg-transparent text-sm font-bold outline-none"
                placeholder="0901234567"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">Phòng</label>
            <div className="neo-input flex items-center gap-3">
              <DoorOpen size={18} className="opacity-50" />
              <Select
                value={formData.room}
                onChange={(value) => setFormData({ ...formData, room: value })}
                className="w-full text-sm font-bold"
                options={combinedRooms.map((room) => ({
                  value: room.id,
                  label: `Phòng ${room.id} - ${room.type}`,
                }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">Ghi chú</label>
            <input
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              className="neo-input w-full text-sm font-bold"
              placeholder="Yêu cầu thêm nếu có"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">Ngày check-in</label>
            <input
              required
              type="date"
              value={formData.checkIn}
              onChange={(event) => setFormData({ ...formData, checkIn: event.target.value })}
              className="neo-input w-full text-sm font-bold"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">Ngày check-out</label>
            <input
              required
              type="date"
              value={formData.checkOut}
              onChange={(event) => setFormData({ ...formData, checkOut: event.target.value })}
              className="neo-input w-full text-sm font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="neo-button-primary flex w-full items-center justify-center gap-2 px-6 py-4 text-sm uppercase tracking-widest">
              <CalendarCheck size={18} />
              Xác nhận đặt phòng
            </button>
          </div>
        </form>
      </section>

      <aside className="neo-surface h-max overflow-hidden">
        <div className="h-56">
          <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80" alt="Phòng khách sạn" className="h-full w-full object-cover" />
        </div>
        <div className="p-6">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)]">Phòng đang chọn</p>
          <h2 className="mt-2 text-2xl font-black">
            {selectedRoom ? `Phòng ${selectedRoom.id} - ${selectedRoom.type}` : "Chọn phòng"}
          </h2>
          {selectedRoom && (
            <div className="mt-5 space-y-3 text-sm font-bold">
              <div className="neo-pressed flex justify-between p-3">
                <span>Trạng thái</span>
                <span className="text-[var(--color-primary)]">{selectedRoom.status}</span>
              </div>
              <div className="neo-pressed flex justify-between p-3">
                <span>Sức chứa</span>
                <span>{selectedRoom.maxGuests} khách</span>
              </div>
              <div className="neo-pressed flex justify-between p-3">
                <span>Giá mỗi đêm</span>
                <span>{formatVND(selectedRoom.price)}đ</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

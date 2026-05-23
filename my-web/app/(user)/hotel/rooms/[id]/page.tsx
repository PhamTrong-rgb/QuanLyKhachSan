import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicRooms } from "@/lib/hotel-storage";
import { formatVND } from '@/lib/format';

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const rooms = getPublicRooms();
  const room = rooms.find(r => r.id === params.id);
  if (!room) return notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="neo-surface overflow-hidden">
          <img src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`} alt={room.type} className="w-full h-96 object-cover" />
        </div>
        <div className="p-6 neo-surface">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)]">Phòng {room.id}</p>
          <h1 className="mt-2 text-3xl font-black">{room.type}</h1>
          <p className="mt-3 text-sm opacity-70">Hướng: {room.view}</p>

          <div className="mt-6 space-y-3">
            <div className="neo-pressed flex justify-between p-3">
              <span>Trạng thái</span>
              <span className={`font-bold ${room.status === 'Sẵn sàng' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>{room.status}</span>
            </div>
            <div className="neo-pressed flex justify-between p-3">
              <span>Sức chứa</span>
              <span className="font-bold">{room.maxGuests} khách</span>
            </div>
            <div className="neo-pressed flex justify-between p-3">
              <span>Giá mỗi đêm</span>
              <span className="font-bold">{formatVND(room.price)}đ</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href={`/hotel/book?room=${room.id}`} className="neo-button-primary px-5 py-3 rounded-xl">Đặt phòng</Link>
            <Link href="/hotel/rooms" className="neo-button px-5 py-3 rounded-xl">Quay lại</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rooms = await prisma.rooms.findMany();
    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

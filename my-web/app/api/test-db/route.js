import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Thử kết nối và đếm số lượng Users hoặc lấy 1 record bất kỳ
    await prisma.$connect();
    
    // Tuỳ chọn: bạn có thể query thử 1 bảng
    const roomsCount = await prisma.rooms.count();

    return NextResponse.json({
      success: true,
      message: 'Kết nối đến SQL Server thành công bằng Prisma!',
      roomsCount
    });
  } catch (error) {
    console.error('Lỗi kết nối CSDL:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi kết nối đến SQL Server.',
        error: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT COUNT(*) as usersCount FROM Users");

    return NextResponse.json({
      success: true,
      message: 'Kết nối bằng mssql thành công!',
      data: result.recordset
    });
  } catch (error) {
    console.error('Lỗi API test-mssql:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi kết nối bằng mssql',
        error: error.message
      },
      { status: 500 }
    );
  }
}

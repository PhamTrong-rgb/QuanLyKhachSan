import sql from 'mssql/msnodesqlv8';

export async function connectDB() {
    try {
        const config = {
            connectionString: process.env.DB_CONNECTION_STRING
        };
        // Kết nối đến SQL Server
        let pool = await sql.connect(config);
        console.log("👉 Kết nối SQL Server thành công bằng mssql!");
        return pool;
    } catch (error) {
        console.error("❌ Lỗi kết nối database (mssql):", error);
        throw error;
    }
}
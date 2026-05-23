const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: "Driver={ODBC Driver 18 for SQL Server};Server=THANHNAM\\MSSQLSERVER02;Database=Hotel Management;Trusted_Connection=yes;TrustServerCertificate=yes;"
};

async function test() {
  try {
    const pool = await sql.connect(config);
    console.log("MSSQL connected successfully!");
    const result = await pool.request().query("SELECT 1 as number");
    console.log(result.recordset);
    pool.close();
  } catch (err) {
    console.error("MSSQL error:", err);
  }
}

test();

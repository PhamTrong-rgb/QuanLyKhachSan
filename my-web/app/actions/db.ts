"use server";
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

async function readDB() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Lỗi đọc db.json:", error);
    return { rooms: [], guests: [], employees: [], bookings: [], transactions: [], invoices: [], requests: [] };
  }
}

async function writeDB(data: any) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Lỗi ghi db.json:", error);
    return false;
  }
}

export async function getDBData() {
  const data = await readDB();
  return {
    rooms: data.rooms || [],
    guests: data.guests || [],
    employees: data.employees || [],
    bookings: data.bookings || [],
    transactions: data.transactions || [],
    invoices: data.invoices || [],
    requests: data.requests || []
  };
}

export async function saveDBData(newData: any) {
  return await writeDB(newData);
}

export async function savePartialData(key: string, value: any) {
  const db = await readDB();
  db[key] = value;
  return await writeDB(db);
}

export async function modifyDBData(modelName: string, action: 'add' | 'update' | 'delete', data: any) {
  try {
    const db = await readDB();
    if (!db[modelName]) {
      db[modelName] = [];
    }

    if (action === 'add') {
      db[modelName] = [data, ...db[modelName]];
    } else if (action === 'update') {
      db[modelName] = db[modelName].map((item: any) => item.id === data.id ? data : item);
    } else if (action === 'delete') {
      db[modelName] = db[modelName].filter((item: any) => item.id !== data);
    }

    await writeDB(db);
    return { success: true };
  } catch (error) {
    console.error(`Lỗi khi ${action} dữ liệu ${modelName}:`, error);
    return { success: false, error: String(error) };
  }
}

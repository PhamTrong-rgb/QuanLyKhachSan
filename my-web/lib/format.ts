export function formatVND(value: number | string | undefined | null) {
  if (value === undefined || value === null) return '0';
  if (typeof value === 'number') return value.toLocaleString('vi-VN');
  // Remove any non-digit characters (commas, dots, spaces, currency symbols)
  const cleaned = String(value).replace(/[^0-9]/g, '');
  const num = parseInt(cleaned || '0', 10);
  return num.toLocaleString('vi-VN');
}

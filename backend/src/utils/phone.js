// Dipakai di mana-mana yang berurusan sama nomor HP: login, ganti nomor, import Excel.
// Biar "08123456789", "8123456789", dan "628123456789" semua dianggap nomor yang sama.
export function normalizePhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/[^0-9]/g, '');
  if (!digits) return null;
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  if (!digits.startsWith('62')) digits = '62' + digits;
  return digits.length >= 10 ? digits : null;
}

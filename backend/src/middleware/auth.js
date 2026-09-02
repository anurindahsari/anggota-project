import jwt from 'jsonwebtoken';

// Menempel di route yang butuh login. Ambil token dari header Authorization: Bearer <token>
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Belum login, token tidak ditemukan.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.ownerId = payload.ownerId; // dipakai di controller buat tau siapa yang request
    req.ownerRole = payload.role;  // dipakai requireAdmin buat cek akses
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesi habis atau token tidak valid. Silakan login ulang.' });
  }
}

// Menempel di route khusus admin/pengurus
export function requireAdmin(req, res, next) {
  if (req.ownerRole !== 'admin' && req.ownerRole !== 'treasurer') {
    return res.status(403).json({ error: 'Kamu tidak punya akses ke halaman ini.' });
  }
  next();
}

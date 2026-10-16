const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const rateLimit = require('express-rate-limit');
const { Certificate, Message, CATEGORIES, BADGES } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { wrap } = require('../middleware/errors');
const store = require('../store');

const router = express.Router();
const UPLOADS = path.join(__dirname, '..', '..', 'uploads');

router.use(rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Slow down.' } }));
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many login attempts. Try again in 15 minutes.' } });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)
      ? cb(null, true)
      : cb(Object.assign(new Error('Upload a PNG, JPEG or WebP image.'), { status: 400 }))
});

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'certificate';
const asBool = (v) => v === true || v === 'true' || v === 'on' || v === '1';
const str = (v, max) => String(v ?? '').trim().slice(0, max);

router.post('/login', loginLimiter, requireAdmin, (req, res) => res.json({ ok: true }));

router.get('/certificates', requireAdmin, wrap(async (req, res) => {
  const items = await Certificate.find().sort({ order: 1 }).lean();
  res.json(items.map((c) => ({ ...c, _id: String(c._id) })));
}));

router.post('/certificates', requireAdmin, upload.single('image'), wrap(async (req, res) => {
  const b = req.body || {};
  const title = str(b.title, 160);
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  if (!CATEGORIES.includes(b.category)) return res.status(400).json({ error: `Category must be one of: ${CATEGORIES.join(', ')}.` });
  const badge = b.badge || 'Participant';
  if (!BADGES.includes(badge)) return res.status(400).json({ error: `Badge must be one of: ${BADGES.join(', ')}.` });

  const slug = `${slugify(title)}-${Date.now().toString(36)}`;
  let image = null;
  let thumb = null;
  if (req.file) {
    await fs.mkdir(path.join(UPLOADS, 'full'), { recursive: true });
    await fs.mkdir(path.join(UPLOADS, 'thumb'), { recursive: true });
    const base = sharp(req.file.buffer).rotate();
    await base.clone().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(UPLOADS, 'full', `${slug}.webp`));
    await base.clone().resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toFile(path.join(UPLOADS, 'thumb', `${slug}.webp`));
    image = `/uploads/full/${slug}.webp`;
    thumb = `/uploads/thumb/${slug}.webp`;
  }

  const last = await Certificate.findOne().sort({ order: -1 }).select('order').lean();
  const doc = await Certificate.create({
    slug, title, image, thumb,
    issuer: str(b.issuer, 200),
    category: b.category,
    badge,
    date: str(b.date, 60),
    featured: asBool(b.featured),
    prize: str(b.prize, 120) || null,
    description: str(b.description, 600),
    order: (last?.order ?? -1) + 1
  });
  res.status(201).json(store.toPublic(doc.toObject()));
}));

router.patch('/certificates/:id', requireAdmin, express.json({ limit: '10kb' }), wrap(async (req, res) => {
  const b = req.body || {};
  const update = {};
  for (const key of ['title', 'issuer', 'date', 'prize', 'description']) if (key in b) update[key] = str(b[key], key === 'description' ? 600 : 200);
  if ('featured' in b) update.featured = asBool(b.featured);
  if ('category' in b) {
    if (!CATEGORIES.includes(b.category)) return res.status(400).json({ error: 'Unknown category.' });
    update.category = b.category;
  }
  if ('badge' in b) {
    if (!BADGES.includes(b.badge)) return res.status(400).json({ error: 'Unknown badge.' });
    update.badge = b.badge;
  }
  const doc = await Certificate.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
  if (!doc) return res.status(404).json({ error: 'Certificate not found.' });
  res.json(store.toPublic(doc));
}));

router.delete('/certificates/:id', requireAdmin, wrap(async (req, res) => {
  const doc = await Certificate.findByIdAndDelete(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: 'Certificate not found.' });
  for (const [kind, url] of [['full', doc.image], ['thumb', doc.thumb]]) {
    if (url && url.startsWith('/uploads/')) await fs.rm(path.join(UPLOADS, kind, path.basename(url)), { force: true });
  }
  res.json({ ok: true });
}));

router.get('/messages', requireAdmin, wrap(async (req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }).limit(100).lean());
}));

module.exports = router;

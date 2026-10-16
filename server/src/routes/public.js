const express = require('express');
const rateLimit = require('express-rate-limit');
const store = require('../store');
const { CATEGORIES } = require('../models');
const { wrap } = require('../middleware/errors');

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true, db: store.isDbReady() ? 'mongodb' : 'file-mode' }));

router.get('/certificates', wrap(async (req, res) => {
  const { category, featured } = req.query;
  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Unknown category. Use one of: ${CATEGORIES.join(', ')}.` });
  }
  res.json(await store.listCertificates({ category, featured: featured === 'true' }));
}));

router.get('/projects', wrap(async (req, res) => res.json(await store.listProjects())));
router.get('/experience', wrap(async (req, res) => res.json(await store.listExperience())));

// Contact form
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (value, max, multiline = false) => {
  const pattern = multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g;
  return String(value ?? '').replace(pattern, ' ').trim().slice(0, max);
};

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages from this connection. Try again in 15 minutes.' }
});

router.post('/contact', contactLimiter, wrap(async (req, res) => {
  const body = req.body || {};
  if (body.website) return res.json({ ok: true }); // honeypot field: real visitors never see or fill it

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const message = clean(body.message, 2000, true);

  const fields = {};
  if (name.length < 2) fields.name = 'Enter your name (at least 2 characters).';
  if (!EMAIL.test(email)) fields.email = 'Enter a valid email address.';
  if (message.length < 10) fields.message = 'Write at least 10 characters.';
  if (Object.keys(fields).length) return res.status(400).json({ error: 'Fix the highlighted fields.', fields });

  await store.saveMessage({ name, email, message });
  res.json({ ok: true });
}));

module.exports = router;

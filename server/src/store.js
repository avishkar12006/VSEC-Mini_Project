// Data access for the public site.
// With MongoDB connected it reads from the database. Without it, it falls back to the
// seed files in /data so the portfolio still works as a read-only site.
const fs = require('fs/promises');
const path = require('path');
const { Certificate, Project, Experience, Message } = require('./models');

const DATA_DIR = path.join(__dirname, '..', 'data');
let dbReady = false;

const setDbReady = (v) => { dbReady = Boolean(v); };
const isDbReady = () => dbReady;

const readJson = async (file) => JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf8'));

// The "note" field is a private to-do for the owner. Never expose it publicly.
const toPublic = (doc) => {
  const { note, __v, createdAt, updatedAt, ...rest } = doc;
  return { ...rest, _id: doc._id ? String(doc._id) : undefined };
};
const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

async function listCertificates({ category, featured } = {}) {
  let items;
  if (dbReady) {
    const filter = {};
    if (category) filter.category = category;
    if (featured) filter.featured = true;
    items = await Certificate.find(filter).sort({ order: 1 }).lean();
  } else {
    items = (await readJson('certificates.seed.json')).filter(
      (c) => (!category || c.category === category) && (!featured || c.featured)
    );
    items.sort(byOrder);
  }
  return items.map(toPublic);
}

async function listProjects() {
  const items = dbReady
    ? await Project.find().sort({ order: 1 }).lean()
    : (await readJson('projects.json')).sort(byOrder);
  return items.map(toPublic);
}

async function listExperience() {
  const items = dbReady
    ? await Experience.find().sort({ order: 1 }).lean()
    : (await readJson('experience.json')).sort(byOrder);
  return items.map(toPublic);
}

async function saveMessage({ name, email, message }) {
  if (dbReady) {
    await Message.create({ name, email, message });
    return;
  }
  const line = JSON.stringify({ name, email, message, createdAt: new Date().toISOString() });
  await fs.appendFile(path.join(DATA_DIR, 'messages.jsonl'), line + '\n', 'utf8');
}

module.exports = {
  setDbReady, isDbReady, readJson, toPublic,
  listCertificates, listProjects, listExperience, saveMessage
};

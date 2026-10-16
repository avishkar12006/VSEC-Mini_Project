// Loads the certificates, projects and experience from /data into MongoDB.
// Safe to run again: entries are matched by slug and updated. Anything you add from /admin is left alone.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { Certificate, Project, Experience } = require('./models');
const { readJson } = require('./store');

async function upsertAll(Model, items) {
  if (!items.length) return 0;
  const ops = items.map((item) => {
    const { _id, ...doc } = item;
    return { replaceOne: { filter: { slug: doc.slug }, replacement: doc, upsert: true } };
  });
  const res = await Model.bulkWrite(ops);
  return res.upsertedCount + res.modifiedCount;
}

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in server/.env first.');
    process.exit(1);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
  const certs = await upsertAll(Certificate, await readJson('certificates.seed.json'));
  const projects = await upsertAll(Project, await readJson('projects.json'));
  const experience = await upsertAll(Experience, await readJson('experience.json'));
  console.log(`Seeded: ${certs} certificates, ${projects} projects, ${experience} experience entries.`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

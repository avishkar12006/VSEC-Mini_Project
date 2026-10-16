const mongoose = require('mongoose');
const store = require('./store');

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI is not set. Running in read-only file mode.');
    return false;
  }
  mongoose.connection.on('connected', () => store.setDbReady(true));
  mongoose.connection.on('disconnected', () => store.setDbReady(false));
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('[db] Connected to MongoDB.');
    return true;
  } catch (err) {
    console.warn(`[db] Could not connect (${err.message}). Falling back to read-only file mode.`);
    return false;
  }
}

module.exports = { connectDb };

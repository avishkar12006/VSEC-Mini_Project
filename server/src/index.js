require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { connectDb } = require('./db');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const { notFoundApi, errorHandler } = require('./middleware/errors');

const app = express();
const PORT = Number(process.env.PORT) || 5050;
const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist');

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: null
    }
  }
}));
if (process.env.CLIENT_ORIGIN) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim()) }));
}
app.use(compression());
app.use(express.json({ limit: '20kb' }));

app.use('/achievements', express.static(path.join(__dirname, '..', 'public', 'achievements'), { maxAge: '7d' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), { maxAge: '1d' }));

app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use('/api', notFoundApi);

// In production the Express server also serves the built React app.
if (fs.existsSync(path.join(CLIENT_DIST, 'index.html'))) {
  app.use(express.static(CLIENT_DIST, { maxAge: '1h', index: false }));
  app.get('*', (req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

app.use(errorHandler);

connectDb().then(() => {
  app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));
});

module.exports = app;

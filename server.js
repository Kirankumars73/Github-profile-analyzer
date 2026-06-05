'use strict';

require('dotenv').config();
const app = require('./src/app');

const PORT = parseInt(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`🚀  GitHub Profile Analyzer running on http://localhost:${PORT}`);
  console.log(`    Health: http://localhost:${PORT}/api/health`);
});

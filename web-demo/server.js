const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the PNG Hit Map library from node_modules
app.use('/dist', express.static(path.join(__dirname, 'node_modules', 'png-hit-map', 'dist')));

// Redirect root to index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`PNG Hit Map Demo running at http://localhost:${PORT}`);
  console.log(`- Create page: http://localhost:${PORT}/create.html`);
  console.log(`- Verify page: http://localhost:${PORT}/verify.html`);
}); 
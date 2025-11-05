const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Afri GoS Backend is running!' });
});

app.listen(3002, () => {
  console.log('🚀 Test server running on port 3002');
});




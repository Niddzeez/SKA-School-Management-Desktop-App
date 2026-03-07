const http = require('http');
http.get('http://localhost:4000/health', (res) => {
  res.on('data', (d) => process.stdout.write(d));
});

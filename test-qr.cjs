const http = require('http');
const data = JSON.stringify({ email: "ivanhutabarat94@gmail.com", password: "geoai-pro-bypass" });
const req = http.request('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log("Login response:", body));
});
req.write(data);
req.end();

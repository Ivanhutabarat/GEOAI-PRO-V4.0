const http = require('http');
http.get('http://localhost:3000/api/health', (res) => {
  console.log(res.statusCode);
});

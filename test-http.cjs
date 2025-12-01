// Teste do http client
const https = require('https');

console.log('Testando https.get...');

https.get('https://api.llama.fi/protocols', {
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json'
  },
  timeout: 15000
}, (res) => {
  console.log('Status:', res.statusCode);

  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Success! Protocols:', parsed.length);
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
}).on('timeout', () => {
  console.error('Request timeout!');
});

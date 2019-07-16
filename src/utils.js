const zlib = require('zlib');
const request = require('request-promise').defaults({
  pool: { maxSockets: Infinity }
});

const { randomUserAgent } = require('./user-agents');

const fetch = url => request({
  url,
  agent: false,
  headers: {
    authority: 'www.amazon.com',
    pragma: 'no-cache',
    'cache-control': 'no-cache',
    'upgrade-insecure-requests': '1',
    'user-agent': randomUserAgent(),
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,bn;q=0.8,eo;q=0.7,fr;q=0.6',
  },
  gzip: true,
  timeout: 30000
});

const compress = text => new Promise((resolve, reject) => zlib.deflate(text, (err, buffer) => err ? reject(err) : resolve(buffer)));
const decompress = buffer => new Promise((resolve, reject) => zlib.unzip(buffer, (err, res) => err ? reject(err) : resolve(res.toString())));

module.exports = { fetch, compress, decompress };

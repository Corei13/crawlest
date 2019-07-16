const Bee = require('bee-queue');
const arena = require('bull-arena');

const { REDIS_HOST, HOSTNAME } = require('./config');

const redis = { host: REDIS_HOST };

const Fetch = new Bee('fetch', { redis });
const Parse = new Bee('parse', { redis });

const Arena = arena({
  queues: [
    { hostId: HOSTNAME, name: 'fetch', type: 'bee', redis },
    { hostId: HOSTNAME, name: 'parse', type: 'bee', redis },
  ],
}, { disableListen: true, basePath: '/' });


module.exports = { Fetch, Parse, Arena };

const express = require('express');
const bodyParser = require('body-parser');

const { Fetch, Parse, Arena } = require('./queue');
const { PORT, RETHINK_TABLE_PAGE } = require('./config');

const start = ({ R }) => new Promise(resolve => {
  const server = express();

  const router = express.Router();
  router.use('/', Arena);

  server.use('/arena', router);

  server.use(bodyParser.json({ limit: '200mb' }));

  server.use((req, res, next) => {
    req.requestTime = Date.now();
    next();
  });

  server.post('/fetch', async (req, res, next) => {
    const { body } = req;
    try {
      const data = await Promise.all(body.map(
        ({ id, url, timeout = 30000, retries = 3 }) =>
          Fetch.createJob({ id, url }).setId(id).timeout(timeout).retries(retries).save()
      ));
      res.status(200).send(data);
      next();
    } catch (err) {
      next(err);
    }
  });

  server.get('/health', async (req, res, next) => {
    const [fetch, parse] = await Promise.all([Fetch.checkHealth(), Parse.checkHealth()]);
    res.status(200).send({ fetch, parse });
    next();
  });

  server.get('/page/:id', async (req, res, next) => {
    try {
      const page = await R.get(RETHINK_TABLE_PAGE, req.params.id);
      res.status(200).type('text/html').send(page);
      next();
    } catch (err) {
      next(err);
    }
  });

  server.use((err, req, res, next) => {
    res.status(500).send({ error: err.message });
    console.error(req.originalUrl, err.stack);
    next();
  });

  server.use((req, res, next) => {
    if (!res.headersSent) {
      res.status(404).send({ found: false });
    } else {
      next();
    }
  });

  server.use(({ requestTime, method, originalUrl }, res) => {
    const elapsed = (Date.now() - requestTime) / 1000;
    console.log(method, originalUrl, res.statusCode, elapsed.toFixed(2));
  });


  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}!`);
    resolve();
  });
});


module.exports = { start };

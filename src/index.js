process.env.UV_THREADPOOL_SIZE = 1024;

const { Fetch } = require('./queue');
const Server = require('./server');
const Rethink = require('./rethink');
const { fetch } = require('./utils');
const { FETCH_CONCURRENCY, RETHINK_TABLE_PAGE } = require('./config');

Rethink.initialize().then(R => {
  Server.start({ R });

  Fetch.process(FETCH_CONCURRENCY, async ({ id: jobId, data: { id = jobId, url } }) => {
    console.log(`Processing job ${jobId}`);
    const start = Date.now();
    try {
      const data = await fetch(url);
      const elapsed = (Date.now() - start) / 1000;
      console.log(`Fetched ${url} in ${elapsed.toFixed(2)}, size: ${data.length}. Saving...`);
      const res = await R.save({ table: RETHINK_TABLE_PAGE, id, data });
      if (res.errors) {
        throw new Error(res.first_error.slice(0, 128));
      }
      console.log('Saved', JSON.stringify(res));
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});

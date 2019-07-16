const config = {
  REDIS_HOST: 'localhost',
  RETHINK_HOST: 'localhost',
  RETHINK_DB: 'data',
  RETHINK_TABLE_PAGE: 'page_v1',
  RETHINK_TABLE_JSON: 'json_v1',
  FETCH_CONCURRENCY: 10,
  HOSTNAME: 'localhost',
  PORT: 3031,
  ...process.env
};

module.exports = config;

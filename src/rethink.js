const R = require('rethinkdb');
const { compress, decompress } = require('./utils');
const { RETHINK_HOST, RETHINK_DB, RETHINK_TABLE_PAGE, RETHINK_TABLE_JSON } = require('./config');

const initialize = async () => {
  const run = await new Promise((resolve, reject) =>
    R.connect({ host: RETHINK_HOST, port: 28015 }, (err, conn) =>
      err
        ? reject(err)
        : resolve(Q => new Promise((resolve, reject) => Q.run(conn, (err, res) => err ? reject(err) : resolve(res))))
    )
  );

  const checkIfExists = err => {
    if (!err.message.includes('already exists')) {
      throw err;
    }
  };

  await run(R.dbCreate(RETHINK_DB)).catch(checkIfExists);
  await run(R.db(RETHINK_DB).tableCreate(RETHINK_TABLE_PAGE)).catch(checkIfExists);
  await run(R.db(RETHINK_DB).tableCreate(RETHINK_TABLE_JSON)).catch(checkIfExists);

  const get = async (table, id) => {
    const { blob } = await run(R.db(RETHINK_DB).table(table).get(id).pluck('blob'));
    return decompress(blob);
  }

  const save = async ({ table, id, data }) => {
    const buff = await compress(data);
    return run(
      R.db(RETHINK_DB)
        .table(table)
        .insert([
          { id, blob: buff, length: data.length, clength: buff.length }
        ])
    );
  };

  return { get, save };
};

module.exports = { initialize };

const { MongoClient } = require('mongodb');
const host = 'ac-kevtq3p-shard-00-00.riernht.mongodb.net:27017';
const uri = `mongodb://user1:hdbfakuejaw@${host}/food_wastage_prevention?ssl=true&authSource=admin&directConnection=true&retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
});

(async () => {
  try {
    await client.connect();
    const res = await client.db().command({ ping: 1 });
    console.log('OK', res);
  } catch (err) {
    console.error('ERR', err);
  } finally {
    await client.close();
  }
})();

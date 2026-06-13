const { MongoClient } = require('mongodb');
const uri = 'mongodb://user1:hdbfakuejaw@ac-kevtq3p-shard-00-00.riernht.mongodb.net:27017,ac-kevtq3p-shard-00-01.riernht.mongodb.net:27017,ac-kevtq3p-shard-00-02.riernht.mongodb.net:27017/food_wastage_prevention?ssl=true&replicaSet=atlas-mzzdft-shard-0&authSource=admin&retryWrites=true&w=majority';

(async () => {
  for (const tlsInsecure of [false, true]) {
    const opts = { tlsInsecure, serverSelectionTimeoutMS: 10000 };
    const client = new MongoClient(uri, opts);
    try {
      await client.connect();
      console.log('CONNECTED tlsInsecure=', tlsInsecure);
      await client.db('admin').command({ ping: 1 });
    } catch (err) {
      console.error('ERROR tlsInsecure=', tlsInsecure, err.message);
      if (err.stack) console.error(err.stack);
    } finally {
      try { await client.close(); } catch (_) {}
    }
  }
})();

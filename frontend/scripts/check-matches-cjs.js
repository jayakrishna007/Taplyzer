const mongoose = require("mongoose");

async function run() {
  await mongoose.connect("mongodb://Tapadmin:tap123@ac-tmaogxb-shard-00-00.i0sga0f.mongodb.net:27017,ac-tmaogxb-shard-00-01.i0sga0f.mongodb.net:27017,ac-tmaogxb-shard-00-02.i0sga0f.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-gughnq-shard-0&appName=Cluster0");
  const matches = await mongoose.connection.collection("matchrecords").find({}).sort({ generatedAt: -1 }).limit(10).toArray();
  console.log("Recent matches:", matches.length);
  matches.forEach(m => {
     console.log(`User: ${m.userId}, MatchedUser: ${m.matchedUserId}, Needs: ${m.needs}, Offers: ${m.offerings}, Version: ${m.cacheVersion}, Generated: ${m.generatedAt}`);
  });
  process.exit(0);
}

run();

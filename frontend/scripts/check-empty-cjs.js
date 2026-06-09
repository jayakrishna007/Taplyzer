const mongoose = require("mongoose");

async function run() {
  await mongoose.connect("mongodb://Tapadmin:tap123@ac-tmaogxb-shard-00-00.i0sga0f.mongodb.net:27017,ac-tmaogxb-shard-00-01.i0sga0f.mongodb.net:27017,ac-tmaogxb-shard-00-02.i0sga0f.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-gughnq-shard-0&appName=Cluster0");
  const businesses = await mongoose.connection.collection("businesses").find({}).toArray();
  console.log("Total Businesses:", businesses.length);
  const empty = businesses.filter(b => (!b.offerings || b.offerings.length === 0) || (!b.needs || b.needs.length === 0));
  console.log("Empty or partially empty profiles:", empty.length);
  if(empty.length > 0) {
    console.log("Example empty profile:", empty[0].ownerName, empty[0].offerings, empty[0].needs);
  }
  process.exit(0);
}

run();

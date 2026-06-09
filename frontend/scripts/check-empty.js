import dbConnect from "../lib/db.js";
import Business from "../models/Business.js";

async function run() {
  await dbConnect();
  const businesses = await Business.find({}).lean();
  console.log("Total Businesses:", businesses.length);
  const empty = businesses.filter(b => (!b.offerings || b.offerings.length === 0) || (!b.needs || b.needs.length === 0));
  console.log("Empty or partially empty profiles:", empty.length);
  if(empty.length > 0) {
    console.log("Example empty profile:", empty[0].ownerName, empty[0].offerings, empty[0].needs);
  }
  process.exit(0);
}

run();

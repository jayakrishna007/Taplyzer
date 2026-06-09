require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkUser() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await mongoose.connection.collection('users').findOne({ email: 'vikram@buildcore.com' });
  console.log("User:", user);
  process.exit(0);
}

checkUser();

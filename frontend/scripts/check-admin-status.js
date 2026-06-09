const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.p718m.mongodb.net/taplyzer?retryWrites=true&w=majority&appName=Cluster0";

async function checkAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await mongoose.connection.db.collection('users').findOne({ email: 'admin@taplyzer.com' });
    console.log('Admin User:', JSON.stringify(user, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin();

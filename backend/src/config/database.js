const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    // Kết nối đến MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Thoát nếu kết nối thất bại
  }
};

module.exports = connectDatabase;
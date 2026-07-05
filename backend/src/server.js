import 'dotenv/config';
import app from './app.js';
import sequelize from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 GAMS backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database.');
    console.error(error);
    process.exit(1); // Stop the application if the database connection fails
  }
}

startServer();

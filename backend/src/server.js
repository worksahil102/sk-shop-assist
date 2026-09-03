const app = require("./app");
const pool = require("./config/database.js");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log("MySql database connected successfully");
    connection.release();

    app.listen(PORT, () => {
      console.log(`sk shop assist Api is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MySQL database connection failed:");
    console.error(error.message);

    process.exit(1);
  }
}

startServer();

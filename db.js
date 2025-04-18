const pg = require(`pg`);
// configure database connection
// Import and configure dotenv to load variables from .env file
require("dotenv").config();

// SQL query to create the table
const createTableQuery = `
DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

//sql query to seed data
const seedDataQuery = `
INSERT INTO flavors (name, is_favorite) VALUES
('Vanilla', true),
('Chocolate', false),
('Strawberry', true),
('Mint Chocolate Chip', false),
('Cookie Dough', true);
`;

// main setup function
const setupDatabase = async () => {
  try {
    await client.connect();
    console.log("Connected to the database");
    await client.query(createTableQuery);
    console.log('Table "flavors" created successfully');
    await client.query(seedDataQuery);
    console.log("Data seeded successfully");
  } catch (err) {
    console.error("Error setting up the database", err);
  } finally {
    await client.end();
    console.log("Database connection closed");
  }
};

//call the setup function
setupDatabase();

//function to create the table
const createTable = async () => {
  try {
    await client.connect();
    await client.query(createTableQuery);
    console.log('Table"flavors" created successfully');
  } catch (err) {
    console.error("Error creating table", err);
  }
};

//function to seed the data
const seedData = async () => {
  try {
    await client.query(seedDataQuery);
    console.log("Data seeded successfully");
  } catch (err) {
    console.error("Error seeding data", err);
  }
};

// module.exports = client;

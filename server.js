const express = require(`express`);
const pg = require(`pg`);

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

require("dotenv").config();

// PUT - Update a flavor by ID
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const flavorId = req.params.id;
    const { name, is_favorite } = req.body;

    if (name === undefined && is_favorite === undefined) {
      return res
        .status(400)
        .send({ message: "Must provide name or is_favorite to update" });
    }
    if (name !== undefined && !name) {
      return res.status(400).send({ message: "Flavor name cannot be empty" });
    }

    const SQL = `
        UPDATE flavors
        SET
          name = COALESCE($1, name), -- Update name only if provided, otherwise keep old value
          is_favorite = COALESCE($2, is_favorite), -- Update is_favorite only if provided
          updated_at = CURRENT_TIMESTAMP -- Always update the timestamp
        WHERE id = $3 -- Specify which flavor to update
        RETURNING *; -- Return the updated flavor object
      `;
    // Execute the query, passing new data and the ID
    const response = await client.query(SQL, [name, is_favorite, flavorId]);

    if (response.rows.length === 0) {
      return res
        .status(404)
        .send({ message: `Flavor with id ${flavorId} not found.` });
    }

    res.send(response.rows[0]);
  } catch (error) {
    console.error(`Error updating flavor with id ${req.params.id}:`, error);
    res
      .status(500)
      .send({ message: "Error updating flavor", error: error.message });
  }
});

//GET all flavors
app.get(`/api/flavors`, async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM flavors ORDER BY created_at DESC`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    console.error("Error fetching flavors", error);
  }
});

// GET a single flavor by ID
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const flavorId = req.params.id;
    const SQL = "SELECT * FROM flavors WHERE id = $1;";
    const response = await client.query(SQL, [flavorId]);

    if (response.rows.length === 0) {
      return res
        .status(404)
        .send({ message: `Flavor with id ${flavorId} not found` });
    }

    res.send(response.rows[0]);
  } catch (error) {
    console.error(`Error fetching flavor with id ${req.params.id}:`, error);
    res
      .status(500)
      .send({ message: "Error fetching flavor", error: error.message });
  }
});

// POST - Create a new flavor
app.post("/api/flavors", async (req, res, next) => {
  try {
    const { name, is_favorite = false } = req.body;

    if (!name) {
      return res.status(400).send({ message: "Flavor name is required" });
    }

    const SQL = `
        INSERT INTO flavors(name, is_favorite)
        VALUES($1, $2)
        RETURNING *;
      `;
    const response = await client.query(SQL, [name, is_favorite]);

    res.status(201).send(response.rows[0]);
  } catch (error) {
    console.error("Error creating flavor:", error);
    res
      .status(500)
      .send({ message: "Error creating flavor", error: error.message });
  }
});

// DELETE a flavor by ID
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const flavorId = req.params.id;

    const SQL = "DELETE FROM flavors WHERE id = $1 RETURNING *;";
    const response = await client.query(SQL, [flavorId]);

    // Check if a row was actually deleted
    if (response.rowCount === 0) {
      return res
        .status(404)
        .send({ message: `Flavor with id ${flavorId} not found.` });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(`Error deleting flavor with id ${req.params.id}:`, error);
    res
      .status(500)
      .send({ message: "Error deleting flavor", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  client
    .connect()
    .then(() => {
      console.log("Connected to the database");
    })
    .catch((err) => {
      console.error("Error connecting to the database", err);
    });
});

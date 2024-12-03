import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Learner from "./models/learner.mjs";

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());

// Connect to Mongoose.
// Note you must specify the database you want to connect to.
// This defaults to the "test" database.
await mongoose.connect(process.env.ATLAS_URI);

// Creating documents follows a syntax similar to classes.
const newDoc = new Learner({
  name: "Frodo",
  enrolled: true,
  year: 2024,
  // Since we do not define a campus, it will resort to our set default.
});

// This saves (inserts) the document to the database.
// We'll disable it here with an anonymous function wrapper
// to prevent duplicates in our example database.
async () => {
  await newDoc.save();
};

app.get("/", async (req, res) => {
  // You can retrieve documents using find methods
  // on their associated models.
  let frodo = await Learner.findOne({ name: "Frodo" });

  // You can also add new fields to a document and save it.
  frodo.avg = 85;
  await frodo.save();

  res.send(frodo);
});

app.get("/passing", async (req, res) => {
  // Here, we use the static function defined on the schema
  // to easily retrieve all learners with passing averages.
  // This also allows us to put business logic in the data model,
  // rather than scattering it about the application.
  let result = await Learner.findPassing();
  res.send(result);
});

app.get("/:id", async (req, res) => {
  // Note that Mongoose automatically type-casts fields.
  // We do not need to wrap the id parameter in ObjectId().
  // That said, we should still catch errors produced by invalid ids.
  try {
    let result = await Learner.findById(req.params.id);
    res.send(result);
  } catch {
    res.send("Invalid ID").status(400);
  }
});

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Seems like we messed up somewhere...");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

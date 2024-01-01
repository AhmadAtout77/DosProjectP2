const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();

app.use(express.json());

// Read data from the JSON file
const rawData = fs.readFileSync("db.json");
let data = JSON.parse(rawData);

// Endpoint for handling item purchase
app.get("/api/purchase/:itemNumber", async (req, res) => {
  const itemNumber = req.params.itemNumber;

  // Check if the item exists and is in stock
  const itemExistResponse = await axios.get(
    `http://172.16.0.20:3333/api/info/${itemNumber}`
  );

  if (!itemExistResponse.data[0].numberInStock) {
    // Send a response if the item is out of stock
    res.send("Item is out of stock");
  } else {
    // Prepare data for updating the number of items in stock on different servers
    const updateData = {
      itemNumber: itemNumber,
    };

    try {
      // Update the number of items in stock on different servers
      const response = await axios.put(
        "http://172.16.0.20:3333/api/updateNumberInStock",
        updateData
      );
      const response2 = await axios.put(
        "http://172.16.0.20:3334/api/updateNumberInStock",
        updateData
      );

      // Generate a new order record
      const newRecord = {
        orderNumber: generateRandom4DigitNumber(),
        itemNumber: itemNumber,
      };

      // Update the order records on a different server
      const response3 = await axios.put(
        "http://172.16.0.20:4445/api/newRecord",
        newRecord
      );

      // Log the new order record
      console.log(newRecord);

      // Update the local data and write it back to the JSON file
      data.push(newRecord);
      fs.writeFileSync("db.json", JSON.stringify(data, null, 2));

      // Send a response indicating a successful purchase
      res.send("The purchase was successfully done");
    } catch (error) {
      // Handle errors during the purchase process
      console.error("Error updating item:", error);
      res.status(500).send(false);
    }
  }
});

// Endpoint for handling new order records
app.put("/api/newRecord", async (req, res) => {
  // Log the new order record received
  console.log(req.body);

  // Update the local data and write it back to the JSON file
  data.push(req.body);
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));

  // Send a response indicating a successful update of the order record
  res.send(true);
});

const port = 4444;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// Function to generate a random 4-digit number
function generateRandom4DigitNumber() {
  const min = 10000;
  const max = 99999;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

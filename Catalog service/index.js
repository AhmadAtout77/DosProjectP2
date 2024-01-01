const express = require("express");
const fs = require("fs");
const axios = require("axios");
const { Console } = require("console");
const app = express();

app.use(express.json());

// Read data from the JSON file
const rawData = fs.readFileSync("db.json");
let data = JSON.parse(rawData);

// Endpoint for searching items by topic
app.get("/api/search/:topic", (req, res) => {
  // Filter items based on the requested topic
  let items = data.filter((item) => item.topic === req.params.topic);

  // Check if items were found, otherwise send a response indicating unavailability
  if (items.length === 0)
    res.send("The book you are searching for is not available");

  // Send the found items in the response
  res.send(items);
});

// Endpoint for retrieving item information by item number
app.get("/api/info/:itemNumber", (req, res) => {
  const itemNumber = parseInt(req.params.itemNumber);

  // Filter items based on the requested item number
  let item = data.filter((item) => item.itemNumber === itemNumber);

  // Check if an item was found, otherwise send a response indicating unavailability
  if (item.length === 0)
    res.send("The book you are searching for is not available");

  // Send the found item in the response
  res.send(item);
});

// Endpoint for updating the number of items in stock
app.put("/api/updateNumberInStock", async (req, res) => {
  // Find the index of the item in the data array
  const index = data.findIndex(
    (item) => item.itemNumber === parseInt(req.body.itemNumber)
  );

  // If the item is found, decrement the numberInStock
  if (index !== -1) {
    data[index]["numberInStock"]--;

    // Write the updated data back to the JSON file
    fs.writeFileSync("db.json", JSON.stringify(data, null, 2));

    // Notify the cache about the updated record by making an HTTP request
    const response = await axios.get(
      `http://172.16.0.20:2222/api/updatedRecord/${req.body.itemNumber}`
    );

    // Send a response indicating a successful update
    res.send(true);
  }
});

const port = 3333;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

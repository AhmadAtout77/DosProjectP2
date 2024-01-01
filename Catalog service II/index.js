const express = require("express");
const fs = require("fs");
const axios = require("axios");
const { Console } = require("console");
const app = express();

app.use(express.json());

const rawData = fs.readFileSync("db.json");
let data = JSON.parse(rawData);

app.get("/api/search/:topic", (req, res) => {
  let items = data.filter((item) => item.topic === req.params.topic);
  if (!items) res.send("the book you are searching for is not available");
  res.send(items);
});

app.get("/api/info/:itemNumber", (req, res) => {
  const itemNumber = parseInt(req.params.itemNumber);
  let item = data.filter((item) => item.itemNumber === itemNumber);
  if (!item) res.send("the book you are searching for is not available");
  res.send(item);
});

app.put("/api/updateNumberInStock", async (req, res) => {
  const index = data.findIndex(
    (item) => item.itemNumber === parseInt(req.body.itemNumber)
  );
  if (index !== -1) {
    data[index]["numberInStock"]--;

    fs.writeFileSync("db.json", JSON.stringify(data, null, 2));

    const response = axios.get(
      `http://172.16.0.20:2222/api/updatedRecord/${req.body.itemNumber}`
    );
    console.log(response);
    res.send(true);
  }
});

const port = 3334;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

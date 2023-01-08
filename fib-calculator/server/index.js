const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

// Redis Client Setup
const redis = require("redis");
const redisClient = redis.createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
const redisPublisher = redisClient.duplicate();
redisClient.connect();
redisPublisher.connect();

// Express route handlers

app.get("/", (req, res) => {
  res.send("Hi");
});

// app.get("/api/values/all", async (req, res) => {
app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");

  res.send(values.rows);
});

// app.get("/api/values/current", async (req, res) => {
app.get("/values/current", async (req, res) => {
  const val = await redisClient.hGetAll("values");
  res.send(val)
});

// app.post("/api/values", async (req, res) => {
app.post("/values", async (req, res) => {
  const index = req.body.index;
  if (isNaN(index)) {
    console.log("Please provide a valid number")
    return res.status(422).send("Please provide a valid number")
  } 

  if (parseInt(index) > 40) {
    console.log("Index too high")
    return res.status(422).send("Index too high");
  }

  await redisClient.hSet("values", index, "Nothing yet!");
  await redisPublisher.publish("insert", index);
  await pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: index });
});

app.listen(5000, (err) => {
  console.log("Listening");
});


// var redisClient = redis.createClient(keys.redisPort, keys.redisHost, 
//   {auth_pass: keys.redisKey, tls: {servername: keys.redisHost}});
// console.log(keys.redisPort)

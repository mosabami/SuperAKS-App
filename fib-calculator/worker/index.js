const keys = require('./keys');
const redis = require('redis');



const redisClient = redis.createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
const sub = redisClient.duplicate();

redisClient.connect()
sub.connect()
function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2) ;
}

sub.subscribe('insert', ( message) => {
  redisClient.hSet('values', message, fib(parseInt(message)));
});
// sub.subscribe('insert');

// this section is used to test out bridge to kubernetes

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  res.send("<h1>hello!</h1>")
});


app.get("/fib", async (req, res) => {
  const index = req.query.index
  if (isNaN(index)) {
    console.log("Please provide a valid number")
    return res.status(422).send("Please provide a valid number")
  } 
  number = parseInt(index)
  if (number > 40) {
    console.log("Index too high")
    return res.status(422).send("Index too high");
  }
  const fibnumber = fib(number)
  await redisClient.hSet("values", number, fibnumber);
    res.send(`<h1>${fibnumber}</h1>`);
    // res.send(`hello`);
});

app.listen(5001, (err) => {
  console.log("Listening on port 5001");
});

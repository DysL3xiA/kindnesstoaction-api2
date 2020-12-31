//Load HTTP module
const http = require("http");
const cors = require('cors')
const hostname = 'localhost';
const port = 3000;

const express = require('express');
const app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

cors({ credentials: true, origin: true });
app.use(cors());

const dotenv = require('dotenv');
dotenv.config();

//database connection (local)
const { Pool } = require('pg');

// postgres database connection
const pool = new Pool({
  host: 'localhost',
  user: 'kindnesstoaction',
  database: 'kindnesstoaction',
  password: 'Il0vezuriandkashii',
  port: 5432,
  // ssl: true,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
});

console.log(process.env.HOSTNAME);
console.log(process.env.USERNAME);
console.log(process.env.DATABASE);
console.log(process.env.PASSWORD);

//listen for request on port 3000, and as a callback function have the port listened on logged
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

app.get("/", function(req, res){
  res.send("Hello World test");
});

app.get("/users", function(req, res){
  let context = {};

  pool.query("SELECT * from users;", (err, rows) => 
  {
    if(err){
        console.log(err);
        return;
    }
    else{
      result = rows.rows;

      context.results = JSON.stringify(result);
      res.send(context);
    }
  });
});
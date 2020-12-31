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
  host: process.env.HOSTNAME,
  user: process.env.USERNAME,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5432,
});

//listen for request on port 3000, and as a callback function have the port listened on logged
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

app.get("/", function(req, res){
  res.send("Hello World test");
});

app.get("/all_chimes", function(req, res){
  //execute the query and the send the results back to the client
  executeQuery(all_chimes, function(context){
    res.send(context);
  });
});

app.post("/add_chime", function(req, res){
  //execute the query and the send the results back to the client
  executeQuery(, function(context){
    res.send(context);
  });
});

/************************ Query Execution Functions **************************/

/*********************************************************
executeQuery: 
Executes the query and returns all the rows
from the results back to the callback which well send to 
the client
Receives: query - query string; callback - callback function
Returns: nothing (sends back rows to callback function)
*********************************************************/
function executeQuery(query, callback){
  pool.query(query, function(err, rows){
      if(err){
          console.log('error');
          next(err);
      }
      callback(JSON.stringify(rows.rows));
  });
}

/************************ Queries to run **************************/

/*************************************************
 * Returns all chimes
*************************************************/
let all_chimes = 
`select 
cc.coin_num,
ch.title,
u.first_name,
u.last_name,
u.email,
aa.latitude,
aa.longitude

from chimes ch
left join coins cc on ch.coin_id = cc.id
left join chime_address ca on ca.chime_id = ch.id
left join addresses aa on aa.id = ca.address_id
left join chime_user cu on cu.chime_id = ch.id
left join users u on u.id = cu.user_id`;

/*************************************************
 * Insert new coin
*************************************************/
let insertCoin = 
`INSERT INTO coins (coin_num)
VALUES (?);`;

/*************************************************
 * Insert new chime
*************************************************/
let insertCoin = 
`INSERT INTO chimes (coin_id, title, description, image)
VALUES (?, ?, ?, ?);`;

/*************************************************
 * Insert new user
*************************************************/
let insertUser = 
`INSERT INTO users (first_name, last_name, email, ambassador)
VALUES (?, ?, ?, ?);`;

/*************************************************
 * Insert new address
*************************************************/
let insertAddress = 
`INSERT INTO users (latitude, longitude)
VALUES (?, ?);`;

/*************************************************
 * Insert new chime_address
*************************************************/
let insertChimeAddress = 
`INSERT INTO chime_address (chime_id, address_id)
VALUES (?, ?);`;

/*************************************************
 * Insert new chime_user
*************************************************/
let insertChimeUser = 
`INSERT INTO chime_user (chime_id, user_id)
VALUES (?, ?);`;

/*************************************************
 * Find if user exists
*************************************************/
let isUser = 
`Select id FROM users where lower(email) = lower(?);`;

/*************************************************
 * Find if address exists
*************************************************/
let isAddress = 
`Select id FROM addresses where latitude = ? and longitude = ?;`;

/*************************************************
 * Find if chime exists
*************************************************/
let isChime = 
`Select id FROM chimes where title = ?;`;
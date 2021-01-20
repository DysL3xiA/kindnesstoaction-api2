//Load HTTP module
const http = require("http");
const cors = require('cors')
const hostname = 'localhost';
const port = 3500;

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

/**************************** Handle Descriptions *****************************/

/*********************************************************
 * All Chimes Handle
 * 
 * Returns all chimes currently in the database with all 
 * data available
**********************************************************/

app.get("/allChimes", async function(req, res){
  const client = await pool.connect();
  try {
    //execute the query and the send the results back to the client
    executeQuery(client, all_chimes, function(context){
      res.send(context);
    });
  } catch (e) {
    await client.query('ROLLBACK');
    throw (e);
  } finally {
    await client.release();
  }
});

/*********************************************************
 * Get single chime based on chime_id
 * 
 * Returns single chime's data
**********************************************************/

app.get("/getCoin", async function(req, res){
  const client = await pool.connect();
  if (req.query.id){
    try {
      let getCoin = {
        text: get_coin,
        placeholder_arr: [req.query.id],
      };
      //execute the query and the send the results back to the client
      executeParameterQuery(client, getCoin, function(context){
        if (context.rowCount >= 1){
          res.send(context.rows);
        }
        else {
          res.send("No coin found");
        }
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw (e);
    } finally {
      await client.release();
    }
  }
});

/*********************************************************
 * Add Chime Handle
 * 
 * Expects Mandatory Arguments: 
 * title
 * coin_num
 * first_name
 * last_name
 * email
 * latitude
 * longitude
 * 
 * Optional Arguments: 
 * description
 * image
 * 
 * Returns: chime_id, coin_id, coin_num, title, description,
 * first_name, last_name, email, latitude, longitude 
*********************************************************/

app.post("/addChime", async function(req, res){ 
  const client = await pool.connect()
  .catch(err => console.error('Error executing query', err.stack))
  try {
    client.query('BEGIN')
    .then(() => {
      addIfNotExist(client, req.body.coin_num, [req.body.coin_num], 'coin')
      .then((coin_id) => {
        if (coin_id == -1){
          res.send("Unable to insert coin");
        }
        else {
          // add chime and user
          let chime_id = Promise.resolve(
            addRelation(client, [coin_id, req.body.title, req.body.description || 'null',
            req.body.image || 'null'], 'chime')
            );
          const user_id = Promise.resolve(
            addIfNotExist(client, req.body.email || null, [req.body.first_name, 
              req.body.last_name, req.body.email || null, 'FALSE'], 'user')
          );
          // need to add logic to check if address exists
          const address_id = Promise.resolve(
            addRelation(client, [req.body.latitude, req.body.longitude], 'address')
          );
          // once chime and user are added, add chime_user relation
          Promise.all([chime_id, user_id, address_id])
          .then((values) => {
            chime_id = values[0];
            const chime_user = addRelation(client, [values[0], values[1]], 'chime_user');
            const chime_address = addRelation(client, [values[0], values[2]], 'chime_address'); 
            Promise.all([chime_user, chime_address])
            .then(() => {
              let new_chime = {
                text: get_chime,
                placeholder_arr: [chime_id],
              };
              executeParameterQuery(client, new_chime, function(context){
                client.query('COMMIT');
                res.send(context);
                client.release();
              });
            });
          })
        }
      });
    })
  } catch (e) {
    console.log("blarb");
    await client.query('ROLLBACK');
    await client.release(e);
    throw e;
  }
});

/*********************************************************
 * Add Ambassador Handle
 * 
 * Expects Mandatory Arguments: 
 * first_name
 * last_name
 * email
*********************************************************/



/************************ Query Execution Functions **************************/

/*********************************************************
addIfNotExist: 
Checks if the entry already exists. If not, adds and returns
new id. Otherwise, returns id of existing entry.
Receives: unique_identifier to be looked up, array of params
for query, "type" identifier to know what table we are checking
Returns: Id of entry (existing or newly created)
*********************************************************/
function addIfNotExist(client, unique_identifier, paramList, type){
  queryCheckLookup = {
    coin: isCoin,
    user: isUser,
  };

  queryInsertLookup = {
    coin: insertCoin,
    user: insertUser,
  };

  let alreadyExists = {
    text: queryCheckLookup[type], 
    placeholder_arr: [unique_identifier]};

  return new Promise(function(resolve, reject) {
    parameterQuery(client, alreadyExists)
    .then((row) => {
      // if the new value already exists, then return id
      if (row.rowCount == 1){
        return resolve(row.rows[0].id);
      }
      // otherwise make the new entry
      else {
        let queryInsert = {
          text: queryInsertLookup[type],
          placeholder_arr: paramList
        }
        parameterQuery(client, queryInsert)
        .then((row) => {
          if (row.rowCount == 1){
            return resolve(row.rows[0].id);
          }
          // return -1 in event of error inserting
          else {
            return reject(-1);
          }
        });
      }
    });
  });
};

/*********************************************************
addRelation: 
Inserts a new entry associated with the id passed
as an argument
Receives: array of params, type of entry to enter
Returns: Id of new entry
*********************************************************/
function addRelation(client, params, type){
  queryInsertLookup = {
    chime: insertChime,
    user: insertUser,
    chime_user: insertChimeUser,
    address: insertAddress,
    chime_address: insertChimeAddress,
  };

  let queryInsert = {
    text: queryInsertLookup[type],
    placeholder_arr: params
  }; 

  return new Promise(function(resolve, reject) {
    executeParameterQuery(client, queryInsert, function(context){
      if (context.rowCount == 1){
        return resolve(context.rows[0].id);
      }
      // return -1 in event of error inserting coin
      else {
        return reject(-1);
      }
    });
  });
};

/*********************************************************
executeQuery: 
Executes the query and returns all the rows
from the results back to the callback which well send to 
the client
Receives: query - query string; callback - callback function
Returns: nothing (sends back rows to callback function)
*********************************************************/
function executeQuery(client, query, callback){
  client.query(query, function(err, rows){
      if(err){
        return console.error('Error executing query', err.stack)
      }
      callback(JSON.stringify(rows.rows));
  });
};

/*********************************************************
parameterQuery:  
Executes a query that has parameters
Receives: JSON object with text and placeholder_arr values
Returns: rows (from query execution)
*********************************************************/
function parameterQuery(client, query) {
  return new Promise(function(resolve, reject) {
      try {
          client.query(query.text, query.placeholder_arr, function(err, rows, fields) {
              if (err) {
                  return reject(err);
              } else {
                  return resolve(rows);
              }
          });
      } catch (err) {
          return reject(err);
      }
  })
};

/*********************************************************
executeParameterQuery:  
Executes the query and returns all the rows
from the results back to the callback which well send to 
the client
Receives: JSON object with text + placeholder_arr values, callback
Returns: nothing (sends back rows to callback function)
*********************************************************/
function executeParameterQuery(client, query, callback) {
  client.query(query.text, query.placeholder_arr, function(err, rows) {
    if (err) {
      return console.error('Error executing query', err.stack)
    }
    else{
      callback(rows);
    }
  });
};

/************************ Queries to run **************************/

/*************************************************
 * Returns all chimes
*************************************************/
let all_chimes = 
`select 
ch.id as chime_id,
cc.id as coin_id,
cc.coin_num,
ch.title,
ch.description,
ch.image,
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
 * Get single chime
*************************************************/
let get_chime = 
`select 
ch.id as chime_id,
cc.id as coin_id,
cc.coin_num,
ch.title,
ch.description,
ch.image,
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
left join users u on u.id = cu.user_id

where ch.id = ($1);`;

/*************************************************
 * Get single coin
*************************************************/
let get_coin = 
`select 
ch.id as chime_id,
cc.id as coin_id,
cc.coin_num,
ch.title,
ch.description,
ch.image,
u.first_name,
u.last_name,
u.email,
aa.latitude,
aa.longitude

from coins cc 
left join chimes ch on ch.coin_id = cc.id
left join chime_address ca on ca.chime_id = ch.id
left join addresses aa on aa.id = ca.address_id
left join chime_user cu on cu.chime_id = ch.id
left join users u on u.id = cu.user_id

where cc.coin_num = ($1);`;

/*************************************************
 * Insert new coin
*************************************************/
let insertCoin = 
`INSERT INTO coins (coin_num)
VALUES ($1)
RETURNING id;`;

/*************************************************
 * Insert new chime
*************************************************/
let insertChime = 
`INSERT INTO chimes (coin_id, title, description, image)
VALUES ($1, $2, $3, $4)
RETURNING id;`;

/*************************************************
 * Insert new user
*************************************************/
let insertUser = 
`INSERT INTO users (first_name, last_name, email, is_ambassador)
VALUES ($1, $2, $3, $4)
RETURNING id;`;

/*************************************************
 * Insert new address
*************************************************/
let insertAddress = 
`INSERT INTO addresses (latitude, longitude)
VALUES ($1, $2)
RETURNING id;`;

/*************************************************
 * Insert new chime_address
*************************************************/
let insertChimeAddress = 
`INSERT INTO chime_address (chime_id, address_id)
VALUES ($1, $2)
RETURNING id;`;

/*************************************************
 * Insert new chime_user
*************************************************/
let insertChimeUser = 
`INSERT INTO chime_user (chime_id, user_id)
VALUES ($1, $2)
RETURNING id;`;

/*************************************************
 * Find if user exists
*************************************************/
let isUser = 
`Select id FROM users where lower(email) = lower($1);`;

/*************************************************
 * Find if address exists
*************************************************/
let isAddress = 
`Select id FROM addresses where latitude = $1 and longitude = $2;`;

/*************************************************
 * Find if chime exists
*************************************************/
let isChime = 
`Select id FROM chimes where title = $1;`;

/*************************************************
 * Find if coin exists
*************************************************/
let isCoin = 
`Select id FROM coins where coin_num = $1;`;
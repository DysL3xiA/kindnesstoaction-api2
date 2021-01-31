//Load HTTP module
const http = require("http");
const cors = require('cors');
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
    const context = await client.query(all_chimes);
    res.send(context);
  } catch (e) {
    throw (e);
  } finally {
    client.release();
  }
});

/*********************************************************
 * Get single coin based on coin_num
 * 
 * Returns single coin's data
**********************************************************/

app.get("/getCoin", async function(req, res){
  const client = await pool.connect();
  if (req.query.id){
    try {
      //execute the query and the send the results back to the client
      const context = await client.query(get_coin, [req.query.id]);
      if (context && context.length == 1){
        res.send(context[0]);
      }
      else {
        res.send("Error: No coin found");
      }
    } catch (e) {
      console.error(e);
    } finally {
      client.release();
    }
  }
  else {
    res.send("Error: Expected id (coin number), none received")
  }
});

/*********************************************************
 * All Chimes Handle
 * 
 * Returns all chimes currently in the database with all 
 * data available
**********************************************************/

app.get("/getSelectChimes", async function(req, res){
  const client = await pool.connect();
  if (req.query.id){
    try {
      //execute the query and the send the results back to the client
      const context = await client.query(get_select_chimes, [req.query.id]);
      if (context.rowCount >= 1){
        res.send(context.rows);
      }
      else {
        res.send("No records found");
      }
    } catch (e) {
      console.error(e);
    } finally {
      client.release();
    }
  }
  else {
    res.send("Error: Expected id (coin number or title), none received")
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

app.post("/addChime2", async function(req, res){
  if (!req.body.coin_num || 
    !req.body.lat || 
    !req.body.long ||
    !req.body.title) {
    res.send("Error: must provide coin_num, lat, long and title")
    return;
  }

  let client = null;
  try {
    client = await pool.connect();
  } catch (error) {
      error('A client pool error occurred:' + error, res);
      return error;
  }

  let chime;
  try {
    await client.query('BEGIN');

    // get coin id
    let coin_id = await client.query(isCoin, [req.body.coin_num]);
    if (coin_id.rowCount == 1) {
      coin_id = coin_id['rows'][0]['id'];
    }
    else {
      const inserted_coin = await client.query(insertCoin, [req.body.coin_num]);
      if (inserted_coin.rowCount == 1){
        coin_id = inserted_coin['rows'][0]['id'];
      }
      else {
        rollback(client);
      }
    }

    // add chime; coin_id, title required
    chime = await client.query(insertChime, [coin_id, req.body.title, req.body.description || 'null',
    req.body.image || 'null'])
    if (chime.rowCount != 1){
      error("Error: could not insert chime", res);
      rollback(client);
    }
    else {
      chime = chime['rows'][0]['id'];
    }

    // add giver (not required); check giver name versus database
    let giver;
    if (req.body.giver){
      giver = await client.query(isUserName, [req.body.giver]);
      if (giver.rowCount == 1) {
        giver = giver['rows'][0]['id'];
      }
      else {
        const inserted_giver = await client.query(insertUser, [req.body.giver, 'null', 'FALSE']);
        if (inserted_giver.rowCount == 1){
          giver = inserted_giver['rows'][0]['id'];
        }
        else {
          error("Error: couldn't insert giver", res);
          rollback(client);
        }
      }
    }

    // add receiver (not required); check receiver name and email v database
    let receiver;
    if (req.body.receiver || req.body.email){
      receiver = await client.query(isUserNameEmail, [req.body.receiver, req.body.email || 'null']);
      if (giver.rowCount == 1) {
        receiver = receiver['rows'][0]['id'];
      }
      else {
        const inserted_receiver = await client.query(insertUser, [req.body.receiver, req.body.email ? req.body.email : 'null', 'FALSE']);
        if (inserted_receiver.rowCount == 1){
          receiver = inserted_receiver['rows'][0]['id'];
        }
        else {
          error("Error: couldn't insert receiver", res);
          rollback(client);
        }
      }
    }

    // get address (required); requires lat/long
    let address_id = await client.query(isAddress, [req.body.lat, req.body.long]);
    if (address_id.rowCount == 1){
      address_id = address_id['rows'][0]['id'];
    }
    else {
      const inserted_address = await client.query(insertAddress, [req.body.lat, req.body.long]);
      if (inserted_address.rowCount == 1){
        address_id = inserted_address['rows'][0]['id'];
      }
      else {
        error("Error: couldn't insert address", res);
        rollback(client);
      }
    }

    // chime_user relation for giver
    if (giver){
      const chime_giver = await client.query(insertChimeUser, [chime, giver]);
      if (chime_giver.rowCount != 1){
        error("Error: couldn't insert giver chime_user relation", res);
        rollback(client);
      }
    }

    // chime_user relation for receiver
    if (receiver){
      const chime_receiver = await client.query(insertChimeUser, [chime, receiver]);
      if (chime_receiver.rowCount != 1){
        error("Error: couldn't insert giver chime_user relation", res);
        rollback(client);
      }
    }
  }
  catch (error) {
    try {
        await client.query('ROLLBACK');
    } catch (rollbackError) {
      error('A rollback error occurred:' + rollbackError, res);
    }
    error('An error adding a chime occurred that triggered the catch: ' + error, res);
  } finally {
    if (req.body.test){
      rollback(client);
    }
    else {
      await client.query('COMMIT');
    }

    //return new chime 
    client.query(get_chime, [chime])
    .then((context) => {
      if (context.rowCount == 1){
        res.send(context['rows']);
      }
      else {
        error("Error: couldn't retrieve new chime", res);
      }
    });
    client.release();
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

async function rollback(client) {
  try {
    await client.query('ROLLBACK');
  } catch (rollbackError) {
    console.error('A rollback error occurred:', rollbackError);
  }
}

function error(message, res) {
  console.error(message);
  res.send( {'error': message} );
}

/*********************************************************
entryExists: 
Checks if the entry already exists.
*********************************************************/
async function entryExists(client, unique_identifier, type){
  queryCheckLookup = {
    coin: isCoin,
    user: isUser,
  };

  queryInsertLookup = {
    coin: insertCoin,
    user: insertUser,
  };

  let result;
  console.log(unique_identifier);

  (async () => {
    try {
    result = await executeQuery(client, queryCheckLookup[type], [unique_identifier]);
    } catch (error) {
      console.log(error);
    } finally {
      return result ? result[0]['id'] : -1;
    }
  })();
}

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
async function executeQuery(client, query, params = []) {
  let response;
  try {
    response = await client.query(query, params);
  } catch (error) {
    console.log("ERROR: ", error);
  }
  return response ? response.rows : null;
}

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
const all_chimes = 
`WITH chime_users as (
  select
  cu.*,
  ut.name as user_type_name,
  u.user_name,
  u.email
  
  from chime_user cu
  left join user_type ut on ut.id = cu.user_type
  left join users u on u.id = cu.user_id
  )
  
  select distinct 
  ch.id as chime_id,
  cc.id as coin_id,
  cc.coin_num,
  ch.title,
  ch.description,
  ch.image,
  cu.user_name as giver,
  cu2.user_name as receiver,
  aa.latitude,
  aa.longitude
  
  from chimes ch
  left join coins cc on ch.coin_id = cc.id
  left join chime_address ca on ca.chime_id = ch.id
  left join addresses aa on aa.id = ca.address_id
  left join chime_users cu on cu.chime_id = ch.id and cu.user_type_name = 'Receiver'
  left join chime_users cu2 on cu2.chime_id = ch.id and cu2.user_type_name = 'Giver'`;

/*************************************************
 * Get single chime
*************************************************/
const get_chime = 
`WITH chime_users as (
  select
  cu.*,
  ut.name as user_type_name,
  u.user_name,
  u.email
  
  from chime_user cu
  left join user_type ut on ut.id = cu.user_type
  left join users u on u.id = cu.user_id
  )
  
select distinct
ch.id as chime_id,
cc.id as coin_id,
cc.coin_num,
ch.title,
ch.description,
ch.image,
cu.user_name as giver,
cu2.user_name as receiver,
aa.latitude,
aa.longitude

from chimes ch
left join coins cc on ch.coin_id = cc.id
left join chime_address ca on ca.chime_id = ch.id
left join addresses aa on aa.id = ca.address_id
left join chime_users cu on cu.chime_id = ch.id and cu.user_type_name = 'Receiver'
left join chime_users cu2 on cu2.chime_id = ch.id and cu2.user_type_name = 'Giver'

where ch.id = ($1);`;

/*************************************************
 * Get coins based on coin_num or title
*************************************************/
const get_select_chimes = `WITH chime_users as (
  select
  cu.*,
  ut.name as user_type_name,
  u.user_name,
  u.email
  
  from chime_user cu
  left join user_type ut on ut.id = cu.user_type
  left join users u on u.id = cu.user_id
  )
  
  select distinct 
  ch.id as chime_id,
  cc.id as coin_id,
  cc.coin_num,
  ch.title,
  ch.description,
  ch.image,
  cu.user_name as giver,
  cu2.user_name as receiver,
  aa.latitude,
  aa.longitude
  
  from chimes ch
  left join coins cc on ch.coin_id = cc.id
  left join chime_address ca on ca.chime_id = ch.id
  left join addresses aa on aa.id = ca.address_id
  left join chime_users cu on cu.chime_id = ch.id and cu.user_type_name = 'Receiver'
  left join chime_users cu2 on cu2.chime_id = ch.id and cu2.user_type_name = 'Giver'
  where cc.coin_num = ($1) OR ch.title = ($1);`;

/*************************************************
 * Get single coin
*************************************************/
const get_coin = 
`WITH chime_users as (
  select
  cu.*,
  ut.name as user_type_name,
  u.user_name
  
  from chime_user cu
  left join user_type ut on ut.id = cu.user_type
  left join users u on u.id = cu.user_id
  )

select distinct
ch.id as chime_id,
cc.id as coin_id,
cc.coin_num,
ch.title,
ch.description,
ch.image,
cu.user_name as giver,
cu2.user_name as receiver,
aa.latitude,
aa.longitude

from coins cc 
left join chimes ch on ch.coin_id = cc.id
left join chime_address ca on ca.chime_id = ch.id
left join addresses aa on aa.id = ca.address_id
left join chime_users cu on cu.chime_id = ch.id and cu.user_type_name = 'Receiver'
left join chime_users cu2 on cu2.chime_id = ch.id and cu2.user_type_name = 'Giver'

where cc.coin_num = ($1);`;

/*************************************************
 * Insert new coin
*************************************************/
const insertCoin = 
`INSERT INTO coins (coin_num)
VALUES ($1)
RETURNING id;`;

/*************************************************
 * Insert new chime
*************************************************/
const insertChime = 
`INSERT INTO chimes (coin_id, title, description, image)
VALUES ($1, $2, $3, $4)
RETURNING id;`;

/*************************************************
 * Insert new user
*************************************************/
const insertUser = 
`INSERT INTO users (name, email, is_ambassador)
VALUES ($1, $2, $3)
RETURNING id;`;

/*************************************************
 * Insert new address
*************************************************/
const insertAddress = 
`INSERT INTO addresses (latitude, longitude)
VALUES ($1, $2)
RETURNING id;`;

/*************************************************
 * Insert new chime_address
*************************************************/
const insertChimeAddress = 
`INSERT INTO chime_address (chime_id, address_id)
VALUES ($1, $2)
RETURNING id;`;

/*************************************************
 * Insert new chime_user
*************************************************/
const insertChimeUser = 
`INSERT INTO chime_user (chime_id, user_id)
VALUES ($1, $2)
RETURNING id;`;

/*************************************************
 * Find if user exists by name
*************************************************/
const isUserName = 
`Select id FROM users where lower(name) = lower($1);`;

/*************************************************
 * Find if user exists by name or email
*************************************************/
const isUserNameEmail = 
`Select id FROM users where lower(name) = lower($1) OR lower(email) = lower($2);`;

/*************************************************
 * Find if address exists
*************************************************/
const isAddress = 
`Select id FROM addresses where latitude = $1 and longitude = $2;`;

/*************************************************
 * Find if chime exists
*************************************************/
const isChime = 
`Select id FROM chimes where title = $1;`;

/*************************************************
 * Find if coin exists
*************************************************/
const isCoin = 
`Select id FROM coins where coin_num = $1;`;
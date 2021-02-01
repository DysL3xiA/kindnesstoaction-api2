const chai = require("chai")
let expect = require("chai").expect;
require('../server.js');

const { Pool } = require('pg');

// postgres database connection
const pool = new Pool({
    host: process.env.HOSTNAME,
    user: process.env.USERNAME,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: 5432,
  });

describe ("entryExists", () => {
    it ("should return -1 if no coin exists", async () => {
        client = await pool.connect();
        
        (async() => {
            let response = entryExists(client, '012104', 'coin');
            expect(response).to.equal(-1);
        });
    });
});
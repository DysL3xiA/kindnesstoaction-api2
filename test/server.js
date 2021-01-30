const chai = require("chai")
let expect = require("chai").expect;
require('../server.js');

// describe ("Check entryExists", () => {
//     it ("check if coin_id exists", () => {
//       (async () => {
//         try {
//             await client.query('BEGIN');
//             coin_id = await entryExists(client, req.body.coin_num, 'coin');
//         } finally {
//             client.query('ROLLBACK')
//         }
//       });
      
//       expect(res.status).to.equal(200);
//     })
  
//     it ("should have expected body", () => {
//       let res = await chai
//           .request('http://localhost:3500')
//           .get('/allChimes');
      
//       console.log(res.text);
//     })
//   });
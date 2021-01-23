const chai = require("chai")
let expect = require("chai").expect;
const chaiHttp = require("chai-http")
chai.use(chaiHttp)

describe ("All Chimes Handle", () => {
  it ("should return status 200", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/allChimes');
    
    expect(res.status).to.equal(200);
  })

  it ("should have expected body", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/allChimes');
    
    console.log(res.text);
  })
});
    
    // it("returns the color in hex", function() {
    //     request(url, function(error, response, body) {
    //         expect(body).to.equal("ffffff");
    //     });
    // });
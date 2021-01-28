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

describe ("getCoin Handle", () => {
  it ("should return status 200", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoin?id=012104');
    
    expect(res.status).to.equal(200);
  })

  it ("should have expected body", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoin?id=012104');
    
    console.log(res.text);
  })

  it ("should return error if no id", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoin');
    
    console.log(res.text);
  })

  it ("should return cannot find if id not find", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoin?id=12');
    
    console.log(res.text);
  })
});

describe ("getSelectChimes Handle", () => {
  it ("should return status 200 with coin number", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=012104');
    
    expect(res.status).to.equal(200);
  })

  it ("should return status 200 with title", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=It all starts here.');
    
    expect(res.status).to.equal(200);
  })

  it ("should have expected body", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=012104');
    
    console.log(res.text);
  })

  it ("should return error if no id", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes');
    
    console.log(res.text);
  })

  it ("should return cannot find if id not find", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=12');
    
    console.log(res.text);
  })
});
    
    // it("returns the color in hex", function() {
    //     request(url, function(error, response, body) {
    //         expect(body).to.equal("ffffff");
    //     });
    // });
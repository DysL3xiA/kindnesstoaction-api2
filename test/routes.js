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

describe ("getCoins Handle", () => {
  let response = '[{"coin_num":"012104","title":"It all starts here.","description":"Elijah James Knight infuses the world with light and joy. 3 weeks before his tragic death, he made this profound statement: \\"Start everything with kindness and the end will be okay.\\" Through his example, Elijah inspires us to turn kindness to action according to our unique talents and interests to remake the world as it should be. If you have received a Kindness Coin, thank you for doing the work of kindness. Now, recognize and encourage others to go do! https://www.dignitymemorial.com/obituaries/houston-tx/elijah-knight-7898454","image":null,"latitude":"29.9717","longitude":"-95.6938"}]';
  it ("should return status 200", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoins?id=012104');
    
    expect(res.status).to.equal(200);
  })

  it ("should have expected body", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoins?id=012104');
    
    expect(res.text).to.equal(response);
  })

  it ("should return error if no id", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoins');
    
    expect(res.text).to.equal('Error: Expected id (coin number), none received');
  })

  it ("should return cannot find if id not find", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoins?id=12');
    
    expect(res.text).to.equal('Error: No coin found');
  })
});

describe ("getSelectChimes Handle", () => {
  let response = '[{"coin_num":"012104","title":"It all starts here.","description":"Elijah James Knight infuses the world with light and joy. 3 weeks before his tragic death, he made this profound statement: \\"Start everything with kindness and the end will be okay.\\" Through his example, Elijah inspires us to turn kindness to action according to our unique talents and interests to remake the world as it should be. If you have received a Kindness Coin, thank you for doing the work of kindness. Now, recognize and encourage others to go do! https://www.dignitymemorial.com/obituaries/houston-tx/elijah-knight-7898454","image":null,"latitude":"29.9717","longitude":"-95.6938"}]';
  
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

  it ("should return status 200 with partial title", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=starts');
    
    expect(res.status).to.equal(200);
  })

  it ("should return status 200 with partial title case insensitive", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=Starts');
    
    expect(res.status).to.equal(200);
  })

  it ("should have expected body", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=012104');
    
    expect(res.text).to.equal(response);
  })

  it ("should return error if no id", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes');
    
    expect(res.text).to.equal('Error: Expected id (coin number or title), none received');
  })

  it ("should return 400 if no id", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes');
    
    expect(res.status).to.equal(400);
  })

  it ("should return cannot find if no record found", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=12');
    
    expect(res.text).to.equal('No records found');
  })

  it ("should return 404 if no record found", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=12');
    
    expect(res.status).to.equal(404);
  })
});

describe ("addChime handle", () => {
  const response1 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"null","latitude":"123","longitude":"456"}]';
  const response2 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"null","latitude":"123","longitude":"456"}]';
  const response3 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"null","latitude":"123","longitude":"456"}]';
  const response4 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"null","latitude":"123","longitude":"456"}]';
  const response5 = '[{"coin_num":"testy test","title":"Testing post","description":"lawdy","image":"null","latitude":"123","longitude":"456"}]';
  const response6 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"dude.png","latitude":"123","longitude":"456"}]';
  it ("should return 200 with coin_num, lat, long, title", (done) => {
    chai.request('http://localhost:3500')
        .post('/addChime')
        .type('form')
        .send({'coin_num': 'testy test', 'lat': '123', 'long': '456', 'title': 'Testing post', 'test': 'true'})
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          done();
        });
  });

  it ("should return expected body with coin_num, lat, long, title", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'lat': '123', 'long': '456', 'title': 'Testing post', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal(response1);
        done();
      }); 
  });

  it ("should return error without coin_num", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'lat': '123', 'long': '456', 'title': 'Testing post', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal('Error: must provide coin_num, lat, long and title');
        done();
      });
  });

  it ("should return error without title", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'lat': '123', 'long': '456', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal('Error: must provide coin_num, lat, long and title');
        done();
      });
  });

  it ("should return error without lat", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'long': '456', 'title': 'Testing post', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal('Error: must provide coin_num, lat, long and title');
        done();
      });
  });

  it ("should return error without long", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'lat': '123', 'title': 'Testing post', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal('Error: must provide coin_num, lat, long and title');
        done();
      });
  });

  it ("should return expected body with giver", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'lat': '123', 'long': '456', 'title': 'Testing post', 'giver': 'Zuri', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal(response2);
        done();
      });
  });

  it ("should return expected body with receiver", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'lat': '123', 'long': '456', 'title': 'Testing post', 'receiver': 'Blarg', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal(response3);
        done();
      });
  });

  it ("should return expected body with receiver email and name", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'lat': '123', 'long': '456', 'title': 'Testing post', 'receiver': 'Blarg', 'email': 'casper@boo.com', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal(response4);
        done();
      });
  });

  it ("should return expected body with receiver email", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'lat': '123', 'long': '456', 'title': 'Testing post', 'email': 'casper@boo.com', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal(response4);
        done();
      });
  });

  it ("should return expected body with description", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'lat': '123', 'long': '456', 'title': 'Testing post', 'description': 'lawdy', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal(response5);
        done();
      });
  });

  it ("should return expected body with image", (done) => {
    chai.request('http://localhost:3500')
      .post('/addChime')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({'coin_num': 'testy test', 'lat': '123', 'long': '456', 'title': 'Testing post', 'image': 'dude.png', 'test': 'true'})
      .end(function (err, res) {
        expect(res.text).to.equal(response6);
        done();
      });
  });
});

describe ("addAmbassador handle", () => {
  const response1 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"null","latitude":"123","longitude":"456"}]';
  const response2 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"null","latitude":"123","longitude":"456"}]';
  const response3 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"null","latitude":"123","longitude":"456"}]';
  const response4 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"null","latitude":"123","longitude":"456"}]';
  const response5 = '[{"coin_num":"testy test","title":"Testing post","description":"lawdy","image":"null","latitude":"123","longitude":"456"}]';
  const response6 = '[{"coin_num":"testy test","title":"Testing post","description":"null","image":"dude.png","latitude":"123","longitude":"456"}]';
  it ("should return 200 with name and email", (done) => {
    chai.request('http://localhost:3500')
        .post('/addAmbassador')
        .type('form')
        .send({'name': 'testy test', 'email': 'casper@boo.com', 'test': 'true'})
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          done();
        });
  });

  it ("should return expected body with name and email", (done) => {
    chai.request('http://localhost:3500')
        .post('/addAmbassador')
        .type('form')
        .send({'name': 'testy test', 'email': 'casper@boo.com', 'test': 'true'})
        .end(function (err, res) {
          expect(res.text).to.equal(response1);
          done();
        });
  });
});
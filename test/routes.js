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
  let response = '[{"chime_id":5,"coin_id":3,"coin_num":"012104","title":"It all starts here.","description":"Elijah James Knight infuses the world with light and joy. 3 weeks before his tragic death, he made this profound statement: \\"Start everything with kindness and the end will be okay.\\" Through his example, Elijah inspires us to turn kindness to action according to our unique talents and interests to remake the world as it should be. If you have received a Kindness Coin, thank you for doing the work of kindness. Now, recognize and encourage others to go do! https://www.dignitymemorial.com/obituaries/houston-tx/elijah-knight-7898454","image":null,"latitude":"29.9717","longitude":"-95.6938"}]';
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
    
    expect(res.text).to.equal(response);
  })

  it ("should return error if no id", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoin');
    
    expect(res.text).to.equal('Error: Expected id (coin number), none received');
  })

  it ("should return cannot find if id not find", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getCoin?id=12');
    
    expect(res.text).to.equal('Error: No coin found');
  })
});

describe ("getSelectChimes Handle", () => {
  let response = '[{"chime_id":5,"coin_id":3,"coin_num":"012104","title":"It all starts here.","description":"Elijah James Knight infuses the world with light and joy. 3 weeks before his tragic death, he made this profound statement: \\"Start everything with kindness and the end will be okay.\\" Through his example, Elijah inspires us to turn kindness to action according to our unique talents and interests to remake the world as it should be. If you have received a Kindness Coin, thank you for doing the work of kindness. Now, recognize and encourage others to go do! https://www.dignitymemorial.com/obituaries/houston-tx/elijah-knight-7898454","image":null,"latitude":"29.9717","longitude":"-95.6938"}]';
  
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
    
    expect(res.text).to.equal(response);
  })

  it ("should return error if no id", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes');
    
    expect(res.text).to.equal('Error: Expected id (coin number or title), none received');
  })

  it ("should return cannot find if id not find", async () => {
    let res = await chai
        .request('http://localhost:3500')
        .get('/getSelectChimes?id=12');
    
    expect(res.text).to.equal('No records found');
  })
});

describe ("addChime handle", () => {
  it ("should return 200 with coin_num, lat, long, title", async () => {
    (async() => {
      let res = await chai
        .request('http://localhost:3500')
        .post('/addChime')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({coin_num: 'testy test', lat: '123', long: '456', title: 'Testing post', test: true});
      expect(res.status).to.equal(200);
    });
  });

  it ("should return error without coin_num", async () => {
    (async() => {
      let res = await chai
        .request('http://localhost:3500')
        .post('/addChime')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({lat: '123', long: '456', title: 'Testing post', test: true});
      expect(res.text).to.equal('Error: must provide coin_num, lat, long and title');
    });
  });

  it ("should return error without title", async () => {
    (async() => {
      let res = await chai
        .request('http://localhost:3500')
        .post('/addChime')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({coin_num: 'testy test', lat: '123', long: '456', title: 'Testing post', test: true});
      expect(res.text).to.equal('Error: must provide coin_num, lat, long and title');
    });
  });

  it ("should return error without lat", async () => {
    (async() => {
      let res = await chai
        .request('http://localhost:3500')
        .post('/addChime')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({coin_num: 'testy test', long: '456', title: 'Testing post', test: true});
      expect(res.text).to.equal('Error: must provide coin_num, lat, long and title');
    });
  });

  it ("should return error without long", async () => {
    (async() => {
      let res = await chai
        .request('http://localhost:3500')
        .post('/addChime')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({coin_num: 'testy test', lat: '123', title: 'Testing post', test: true});
      expect(res.text).to.equal('Error: must provide coin_num, lat, long and title');
    });
  });
});
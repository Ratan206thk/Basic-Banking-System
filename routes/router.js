const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://user:helloH@sparks.jcwap.mongodb.net/users?retryWrites=true&w=majority";
module.exports = () => {
  router.use(bodyParser.urlencoded());
  router.get('/', (request, response) => {
    return response.render('homepage', { pagetitle: 'new Title' });
  });
  router.get('/action', (request, response) => {
    return response.render('action', { pagetitle: 'new Title' });
  });
  router.get('/customers', async (request, response) => {
    response.render('customers', { "result": await aa() })
  });
  router.get('/history', async (request, response) => {
    response.render('history', { "result": await aa(2) })
  });
  router.post('/create', async (request, response) => {
    await aa(request.body);
    response.render('insert', { pagetitle: 'new Title' });
    console.log('hehehe');
  })
  router.post('/update', async (request, response) => {
    let arr = ((request.headers.referer).split('/'));
    await update(request.body, arr[arr.length - 1]);
    response.redirect('/action');
  })
  router.get('/insert', (request, response) => {
    response.render('insert', { pagetitle: 'new Title' })
  })
  async function ab() {
    for (let j = 0; j < (await aa()).length; j++) {
      router.get('/profile/' + (j + 1), async (request, response) => {
        response.render('profile', { 'object': (await aa())[j] });
      })
      router.get('/transfer/' + (j + 1), async (request, response) => {
        response.render('transfer', { 'object': (await aa()), 'cus': j });
      })
    }
  }
  ab();

  async function aa(x) {
    let db;
    try {
      const returnable = [];
      db = await MongoClient.connect(url, { useUnifiedTopology: true });
      const dbo = await db.db("banking");
      if (x == 2) {
        const found = await dbo.collection("history").find({});
        await found.forEach(eachtest => { returnable.push(eachtest) });
        return returnable;
      }
      const found = await dbo.collection("customers").find({});
      await found.forEach(eachtest => { returnable.push(eachtest) });
      if (x) {
        x.sn = returnable.length + 1;
        x.balance = parseInt(x.balance);
        await dbo.collection("customers").insertOne(x);
        return;
      }
      return returnable;
    } catch (err) {
      console.log(err);
    } finally {
      if (db) db.close();
    }
  }
  async function update(to, from) {
    let db;
    try {
      from = parseInt(from);
      to.cust = parseInt(to.cust);
      to.amount = parseInt(to.amount);
      db = await MongoClient.connect(url, { useUnifiedTopology: true });
      const dbo = await db.db("banking");
      await dbo.collection("customers").updateOne({ "sn": to.cust }, { $inc: { 'balance': to.amount } });
      await dbo.collection("customers").updateOne({ "sn": from }, { $inc: { 'balance': -to.amount } });
      const returnable = [];
      const found = await dbo.collection("customers").find({ "sn": { "$in": [to.cust, from] } });
      await found.forEach(eachtest => { returnable.push(eachtest) });
      let time = new Date;
      let x = { "sender": returnable[1].name, "receiver": returnable[0].name, "amount": to.amount, "date": time.toLocaleDateString(), "time": time.toLocaleTimeString() }
      await dbo.collection("history").insertOne(x);
      return;
    } catch (err) {
      console.log(err);
    } finally {
      if (db) db.close();
    }
  }
  return router;
}
try{
  

  const JSONdb = require('simple-json-db');
  const Rural = require('./classes/leilao.js');
  
  const express = require('express');
  const http = require('http');
  const { response } = require('express');
  
  const app = express();
  const server = http.createServer(app).listen(process.env.PORT || 3030, () => {
    console.log("server running...")
  });
  
  app.use(express.static('./public'))
  app.use('/vendor', express.static('./node_modules'))
  
  app.set("views","./public");
  app.set("view engine","html");
  
  app.get("/", (req, res) => {
      return res.render('index.html')
  })
  
  app.get('/data', (req,res)=>{
      var response=[];
      const db = new JSONdb('./database/database.json');
      const data = db.JSON();
      const status = req.query['status'];
      for (key in data){
          var doc = JSON.parse(data[key]);
          var docsta = doc['status'];
          if(docsta == status){
              response.push(data[key])
          }
          }
      return res.json(response)
  })
  
  app.get('/trigger', (req,res)=>{
      var response = [{status:200}];
      console.log("Working...");
      //const start = init();
      return res.json(response)
  })

  app.get('/run', (req,res)=>{
      var response = [{status:200}];
      console.log("Working...");
      const start = init();
      return res.json(response)
  })
  
  app.post('/set',(req,res)=>{
      const db = new JSONdb('./database/database.json');
      const key=req.query['key'];
      const status=req.query['status'];
      var comments = req.query['comments'];
      var expire = req.query['expire'];
      const data = db.JSON();
      const doc = JSON.parse(db.get(key));
      doc.status = status;
      doc.comments = comments;
      doc.expire = expire;
      const setkey = db.set(key,JSON.stringify(doc));
      return res.json(setkey)
  })
  
  
  async function init(){
      const rural = new Rural();
      const init = rural.init()
      return await init
  }
  
  
  //const start = init();
}
catch(e){
  console.log(e);
}

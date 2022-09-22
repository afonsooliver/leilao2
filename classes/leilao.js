const axios = require("axios");
const cheerio = require("cheerio");
const JSONdb = require('simple-json-db');


const config = {
  headers: {
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36",
  }
};

class Rural {
  constructor() {
    const url1 = "https://www.leilaoimovel.com.br/encontre-seu-imovel/?type=area-rural&states=sp";
    const url2 = "https://www.leilaoimovel.com.br/encontre-seu-imovel/?states=ms&location=tres-lagoas";
    const url3 = "https://www.leilaoimovel.com.br/encontre-seu-imovel/?states=sp&location=lencois-paulista";
    const url4 = "https://www.leilaoimovel.com.br/encontre-seu-imovel/?states=sp&location=bauru";
    this.db = new JSONdb('./database/database.json');
    this.dbkeys = new JSONdb('./database/database_keys.json');
    this.url = [url1,url2,url3,url4];
    this.docs = [];
    this.error = [];

  }
  async init() {
    for (var url of this.url) {
      const init = await this.scraper(url);
      const save = this.savedb().then(() => {
        this.docs = [];
        console.log("#Finished:", url);
      })
    }
  }

  async savedb() {
    var count = 0;
    var plist = [];
    var klist = [];
    var dlist = [];
    for (var doc of this.docs) {
      var key = cyrb53(doc.link);
      if (this.db.has(key)) {
        count++
      } else {
        var link2 = this.extractLink(doc.link)
            plist.push(link2)
            klist.push(key)
            dlist.push(doc)  
      }
    }
    const results = await Promise.all(plist)
    for (var i in results) {
      var doc = dlist[i];
      var key = klist[i];
      var link2 = results[i];
      var json = JSON.stringify({ key: key, title: doc.title, link: doc.link, link2: link2, price: doc.price, status: 0, comments: "", datealarm: 0 })
      var key2 = cyrb53(link2);
         if (this.dbkeys.has(key2)) {
             count++; 
         }else{
           var insert = this.db.set(key, json);
           var insert2 = this.dbkeys.set(key2, key);

         }
    }
    console.log("#+docs: ", this.docs.length - count)
  }

  async scraper(url) {
    var pagelist = [];
    var index = 0;
    try {
      const response = await axios.get(url, config);
      console.log(response.status)
      //console.log(response.status)
      const $ = cheerio.load(response.data)
      const pages = $('.page-link')
      pages.each((idx, element) => {
        index = parseInt(String(element.attribs.href).match(/\d+/g))
      })
      this.index = index;
      console.log(index);
      //***********/
      //index = 5;
      var page1 = this.getData(url);
      pagelist.push(page1);
      for (var i = 1; i <= index; i++) {
        var docs = this.getData(url.replace("/?", "/page/"+i+"/?"))
        pagelist.push(docs);
      }
      const results = await Promise.all(pagelist);
      console.log("#docs : ", this.docs.length)
      console.log("#errors :", this.error.length)
    } catch (e) {
      console.log(e);
    }
  }

  async getData(url, i) {
    try {
      const resp = await axios.get(url, config);
      const $ = cheerio.load(resp.data);
      const listItems = $(".item-listing-wrap");
      listItems.each((idx, el) => {
        var card = cheerio.load(el)
        var title = this.formatter(card(".item-title").text());
        var link = card(".item-title a").attr("href");
        var price = this.formatter(card(".item-price-wrap").text());
        return this.docs.push({ title, link, price })
      })
    } catch (e) {
      this.error.push(url)
    }
  }

  formatter(string) {
    return string.replace(/(\r\n|\n|\r)/gm, "").replace(/ +(?= )/g, '')
  }

  async extractLink(url) {
    var response = ""
    const resp = await axios.get(url, config);
    const $ = cheerio.load(resp.data);
    const linkhtml = $(".popmake-link-leiloeiro");
    linkhtml.each((idx, el) => {
      var card = cheerio.load(el);
      var link = card.html();
      link = link.replace(/[();',{}]/g, '_').replace(/ /g, "").replace(/_+/g, "_").split("_")
      for (var item of link) {
        if (item.match(/https/gi) != null) {
          //console.log(item);
          response = item;
        }
      }
    })
    return response
  }
}

module.exports = Rural;


const cyrb53 = function(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};


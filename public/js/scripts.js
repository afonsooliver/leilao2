var page = 0

function init() {
  const init = loadData(page);
}

async function loadData(status) {
  page = status;
  const data = await fetch('/data?status=' + status);
  const json = await data.json();
  const table = await loadTable(json);
}

async function setData(key, status, comments,expire) {
  const data = await fetch('/set?key=' + key + '&status=' + status + '&comments=' + comments + '&expire=' + expire, { method: "POST" });
  console.log(data.status);
}

async function loadTable(data) {
 
  var linhas = [];
  var $table = $('#table');
  $table.bootstrapTable('removeAll');
  for (key in data) {
    var doc = JSON.parse(data[key]);
    linhas.push({
      key: parseInt(key) + 1,
      title: doc.title,
      link: "<a href=" + JSON.stringify(doc.link) + ">Original</a>",
      link2: "<a href=" + JSON.stringify(doc.link2) + ">Direto</a>",
      price: doc.price,
      comments: '<input type="text" id="' + doc.key + '" value="' + doc.comments + '">',
      salvar: '<button type="button" key="' + doc.key + '"class="btn"  onclick="btnclick(' + doc.key + ',' + page + ')">S</button>',
      expire: '<input type="date" id="expire_'+doc.key+'" value="'+doc.expire+'">',
      excluir: '<button type="button" key="' + doc.key + '"class="btn btn-danger"  onclick="btnclick(' + doc.key + ',2)">X</button>',
      manter: '<button type="button" key="' + doc.key + '" class="btn btn-success" onclick="btnclick(' + doc.key + ',1)">*</button>',
      images: doc.images
    })
  }
  $table.bootstrapTable('append', linhas);
}

async function btnclick(id, status) {
  comments = $("#"+id).val();
  expire = $("#expire_"+id).val();
  console.log(id, status, comments,expire);
  await setData(id, status, comments,expire);
  await loadData(page);
}



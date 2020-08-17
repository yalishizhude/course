var express = require('express');
var path = require('path');

var app = express();

app.engine('.html', require('ejs').__express);


app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'html');

app.get('/reflection', function(req, res){
  res.render('reflection', {
    search: req.query.search
  });
});
app.get('/dom', function(req, res){
  res.render('dom');
});
app.get('/alert', function(req, res){
  res.render('alert');
});
app.get('/clickjacking', function(req, res){
  res.render('clickjacking');
});

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}

module.exports = app

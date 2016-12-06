var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var less = require('less-middleware');
var compression = require('compression');
var path = require('path');
var logger = require('morgan');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(less(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);

app.use(compression());
app.use(logger('dev'));

// Local variables for dev environment
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

// Routes
app.get('/', function (req, res) {
  res.sendfile('public/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;

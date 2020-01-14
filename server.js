var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var less = require('less-middleware');
var compression = require('compression');
var path = require('path');
var logger = require('morgan');
var nodemailer = require('nodemailer');
var helmet = require('helmet');

var app = express();

app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV === 'production') {
  // Trust the proxies (e.g Heroku) and pick up actual IP addresses of clients
  app.set('trust proxy', true);
  // Enforce https on all requests
  app.use( function (req, res, next) {
    if (req.headers['x-forwarded-proto'] === 'https') {
      return next()
    };
    res.redirect('https://' + req.headers.host + req.url);
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(less(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);

app.use(logger('dev'));

// Local variables for dev environment
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

// Setup NodeMailer
var smtpTransport = nodemailer.createTransport("SMTP",{
  host: process.env.SMTP_HOST || undefined,
  port: process.env.SMTP_PORT || undefined,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined
  }
});

// Routes
app.get('/', function (req, res) {
  res.sendfile('public/index.html');
});

app.get('/shutdowns.json', function (req, res) {
  res.sendfile('public/data/shutdowns.json');
});

var faqList = require('./public/data/faqs.json');
app.get('/about', function (req, res) {
  res.render('about', {
    faqList: faqList
  });
});

app.get('/why-care', function (req, res) {
  res.render('why-care');
});

app.get('/contribute', function (req, res) {
  res.render('contribute');
});

app.get('/resources', function (req, res) {
  res.render('resources');
});

app.get('/policy-tracker', function (req, res) {
  res.render('policy-tracker');
});

app.get('/updates', function (req, res) {
  res.render('updates');
});

app.get('/testimonials', function (req, res) {
  res.render('testimonials')
});

app.post('/shutdown', function (req, res) {
  smtpTransport.sendMail({
    from: process.env.EMAIL_FROM || 'internetshutdowns@sflc.in',
    to: process.env.EMAIL_TO || ['internetshutdowns@sflc.in'],
    subject: 'New Shutdown Submission from InternetShutdowns.in',
    text: JSON.stringify(req.body),
    //html: htmlify??
  }, function (err, response) {
    console.log(err);
    console.log(response);
    if (err) {
      res.sendStatus(400);
    } else {
      res.sendStatus(200);
    }
  });
});

app.post('/experience', function (req, res) {
  smtpTransport.sendMail({
    from: process.env.EMAIL_FROM || 'internetshutdowns@sflc.in',
    to: process.env.EMAIL_TO || ['internetshutdowns@sflc.in'],
    subject: 'New Experience Submission from InternetShutdowns.in',
    text: JSON.stringify(req.body),
    //html: htmlify??
  }, function (err, response) {
    console.log(err);
    console.log(response);
    if (err) {
      res.sendStatus(400);
    } else {
      res.sendStatus(200);
    }
  });
});

// For LetsEncrypt authorization
// https://github.com/dmathieu/sabayon
app.get('/.well-known/acme-challenge/:acmeToken', function(req, res, next) {
  var acmeToken = req.params.acmeToken;
  var acmeKey;

  if (process.env.ACME_KEY && process.env.ACME_TOKEN) {
    if (acmeToken === process.env.ACME_TOKEN) {
      acmeKey = process.env.ACME_KEY;
    }
  }

  for (var key in process.env) {
    if (key.startsWith('ACME_TOKEN_')) {
      var num = key.split('ACME_TOKEN_')[1];
      if (acmeToken === process.env['ACME_TOKEN_' + num]) {
        acmeKey = process.env['ACME_KEY_' + num];
      }
    }
  }

  if (acmeKey) res.send(acmeKey);
  else res.status(404).send();
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;

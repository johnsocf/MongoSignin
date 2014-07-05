var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
	mongodb = require('mongodb');

app = express();
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cookieParser());
app.use(session({secret: 'my secret',
				 saveUninitialized: true,
				 resave: true}));

app.set('view engine', 'jade');

app.get('/', function (req, res) {
	res.render('index', { authenticated: false });
});

app.get('/login/:signupEmail', function (req, res) {
  res.render('login', { signupEmail: req.params.signupEmail });
});
app.get('/logout', function (req, res) {
	req.esssion.loggedIn = null;
	res.redirect('/');
});

app.get('/signup', function (req, res) {
	res.render('signup');
});

var server = new mongodb.Server('127.0.0.1', 27017)
new mongodb.Db('my-website', server).open(function (err, client) {
	if (err) throw err;
	console.log('\033[96m + \033[39m connected to mongodb');
	app.users = new mongodb.Collection(client, 'users');

	client.ensureIndex('users', 'password', function (err) {
		if (err) throw err;

		console.log('\033[96m + \033[39m ensured indexes');
	});

});

app.post('/signup', function (req, res, next) {
	app.users.insert(req.body.user, function (err, records) {
		if (err) return next(err);
	});
	setTimeout(function() {

    // Fetch the document
    app.users.findOne(req.body.user, function(err, item) {
      if (err) return next(err);
      console.log(req.body);

      res.redirect('/login/' + item.email);
      //server.close();
    })
  }, 100);
});


app.post('/login', function (req, res, next) {
	setTimeout(function() {

    // Fetch the document
    app.users.findOne({email: req.body.user.email, password: req.body.user.password}, function(err, item) {
      if (err) return next(err);
      if (!item) console.log('<p>User not found. Go back and try again');
      if (item) {
      	req.session.loggedIn = item._id;
      	res.redirect('/');
      	console.log(req.session.loggedIn);
      }
      
    })
  }, 100);
});


app.listen(3000, function () {
  console.log('\033[96m + \033[39m app listening on *:3000');
});


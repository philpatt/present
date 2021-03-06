require('dotenv').config();
var bodyParser = require('body-parser');
var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var flash = require('connect-flash');
var isLoggedIn = require('./middleware/isLoggedIn');
var passport = require('./config/passportConfig');
var session = require('express-session');
var db = require('./models');
var app = express();

// app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));

// server.listen(80);
var server = app.listen(process.env.PORT || 3000);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);
// Session above flash & passport bcs they use it
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.alerts = req.flash();
  next();
})

app.get('/', function(req, res){
  res.render('auth/login');
});

app.get('/profile', isLoggedIn, function(req, res){
  // res.render('profile');
  db.user.findAll().then(printU => {
    // console.log('locale',printU.locale);
    console.log(printU);
    // console.log(printU[0].dataValues.id);
    res.render('profile', {people: printU});
  });
});

// app.post('/profile', function(req, res, next){
//   console.log('something')
//   db.user.update(
//     {sessionid: req.body.sessionid},
//     {where: {id: {[Op.lt]: 10}}}
//   ).then(function(updated){
//     console.log('updated', updated);
//   });
// });

app.use('/auth', require('./controllers/auth'));

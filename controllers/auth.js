var express = require('express');
var passport = require('../config/passportConfig');
var isLoggedIn = require('../middleware/isLoggedIn');
var db = require('../models');
var router = express.Router();

router.use(express.static(__dirname + '../public/'));

router.get('/login', function(req, res){
  res.render('auth/login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  successFlash: 'Login Successful',
  failureRedirect: '/',
  failureFlash: 'Invalid Credentials'
}));

router.get('/signup', function(req, res){
  res.render('auth/signup');
});

router.post('/signup', function(req, res, next){
  db.user.findOrCreate({
    where: { email: req.body.email },
    defaults: {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: req.body.password,
      locale: req.body.locale
    }
  }).spread(function(user, wasCreated){
    if(wasCreated){
      // Yay no duplic
      passport.authenticate('local', {
        successRedirect: '/profile',
        successFlash: 'Successfully logged in'
      })(req, res, next);
    } else {
      //Bad job, tried sign up when need login
      req.flash('error', 'Email already exists');
      res.redirect('/');
    }
  }).catch(function(err){
    req.flash('error', err.message);
    res.redirect('/auth/signup');
  })
});

// OAUTH ROUTES
//Calls the passport-facebook strategy (located in passport config)
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

//Handle response from FB (logic located in passport config)
router.get('/callback/facebook', passport.authenticate('facebook', {
  successRedirect: '/profile',
  successFlash: "You successfully logged in via Facebook",
  failureRedirect: '/',
  failureFlash: 'You tried to login with Facebook, but he doesn\'t recognize you'
}));

router.get('/logout', function(req, res){
  // res.send('logout route coming soon');
  req.logout();
  req.flash('success', 'Successfully logged out');
  res.redirect('/');
});

router.get('/:id', function(req, res){
  // console.log('Get User route up');
  // res.send('User edit route runnin');
  db.user.findOne({
    where: {id: req.params.id}
    // NOT ASSOCIATED! REBOOT SERVER
    // include: [db.chatroom, db.messages]
  }).then(function(user){
    // console.log(user);
    res.render('auth/single', { result: user });
  });
});

router.delete('/:id', isLoggedIn, function(req, res){
  console.log('Delete route. Id = ', req.params.id);
  res.send('Delete Route Working');
  db.user.destroy({
    where: {id: req.params.id}
  }).then(function(deleted){
    console.log('deleted = ', deleted);
    res.send('successful'); //successFlash ??
    req.flash('success', 'User Deleted');
  }).catch(function(err){
    console.log('Error occured', err);
    res.send('fail');
  })
})

router.put('/edit', isLoggedIn, function(req, res){
  console.log('Update Route. Id = ', req.user.id);
  console.log('thisis req',req.body);
  db.user.update({
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      locale: req.body.locale
      }, {
        where: {
          id: req.user.id
        }
  }).then(function(user){
    req.flash('success', 'User Updated');
    res.send('success'); //needs to tell ajax it is done
  }).catch(function(err){
    console.log('Error occured', err);
    res.send('fail');
  });
});

router.put('/edit-session', isLoggedIn, function(req, res){
  console.log('this is req.body',req.body);
  db.user.update(
    { sessionid: req.body.sessionid },
    { where: {
      id: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
    }
  }).then(function(users){
    console.log('returned users?',users)
    req.flash('success', 'Users Updated');
    res.send('success'); //needs to tell ajax it is done
  }).catch(function (err) {
    console.log('Error occured', err);
    res.send('fail');
  });
});

router.put('/check-session', isLoggedIn, function (req, res) {
  console.log('this is req.body', req.body);
  db.user.update(
    { checkSession: req.body.sessionidcheck },
    { where: {
      id: req.user.id
    }
  }).then(function (users) {
      console.log('returned users?', users)
      req.flash('success', 'Users Updated');
      res.send('success'); //needs to tell ajax it is done
    }).catch(function (err) {
      console.log('Error occured', err);
      res.send('fail');
    });
});

module.exports = router;

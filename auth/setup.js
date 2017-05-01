function setupAuth(User, app) {
  let config = require('../config');
  let passport = require('passport');
  let FacebookStrategy = require('passport-facebook').Strategy;

  // Init. for Passport
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.
      findOne({ _id : id }).
      exec(done);
  });


  //----------------------------------------------------------------------
  // Strategy Setup
  //----------------------------------------------------------------------

  passport.use(new FacebookStrategy(
    {
      clientID: config.facebook.clientid,
      clientSecret: config.facebook.clientsecret ,
      callbackURL: 'http://' + config.server.host + config.server.port + '/auth/facebook/callback',
      profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
    },
    function(accessToken, refreshToken, profile, done) {
      if (!profile.emails || !profile.emails.length) {
        return done('No emails associated with this account!');
      }

      User.findOneAndUpdate(
        { 'data.oauth': profile.id },
        {
          $set: {
            'profile.username': profile.emails[0].value,
            'profile.picture': 'http://graph.facebook.com/' +
              profile.id.toString() + '/picture?type=large'
          }
        },
        { 'new': true, upsert: true, runValidators: true },
        function(error, user) {
          done(error, user);
        });
    }));

  //----------------------------------------------------------------------
  // Express Setup
  //----------------------------------------------------------------------

  // Express middlewares
  app.use(require('express-session')({
    secret: 'this is a secret', 
    cookie: { maxAge: 60000 }, 
    resave: true, 
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());



  //----------------------------------------------------------------------
  // Facebook auth routes
  //----------------------------------------------------------------------

  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] }));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/fail' }),
    function(req, res) {
      res.send('Welcome, ' + req.user.profile.username);
    });
}

module.exports = setupAuth;

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../database/models').User;

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, (email, password, done) => {
    User.findOne({ 
        where: { 
            email: email 
        }
    }).then((user) => {
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }else{
          if(!user.dataValues.active) {
            return done(null, false, { message: 'You must activate your account' });
          }else{
            bcrypt.compare(password, user.dataValues.password, (err, result) => {
                if (err) { return done(err) }
                if (result) {
                  return done(null, user);
                } else {
                  return done(null, false, { message: 'Invalid email or password!' });
                }
            });
          }
        }
    }).catch(() => {
      return done(null, false, { message: 'Connection error' });
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.dataValues.id);
  });

  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then((user) => {
        done(null, user.dataValues);
      })
      .catch(err => console.log(err));
  });
}
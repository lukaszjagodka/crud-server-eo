/* eslint-env node */

const express = require('express');

const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const keys = require('../config/keys');
// const register_mail = require('../mailer/register_mail');

const saltRounds = 10;

const { User } = require('../database/models');

function authenticateToken(req, res, next) {
  console.log('\x1b[36m%s\x1b[34m', 'REQ FROM SERVER');
  console.log(req.headers /* , "REQ FROM SERVER" */);

  const authHeader = req.headers.Authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) { res.sendStatus(401); }
  jwt.verify(token, keys.access_token_secret.tokenKey, (err, user) => {
    if (err) { res.sendStatus(403); }
    User.findOne({
      where: { email: req.body.email },
    }).then((baseUser) => {
      if (user.email === baseUser.dataValues.email) {
        req.user = user;
        next();
      } else {
        res.json({
          success: false,
          userLogged: req.isAuthenticated(),
          message: 'Authentication token is wrong or expire.',
        });
      }
    });
  });
}

router.get('/account', authenticateToken, (req, res) => res.json({
  success: true,
  username: req.user.name,
  userLogged: req.isAuthenticated(),
}));

router.get('/logout', authenticateToken, (req, res) => {
  req.logout();
  return res.json({
    success: true,
    message: 'You have been logged out.',
  });
});

router.post('/register', [
  check('name').isLength({ min: 3 }),
  check('email').isEmail(),
  check('password').isLength({ min: 4 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }
  const mail = req.body.email.trim();
  const { password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    const passHash = hash;
    if (err) {
      res.json({
        success: false,
        message: 'Error from bcInReg.',
      });
    }
    crypto.randomBytes(48, (error, buffer) => {
      if (error) {
        console.log(error);
      } else {
        const token = buffer.toString('hex');
        User.create({
          name: req.body.name.trim(),
          email: mail,
          passHash,
          token,
        }, {
          fields: ['name', 'email', 'password', 'token'],
        }).then(() =>
          // const adres = mail;
          // register_mail(adres, token)
          res.json({
            success: true,
            message: 'Activation message was send on email.',
          })).catch((erro) => console.log(erro));
      }
    });
  });
});


router.post('/passwordchange/', (req, res) => {
  const { actualPassword } = req.body;
  const { newPassword } = req.body;
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((foundUser) => {
    bcrypt.compare(actualPassword, foundUser.dataValues.password, (error, result) => {
      if (error) {
        res.json({
          success: false,
          message: 'Actual password is wrong.',
        });
      } else if (result) { // result = true
        bcrypt.hash(newPassword, 10, (err, hash) => {
          if (err) {
            res.json({
              success: false,
              message: 'Problem with new hash.',
            });
          }
          foundUser.update({
            password: hash,
          }, {
            where: { id: foundUser.dataValues.email },
          }).then(() => res.json({
            success: true,
            message: 'New password confirmed.',
          }));
        });
      }
    });
  });
});

router.delete('/deleteaccount', /* authenticateToken */(req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  console.log(req.body);
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((foundUser) => {
    bcrypt.compare(password, foundUser.dataValues.password, (err, result) => {
      if (err) {
        res.json({
          success: false,
          message: err,
        });
      }
      if (!result) {
        res.json({
          success: false,
          message: 'Wrong password.',
        });
      }
      foundUser.destroy({
        where: {
          id: foundUser.dataValues.email,
        },
      });
      res.json({
        success: true,
        message: 'Account was deleted.',
      });
    });
  });
});

router.get('/register/:token', (req, res) => {
  User.findOne({
    where: {
      token: req.params.token,
    },
  }).then((user) => {
    if (!user) {
      res.json({
        success: false,
        message: 'Invalid token.',
      });
    }
    if (user.dataValues.active) {
      res.json({
        success: false,
        message: 'Account is already active.',
      });
    }
    User.update({
      active: true,
    }, {
      where: { id: user.dataValues.id },
    }).then(() => res.json({
      success: true,
      message: 'Your account is active now. Please log in.',
    })).catch((err) => console.log(err));
  }).catch((err) => console.log(err));
});

router.get('/login', authenticateToken, (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      userLogged: req.isAuthenticated(),
    });
  } else {
    res.json({
      success: false,
      userLogged: req.isAuthenticated(),
    });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      next(err);
    }
    if (!user) {
      res.json({
        success: false,
        message: info.message,
      });
    }
    req.login(user, (er) => {
      if (er) {
        next(er);
      }
      const { email } = req.body;
      const { name } = req.user.dataValues;
      const userObj = { name, email };
      const accessToken = jwt.sign(userObj, keys.access_token_secret.tokenKey /* , {expiresIn: '30s'} */);
      User.update({
        authtoken: accessToken,
      }, {
        where: { email: user.email },
      }).then(() => res.json({
        success: true,
        accessToken,
      }));
    });
  })(req, res, next);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const register_mail = require('../mailer/register_mail')
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const passport = require('passport');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const saltRounds = 10;

const User = require('../database/models').User

router.get('/account', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    username: req.user.name,
    userLogged: req.isAuthenticated()
  });
});

router.get('/logout', authenticateToken, (req, res) => {
  req.logout();
  return res.json({
        success: true,
        message: 'You have been logged out.'
      });
});

router.post('/register',[
  check('name').isLength({ min: 3 }),
  check('email').isEmail(),
  check('password').isLength({ min: 4 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  crypto.randomBytes(48, function(err, buffer) {
    if(err){console.log(err)}else{
      return token = buffer.toString('hex');
    }
  });
  let mail = req.body.email.trim();
  let password = req.body.password;
  bcrypt.hash(password, saltRounds, function(err, hash) {
    let password = hash;
    if(err){
      console.log(err)
      return res.json({
        success: false,
        message: 'Error from bcInReg.'
      });
    }else{
      User.create({
        name: req.body.name.trim(),
        email: mail,
        password: password,
        token: token
      },{
        fields: ['name', 'email', 'password', 'token'] 
      }).then(()=> {
        let adres = mail;
        register_mail(adres, token)
        return res.json({
          success: true,
          message: 'Activation message was send on email.'
        });
      }).catch(err => console.log(err));
    }
  });
});

router.post('/passwordchange/', (req, res) => {
  const actualPassword = req.body.actualPassword
  const newPassword = req.body.newPassword
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(foundUser => {
    bcrypt.compare(actualPassword, foundUser.dataValues.password, function(err, result) {
      if(err){
        return res.json({
          success: false,
          message: 'Actual password is wrong.'
        })
      }else{ //result = true
        bcrypt.hash(newPassword, 10, function(err, hash) {
          if(err){
            return res.json({
              success: false,
              message: 'Problem with new hash.'
            })
          }else{
            foundUser.update({
              password: hash
            },{
              where: {id: foundUser.dataValues.email}
            }).then(()=> {
              return res.json({
                success: true,
                message: 'New password confirmed.'
              })
            })
          }
        });
      }
    });
  });
});

router.delete('/deleteaccount', /*authenticateToken*/(req, res) => {
  const {email, password} = req.body;
  console.log(email, password)
  console.log(req.body)
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(foundUser => {
    bcrypt.compare(password, foundUser.dataValues.password, function(err, result) {
      if(err){
        return res.json({
          success: false,
          message: err
        })
      }
      if(!result){
        return res.json({
          success: false,
          message: 'Wrong password.'
        })
      }else{
        foundUser.destroy({
          where: {
            id: foundUser.dataValues.email
          }
        })
        return res.json({
          success: true,
          message: 'Account was deleted.'
        });
      }
    })
  });
});

router.get('/register/:token', (req, res) => {
  User.findOne({
    where: {
      token: req.params.token
    }
  }).then(user => {
    if(!user){
      return res.json({
        success: false,
        message: 'Invalid token.'
      })
    }else{
      if(user.dataValues.active){
        return res.json({
          success: false,
          message: 'Account is already active.'
        });
      }else{
        User.update({
          active: true
        },{
          where: {id: user.dataValues.id}
        }).then(()=> {
          return res.json({
            success: true,
            message: 'Your account is active now. Please log in.'
          });
        }).catch(err => console.log(err));
      }
    }
  }).catch(err => console.log(err));
});

router.get('/login', authenticateToken, (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      userLogged: req.isAuthenticated()
    });
  } else {
    res.json({
      success: false,
      userLogged: req.isAuthenticated()
    });
  }
});

router.post('/login', (req, res, next)=> {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({
        success: false,
        message: info.message
      });
    }
    req.login(user, (err) => {
      if (err){
        return next(err);
      }
      const email = req.body.email
      const name = req.user.dataValues.name
      const user = { name: name, email: email}
      const accessToken = jwt.sign(user, keys.access_token_secret.tokenKey /*, {expiresIn: '30s'}*/)
      User.update({
        authtoken: accessToken
      },{
        where: {email: user.email}
      }).then(()=> {
        return res.json({
          success: true,
          accessToken: accessToken
        });
      });
    });
  })(req, res, next);
})

function authenticateToken(req, res, next){
  console.log('\x1b[36m%s\x1b[34m', 'REQ FROM SERVER');
  console.log(req.headers /*, "REQ FROM SERVER"*/)

  const authHeader = req.headers['Authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if ( token == null ) return res.sendStatus(401)
  jwt.verify(token, keys.access_token_secret.tokenKey, (err, user) => {
    if(err) return res.sendStatus(403)
    User.findOne({
      where: {email: req.body.email}
    }).then(baseUser =>{
      if(user.email == baseUser.dataValues.email){
        req.user = user
        next()
      }else{
        res.json({
          success: false,
          userLogged: req.isAuthenticated(),
          message: 'Authentication token is wrong or expire.'
        });
      }
    })
  })
}

module.exports = router;
const express = require('express');
const router = express.Router();
const register_mail = require('../mailer/register_mail')
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const saltRounds = 10;

const User = require('../database/models').User

router.post('/register',[
  check('name').isLength({ min: 3 }),
  check('email').isEmail(),
  check('password').isLength({ min: 5 })
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
        console.log(adres, token)
        return res.json({
          success: true,
          message: 'Activation message was send on email.'
        });
      }).catch(err => console.log(err));
    }
  });
});

// router.post('/passwordchange/', (req, res) => {
//   const { password, newpassword, renewpassword} = req.body;
//   res.status(200).send()
// });

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

router.get('/login', (req, res) => {
  if (req.user) {
    res.json({
      success: false,
      userLogged: req.isAuthenticated()
    });
  } else {
    res.json({
      success: true,
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
      
      return res.json({
        success: true,
        user: user
      });
    });
  })(req, res, next);
  // AUTHENTICATE V0.1

  // const userPassword = req.body.password
  // const email = req.body.email
  // User.findOne({
  //   where: {
  //     email: email
  //   }
  // }).then(User =>{
  //   if(User.active){
  //     //account active, check password
  //     const hashPassword = User.password
  //     bcrypt.compare(userPassword, hashPassword, function(err, result) {
  //       if(err){console.log(err)}
  //       if(result){
  //         console.log('User is logged.');
  //         return res.json({
  //           success: true,
  //           message:'User is logged.'
  //         })
  //       }else{
  //         console.log('Wrong password.');
  //         return res.json({
  //           success: false,
  //           message:'Wrong password.'
  //         })
  //       }
  //     });
  //   }else{
  //     //user.active is false 
  //     console.log('Account not active.')
  //     return res.json({
  //       success: false,
  //       message:'Account is not active.'
  //     })
  //   }
  // }).catch((err)=> console.log('No user in the database'));
})

module.exports = router;
const express = require('express');
const router = express.Router();
const register_mail = require('../mailer/register_mail')
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = require('../database/models').User

// console.log(object)
// router.get('/register', (req, res) => {
//  console.log('test')
// });


router.post('/register', (req, res) => {
  console.log('body', req.body)
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
          success:true
        });
      }).catch(err => console.log(err));
    }
  });
});

router.get('/register/:token', (req, res) => {
  console.log('Wakanda foreva!')
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

module.exports = router;
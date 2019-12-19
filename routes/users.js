const express = require('express');
const router = express.Router();

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
  let password = req.body.password;
  bcrypt.hash(password, saltRounds, function(err, hash) {
    let password = hash;
    if(err){
      console.log(err)
    }else{
      User.create({
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        password: password,
        token: token
      },{
        fields: ['name', 'email', 'password', 'token'] 
      }).then(()=> {
        return res.json({
          succes:true
        });
      }).catch(err => console.log(err));
    }
  });
});


module.exports = router;
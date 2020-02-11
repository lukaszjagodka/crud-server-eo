const express = require('express')
const app = express()
const session = require('express-session');
const passport = require('passport');
const keys = require('./config/keys');
const port = 3001

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
// const User =require('./database/models').User

app.use(session({
  secret: keys.session.cookieKey,
  cookie: {
    maxAge: 24*60*60*1000
  },
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  rolling: true
}));

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);


  
// User.create({
//     name: 'Lukaszsz',
//     email: 'jakistamta',
//     password: 'testdd',
//     active: 'true'
// }).then(User => {
//     User.createAccount({
//         accountValue: 2000,
//         accountCode: 'USD',
//         userId: 1
//     }).then(()=>console.log('working'));
// })

app.get('/', (req, res) => res.send('Server'))
app.use('/users', require('./routes/users'));

app.listen(port, () => console.log(`Server listening on port ${port}`))

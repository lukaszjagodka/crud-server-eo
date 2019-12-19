const express = require('express')
const app = express()
const port = 3001

const User =require('./database/models').User
const Account = require('./database/models').Account

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
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
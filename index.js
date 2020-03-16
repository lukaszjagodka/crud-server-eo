const express = require('express');

const app = express();
const passport = require('passport');

const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.get('/', (req, res) => res.send('Server'));
app.use('/users', require('./routes/users'));

app.listen(port, () => console.log(`Server listening on port ${port}`));

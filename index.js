const express = require('express')
const app = express()
const port = 3001

app.get('/', (req, res) => res.send('Server'))

app.listen(port, () => console.log(`Server listening on port ${port}`))
require('dotenv').config()
const express = require('express')
var cors = require('cors')
require('./db/db.js')

const userRouter = require('./routers/user')
const onlyBook = require('./routers/onlyBook')

const app = express()

app.use(cors()) //allowed cross origin

const port = 8080;

//Test Area

//Test Area

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.use(express.json());
app.use(userRouter);
app.use(onlyBook);

app.listen(port, () => {
    console.log('Server runing on: ' + port)
})
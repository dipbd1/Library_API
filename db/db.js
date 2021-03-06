const mongoose = require('mongoose');

const uri = process.env.DB_URL;

mongoose.connect(uri, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("DB Connected")
})
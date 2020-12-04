const express = require('express');
const Book = require('../models/book');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');

router.post('/books', auth, async (req, res) => {
	if (req.user.type === 'librarian') {
		const book = new Book({
			...req.body,
			owner: req.user._id,
		});

		try {
			await book.save();
			res.status(201).send(book);
		} catch (e) {
			res.status(400).send(e);
		}
	} else {
		res.status(400).send({
			error: 'You are not a Librarian',
		});
	}
});

router.get('books/:id', auth, async (req, res) => {
	if (req.user.type === 'librarian') {
		const id = req.params.id;
		try {
			// const book = await Book.findById(_id)
			const book = await Book.findOne({ _id });
			if (!book) {
				return res.status(404).send();
			}
			res.send(book);
		} catch (e) {
			if (e.name === 'CastError') {
				return res.status(404).send();
			}
			res.status(500).send(e);
		}
	} else {
		res.status(400).send({
			error: 'You are not a Librarian',
		});
	}
});

//GET /books?sortBy=createdAt
//GET /books?limit
//GET books?completed=true
//Get method to read all Book

// Sorry I canceleled the pagination
router.get('/books', auth, async (req, res) => {
	if (req.user.type === 'librarian') {
		try {
			const books = await Book.find();
			res.send(books);
		} catch (e) {
			res.send(e);
		}
	} else {
		res.status(400).send({
			error: 'You are not a Librarian',
		});
	}
});

router.patch('/books/:id', auth, async (req, res) => {
	if (req.user.type === 'librarian') {
		const _id = req.params.id;
		const updates = Object.keys(req.body);
		const allowedUpdate = ['name', 'author', 'genre', 'status', 'bookImage'];
		const isAllowed = updates.every((update) => allowedUpdate.includes(update));

		if (!isAllowed) {
			res.status(400).send({
				error: 'invalid updates!',
			});
		}
		try {
			const book = await Book.findOne({ _id });
			if (!book) {
				res.status(404).send();
			}
			updates.forEach((update) => (book[update] = req.body[update]));
			await book.save();
			return res.send(book);
		} catch (e) {
			res.status(500).send(e);
		}
	} else {
		res.status(400).send({
			error: 'You are not a Librarian',
		});
	}
});

//Here starts the multer thing
// it is a middleware that helps to upload buffer into db
const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(img|jpg|jpeg|png)$/)) {
			cb(new Error('Please upload a Image file'));
		}
		cb(undefined, true);
	},
});

router.post(
	'/books/:id/image',
	auth,
	upload.single('avatar'),
	async (req, res) => {
		if (req.user.type === 'librarian') {
			const _id = req.params.id;

			const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
			try {
				const book = await Book.updateOne(_id, { bookImage: buffer });
				if (!book || !book.bookImage) {
					throw new Error();
				}
				res.set('Content-Type', 'image/png');
				res.send(book);
			} catch (e) {
				res.status(404).send(e);
			}
			res.send();
		} else {
			res.status(400).send({
				error: 'You are not a Librarian',
			});
		}
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete('/books/:id/image', auth, async (req, res) => {
	if (req.user.type === 'librarian') {
		const _id = req.params.id;
		try {
			const book = await Book.updateOne(_id, { bookImage: undefined });
			res.send('Image Deleted Succesfully');
		} catch (e) {
			res.send(e).status(400);
		}
	} else {
		res.status(400).send({
			error: 'You are not a Librarian',
		});
	}
});

router.patch('/books/reserving/:id', auth, async (req, res) => {
	if (req.user.type === 'student') {
		_id = req.params.id;
		try {
			const book = await Book.findById(_id);
			console.log(book);
			book.bookings.push({requestedBy:req.user._id});
			console.log(book)
			book.save((err, doc) => {
				if (err){
					console.log(err);
					res.send('reserving error, plz check book id');	
				}
				res.status(200).send('reserving received');
			});
		} catch (error) {
			res.send('cant reserve right now');
			console.log(error)
		}
	} else {
		res.status(400).send({
			error: 'You are not a Student',
		});
	}
});

module.exports = router;

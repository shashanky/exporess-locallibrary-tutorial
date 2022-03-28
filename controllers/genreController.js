const Book = require('../models/book');
const async = require('async');
const Genre = require('../models/genre');
const { body, validationResult } = require('express-validator');
// Display list of all genres
exports.genre_list = function (req, res, next) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('genre_list', {
        title: 'Genre List',
        genre_list: list_genres,
      });
    });
};

// Display detail page for a specific genre
exports.genre_detail = function (req, res, next) {
  // res.send(`NOT IMPLEMENTED: Genre detail: ${req.params.id}`);

  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // no results
        const err = new Error('Genre not found');
        err.status = 404;
        next(err);
      }
      //successful so render
      res.render('genre_detail', {
        title: 'Genre Detail',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res, next) {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on post
exports.genre_create_post = [
  // validate and sanitize the name field
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
  // process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // create a Genre object with escaped and trimmed data
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // there are errors. render the form again with sanitized values/error messages
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // data from form is valid
      // check if Genre with same name already exists
      Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // genre exists; redirect to it detail page
          res.redirect(found_genre.url);
        } else {
          genre.save(function (err) {
            if (err) {
              return next(err);
            }
            // genre saved. redirect to detail page
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Handle Genre delete on get
exports.genre_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete GET:');
};

// Handle Genre delete on post
exports.genre_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete POST:');
};

// Display Genre update form on get
exports.genre_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update GET:');
};

// Handle Genre update on post
exports.genre_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update POST:');
};

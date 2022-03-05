const express = require('express')
const passport = require('passport')

// pull in Mongoose model for examples
const Poem = require('../models/poem')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existent document is requested
const handle404 = customErrors.handle404

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /poems
router.get('/poems', (req, res, next) => {
  // queries to get a genre

  // console.log(req.query.genre)
  // Movie.find({ 'genre': req.query.genre })
  Poem.find()
    .then(poems => {
      // `examples` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return poems.map(poem => poem.toObject())
    })
    // respond with status 200 and JSON of the examples
    .then(poems => res.status(200).json({ poems: poems }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /poem/5a7db6c74d55bc51bdf39793
router.get('/poems/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Poem.findById(req.params.id)
    .then(handle404)
    // if `findById` is successful, respond with 200 and "example" JSON
    .then(poem => res.status(200).json({ poem: poem.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /poems
router.post('/poems', (req, res, next) => {
  // set owner of new example to be current user
  // req.body.movie.owner = req.user.id

  Poem.create(req.body.movie)
    // respond to successful `create` with status 201 and JSON of new "example"
    .then(poem => {
      res.status(201).json({ poem: poem.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /poems/5a7db6c74d55bc51bdf39793
router.patch('/poems/:id', removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.poem.owner

  Poem.findById(req.params.id)
    .then(handle404)
    .then(poem => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner

      /****************
       * comment back in
       */
      // requireOwnership(req, movie)

      // pass the result of Mongoose's `.update` to the next `.then`
      return poem.updateOne(req.body.poem)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /poems/5a7db6c74d55bc51bdf39793
router.delete('/poems/:id', (req, res, next) => {
  Poem.findById(req.params.id)
    .then(handle404)
    .then(poem => {
      // throw an error if current user doesn't own `example`
      // requireOwnership(req, movie)
      // delete the example ONLY IF the above didn't throw
      poem.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router

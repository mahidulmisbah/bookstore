const express = require('express')
const router = express.Router()


// All authors route
router.get('/', (req, res) => {
    res.render('authors/index')
})

// new author route
router.get('/new', (req, res) => {
    res.render('authors/new')
})

// create author route
router.post('/create', (req, res) => {
    res.send('authors/create')
})

module.exports = router
const e = require('express')
const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
// All authors route
router.get('/', async (req, res) => {
    let searchOption = {}
    if(req.query.name != null && req.query.name !==''){
        searchOption.name = new RegExp(req.query.name, 'i')
    }
    try 
    {
        const authors = await Author.find(searchOption) 
        res.render('authors/index', {
            authors: authors,
            searchOption: req.query
        })
    }catch{
        res.render('/')
    }
})

// new author route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author()})
})

// create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try{
        const newAuthor = await author.save();
        //res.redirect('authors/${newAuthor}')
        res.redirect('authors')
       
    }catch{
        res.render('authors/new', {
        author: author,
        errorMessage: 'Name is a required field'
        })
            
    }
})

router.get('/:id',async (req,res) =>{

    try{
        const author = await Author.findById(req.params.id)
        const bookByAuthor = await Book.find({author: author.id}).limit(6).exec()
        res.render('authors/showAuthor',{
            author: author,
            bookByAuthor: bookByAuthor
        })
    }catch{
        res.redirect('/')
    }

})

router.get('/:id/edit',async (req,res) =>{
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author})
    }catch{
        res.redirect('/authors')
    }
})

router.put('/:id',async (req, res) => {
    let author

    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save();
        res.redirect(`/authors/${author.id}`)
       
    }catch
    {
        if(author == null){
            res.redirect('/')
        console.log("hello ")}
        else 
        {
            res.render('authors/edit', {
            author: author,
            errorMessage: 'Updation error'}) 
        }
    }   
})

router.delete('/:id',async (req,res) =>{
    let author
    try
    {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect('/authors')
       
    }catch
    {
        if(author == null){
            res.redirect('/')
        }
        else 
        {
            res.redirect(`/authors/${author.id}`)
        }
    }   
})

module.exports = router
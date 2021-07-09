const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All book route
router.get('/', async (req,res) =>{
    let query = Book.find()
    if(req.query.title !=null && req.query.title!='')
    {
        query = query.regex('title',new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishBefore !=null && req.query.publishBefore!='')
    {
        query = query.lte('publishDate', req.query.publishBefore)
    }
    if(req.query.publishAfter !=null && req.query.publishAfter!='')
    {
        query = query.gte('publishDate', req.query.publishAfter)
    }
    try{
        const books = await query.exec()
        res.render('books/index', {
            books : books,
            searchOption : req.query
        })

    }catch
    {
        res.redirect('/')
    }
})

// new book route (displaying the required fields to add a new book)
router.get('/new', async (req,res) =>{
    addNewBookPage(res, new Book() )
})

// create new book route(new book information save to database)
router.post('/',async (req,res) =>{
    const book = new Book({
       title: req.body.title,
       author: req.body.author,
       publishDate: new Date(req.body.publishDate),
       pageCount: req.body.pageCount,
       description : req.body.description
   })
   saveCover(book, req.body.cover)
   try{
        const newBook = await book.save()
        res.redirect('books')
   }catch{
        addNewBookPage(res, new Book(), true )
   }
})

async function addNewBookPage(res,book,hasError = false)
{
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book : book
        }
        if(hasError) params.errorMessage = "Error in adding new book"
        res.render('books/new',params)
    }catch{
        res.redirect('/books')
    }
}

function removeBookCover(filename)
{
    fileSytem.unlink(path.join(uploadPath, filename),err => {
        if(err)
            console.error(err)
    }) 
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64')
      book.coverImageType = cover.type
    }
  }

module.exports = router
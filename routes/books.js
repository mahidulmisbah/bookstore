const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fileSytem = require('fs')
const Author = require('../models/author')
const Book = require('../models/book')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes =['images/jpg','images/png','images/gif']
const upload = new multer({
    dest : uploadPath,
    filterFile: (req,file,callback) =>{
        callback(null,imageMimeTypes.includes(file.mimetype))
    }
})

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
router.post('/', upload.single('cover'), async (req,res) =>{
    const filename = req.file != null ? req.file.filename : null
    const book = new Book({
       title: req.body.title,
       author: req.body.author,
       publishDate: new Date(req.body.publishDate),
       pageCount: req.body.pageCount,
       coverImageName : filename,
       description : req.body.description
   })

   try{
        const newBook = await book.save()
        res.redirect('books')
   }catch{
        if(book.coverImageName != null)
            removeBookCover(book.coverImageName)
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

module.exports = router
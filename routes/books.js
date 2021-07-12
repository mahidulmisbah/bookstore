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

// show specific book and related information
router.get('/:id', async (req, res) => {
    try {
      const book = await Book.findById(req.params.id)
                             .populate('author')
                             .exec()
      res.render('books/showBook', { book: book })
    } catch {
      res.redirect('/')
    }
  })

// edit book route
router.get('/:id/edit', async(req,res)=>{
    try{
        book = await Book.findById(req.params.id)
        EditBookPage(res,book)
    }catch{
        res.redirect('/')
    }
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
        addNewBookPage(res, new Book())
   }
})

// update book 
router.put('/:id',async (req, res) => {
    let book

    try{
        book = await Book.findById(req.params.id)
        book.title = req.body.title,
        book.author = req.body.author,
        book.publishDate = new Date(req.body.publishDate),
        book.pageCount = req.body.pageCount,
        book.description = req.body.description
        if(req.body.cover != null && req.body.cover !=='')
        {
            saveCover(book,req.body.cover)
        }
        await book.save();
        res.redirect(`/books/${book.id}`)
       
    }catch
    {
        if(book != null){
           EditBookPage(res,book,true)
        console.log("hello ")}
        else 
        {
            res.render('books/edit', {
            book: book,
            errorMessage: 'Updation error'}) 
        }
    }   
})


// delete a book
router.delete('/:id', async(req,res) =>{
    let book
    try{
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    }catch{
        if(book!=null)
        {
            res.render('books/showBook',{
                book:book,
                errorMessage: 'Error in deleting book'
            })
        }
        else {
            res.redirect('/')
        }
        
    }
})

async function addNewBookPage(res,book,hasError)
{
    AddOrEditBookPage(res,book,'new',hasError)
}

async function EditBookPage(res,book,hasError)
{
    AddOrEditBookPage(res,book,'edit',hasError)
}

async function AddOrEditBookPage(res,book,form,hasError = false)
{
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book : book
        }
        if(hasError) 
        {
            if(form == 'edit') params.errorMessage = "Error in Edit book"
            else params.errorMessage = "Error in creating book"
        }
        res.render(`books/${form}`,params)
    }catch (e){
        console.log(e)
        res.redirect('/')
    }
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
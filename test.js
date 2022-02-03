const express = require('express')
const app = express()
const cors = require('cors')
const multer = require('multer');
const { json } = require('body-parser');
path = require('path');
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './uploads');
   },
  filename: function (req, file, cb) {
    cb(null,`${file.fieldname}-${Date.now()}.${path.extname(file.originalname)}`)
  }
});
const upload = multer({ storage })
var corsoptions = {
  origin: 'http://localhost:8080',
  optionsSuccessStatus: 200
}
app.use(cors(corsoptions))
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => res.render('home'))
app.post('/', upload.single('file'), (req, res) => {
    console.log(req.body, req.file)

    res.send(req.file)
  })
app.get('/TestForm', (req, res) => res.render('home'))
app.post('/TestForm',upload.any(), (req,res) => {
  console.log(req.body,req.file,req.fields)
  let myjson = req.body
  console.log('myjson',myjson.name)
})
app.listen(3333, () => console.log('running...'))
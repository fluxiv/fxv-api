const mysql = require('mysql')
require("dotenv").config({
    allowEmptyValues: true
})
var mysqlconnect = mysql.createConnection({
    host: process.env.HOST,
    user:  process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    multipleStatements: true
})

var exp = require('express')
var router = exp.Router()

const { nanoid } = require('nanoid')

router.get('/', (req,res) => {
    console.log('testando essa rota')
    res.send('Welcome to groups route!')
})

router.post('/create',(req,res) => {
    console.log(req.body.params)
    let myId = ''
    myId = nanoid()
    let name = req.body.params.name
    let pic = req.body.params.pic
    mysqlconnect.query('INSERT Into groups (id,name,pic) VALUES (?,?,?)',[myId,name,pic],(err,rows,fields) => {
        if(err){
            res.send({status: 'fail',err:err})
        } else {
            res.send({status: 'ok',rows:rows})
        }
    })
})
router.get('/getall', (req,res) => {
    mysqlconnect.query('SELECT * from groups',(err,rows) => {
        if(err){
            res.send({status: 'fail',err:err})
        } else {
            res.send({status: 'ok',rows:rows})
        }
    })
})

module.exports = router;
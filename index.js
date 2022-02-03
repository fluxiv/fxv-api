//routes
var userRouter = require('./routes/user.router')
var groupsRouter = require('./routes/groups.router')
var feedRouter = require('./routes/feed.router')
//deps
const mysql = require('mysql')
require("dotenv").config({
    allowEmptyValues: true
})
const jwt = require('jsonwebtoken')

const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const cors = require('cors')
// var canUseApi = ['http://localhost:8080','http://localhost:8081']
// var corsOptions = {
//     origin: function (origin, callback) {
//       if (canUseApi.indexOf(origin) !== -1) {
//         callback(null, true)
//       } else {
//         callback(new Error('Not allowed by CORS'))
//       }
//     }
//   }
var corsOptions = {
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

app.set('view engine', 'ejs')
var mysqlconnect = mysql.createConnection({
    host: process.env.HOST,
    user:  process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    multipleStatements: true
})

mysqlconnect.connect((err)=>{
    if(!err){
        console.log('API FXV CONNECT');
        console.log(`Run FXV api on http://localhost:${process.env.PORT}`)
    }
    else{
        console.log('SOMETHING WRONG');
        console.log('Connect to you database')
    }
})

app.listen(process.env.PORT,()=>{
    console.log(`Rodando na porta ${process.env.PORT}`)
})
app.use('/users', userRouter)
app.use('/groups', groupsRouter)
app.use('/feed', feedRouter)
app.get('/', (req,res) => {res.json({'Oi mundo': 'TOP'})})
app.get('/return',(req,res) => {
    console.log(req.params)
    console.log(req.query)
    res.sendFile(`/${req.query.path}`, {root: '.'})
})
// app.post('/groups/create',(req,res) => {
//     console.log(req.body.params)
//     let MyId = nanoid()
//     let Name = req.body.params.Name
//     let Pic = req.body.params.Pic
//     mysqlconnect.query('INSERT Into groups (Id,Name,Pic) VALUES (?,?,?)',[MyId,Name,Pic],(err,rows,fields)=>{
//         if(err){
//             res.send({Status: 'Fail',Err:err})
//         } else {
//             res.send({Status: 'Ok',Rows:rows})
//         }
//     })
// })
	
app.post('/logout', function(req, res) {
    res.json({ auth: false, token: null });
})
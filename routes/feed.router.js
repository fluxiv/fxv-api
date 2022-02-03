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
var Id
Id = nanoid()

const fs = require('fs')
const multer = require('multer')
var path = require('path');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let path = `./uploads/feed/${Id}/`
        fs.mkdirSync(path, { recursive: true })
        cb(null, path);
     },
    filename: function (req, file, cb) {
      cb(null,`${Id}-${Date.now()}${path.extname(file.originalname)}`)
    }
  });
const upload = multer({ storage })

// const util = require('util')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
var salt = bcrypt.genSaltSync(10)


router.get('/', (req,res) => {
    console.log('testando essa rota')
    res.send('rota roda')
})

router.post('/post', verifyjwt ,upload.any(),(req,res) => {
    console.log(req.body)
    console.log(req.files);
    let myparams = JSON.parse(req.body.postdata)
    let myprops = ''
    let myinter = ''
    let myvalues = []
    let groupID = myparams.selectedPost.value
    delete myparams.selectedPost
    let toarr = Object.keys(myparams).map((key)=> [key,myparams[key]])
    let img = []
    toarr.push(["groupID",groupID],["id",Id])
    if(req.files){
        req.files.map((x) => {
            img.push(x.path)
        })
        toarr.push(["img",JSON.stringify(img)])
    }
    console.log(toarr)
    toarr.forEach((x,i) =>{
        if(i == toarr.length - 1){
            myprops += `${x[0]}`
            myinter += '?'
        } else {
            myprops += `${x[0]},`
            myinter += '?,'
        }
        myvalues.push(x[1])
    })

    // let myprops = JSON.parse(req.body.data)
    // myprops.id = Id
    console.log(myprops)
    const myquery = `insert into posts (${myprops}) VALUES (${myinter})`
    mysqlconnect.query(myquery,myvalues,(err,rows,fields) => {
        if(!err)
            res.send({status: 'ok',rows:rows})
        else
        res.send({status: 'fail',err:err})
    })
})



function verifyjwt(req,res,next){
    console.log(req.headers)
    const token = req.headers['x-access-token']

    if (!token) return res.status(401).json({ auth: false, msg: 'No token provided.' });

    jwt.verify(token, process.env.TOKEN, function(err,decoded){
        if(err) return res.status(500).json({ auth: false, msg: 'failed to authenticate token.' })

        console.log(decoded)

        next()
    })

}

module.exports = router;
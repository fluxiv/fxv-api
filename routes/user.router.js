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
var Id = ''
if (Id == '' || Id != '') Id = nanoid()

const fs = require('fs')
const multer = require('multer')
var path = require('path');
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
      let path = `./uploads/user/${Id}/profilepic`
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
router.get('/GetAll',(req,res)=>{
    mysqlconnect.query('SELECT * FROM Users',(err, rows, fields)=>{
        if(!err){
        res.send(rows)
        }
        else
        res.send(err)
    })
})
router.get('/SearchUsersByEmail/email::email', (req,res) => {
    mysqlconnect.query('SELECT Email FROM Users WHERE Email = ?',[req.params.email],(err,rows,fields)=>{
        if(!err && rows.length == 0){
            res.send({msg: 'No Emails Found!',allow: true,email: req.params.email})
        } else if(!err && rows.length > 0){
            res.send({msg: 'Email Already Exisits',allow: false,email: req.params.email})
        } else {
            res.send(err)
        }
    })
})

router.post('/login', (req,res) => {
    console.log(req.query)
    mysqlconnect.query('SELECT * From Users Where Email = ?', [req.query.email],(err,rows,fields) => {
        console.log(err)
        if(!err && rows.length > 0){
            let myrow = rows[0]
            let checkpass = bcrypt.compareSync(req.query.password,myrow.password)
            console.log(checkpass)
            if (checkpass) {
                delete myrow.password
                var token = jwt.sign({id: myrow.id}, process.env.TOKEN, {
                    expiresIn: '7d' // expires in 7day
                });
                res.send({msg: 'ok',allow: true,token: token,MyData:myrow})
            } else{
                console.log('aqui roda?')
                res.send({msg: 'Password not Match',allow: false})
            }
        } else {
            res.send({msg: 'Some Error with your query or email',allow: false})
        }
    })
})

router.post('/PostUser', upload.any() ,(req,res) => {
    console.log(req.body.params)
    // console.log(req.body.Password)
    let myparams = JSON.parse(req.body.params)
    myparams['password'] = req.body.password
    myparams['id'] = Id
    myparams['pic'] = req.files[0].path
    let toarr = Object.keys(myparams).map((key)=> [key, myparams[key]])
    let myprops = ''
    let myinter = ''
    let myvalues = []
    for (let x = 0; x < toarr.length; x++) {
        if(x == toarr.length - 1){
            myprops += `${toarr[x][0]}`
            myinter += '?'
        } else{
            myprops += `${toarr[x][0]},`
            myinter += '?,'
        }
        if(toarr[x][0] === 'password'){
            toarr[x][1] = bcrypt.hashSync(toarr[x][1], salt);
        }
        myvalues.push(toarr[x][1])
        console.log(toarr[x][1])
    }
    console.log(myprops)
    console.log(myvalues);
    var token = jwt.sign({id: myparams['id']}, process.env.TOKEN, {
        expiresIn: '7d' // expires in 7day
    });
    var myquery = `INSERT INTO Users (${myprops}) VALUES (${myinter})`
    mysqlconnect.query(myquery,myvalues, (err,rows, fields) => {
        if(!err)
        res.send({status: 'ok',Rows:rows,id:myparams['id'],token:token})
        else
        res.send({status: 'fail',Err:err})
    })
})

router.post('/AttTerms',verifyjwt,(req,res) => {
    console.log("EU RODO!")
    console.log("Params",req.body.params)
    let mynewparam = '$.' + req.body.params.step
    console.log(mynewparam)
    let mytrue = true
    mysqlconnect.query(`UPDATE Users SET Terms = JSON_SET(Terms,?,?) WHERE id = ?`,[mynewparam,mytrue,req.body.params.id],
    (err,rows, fields) => {
        if(err){
            res.send({status: 'fail', Err: err})
        } else{
            console.log(rows)
            res.send({status: 'ok', rows:rows, rields: fields})
        }
    })

})
router.get('/getuserbyid/id::id',verifyjwt,(req,res) => {

    mysqlconnect.query(`SELECT * FROM users where id = ?`,[req.params.id],(err,rows,fields) =>{
        if(!err){
            delete rows[0].password
            delete rows[0].created_At
            delete rows[0].updated_At
            res.send({status: 'ok', rows:rows[0]})
        } else{
            res.send({status: 'fail', err:err})
        }
    })
})
router.post('/postgroups', verifyjwt, (req, res) => {
    //res.send(req.body.params)
    let groups = JSON.parse(req.body.params.groups)
    let counter = 0
    groups.forEach((element, index) => {
        mysqlconnect.query(`update users SET groups = JSON_INSERT(groups,"$[${index}]",?) WHERE Id = ?;`, [element, req.body.params.id]
        ,(err,rows)=>{
            if(err){
                console.log(err)
            }else{
                console.log(rows)
            }
        })    
    });
    res.send({status: 'ok'})
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
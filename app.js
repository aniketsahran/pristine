const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config({
    path : './.env'
})

const app = express();
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');

db.connect(function(error){
    if(error){
        console.log(error);
    }
    else {
        console.log("MySQL connected.");
    }
})

app.get('/home_hostel', function(req,res){
    var rooms_to_be_cleaned = [];
    var special_requests = [];
    db.query('SELECT * FROM cleaning_req', function(error, results){
        for ( var i = 0; i < results.length; i++) {
            rooms_to_be_cleaned.push(results[i]);
        }
    });
    db.query('SELECT * FROM special_req', function(error, results){
        for ( var i = 0; i < results.length; i++) {
            special_requests.push(results[i]);
        }
    });
    res.render('homepage_hostel', {
        rooms_to_be_cleaned: rooms_to_be_cleaned,
        special_requests: special_requests
    });
    
});


app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/dbase', require('./routes/dbase'));

app.listen(5000, function(){
    console.log("Server started on port 5000");
});
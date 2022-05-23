const mysql = require("mysql");
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

router.get('/',function(req, res) {
    res.render('index');
});

router.get('/home',authController.isLoggedIn, function(req, res) {
    if(req.user) {
        res.render('homepage_student');
    }
    else {
        res.redirect('/')
    }
})

router.get('/home_cleaning', function(req,res){
    res.render('homepage_student_cleaning');
});



module.exports = router;
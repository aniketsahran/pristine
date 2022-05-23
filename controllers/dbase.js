const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {promisify} = require("es6-promisify");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.special_req_func = function(req, res) {
    const {name, email, message} = req.body;
    db.query('INSERT INTO special_req SET ?',{name:name, email:email, message:message}, async function(error, results) {
        if(error) {
            console.log(error);
        }
        else {
            return res.redirect('/home');
        }
    });
}

exports.cleaning_req_func = async function(req, res) {
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], function(error,results) {
                db.query('UPDATE users SET cleaned = 0 WHERE room_no = ?', [results[0].room_no],function(){});
                db.query('INSERT INTO cleaning_req SET ?',{room_no:results[0].room_no, hostel:results[0].hostel, time:req.body.time},function(){});
            });
            res.redirect("/home_cleaning");
        }
        catch(error)
        {
            console.log(error);
        }
    }
    else {
        next();
    }
}

exports.cleaning_done_func = async function(req, res) {
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], function(error,results) {
                db.query('UPDATE users SET cleaned = 1 WHERE room_no = ?', [results[0].room_no],function(){});
                db.query('INSERT INTO cleaned_room SET ?',{room_no:results[0].room_no, hostel:results[0].hostel},function(){});
                db.query('DELETE FROM cleaning_req WHERE room_no = ?', [results[0].room_no],function(){});
            });
            res.redirect("/home");
        }
        catch(error)
        {
            console.log(error);
        }
    }
    else {
        next();
    }
}
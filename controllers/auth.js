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

exports.register = function(req, res) {
    console.log(req.body);
    const {name, roll_no, hostel, room_no, email, password, passwordConfirm} = req.body;
    db.query('SELECT email FROM users WHERE email = ?',[email], async function(error, results) {
        if(error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('index', {
                message: 'The mentioned email is already in use.'
            });
        }
        else if (password !== passwordConfirm) {
            return res.render('index', {
                message: 'The passwords do not match.'
            });
        }
        let hashedPassword = await bcrypt.hash(password,8);
        db.query('INSERT INTO users SET ?',{name:name, roll_no:roll_no, hostel:hostel, room_no:room_no, email:email, hostel_status:0, password:hashedPassword}, function(error, results) {
            if(error) {
                console.log(error);
            }
            else {
                return res.render('index', {
                    message: 'User registered.'
                });
            }
        })
    });
};

exports.login = async function(req, res) {
    try {
        const {roll_no, password} = req.body;
        if(!roll_no || !password) {
            return res.status(400).render('index', {
                message: 'Please provide a roll number and password'
            });
        }
        db.query('SELECT * FROM users WHERE roll_no = ?', [roll_no], async function (error,results) {
            console.log(results);
            if(!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('index', {
                    message: 'Roll number or password is incorrect.'
                });
            }
            else {
                const id = results[0].id;
                const token = jwt.sign({id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES*24*60*60*1000
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions);
                if(results[0].hostel_status === 1) {
                    return res.redirect('/home_hostel');
                }
                else {
                    return res.redirect('/home');
                }
            }
        })
    } 
    catch (error) {
        console.log(error);
    }
}

exports.isLoggedIn = async function(req, res, next) {
    console.log(req.cookies);
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], function(error,results) {
                if (!results) {
                    return next();
                }
                req.user = results[0];
                return next();
            })
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

exports.logout = async function(req, res, next) {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2*1000),
        httpOnly: true
    });
    res.status(200).redirect('/');
}
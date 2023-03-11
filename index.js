const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// const ejs = require('ejs');
const ms = require('mysql2/promise');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const path = require('path');

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

const conn = ms.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "BH"
})


app.get('/signup', (req, res) => {
    if (req.cookies.user) {
        res.redirect("/")
    } else {
        res.render('signup', { error: null });
    }
})


app.post('/signup', async (req, res) => {
    let b = req.body;

    let pwd = await bcrypt.hash(b.pwd, 12)

    let [sel] = await conn.query(`SELECT * FROM BH.jwt_login`);

    let emailExist = false

    sel.forEach(data => {
        if (data.email === b.email) {
            emailExist = true
        }
    })
    if (emailExist) {
        res.render('signup', { error: 'Email already exist' })
    } else {
        await conn.query(`INSERT INTO BH.jwt_login (name, email, pwd, verify) VALUES ('${b.name}','${b.email}','${pwd}','0')`);
        res.render('login', { msg: 'Login successfully', emailErr: null, err: null })
    }
})

app.get('/login', (req, res) => {
    if (req.cookies.user) {
        res.redirect("/")
    } else {
        res.render('login', { msg: null, emailErr: null, passErr: null });
    }
})


app.post('/login', async (req, res) => {
    let b = req.body;

    let [sel] = await conn.query(`SELECT * FROM BH.jwt_login WHERE email = '${b.email}'`);

    if (sel.length == 0) {
        res.render('login', { msg: '', emailErr: 'Invalid email', passErr: null });
    }
    else if (sel.length > 0) {
        let checkPwd = await bcrypt.compare(b.pwd, sel[0].pwd);

        if (checkPwd) {
            //login success
            let token = jwt.sign({ id: sel[0].id, name: sel[0].name }, process.env.SECRET_KEY);

            res.cookie('user', token);

            // res.render('/')

            res.redirect('/');
        } else {
            res.render('login', { msg: '', emailErr: null, passErr: 'Password incorrect' });
        }
    } else {
        res.render('login', { msg: '', emailErr: null, passErr: 'Something went wrong' });
    }
})

app.get('/', (req, res) => {
    checkToken(req, res, "home", "Login successfully...");
})

function checkToken(req, res, filename, msg = "") {
    jwt.verify(req.cookies.user, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) {
            res.render('login', { msg: '', emailErr: "You can't access without login", passErr: null });
        }
        else {
            let [sel] = await conn.query(`SELECT * FROM BH.jwt_login WHERE id = '${decoded.id}' and verify = '1'`);

            if (sel.length > 0) {
                res.render(filename, { msg: msg, user: decoded.name });
            } else {
                res.render("verify")
            }
        }
    });
}
app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.redirect('login');
})
app.get("/update", (req, res) => {
    jwt.verify(req.cookies.user, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) {
            res.render('login', { msg: '', emailErr: "You can't access without login", passErr: null });
        }

        let id = decoded.id;
        let [sel] = await conn.query(`SELECT * FROM BH.jwt_login WHERE id = ${id}`);
        res.render("profile", { user: decoded.name, error: null, data: sel[0] });
    });
})

app.post("/update", async (req, res) => {
    const { name, email, pwd, cpwd } = req.body;

    let [sel] = await conn.query(`SELECT * FROM BH.jwt_login WHERE email = '${email}'`);

    if (sel.length > 0) {
        let checkPwd = await bcrypt.compare(pwd, sel[0].pwd);

        if (checkPwd) {
            //login success
            let token = jwt.sign({ id: sel[0].id, name: name }, process.env.SECRET_KEY);

            res.cookie('user', token);

            let newpwd = await bcrypt.hash(cpwd, 12)

            let [up] = await conn.query(`UPDATE BH.jwt_login SET name='${name}', pwd = '${newpwd}' WHERE email='${email}'`);

            let [sel1] = await conn.query(`SELECT * FROM BH.jwt_login WHERE email = '${email}'`);

            res.render('profile', { user: name, error: null, data: sel1[0] });

        } else {
            res.render('profile', { user: sel[0].name, error: "Old Password doesn't match", data: sel[0] });
        }
    } else {
        res.render('login', { msg: '', emailErr: null, passErr: 'Something went wrong' });
    }

})

app.get("/checkUsername", async (req, res) => {
    let username = req.query.name;

    let [sel] = await conn.query(`SELECT * FROM BH.jwt_login WHERE name = '${username}'`);

    if (sel.length > 0) {
        res.json(true);
    } else {
        res.json(false);
    }

})

app.get("/verify", async (req, res) => {
    res.render("verify");
})

app.get("/verifyUserId", async (req, res) => {
    jwt.verify(req.cookies.user, process.env.SECRET_KEY, async (err, decoded) => {
        let [sel] = await conn.query(`SELECT * FROM BH.jwt_login WHERE id = '${decoded.id}'`);

        if (sel.length > 0) {
            let [up] = await conn.query(`UPDATE BH.jwt_login set verify ='1' WHERE id = '${decoded.id}'`);
            res.render("home", { msg: "Your account is verified successfully", user: decoded.name });
        }
    })

})


//-------------------------------ALL JS PROJECTS-------------------------------------------------------

app.get('/js', async (req, res) => {
    let name = req.query.name;
    if (name) {
        checkToken(req, res, 'home')
        res.sendFile(__dirname + `/views/js/${name}/index.html`);

    } else {
        checkToken(req, res, 'home')
    }
});








app.listen(3001, () => {
    console.log("listening on 3000");
});
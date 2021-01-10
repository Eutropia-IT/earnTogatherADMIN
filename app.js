require('dotenv').config()
const express = require('express');
const path = require('path');

const hbs = require('hbs');
hbs.registerHelper('equal', require('handlebars-helper-equal'));
hbs.registerHelper('dateFormat', require('handlebars-dateformat'));




const pageRoute = require('./routes/pageRoute');

const session = require('express-session');
const flash = require('connect-flash');

const MysqlStore = require('express-mysql-session')(session);

const sessionDB = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'site_management'
}
const sessionStore = new MysqlStore(sessionDB);

// create app
const app = express();
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.use(session({
    secret: 'my-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(flash())


app.use('/', pageRoute);



app.listen(5000, ()=>{
    console.log('admin server ok');
});
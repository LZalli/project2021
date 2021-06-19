const express = require('express');
const app = express();

const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));



app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
const methodOverride = require('method-override');


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

//middleware for  method override
app.use(methodOverride('_method'));
const facebookRoutes = require('./routes/facebook');
app.use(facebookRoutes);
app.listen(3000, ()=> {
  console.log('Server is started');
});
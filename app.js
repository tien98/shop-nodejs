const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const routerProducts = require('./api/routes/products');
const routerOrders = require('./api/routes/orders');
const routerUsers = require('./api/routes/users');

mongoose.connect('mongodb+srv://' + process.env.MONGO_ATLAS_US + ':' + process.env.MONGO_ATLAS_PW + '@cluster0-3jqqr.mongodb.net/shop?retryWrites=true&w=majority', {
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;

const app = express();

app.use(cors());
// {
//     origin: "*",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     preflightContinue: false,
//     optionsSuccessStatus: 201,
//     credentials: true
//   }
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin',"*");
//     res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     next();
//     }) 
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });
  
//   app.get('/', function (req, res) {
//     var data = {
//       "bestAnimals": [
//         "wombat",
//         "corgi",
//         "puffer fish",
//         "owl",
//         "crow"
//       ]
//     };
  
//     res.json(data);
//   });

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
        return res.status(200).json({});
    }
    next();
});

app.use('/products', routerProducts);
app.use('/orders', routerOrders);
app.use('/user', routerUsers);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);

});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});
module.exports = app;
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');


//db connections
mongoose.connect(`mongodb+srv://admin:${process.env.MONGO_ATLAS_PWD}@cluster0.tq0xu.mongodb.net/shop?retryWrites=true&w=majority`,
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}
);
mongoose.Promise = global.Promise;

//middlewares

app.use(morgan('dev')); //give request type in console
app.use('/uploads', express.static("uploads"));
//Body Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header((req, res, next) => {
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-type, Accept, AUthorization"
    });
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", 'PUT, POST, DELETE, GET, PATCH');
        return res.status(200).json({});
    }
    next();
});


//Routes which should handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found!');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
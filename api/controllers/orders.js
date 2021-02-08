const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

exports.orders_get_all = (req, res, next) => {
    Order.find()
    .select('product quantity _id')
    .populate('product')
    .exec()
    .then(docs => {
        console.log(docs);
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id : doc._id,
                    product : doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: "https://localhost:5000/orders" + doc._id
                    }
                }
            }),
            
        });
    })
    .catch(error =>{
        console.log(error);
        res.status(500).json(error);
    })
};

exports.orders_create_order = (req, res, next) => {

    Product.findById(req.body.productId)
    .then( product => {
        const order = new Order ({
            _id : mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        
        return order.save();
    })
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: "Order Stored",
            createOrder: {
                _id: result._id,
                product: result.productId,
                quantity: result.quantity
            },
            request: {
                type: "GET",
                url : 'https://localhost:5000/orders/'+ result._id
            }
        });
    })
    .catch(error => {
        res.status(500).json({
            message: 'Product not found!',
            error
        });
    });
};

exports.orders_get_order = (req, res, next) => {
    Order.findByIdAndUpdate(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: "https://localhost/5000/orders"
            }
        });
    })
    .catch(error => {
        res.status(500).json(error)
    })
};

exports.orders_delete_order = (req, res, next) => {
    Order.remove({_id: req.params.orderId})
    .exec()
    .then(result => {
        if(!order) {
            res.status(404).json({
                message: "Order not found!"
            });
        }
        else {res.status(200).json({
            message: "Order removed",
            request: {
                type: 'GET',
                url: "https://localhost/5000/orders"
            }
        });}
    })
    .catch(error => {
        res.status(500).json(error)
    });
};


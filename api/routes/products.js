const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const product = require('../models/product');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) =>{
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.minetype === 'image/jpeg' || file.minetype === 'image/png'){
        //accepts a file
        cb(null, true);
    } else {
        //reject a file
        cb(null, false);
    }
};

const upload = multer({
    storage: storage, 
    limits: {fileSize: 1024 * 1024 * 5},
    fileFilter: fileFilter
});

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
        const response = {
            count : docs.length,
            products :docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request: {
                        type: "GET",
                        url: "http://localhost:5000/products/" + doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                mesaage: "Created product successfully!",
                createProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: "http://localhost:5000/products/" + result._id
                    }
                }
            });
        })
        .catch(err => console.log(err));  
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    if(!product) {
        return res.status(404).json({
            message: "Product not found!"
        });
    }
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'Get all products',
                    url: 'https://localhost:3000/products'
                }
            }); 
        } else {
            res.status(404).json({message: "Sorry, No valid entry found for this id!"});
        }   
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id : id}, { $set : updateOps })
    .exec()
    .then(result => {
        
        res.status(200).json({
            message: 'Product Updated',
            request: {
                type: 'GET',
                url: 'https://localhost:3000/products' + id
            }
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: error
        });
    });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id : id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product Deleted'
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({error})
    });
});

module.exports = router;
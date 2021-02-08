const express = require('express');
const router = express.Router();

const multer = require('multer');
const checkAuth = require('../middleware/check_auth');
const ProductController = require('../controllers/products');


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


router.get('/', ProductController.products_get_all);

router.post('/', checkAuth, upload.single('productImage'), ProductController.products_create_product);

router.get('/:productId', ProductController.products_get_product);

router.patch('/:productId', checkAuth, ProductController.products_update_product);

router.delete('/:productId', checkAuth, ProductController.products_delete);

module.exports = router;
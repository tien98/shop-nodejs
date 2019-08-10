const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const Product = require('../models/product');
const checkAuth  = require('../middleware/checkAuth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
      cb(null,file.originalname)
    }
  })
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
      cb(null, false)
    }
} 
const upload = multer({ 
    storage: storage, 
    limits: {
        fieldSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/', checkAuth, (req, res, next) => {
    Product.find()
        .select('name price _id imageProduct')
        .exec()
        .then(docs => {
            console.log("Loaded!");
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        imageProduct: doc.imageProduct,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:5000/products/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            })
        })
});

router.post('/',checkAuth ,upload.single('imageProduct'),(req, res, next) => {
    const product = new Product({
        _id : new mongoose.Types.ObjectId(),
        name : req.body.name,
        price : req.body.price,
        imageProduct: req.file.path
    });
    product
        .save()
        .then(result => {
            console.log("Created!");
            res.status(201).json({
                message: 'Create Product Successfully',
                createProduct : {
                    _id: result.id,
                    name: result.name,
                    price: result.price,
                    imageProduct: result.imageProduct,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:5000/products/'+ result._id
                    } 
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    
});

router.get('/:productId',checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id imageProduct')
        .exec()
        .then(doc => {
            console.log("Loaded a product!");
            if(doc){
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:5000/products'
                    }
                });
            }else{
                res.status(404).json({
                    message: 'No found for provided ID'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

router.patch('/:productId', checkAuth,upload.single('imageProduct'), (req, res, next) => {
    const id =  req.params.productId;
    const updateOps =  req.body;
    const imageProduct = req.file.path;
        updateOps.imageProduct = imageProduct
    //update a prop
    // const updateOps = {};
    // for(const ops of req.body) {
    //     updateOps[ops.propName] = ops.value;
    // }
    //test: "propName": "nameUpdate", "value": "valueUpdate"
    Product.updateOne({ _id : id } , { $set : updateOps })
        .exec()
        .then(result => {
            console.log("Updated!");
            res.status(200).json({
                message : 'Updated Successfully',
                request: {
                    type: 'GET',
                    url: 'http://localhost:5000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            });
        });
})

router.delete('/:productId', checkAuth,(req, res, next) => {
    const id =  req.params.productId;
    Product.deleteOne({_id : id})
        .exec()
        .then(result => {
            console.log('Deleted!')
            res.status(200).json({
                message: 'Delete Successfully',
                request: {
                    type: 'POTS',
                    url: 'http://localhost:5000/products',
                    body: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            })
        })
})
module.exports = router;
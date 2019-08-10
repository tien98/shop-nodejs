const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const checkAuth = require('../middleware/checkAuth');

router.get('/',checkAuth, (req, res, next) => {
    Order.find()
        .select('quantity productId _id')
        .populate({ path: 'productId'})
        // .populate('productId', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        quantity: doc.quantity,
                        productId: doc.productId,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:5000/orders/' + doc._id
                        }
                    }
                })
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

router.post('/',checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
        .then( product => {
            if(!product){
                return res.status(404).json({
                    message: 'Product not found'
                })
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                productId: req.body.productId
            });
            return order.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Order stored!',
                createOrder: {
                    _id: result._id,
                    quantity: result.quantity,
                    productId: result.productId
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:5000/orders/' + result._id 
                }
            })
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            })
        });
});

router.get('/:orderId',checkAuth, (req, res, next) => {
    id = req.params.orderId;
    Order.findById(id)
        .populate({ path: 'productId'})
        .exec()
        .then(order => {
            if(!order){
                return res.status(404).json({
                    message: 'Order not found'
                })
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:5000/orders'
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

router.patch('/:orderId',checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    const updateOps = req.body;

    Order.update({_id: id}, { $set: updateOps })
        .exec()
        .then(result => {
            console.log("Updated!");
            res.status(200).json({
                message : 'Updated Order Successfully',
                request: {
                    type: 'GET',
                    url: 'http://localhost:5000/orders/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            });
        })
});

router.delete('/:orderId',checkAuth, (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Deleted Order!',
                request: {
                    type: 'POST',
                    url: 'http://localhost:5000/orders',
                    body: { quantity: 'Number', productId: 'ID'}
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});
module.exports = router;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length >= 1){
                res.status(409).json({
                    login: false,
                    message: 'Email exists'
                });
            }else{
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err){
                        return res.status(500).json({
                            error: err
                        })
                    }else{
                        const user = new User({
                            email: req.body.email,
                            password: hash,
                            firstName: req.body.firstName
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    login: true,
                                    message: 'User created!'
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    login: false,
                                    error: err
                                })
                            })
                    }
            });
            }
        })
});

router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
                if(user.length < 1){
                    return res.status(401).json({
                        message: 'Email failed'
                    });
                }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                console.log(result)
                if(err){
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if(result){
                    const token = jwt.sign(
                    {
                        email: user[0].email,
                        name: user[0].firstName,
                        id: user[0]._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "24h"
                    });
                    return res.status(200).json({
                        message: 'Auth successful',
                        data :user,
                        token: token
                    })
                }
                res.status(401).json({
                    message: 'Password failed'
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        }
        )
});

router.get('/:userId', (req, res, next) => {
    const id = req.params.userId ;
    User.findById(id)
        .exec()
        .then(user => {
            res.status(200).json({
                user: user
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

router.delete('/:userId', (req, res, next) => {
    User.deleteOne({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User Deleted!'
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});
module.exports = router;
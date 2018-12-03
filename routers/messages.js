const express = require('express');
const moment = require('moment');
const mongoose = require('mongoose');
const Message = require('../models/messages');
require('dotenv-flow').config();
require('moment-timezone');

const router = express.Router();

router.get('/messages', async (req, res, next) => {

    const messages = await Message.find({});

    res.render('messages', { 
        title: 'Messages',
        data: req.user,
        messages
    });
    
});

router.post('/messages', checkAuth, async (req, res, next) => {

    try {

        let messages = await Message.find({});
        messages = messages.length;

        const newMessage = await new Message({
            _id: mongoose.Types.ObjectId(),
            userID: req.user.id,
            userName: `${req.user.username}#${req.user.discriminator}`,
            userAvatar: req.user.avatar,
            message: req.body.message,
            messageID: messages + 1,
            submittedOn: moment(new Date).format('MM/DD/YYYY HH:mm:ss')
        });

        newMessage.save().then(console.log).catch(console.error);
        res.redirect('/messages');

    } catch (err) {
        console.error(err)
    }

});

router.delete('/messages/:messageID/delete', checkAuth, async (req, res, next) => {

    try {
        
        let message = await Message.findOne({ messageID: req.params.messageID });
        if (!message) return res.status(404).json({ 
            status: res.statusCode, 
            message: `Could not find a message with the ID ${req.params.messageID}.`
        })

        if (req.user.id === message.userID) {
            await message.delete().then(console.log).catch(console.error);
        }

    } catch (err) {
        console.error(err);
    }

});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send('not logged in :(');
}

module.exports = router;
const express = require('express');
const router = express.Router();
const { chatModel } = require('../models/chat.model');

class ChatManager {
    constructor() {
        this.createMessage = this.createMessage.bind(this);
        this.getMessages = this.getMessages.bind(this);
        this.getMessageById = this.getMessageById.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
        this.deleteMessage = this.deleteMessage.bind(this);

        // Define las rutas en el constructor
        this.defineRoutes();
    }

    async createMessage(req, res) {
        try {
            const { user, message } = req.body;

            if (!user || !message) {
                return res.status(400).send('Usuario y mensaje son obligatorios.');
            }

            const newMessage = {
                user,
                message
            };

            const result = await chatModel.create(newMessage);

            res.send({
                status: 'success',
                payload: result
            });
        } catch (error) {
            res.status(500).send(`Error del servidor: ${error.message}`);
        }
    }

    async getMessages(req, res) {
        try {
            const messages = await chatModel.find({}).lean().exec();

            res.send({
                status: 'success',
                payload: messages
            });
        } catch (error) {
            res.status(500).send(`Error del servidor: ${error.message}`);
        }
    }

    async getMessageById(req, res) {
        try {
            const { pid } = req.params;
            const message = await chatModel.findOne({ _id: pid }).lean().exec();

            res.send({
                status: 'success',
                payload: message
            });
        } catch (error) {
            res.status(500).send(`Error del servidor: ${error.message}`);
        }
    }

    async updateMessage(req, res) {
        try {
            const { pid } = req.params;
            const bodyData = req.body;

            const result = await chatModel.findOneAndUpdate({ _id: pid }, bodyData, { new: true }).lean().exec();

            res.send({
                status: 'success',
                payload: result
            });
        } catch (error) {
            res.status(500).send(`Error del servidor: ${error.message}`);
        }
    }

    async deleteMessage(req, res) {
        try {
            const { pid } = req.params;
            const result = await chatModel.findByIdAndDelete({ _id: pid }).lean().exec();

            res.send({
                status: 'success',
                payload: result
            });
        } catch (error) {
            res.status(500).send(`Error del servidor: ${error.message}`);
        }
    }

    defineRoutes() {
        router.post('/', this.createMessage);
        router.get('/', this.getMessages);
        router.get('/:pid', this.getMessageById);
        router.put('/:pid', this.updateMessage);
        router.delete('/:pid', this.deleteMessage);
    }
}

const chatManager = new ChatManager();

module.exports = router;

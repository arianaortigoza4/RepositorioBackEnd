const { Router } = require('express')
const MockController = require('../controllers/mock.controller')

const router = Router()

const {
    generateUsers
} = new MockController()

router.get('/generateUsers',        generateUsers )

module.exports = router

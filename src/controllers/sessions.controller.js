const UserMongoManager = require("../dao/Mongo/usersDao.mongo")

const { createHash, isValidPassword } = require('../utils/hashBcrypt')
const passport = require('passport')

class SessionController {
    constructor(){
        this.userService = new UserMongoManager()
        // this.userService = new UserFileManager()
        // this.userService = new UserMemoryManager()
    }

    register = async (req, res)=>{
        res.status(200).json({
            status: 'success',
            message: 'Usuario creado correctamente'
        })
        
    }
    
    login  = async (req, res)=>{
        if (!req.user) return res.status(401).send({status: 'error', error: 'creadential invalid'})
        req.session.user = {
            name: `${req.user.first_name} ${req.user.last_name}`,
            admin: req.user.admin,
            email: req.user.email
        }

        // console.log("req.session.user.admin : " + req.session.user.admin)

        res.status(200).send({
            status: 'success',
            payload: req.session.user,
            message: 'Login correcto',
            redirectTo: '/realtimeproducts?name=' + encodeURIComponent(req.session.user.name) + '&admin=' + encodeURIComponent(req.session.user.admin)
        })
    }


    current = async (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ status: 'error', error: 'No session found' });
        }
    
        res.status(200).json({
            status: 'success',
            payload: req.session.user,
            message: 'Current session data retrieved successfully'
        });
    }


    logout = (req, res) => {
        // session.destroy()
        req.session.destroy(err => {
            if(err) return res.send({status:'Logout error', message: err})           
        })
        res.status(200).redirect('/login')
    }

    failregister = (req, res) => {
        res.send({error: 'falla en el register'})
    }

    
}

module.exports = SessionController
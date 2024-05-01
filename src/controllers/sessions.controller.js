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
            role: req.user.role,
            email: req.user.email
        }
        console.log("req.session.user.role: ", req.session.user.role)
        let urlRedirect = ""
        if(req.session.user.role === "admin" || req.session.user.role === "premium") {
            urlRedirect = '/realtimeproducts?name=' + encodeURIComponent(req.session.user.name) + '&role=' + encodeURIComponent(req.session.user.role)
        }else{
            urlRedirect = '/products?name=' + encodeURIComponent(req.session.user.name) + '&admin=false'
        }
        console.log(urlRedirect)
        
        res.status(200).send({
            status: 'success',
            payload: req.session.user,
            message: 'Login correcto',
            redirectTo: urlRedirect
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

    isAdmin = (req, res, next) => {
        // Verifica si hay una sesión de usuario
        if (!req.session.user) {
            return res.status(401).json({ status: 'error', error: 'No session found' });
        }
        if (req.session.user.role !== "admin") {
            return res.status(403).json({ status: 'error', error: 'Unauthorized' });
        }
    
        next();
    };


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
const { Router } = require('express')
const { sendMail } = require('../utils/sendEmail.js')
const jwt = require('jsonwebtoken');

const router = Router()

router.post('/', async (req, res) => {
    try {
        let email = req.body.email;
        // Generar un token con el correo electrónico y la hora de expiración
        const token = jwt.sign({ email: email }, 'secreto', { expiresIn: '1h' });

        

        // Construir el enlace para recuperar la contraseña
        const recoveryLink = `http://localhost:8080/mail/recuperar-contrasena/${email}/${token}`;

        console.log("email: " + email)
        const destinatario = email;
        const subject = 'Recuperación de contraseña';
        const html = "<div><h1>Este es un correo electrónico de recuperación de contraseña: </h1><h2>" + recoveryLink + "</h2></div>";
        await sendMail(destinatario, subject, html);
        res.send('Correo electrónico de recuperación enviado');
    } catch (error) {
        console.error('Error al enviar el correo electrónico de recuperación:', error);
        res.status(500).send('Error al enviar el correo electrónico de recuperación');
    }
});

router.get('/recuperar-contrasena/:email/:token', async (req, res) => {
    try {
        const { email,token } = req.params;

        // Verificar el token
        const decodedToken = jwt.verify(token, 'secreto');

        // Verificar que el token no haya expirado
        if (new Date(decodedToken.exp * 1000) < new Date()) {
            return res.status(400).send('El enlace de recuperación de contraseña ha expirado');
        }

        // Si el token es válido, permitir al usuario restablecer su contraseña
        // Aquí puedes redirigir al usuario a una página de restablecimiento de contraseña
        res.render('reset-password', { email,token }); // 'reset-password' es el nombre de tu plantilla Handlebars
    } catch (error) {
        console.error('Error al verificar el token de recuperación de contraseña:', error);
        res.status(400).send('El enlace de recuperación de contraseña no es válido');
    }
});

module.exports = router

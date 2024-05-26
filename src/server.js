const express = require('express');
const cartsRouter = require('../src/routes/carts.router.js');
const productsRouter = require('../src/routes/products.router');
const userRouter = require('../src/routes/users.router');
const handlebars = require('express-handlebars');
const { Server: ServerIO } = require('socket.io');
const fs = require('fs/promises');
const { connectDB } = require('./configDB/connectDB.js');
const cartManager = require('../src/dao/mongo/CartsManager.js');
//const chatManagerRouter = require('../src/dao/mongo/ChatManager.js');
const viewsProductsRouter = require('./routes/views.products.routes.js');
const viewsCartRouter = require('./routes/views.cart.routes.js');

const mockingRouter = require('../src/routes/mocking.router');

const loggerTest = require('../src/routes/loggertest.router.js');
const { userService, productService } = require("../src/repositories")

const swaggerJsDocs = require('swagger-jsdoc')
const swaggerUiExpress = require('swagger-ui-express')


const { userModel } = require('../src/dao/models/users.model')
const { productsModel } = require('../src/dao/models/products.model')

const MongoStore = require('connect-mongo'); // Importa MongoStore desde connect-mongo
const session = require('express-session'); // Importa el middleware express-session
const cookieParser = require('cookie-parser'); // Importa el middleware cookie-parser
const logger = require('morgan'); // Importa el middleware de registro
const sessionRouter = require('../src/routes/session.routes.js');
const { auth } = require('../src/middleware/authentication.js')

const { loggerWrite } = require('../src/logger/logger.js')
const mailRouter = require('../src/routes/mail.router');

const passport = require('passport')
const { initializePassport } = require('./dao/mongo/sessionManager.js')

const dotenv = require('dotenv')
const { program } = require("../src/enviroment/commander")

const { mode } = program.opts()
loggerWrite.info(mode)
dotenv.config({
    path: mode === 'development' ? 'src/enviroment/.env.development' : 'src/enviroment/.env.production'
})

loggerWrite.debug('TEST');
exports.configObject = {
    port: process.env.PORT || 8080,
    mongo_url: process.env.MONGO_URL,
    jwt_secret_Key: process.env.JWT_SECRET_KEY
}


const app = express();
const PORT = 3000;

connectDB();

loggerWrite.info(__dirname + '/public');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'))
app.use(cookieParser())

loggerWrite.debug("mongoUrl: " + exports.configObject.mongo_url)
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
        ttl: 10
    }), 
    secret: 's3cr3t0',
    resave: false,
    saveUninitialized: false,
}))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

const httpServer = app.listen(process.env.PORT, () => {
    loggerWrite.info('Escuchando en el puerto ' + process.env.PORT);
});

const io = new ServerIO(httpServer);

app.get('/', (req, res) => {
    res.render('index', {});
});

app.get('/login', (req, res) => {
    res.render('login', {});
});

app.get('/register', (req, res) => {
    res.render('register', {});
});


app.get('/realtimeproducts', (req, res) => {
    console.log('req.session.email:', req.session.email)
    res.render('realtimeproducts', {emailSession : req.session.email});
});

app.get('/api/chat', (req, res) => {
    res.render('chat/chat', {});
});


app.get('/carts', (req, res) => {
    res.render('cart', {});
});


app.get('/users', async (req, res) => {
    const {limit = 10, pageQuery = 1} = req.query
    const {
        docs,
        hasPrevPage, 
        hasNextPage,
        prevPage, 
        nextPage,
        page 
    } = await userModel.paginate({}, {limit, page: pageQuery, sort: {first_name: -1}, lean: true})
    loggerWrite.debug(docs,
        hasPrevPage, 
        hasNextPage,
        prevPage, 
        nextPage,
        page)
    res.render('users', {
        limit: limit,
        users: docs,
        hasPrevPage, 
        hasNextPage,
        prevPage, 
        nextPage,
        page 
    })
})

// sweagger config -> documentación
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación de app Coder House',
            description: 'Descripción de nuestro proyecto'
        }
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
} 

const specs = swaggerJsDocs(swaggerOptions)
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))
app.get('/products', async (req, res) => {
    //const currentCart = await cartManager.createCart('0',0,0);
    //loggerWrite.debug(currentCart._id.toString());
    const {limit = 10, pageQuery = 1} = req.query
    const {
        docs,
        hasPrevPage, 
        hasNextPage,
        prevPage, 
        nextPage,
        page 
    } = await productsModel.paginate({}, {limit, page: pageQuery, sort: {title: -1}, lean: true})
    loggerWrite.debug(docs,
        hasPrevPage, 
        hasNextPage,
        prevPage, 
        nextPage,
        page)
    res.render('products', {
        limit: limit,
        products: docs,
        hasPrevPage, 
        hasNextPage,
        prevPage, 
        nextPage,
        page 
    })
})




app.use('/session', sessionRouter);
app.use('/mail', mailRouter);
app.use('/api/users', userRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/products', (req, res, next) => {
    // Llama a tu función personalizada aquí
    updateJsonClient();
    loggerWrite.debug('ACTUALIZAR PRODUCTO');
    // Continúa con el siguiente middleware/route handler
    next();
});
app.use('/api/products', productsRouter);
app.use('/api/mocking', mockingRouter);

app.use('/loggertest', loggerTest);

// Importa el chatManagerRouter y asigna una ruta adecuada
//app.use('/api/chat', chatManagerRouter);

// Agrega el middleware para la ruta '/'
app.use('/', viewsProductsRouter(io));

// Agrega el middleware para la ruta '/cart'
app.use('/cart', viewsCartRouter);

let mensajes = [];

async function readFile(path) {
    try {
        const dataProducts = await fs.readFile(path, 'utf-8');
        return JSON.parse(dataProducts);
    } catch (error) {
        return [];
    }
}


async function getProductsByFile(path) {
    const products = await readFile(path);

    if (!products || products.length === 0) {
        return 'producto vacío';
    }

    return products;
}

async function updateJsonClient() {
    try {
        const response = await productService.getProducts();
        const jsonData = JSON.stringify(response, null, 2);
        //console.log(jsonData);
        io.emit('message', jsonData);
        //loggerWrite.debug('\n\n\n\n\n updateJsonClient \n\n\n\n\n' + jsonData);
    } catch (error) {
        console.error('Error al obtener datos JSON:', error);
    }
}

function cbConnection(socket) {
    loggerWrite.info('cliente conectado');
    updateJsonClient();
    socket.on('message', (data) => {
        //loggerWrite.info(data);
        mensajes.push(data);
        loggerWrite.debug('MENSAJE RECIBIDO EN EL SERVIDOR');
    });
}

io.on('connection', (socket) => {
    cbConnection(socket);
});

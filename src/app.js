
// config
const config = require('./config.js');

// Express
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Auth
const auth = require('./auth/auth.js')

const cookieParser = require('cookie-parser')

// helpers
//const { ensureAdmin } = require('./helpers/helpers')

// middleware
const middleware = require('./middlewares/middleware')

// API
const productController = require('./controllers/product')
const orderController = require('./controllers/order')
const userController = require('./controllers/user')

const port = global.gConfig.node_port || 1337
//const port = process.env.PORT || 1337

const app = express()

// -- Security
// https://expressjs.com/fr/advanced/best-practice-security.html

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
//app.use(cors());
app.use(middleware.cors)    // TODO : à conserver ?

// adding morgan to log HTTP requests
app.use(morgan('combined'));    // 'tiny|combined'

// auth cookies
app.use(cookieParser())

// disable server signature
app.disable('x-powered-by');

// Auth
//auth.setMiddleware(app) // NB: if session cookie id

/**
 * routes
 */

app.get('/', (req, res) => {
    res.json({ data: `Welcome to ${global.gConfig.app_name} !` }).status(200);
});

// -- users
app.get('/users', userController.list)
app.get('/users/:username', userController.get)
app.post('/users', userController.create)
app.put('/users/:username', auth.ensureAdmin, userController.edit)
app.delete('/users/:username', auth.ensureAdmin, userController.destroy)

// -- auth
app.post('/login', auth.authenticate, auth.login)

// -- products
app.get('/products', productController.list)
app.get('/products/:id', productController.get)
app.post('/products', auth.ensureUser, productController.create)
app.put('/products/:id', auth.ensureUser, productController.edit)
app.delete('/products/:id', auth.ensureUser, productController.destroy)

// -- orders
app.get('/orders', auth.ensureUser, orderController.list)
app.get('/orders/:id', auth.ensureUser, orderController.get)
app.post('/orders', auth.ensureUser, orderController.create)

app.use(middleware.handleValidationError)
app.use(middleware.handleError)
app.use(middleware.notFound)

/**
 * scripts
 *
 * import products db : node ./src/db/import-products
 */

app.listen(port, () => {
    console.log(`Server listening on port ${port}\n Please open ${global.gConfig.host}:${global.gConfig.node_port}/ in your browser.');`)
})





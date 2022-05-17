// Bismillahi Rahmoni Raohiym
const express = require('express');

const app = express();

// require dotenv
require('dotenv').config();

// reqire ejs
const ejs = require('ejs');


// require morgan
const morgan = require('morgan');

// require mongodb
require('./config/mongodb')

// require and use express-session for cookie
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session);

const store = new MongoDBSession({
    uri: process.env.MONGO_DB,
    collection: "userSessions"
})

app.use(session({
    secret: "key that will sign cookie",
    resave: false,
    saveUninitialized: false,
    store: store 
}))



// set const PORT
const PORT = process.env.PORT || 5000; 

// use static folder
app.use(express.static('public'));


// set view engine
app.set('view engine', ejs)

// middleware
app.use(express.urlencoded());
app.use(express.json());
// app.use(morgan('common'));

// require users router
const usersRoute = require('./routes/users');
// require auth router
const authRouter = require('./routes/auth')
// require show router
const showRouter = require('./routes/show');
// require prodData router
const prodDataRouter = require('./routes/productionData')
// create news router
const createNewsRouter = require('./routes/adminActions/createNews')
// teachers router
const teachersRouter = require('./routes/adminActions/teachers')
// courses router
const coursesRouter = require('./routes/adminActions/courses')
// adminActions get router
const adminActionsRouter = require('./routes/adminActions');
// likes router
const likesRouter = require('./routes/like')
// use routes
app.use('/users', usersRoute);
app.use('/api/auth', authRouter);
app.use(showRouter);
app.use('/productionData', prodDataRouter);
app.use('/createNews', createNewsRouter)
app.use('/teachers', teachersRouter)
app.use('/courses', coursesRouter)
app.use('/adminActions', adminActionsRouter);
app.use("/like", likesRouter);

// server listening

app.listen(PORT, ()=>console.log(`Server runnning on port ${PORT}`));


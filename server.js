const express =require ('express');
const mongoose = require ('mongoose');
const passport = require('passport');
const router = express.Router();
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const users = require ('./routes/api/users.js');
const profiles = require ('./routes/api/profiles.js');
const posts = require ('./routes/api/posts.js');




//Body parser middleware
app.use(bodyParser.urlencoded({extended:true}));

//app.use(bodyParser.json({ type: 'application/*+json' }))

//db config
const db = require ('./config/keys').mongoURI;

// Connect to mongodb
mongoose
    .connect(db,{useUnifiedTopology: true,useNewUrlParser: true})
    .then (()=> console.log('Mongo DB is connected'))
    .catch(err => console.log(err));


//Passport middleware
app.use(passport.initialize());

//Passport config
require('./config/passport')(passport);

// Routes
app.use('/api/users', users);
app.use('/api/profiles', profiles);
app.use('/api/posts', posts);


app.post('/',(req,res) => {
    console.log(req.body)
    res.send("hello");
});


app.post('/',(req,res) => {
    console.log(req.body)
    res.send("hello");
});




const port = process.env.port || 5000;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
});


const express =require ('express');
const mongoose = require ('mongoose');

users = require ('./routes/api/users.js');
profiles = require ('./routes/api/profiles.js');
posts = require ('./routes/api/posts.js');


const app = express();

//db config
const db = require ('./config/keys').mongoURI;

// Connect to mongodb
mongoose
    .connect(db)
    .then (()=> console.log('Mongo DB is connected'))
    .catch(err => console.log(err));

app.get('/',(req,res) => {
    res.send("hello");
});

// Routes
app.use('/api/users', users);
app.use('/api/profiles', profiles);
app.use('/api/posts', posts);

const port = process.env.port || 5000;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
});


const express =require ('express');
const mongoose = require ('mongoose');

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

const port = process.env.port || 5000;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
});


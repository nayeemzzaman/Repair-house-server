const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yuvpr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());

app.use(fileUpload());

const port = 4000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("mobileRepair").collection("service");
    const adminCollection = client.db("mobileRepair").collection("admin");
    const orderCollection = client.db("mobileRepair").collection("orders");
    const reviewCollection = client.db("mobileRepair").collection("review");

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ name, price, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

    app.get('/order/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, data) => {
                res.send(data);
            })
    })
    app.post('/addOrder' , (req, res) => {
        const order = req.body;
        
        orderCollection.insertOne(order)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/orders', (req, res) => {
        orderCollection.find({email: req.query.email})
        .toArray((err, items) => {
            res.send(items);
        })
    })
    app.get('/allOrders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                console.log(documents);
                res.send(documents);
            })
    })
    app.get('/allService' , (req, res) => {
        serviceCollection.find({})
        .toArray( (err, data) => {
            res.send(data);
        })
    })
    app.post('/addReview' , (req, res) => {
        const order = req.body;

        reviewCollection.insertOne(order)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })
    app.post('/addAdmin' , (req, res) => {
        const email = req.body.email;
        adminCollection.insertOne({email})
        .then(result => {
            console.log(result);
            res.send(result.insertedCount > 0);
        })
    })

    app.delete('/delete/:id', (req, res) => {
        serviceCollection.deleteOne({_id: ObjectId(req.params.id)})
        .then(result => {
            console.log(result)
        })
    })

    app.patch('/update/:id',(req, res) =>{
        orderCollection.updateOne({_id: ObjectId(req.params.id)}
        ,{
            $set: {status: req.body.status},
        })
        .then(result =>{
            res.send(result.modifiedCount > 0);
        })
      })
});


app.listen(process.env.PORT || port)
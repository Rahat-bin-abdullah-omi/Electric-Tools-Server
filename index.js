const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY);

app.use(cors())
app.use(express.json())


const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader) {
        res.status(401).send({ message: "unAuthorization" })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbiddenAccess' })
        }
        req.decoded = decoded
        next()
    });
}

// const { json } = require('express');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f9lm3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const toolsCollection = client.db("Products").collection("tools");
        const PurchaseCollection = client.db("Products").collection("purchase");
        const reviewCollection = client.db("Products").collection("reviews");
        const profileCollection = client.db("Products").collection("addProfile");
        const userCollection = client.db("Products").collection("AllUsers");
        //   all get method   / /
        app.get('/tools', async(req, res) => {
            const tools = await toolsCollection.find().toArray();
            res.send(tools)
        })
        app.get('/tools/:id', async(req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const findTool = await toolsCollection.findOne(query);
                res.send(findTool)
            })
            // show purchase orders
        app.get('/orders', async(req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const orders = await PurchaseCollection.find(query).toArray();
            res.send(orders)
        })
        app.get('/orders/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const orders = await PurchaseCollection.find(query).toArray();
            res.send(orders)
        })

        app.get('/reviews', async(req, res) => {
            const reviews = await reviewCollection.find().toArray();
            res.send(reviews)
        })

        app.get('/profile', async(req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const profile = await profileCollection.find(query).toArray();
            res.send(profile)
        })

        app.get('/findAdmin/:email', async(req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user ? .role === 'admin';
            res.send({ admin: isAdmin })

        })

        app.get('/showAllUser', async(req, res) => {
            const allUser = await userCollection.find({}).toArray();
            res.send(allUser)
        })

        app.get('/allOrders', async(req, res) => {
            const allOrders = await PurchaseCollection.find().toArray();
            res.send(allOrders)
        })
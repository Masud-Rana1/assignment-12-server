const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxqgc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try{
        await client.connect();
        const database = client.db("woodenCraft");
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');


        app.get('/orders', async (req, res)=> {
          const email = req.query.email;
          const query = {email:email}
          const cursor = ordersCollection.find(query);
          const orders = await cursor.toArray();
          res.json(orders);
        });

        // Orders delete Api
        app.delete('/orders/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const result = await ordersCollection.deleteOne(query);
          res.json(result);
        });

        app.post('/orders', async (req, res) => {
          const order = req.body;
          const result = await ordersCollection.insertOne(order);
          
          res.json(result)
        });


        // review apis post
        app.post('/reviews', async(req, res) => {
          
          const review = req.body;
          

          
          const result = await reviewsCollection.insertOne(review);
          console.log(result);
          res.json(result);
        });


        app.get('/reviews', async (req, res)=> {
          const cursor = reviewsCollection.find({});
          const reviews = await cursor.toArray();
          res.json(reviews);
        });




        app.get('/users/:email', async(req, res)=> {
          const email = req.params.email;
          const query = {email: email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
            isAdmin = true;
          }
          res.json({admin: isAdmin});
        })


        app.get('/products', async (req, res) => {
          const cursor = productsCollection.find({});
          const products = await cursor.toArray();
          res.send(products);
        });

        // GET single product
        app.get('/products/:id', async(req, res) =>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const product = await productsCollection.findOne(query);
          res.json(product);
        })


        app.post('/products', async(req, res) => {
          const service = req.body;
          console.log('hit the post api', service);
          const result = await productsCollection.insertOne(service);
          console.log(result);
          res.json(result);
        })


        app.post('/users', async(req, res)=>{
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.json(result);
        });
        app.put('/users/admin', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email};
          const updateDoc = {$set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        })
    }
    finally{
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello assaignment!')
})

app.listen(port, () => {
  console.log(` listening at ${port}`)
})
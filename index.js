const express = require ('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



// MongoDb 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgqhclb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db("tranquilHavenDb").collection("users");
    const instructorCollection = client.db("tranquilHavenDb").collection("instructors");
    const classesCollection = client.db("tranquilHavenDb").collection("classes");
    const cartCollection = client.db("tranquilHavenDb").collection("carts");


    // User related API
    app.get('/users', async(req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })
    
    app.post('/users', async(req,res) => {
      const user = req.body;
      console.log(user);
      const query = {email: user.email}
      const existingUser = await usersCollection.findOne(query);
      console.log('Existing user: ',existingUser)
      if(existingUser){
        return res.send({message: 'user already exists'})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    // instructor related API
    app.get('/instructors' , async(req,res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    })

    // class related API
    app.get('/classes' , async(req,res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

    // Cart collection process
    app.get('/carts',async(req,res) => {
      const email = req.query.email;
      if(!email){
        res.send([]);
      }
      const query = {email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/carts', async(req, res) =>{
        const course = req.body;
        console.log(course);
        const result = await cartCollection.insertOne(course);
        res.send(result);
    })

    app.delete('/carts/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req,res) => {
    res.send('Summer camp server is running')
})

app.listen(port, () => {
    console.log(`Summer camp server is running on port ${port}`);
})
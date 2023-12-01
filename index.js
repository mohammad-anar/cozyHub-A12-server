const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const cors = require("cors");
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zav38m0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    const apartmentCollection = client.db("prh-a12").collection("apartments");
    const agreementCollection = client.db("prh-a12").collection("agreements");
    const userCollection = client.db("prh-a12").collection("users");
    const announcementCollection = client
      .db("prh-a12")
      .collection("announcements");
    const cuponCollection = client.db("prh-a12").collection("cupons");

    app.get("/apartments", async (req, res) => {
      const result = await apartmentCollection.find().toArray();
      res.send(result);
    });
    // agreements apis
    app.get("/agreements", async (req, res) => {
      const result = await agreementCollection.find().toArray();
      res.send(result);
    });

    app.get("/agreements", async (req, res) => {
      const query = { userEmail: req?.query?.email };
      const result = await agreementCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/agreements", async (req, res) => {
      const agreementData = req.body;
      const result = await agreementCollection.insertOne(agreementData);
      res.send(result);
    });

    app.put("/agreements/:id", async (req, res) => {
      const id = req.params?.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "checked",
        },
      };
      const result = await agreementCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    app.delete("/agreements/:id", async (req, res) => {
      const id = req.params?.id;
      const query = { _id: new ObjectId(id) };
      const result = await agreementCollection.deleteOne(query);
      res.send(result);
    });
    // announcement api
    app.get("/announcements", async (req, res) => {
      const result = await announcementCollection.find().toArray();
      res.send(result)
    })
    app.post("/announcements", async (req, res) => {
      const announcement = req.body;
      const result = await announcementCollection.insertOne(announcement);
      res.send(result);
    });
    // cupons apis
    app.get("/cupons", async (req, res) => {
      const result = await cuponCollection.find().toArray();
      res.send(result)
    })
    app.post("/cupons", async(req, res) => {
      const cupon = req.body;
      const result = await cuponCollection.insertOne(cupon);
      res.send(result)
      console.log(cupon);
    })
    // user related api
    app.get("/users", async (req, res) => {
      const query = { role: "member" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params?.email;
      const query = { email };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.put("/users/:email", async (req, res) => {
      const email = req.params?.email;
      const query = { email: email};
      const updatedDoc = {
        $set: {
          role: "member",
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.patch("/users/:id", async (req, res) => {
      const id = req.params?.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "user",
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    // payment related api 
    app.post("/create-payment-intent", async(req, res)=>{
      const {price} = req.body;
      const amount = parseFloat(price * 100)
      // create payment intent 
      const paymentIntent = stripe.paymentIntents.create({
        amount:amount,
        currency: "usd",
        payment_method_types:["card"]
      })
      res.send({
        clientSecret:paymentIntent.client_secret
      })
    })

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Primerental hub is running");
});

app.listen(port, () => {
  console.log(`prime rental hub is rinning on port: ${port}`);
});

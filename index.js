const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())

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

    app.get("/apartments", async (req, res) => {
        const result = await apartmentCollection.find().toArray();
        console.log(result, "apartments");
      res.send(result);
    });

    app.post("/agreements", async (req, res) => {
        const agreementData = req.body;
        const result = await agreementCollection.insertOne(agreementData)
        res.send(result)
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

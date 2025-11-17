const express = require('express');
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

// 👇 [CHANGE KORA HOYECHE] Shothik Environment Variable use kora hoyeche
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3adt9xq.mongodb.net/?appName=Cluster0`;

//middleware
app.use(cors());
app.use(express.json());

//client create..
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Server is running...')
})

async function run() {
    try {
        // 👇 [CHANGE KORA HOYECHE] Ei line-ti uncomment kora hoyeche. Eti-i shobcheye joruri.
        await client.connect();

        const db = client.db("food-lovers-db")
        const userCollection = db.collection('users');
        const reviewsCollection = db.collection('reviews');
        const favoriteCollection = db.collection('favorite');

        //review api call
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find().sort({ rating: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/all-reviews', async (req, res) => {
            const cursor = reviewsCollection.find().sort({ createdAt: -1 })
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/myReviews', async (req, res) => {
            const email = req.query.email;
            const query = {};
            query.email = email;
            const causer = reviewsCollection.find(query).sort({ createdAt: 1 });
            const result = await causer.toArray();
            res.send(result);
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await reviewsCollection.findOne(query);
            res.send(result);
        })

        //search api 
        app.get("/search", async (req, res) => {
            const search_text = req.query.search
            const result = await reviewsCollection.find({ foodName: { $regex: search_text, $options: "i" } }).toArray()
            res.send(result)
        })
        //search api end...

        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.send(result);
        })

        app.put("/reviews/:id", async (req, res) => {
            const { id } = req.params;
            const data = req.body;
            const objectId = new ObjectId(id);
            const query = { _id: objectId };
            const update = {
                $set: data,
            };

            const result = await reviewsCollection.updateOne(query, update);

            res.send({ result });
        });

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })


        //favorite all api..
        //in challenge req.....
        app.post('/favorite', async (req, res) => {
            const newFavorite = req.body;
            const favoriteReviewCardId = req.body.favoriteReviewCardId;
            const query = { 
                favoriteReviewCardId: favoriteReviewCardId,
                userEmail: newFavorite.userEmail
             };
            const existingFavorite = await favoriteCollection.findOne(query);
            if (existingFavorite) {
                res.send({ message: "existingFavorite" })
            } else {
                const result = await favoriteCollection.insertOne(newFavorite);
                res.send(result);
            } 
        })

        app.get('/myFavorite', async (req, res) => {
            const userEmail = req.query.email;
            const query = {};
            query.userEmail = userEmail;
            const causer = favoriteCollection.find(query);
            const result = await causer.toArray();
            res.send(result);
        })

        app.delete('/myFavorite/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await favoriteCollection.deleteOne(query);
            res.send(result);
        })

        //user all api...
        app.post('/user', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                res.send({ message: "User already exist , do not insert again.." })
            } else {
                const result = await userCollection.insertOne(newUser);
                res.send(result);
            }
        })

        // 👇 [CHANGE KORA HOYECHE] Ei line-ti uncomment kora hoyeche
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`server listening on port ${port}`)
})
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const USER_DB =`createUsers`;
const PASS_DB = `yPpKTZONGwJ9phUk`;


const uri = `mongodb+srv://${USER_DB}:${PASS_DB}@cluster2.cv4uqat.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {


        const createUsers = client.db("userCreate").collection("users");
        const userPoste = client.db("userCreate").collection("userPost");
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await createUsers.insertOne(users);
            res.send(result);
        })
        app.get('/users', async (req, res) => {
            const query = {};
            const state = await createUsers.find(query).toArray();
            res.send(state);
        })
        app.post('/userPost', async (req, res) => {
            const users = req.body;
            const result = await userPoste.insertOne(users);
            res.send(result);
        })
        app.get('/userPost', async (req, res) => {
            const query = {};
            const state = await userPoste.find(query).toArray();
            res.send(state);
        })

        //post like button
        app.put("/posts/like/:id", async (req, res) => {
            const userEmail = req.query.email;
            const postId = req.params.id;
            //find the post
            const query = { _id: ObjectId(postId), };
            const query2 = { _id: ObjectId(postId), likes: { $all: [userEmail] }, };
            const exist = await userPoste.findOne(query2);
            if (!exist) {
                const updatedDoc = {
                    $inc: { quantity: 1 },
                    $push: {
                        likes: userEmail,
                    },
                };
                const options = { upsert: true };
                const result = await userPoste.updateOne(
                    query,
                    updatedDoc,
                    options
                );
                return res.send(result);
            }
            const updatedDoc = {
                $inc: { quantity: -1 },
                $pull: {
                    likes: userEmail,
                },
            };
            const options = { upsert: true };
            const result = await userPoste.updateOne(query, updatedDoc, options);
            res.send(result);
        });
        app.delete("/userPostDelete/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await userPoste.deleteOne(filter);
            res.send(result);
        })
        app.get("/users/admin/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await createUsers.findOne(query);
            res.send({ isAdmin: user?.role === "Admin" });
          });

    }
    finally {

    }
}
run().catch(console.log);


app.get('/', async (req, res) => {
    res.send('Server is running');
})

app.listen(port, () => {
    console.log('Server is running')
})
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();
// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.REACT_APP_mongodb_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    const taskCollection = client.db('tasksApp').collection('allTasks');
    try {
        app.put('/tasks', async(req, res)=> {
            const task = req.body;
            const filter = {};
            const options = { upsert: true };
            const updateDoc = {
                $set: task,
            };
            const results = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(results);
        })
        app.get('/', async (req, res) => {
            res.send("server running for tasks app")
        })
    } catch (error) {
        console.log(error)
    }
}
run().catch(err => console.error(err));

app.listen(port, () => {
    client.connect(err => {
        if (err) {
            console.log(err)
        }
        console.log('running task app server', port)
    });
})
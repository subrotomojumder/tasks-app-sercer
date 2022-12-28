const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        app.post('/tasks', async(req, res)=> {
            const task = req.body;
            const results = await taskCollection.insertOne(task);
            res.send(results);
        })
        app.put('/tasks/:id', async(req, res)=> {
            const id = req.params.id;
            const updateTask = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: updateTask
            };
            const results = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(results);
        })
        app.get('/tasks/:email', async(req, res)=> {
            const email = req.params.email;
            const completed = req.query.completed;
            if (completed === 'complete') {
                const filter = { $and: [{ userEmail: { $eq: email } }, { completed: { $eq: true }}] }
                const tasks = await taskCollection.find(filter).toArray();
                return res.send(tasks);
            }
            const filter = { $and: [{ userEmail: { $eq: email } }, { completed: { $ne: true } }] }
            const tasks = await taskCollection.find(filter).toArray();
            res.send(tasks)
        })
        app.delete('/tasks/:id', async(req, res)=> {
            const query = {_id: ObjectId(req.params.id)};
            const results = await taskCollection.deleteOne(query);
            res.send(results)
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
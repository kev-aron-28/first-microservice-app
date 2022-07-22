const { default: axios } = require('axios');
const express = require('express');
const { v4: uuid } = require('uuid');
const cors = require('cors');
const app = express();
const port = 4000;
const posts = {};


app.use(cors())
app.use(express.json());

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/posts', async (req, res) => {
    const id = uuid();
    const { title } = req.body;
    posts[id] = {
        id,
        title,
    };

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: {
            id,
            title
        }
    })

    res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
    console.log(`Event received : ${req.body.type}`);
    res.send({});
});

app.listen(port, () => console.log(`Using latest version: Posts app listening on port ${port}!`));
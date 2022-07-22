const express = require('express');
const { v4:uuid } = require('uuid');
const cors = require('cors');
const app = express();
const port = 4001;
const commetsByPostId = {};
const { default: axios } = require('axios');

app.use(cors());
app.use(express.json());

app.get('/posts/:id/comments', (req, res) => {
    res.send(commetsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = uuid();
    const { content } = req.body;
    const comments = commetsByPostId[req.params.id] || [];
    comments.push({ id: commentId, content, status: 'pending' });

    commetsByPostId[req.params.id] = comments;

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'
        }
    })

    res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
    try {
        const { data, type } = req.body

        if(type === 'CommentModerated') {
            const { postId, id, status, content } = data;
            const comments = commetsByPostId[postId];
            const commentToUpdate = comments.find(c => c.id == id);
            commentToUpdate.status = status;
            await axios.post('http://event-bus-srv:4005/events', {
                type: 'CommentUpdated',
                data: {
                    id,
                    content,
                    postId,
                    status
                }
            })
        }

        res.send({});
    } catch (error) {
        console.log(error);
    }
});


app.listen(port, () => console.log(`Comments service listening on port ${port}!`))
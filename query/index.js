const express = require('express');
const app = express();
const port = 4002;
const cors = require('cors');
const { default: axios } = require('axios');

const posts = {};

app.use(cors());
app.use(express.json());

const handleEvent = (type, data) => {
    if(type === 'PostCreated') {
        const { id, title } = data;
        posts[id] = { 
            id,
            title,
            comments: []
        }
    }

    if(type === 'CommentCreated') {
        const { id, content, postId, status } = data;
        const post = posts[postId];
        post.comments.push({
            id,
            content,
            status
        })
    }

    if(type === 'CommentUpdated') {
        const { id, content, postId, status } = data;
        const post = posts[postId];
        const comment = post.comments.find(c => c.id == id);
        comment.status = status;
        comment.content = content;
        
    }

}


app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    handleEvent(type, data);

    res.send({});
});

app.listen(port, async () => {
    console.log(`Query app listening on port ${port}!`)
    try {
        const { data } = await axios.get('http://event-bus-srv:4005/events')
        for (const event of data) {
            console.log(`Processing event: `, event.type);
            handleEvent(event.type, event.data);
        }
    } catch (error) {
        console.log(error);    
    }
})
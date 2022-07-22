const express = require('express');
const app = express();
const cors = require('cors');
const { default: axios } = require('axios');
const port = 4003;


app.use(express.json());
app.use(cors());

app.post('/events', async (req, res) => {
    try {
        const { type, data } = req.body;
        const { id, postId, content } = data;
        console.log(data);
        if(type === 'CommentCreated') {
            const status = data.content.includes('orange') ? 'rejected' : 'approved';
            await axios.post('http://event-bus-srv:4005/events', {
                type: 'CommentModerated',
                data: { 
                    id,
                    postId,
                    status,
                    content,
                }
            });
        }

        return res.send({});
    } catch (error) {
        console.log(error);
        return res.json(error);    
    }
});

app.listen(port, () => console.log(`Moderation app listening on port ${port}!`));

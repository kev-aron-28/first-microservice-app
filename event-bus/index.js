const express = require('express');
const app = express();
const port = 4005;
const cors = require('cors');
const { default: axios } = require('axios');

app.use(cors());
app.use(express.json());

const events = [];

app.post('/events', async (req, res) => {
   try {
        const event = req.body;
        events.push(event);
        console.log(`New event ${event.type}`);
        await axios.post('http://posts-clusterip-srv:4000/events', event);
        await axios.post('http://comments-srv:4001/events', event);
        await axios.post('http://query-srv:4002/events', event);
        await axios.post('http://moderation-srv:4003/events', event);
        res.send({ status: 'OK',});

   } catch (error) {
        res.send(error);
   }
});

app.get('/events',  (req, res) => {
    res.send(events);
});

app.listen(port, () => console.log(`Event bus listening on port ${port}!`))
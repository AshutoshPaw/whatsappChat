const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello, this is WhatsApp bot');
});
app.get('/webhook', (req, res) => {
    const verify_token = "YouCanSetYourOwnToken";

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === verify_token) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

app.post('/webhook', (req, res) => {
    const { body } = req;
    console.log(body);

    // Verify the callback came from WhatsApp
    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
            const from = body.entry[0].changes[0].value.messages[0].from;
            const msg_body = body.entry[0].changes[0].value.messages[0].text.body;

            // Send a response back to the user
            axios({
                method: 'POST',
                url: `https://graph.facebook.com/v19.0/${phone_number_id}/messages?access_token=${process.env.WHATSAPP_TOKEN}`,
                data: {
                    messaging_product: 'whatsapp',
                    to: from,
                    text: { body: `You sent: ${msg_body}` },
                },
                headers: { 'Content-Type': 'application/json' },
            });
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

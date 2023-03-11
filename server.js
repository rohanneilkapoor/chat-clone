import { Configuration, OpenAIApi } from 'openai'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const fs = require('fs');
const express = require('express')
const cors = require('cors')
const app = express()
const port = 8080

app.use(express.json())
app.use(require('cors')())
const { Pool } = require('pg');

const pool = new Pool({
  user: 'rohankapoor',
  host: 'localhost',
  database: 'chat_db',
  password: 'password',
  port: 5432,
});

require('dotenv').config()

const openAI_SECRET_KEY = process.env.OPENAI_SECRET_KEY

const configuration = new Configuration({
    apiKey: openAI_SECRET_KEY
})
const openai = new OpenAIApi(configuration)

const queue = [];

fs.readFile('ORDERS.csv', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    // Do something with the CSV string
    //console.log(data);

    const messages = [
        {
            "role": 'system', 
            "content": 'You are a wonderfully helpful assistant. I am giving you a CSV from an ERP system of a manufacturing company. I will ask you questions about it. Here is the data: ' + data
        }
    ]
    storeMessages('INSERT INTO chat_messages (messages) VALUES ($1)');
    
    async function storeMessages(query){
        console.log(messages)
        const client = await pool.connect()
        await client.query(query, [JSON.stringify(messages)])
        client.release()
    }
    
    async function sendPrompt(input) {
        const model = 'gpt-3.5-turbo'
        const userInput = {"role": 'user', "content": input}
        messages.push(userInput)
    
        const completion = await openai.createChatCompletion({
            model,
            messages
        })
        const APIResponse = completion.data.choices[0].message
        messages.push(APIResponse)
        storeMessages('UPDATE chat_messages SET messages = $1 WHERE id = (SELECT id FROM chat_messages ORDER BY id ASC LIMIT 1)');
        
        return completion.data.choices
    }
    
    function queueHandler() {
        if (queue.length > 0) {
            const { prompt, res } = queue.shift();
            sendPrompt(prompt)
                .then(answer => {
                    res.status(200).json({
                        'message': answer
                    });
                    queueHandler();
                })
                .catch(error => {
                    res.status(500).json({
                        'error': error
                    });
                    queueHandler();
                });
        }
    }
    
    //route
    app.post('/api', async (req, res) => {
        const { prompt } = req.body;
        queue.push({ prompt, res });
        if (queue.length === 1) {
            queueHandler();
        }
    })
    
    app.get('/messages', async (req, res) => {
        const client = await pool.connect();
        const query = 'SELECT messages FROM chat_messages';
        const result = await client.query(query);
        client.release();
      
        res.status(200).send(result.rows);
    });
    
    app.get('/', (req, res)=>{
        res.send("Welcome to your server")
    })
    
    app.listen(port, () => console.log(`Server has started on port: ${port}`))
});
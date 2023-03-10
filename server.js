import { Configuration, OpenAIApi } from 'openai'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
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

async function sendPrompt(input) {
    const model = 'gpt-3.5-turbo'
    const messages = [
        {
            "role": 'system', 
            "content": 'You are a wonderfully helpful assistant.'
        },
        {
            "role": 'user', 
            "content": input
        }
    ]

    const completion = await openai.createChatCompletion({
        model,
        messages
    })
    const APIResponse = completion.data.choices[0].message
    messages.push(APIResponse)
    
    const client = await pool.connect()
    const query = 'INSERT INTO chat_messages (messages) VALUES ($1)'
    await client.query(query, [JSON.stringify(messages)])
    client.release()
    return completion.data.choices
}


//route
app.post('/api', async (req, res) => {
    const {prompt} = req.body
    console.log(req.body)
    const answer = await sendPrompt(prompt)
    res.status(200).json({
        'message': answer
    })

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
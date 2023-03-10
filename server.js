import { Configuration, OpenAIApi } from 'openai'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const express = require('express')
const cors = require('cors')
const app = express()
const port = 8080

app.use(express.json())
app.use(require('cors')())

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
    //console.log(completion.data.choices)
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

app.get('/', (req, res)=>{
    res.send("Welcome to your server")
})

app.listen(port, () => console.log(`Server has started on port: ${port}`))
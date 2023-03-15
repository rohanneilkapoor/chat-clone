import { Configuration, OpenAIApi } from 'openai'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const fs = require('fs');
const express = require('express')
const cors = require('cors')
const app = express()
const port = 8080
const { promisify } = require('util')
const parseString = promisify(require('xml2js').parseString)
const { spawn } = require('child_process');

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

    const messages = [
        {
            "role": 'system', 
            "content": 'You are the best programmer in the world. You write code very carefully, \
                        considering all edge cases to make sure the code works correctly 100% of \
                        the time. You triple check your code and you do not hesitate to write long \
                        code if it means your code is more likely to work correctly. You are getting a CSV from an ERP \
                        system of a manufacturing company. The name of the CSV is "ORDERS.csv" A \
                        user will ask you questions about it. Most of their questions will be about \
                        the data itself. When the user asks questions about the data, you must \
                        always output a python program that answers that question. Here is the CSV:' + data
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
        const userInput = {
            "role": 'user', 
            "content": 'Remember, you are the best programmer in the world. You write code very carefully, \
                        considering all edge cases to make sure the code works correctly 100% of \
                        the time. You triple check your code and you do not hesitate to write long \
                        code if it means your code is more likely to work correctly. Remember\
                        that a user is asking you questions about about the CSV you were \
                        originally given. The CSV is from an ERP system of a manufacturing company.\
                        If the user is asking questions about the data, you must always output a \
                        python program that answers the question. This python program should work 100% \
                        of the time. You need to be extremely careful to make sure it always works and \
                        always returns the correct output. The name of the csv file is \
                        "ORDERS.csv" Here is what the user just said: ' + input
        }
        messages.push(userInput)
    
        const completion = await openai.createChatCompletion({
            model: model,
            messages: messages,
            temperature: 0
        })
        const APIResponse = completion.data.choices[0].message
        const APIResponseText = APIResponse.content
        console.log("API RESPONSE TEXT IS: ", APIResponseText)
        const regex1 = /```python\n([\s\S]*)```/
        const regex2 = /```(?:\s*)(import[\s\S]*?)```/
        const match1 = regex1.exec(APIResponseText)
        const match2 = regex2.exec(APIResponseText)
        if (match1) {
            const pythonCode = match1[1];
            console.log("HERE IS THE PYTHON CODE1", pythonCode)
            //runPython(pythonCode)
            completion.data.choices[0].message.content = await runPython(pythonCode)
            messages.push(APIResponse)
            storeMessages('UPDATE chat_messages SET messages = $1 WHERE id = (SELECT id FROM chat_messages ORDER BY id ASC LIMIT 1)');
          } else if (match2) {
            const pythonCode = match2[1];
            console.log("HERE IS THE PYTHON CODE2", pythonCode)
            //runPython(pythonCode)
            completion.data.choices[0].message.content = await runPython(pythonCode)
            messages.push(APIResponse)
            storeMessages('UPDATE chat_messages SET messages = $1 WHERE id = (SELECT id FROM chat_messages ORDER BY id ASC LIMIT 1)');
          } 
          else {
            console.log("Python code not found (inside sendPrompt function)")
        }
        
        return completion.data.choices
    }
    
    async function runPython(pythonCode) {
        // Spawn a new Python process
        const pythonProcess = spawn('python3', ['-c', pythonCode]);
    
        // Capture output from the Python process
        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
    
        // Capture error output from the Python process
        let errorOutput = '';
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
    
        // Handle process completion
        const exitCode = await new Promise((resolve) => {
            pythonProcess.on('close', (code) => {
                resolve(code);
            });
        });
    
        if (exitCode !== 0) {
            console.error(`Python process exited with code ${exitCode}`);
            console.error('Error output:', errorOutput);
            fixError(pythonCode, errorOutput)
        }
    
        return output.trim();
    }

    async function fixError(pythonCode, errorOutput){
        const model = 'gpt-3.5-turbo'
        const userInput = {
            "role": 'user', 
            "content": 'I have the following python code: ' + pythonCode + "I'm getting the following error: " + errorOutput
        }
        messages.push(userInput)
    
        const completion = await openai.createChatCompletion({
            model: model,
            messages: messages,
            temperature: 0
        })
        const APIResponse = completion.data.choices[0].message
        const APIResponseText = APIResponse.content
        console.log("API RESPONSE TEXT IS: ", APIResponseText)
        const regex1 = /```python\n([\s\S]*)```/
        const regex2 = /```(?:\s*)(import[\s\S]*?)```/
        const match1 = regex1.exec(APIResponseText)
        const match2 = regex2.exec(APIResponseText)
        if (match1) {
            const pythonCode = match1[1];
            console.log("HERE IS THE PYTHON CODE1", pythonCode)
            //runPython(pythonCode)
            completion.data.choices[0].message.content = await runPython(pythonCode)
            messages.push(APIResponse)
            storeMessages('UPDATE chat_messages SET messages = $1 WHERE id = (SELECT id FROM chat_messages ORDER BY id ASC LIMIT 1)');
          } else if (match2) {
            const pythonCode = match2[1];
            console.log("HERE IS THE PYTHON CODE2", pythonCode)
            //runPython(pythonCode)
            completion.data.choices[0].message.content = await runPython(pythonCode)
            messages.push(APIResponse)
            storeMessages('UPDATE chat_messages SET messages = $1 WHERE id = (SELECT id FROM chat_messages ORDER BY id ASC LIMIT 1)');
          } 
          else {
            console.log("Python code not found (inside fixError function)")
        }
        
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
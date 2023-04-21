import { Configuration, OpenAIApi } from 'openai'
import { createRequire } from 'module'
import { fileURLToPath } from 'url';
const DATABASE_URL = process.env.DATABASE_URL || "postgres://rohankapoor:password@localhost:5432/chat_db";
const require = createRequire(import.meta.url)
const fs = require('fs');
const path = require('path');
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 8080
const { promisify } = require('util')
const parseString = promisify(require('xml2js').parseString)
const { spawn } = require('child_process');
const multer = require('multer');
const fsPromises = fs.promises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json())
app.use(require('cors')())
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false
});

require('dotenv').config()

const openAI_SECRET_KEY = process.env.OPENAI_SECRET_KEY

const configuration = new Configuration({
    apiKey: openAI_SECRET_KEY
})
const openai = new OpenAIApi(configuration)

const queue = [];

app.use(express.static(path.join(__dirname, 'client')));

app.post('/upload_csv', upload.single('csv'), async (req, res) => {
    const file = req.file;
    if (!file) {
        console.log("didn't do it");
        return res.status(400).send({ message: 'No file uploaded.' });
    }

    const fileName = file.originalname;
    const content = file.buffer.toString('utf8');

    // Write the content to the ORDERS.csv file
    try {
        await fsPromises.writeFile('ORDERS.csv', content);
        console.log("Wrote content to ORDERS.csv");
    } catch (error) {
        console.error("Failed to write content to ORDERS.csv:", error);
    }

    fs.readFile('ORDERS.csv', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        // Split the content by lines
        let lines = data.split('\n');
    
        // Extract the first 30 rows, including the header row
        let first30Rows = lines.slice(0, 30).join('\n');
    
        messages[0].content = 'You are the best programmer in the world. You write code very carefully, \
                                considering all edge cases to make sure the code works correctly 100% of \
                                the time. You triple check your code so that there is 0% chance of a syntax error. You are getting a CSV from an ERP \
                                system of a manufacturing company. The name of the CSV is "ORDERS.csv" A \
                                user will ask you questions about it. Most of their questions will be about \
                                the data itself. When the user asks questions about the data, you must \
                                always output a python program that answers that question. Here are the first 30 rows of the CSV, including the header row:' + first30Rows;
        console.log("MESSAGES ARE: ", messages);
    });

    try {
        const client = await pool.connect();
        const query = 'INSERT INTO csvs (file_name, content) VALUES ($1, $2)';
        await client.query(query, [fileName, content]);
        client.release();

        res.status(200).send({ message: 'CSV file uploaded and stored in the database.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to store CSV file in the database.' });
        console.log("there was some error");
    }
});




const messages = [
    {
        "role": 'system', 
        "content": ''
    },
    {
        "role": 'user',
        "content": 'Remember, you are the best programmer in the world. You write code very carefully, \
                    considering all edge cases to make sure the code works correctly 100% of \
                    the time. You triple check your code so that there is 0% chance of a syntax error. Remember\
                    that a user is asking you questions about about the CSV you were \
                    originally given. The CSV is from an ERP system of a manufacturing company.\
                    If the user is asking questions about the data, you must always output a \
                    python program that answers the question. This python program should work 100% \
                    of the time. You need to be extremely careful to make sure it always works and \
                    always returns the correct output. The name of the csv file is \
                    "ORDERS.csv" Here is what the user just said: how many rows are there that contain the number "100". Your response should\
                    only contain the code and no other text. The program must always print out both the answer \
                    and all the row indices in the CSV that are involved in the answer. The print statement must always be formatted \
                    as "ANSWER: [answer], ROW INDICES: [show only a list of row indices here and no other text]". You must be careful to only show a list of numbers after "ROW INDICES: ". I am going to copy and paste your entire \
                    response into a code editor so in order for it to run, you cannot include any text\
                    other than the code. You also need to be careful not to include any newline \
                    characters since that will also result in a syntax error. Also do not write ```python.'
    },
    {
        "role": 'assistant',
        "content": 'import csv\n' +
            '\n' +
            'rows_with_100 = []\n' +
            'row_indices = []\n' +
            '\n' +
            'with open("ORDERS.csv", "r") as csvfile:\n' +
            '    csv_reader = csv.reader(csvfile)\n' +
            '    for index, row in enumerate(csv_reader):\n' +
            '        if "100" in row:\n' +
            '            rows_with_100.append(row)\n' +
            '            row_indices.append(index)\n' +
            '\n' +
            '#Format the print statement as "ANSWER: [answer], ROW INDICES: [show only a list of row indices here and no other text]. You must be careful to only show a list of numbers after "ROW INDICES: "\n' +
            'print(f"ANSWER: {len(rows_with_100)}, ROW INDICES: {row_indices}")'
    }
]

fs.readFile('ORDERS.csv', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    // Split the content by lines
    let lines = data.split('\n');

    // Extract the first 30 rows, including the header row
    let first30Rows = lines.slice(0, 30).join('\n');

    messages[0].content = 'You are the best programmer in the world. You write code very carefully, \
                            considering all edge cases to make sure the code works correctly 100% of \
                            the time. You triple check your code so that there is 0% chance of a syntax error. You are getting a CSV from an ERP \
                            system of a manufacturing company. The name of the CSV is "ORDERS.csv" A \
                            user will ask you questions about it. Most of their questions will be about \
                            the data itself. When the user asks questions about the data, you must \
                            always output a python program that answers that question. Here are the first 30 rows of the CSV, including the header row:' + first30Rows;
    console.log("MESSAGES ARE: ", messages);
});

storeMessages('INSERT INTO chat_messages (messages) VALUES ($1)');

async function storeMessages(query){
    console.log(messages)
    const client = await pool.connect()
    await client.query(query, [JSON.stringify(messages)])
    client.release()
}

async function sendPrompt(input) {
    const model = 'gpt-4'
    const userInput = {
        "role": 'user', 
        "content": 'Remember, you are the best programmer in the world. You write code very carefully, \
                    considering all edge cases to make sure the code works correctly 100% of \
                    the time. You triple check your code so that there is 0% chance of a syntax error. Remember\
                    that a user is asking you questions about about the CSV you were \
                    originally given. The CSV is from an ERP system of a manufacturing company.\
                    If the user is asking questions about the data, you must always output a \
                    python program that answers the question. This python program should work 100% \
                    of the time. You need to be extremely careful to make sure it always works and \
                    always returns the correct output. The name of the csv file is \
                    "ORDERS.csv" Here is what the user just said: ' + input +'. Your response should\
                    only contain the code and no other text. The program must always print out both the answer \
                    and all the row indices in the CSV that are involved in the answer. The print statement must always be formatted \
                    as "ANSWER: [answer], ROW INDICES: [show only a list of row indices here and no other text]". You must be careful to only show a list of numbers after "ROW INDICES: ". I am going to copy and paste your entire \
                    response into a code editor so in order for it to run, you cannot include any text\
                    other than the code. You also need to be careful not to include any newline \
                    characters since that will also result in a syntax error. Also do not write ```python.'
    }
    if(messages.length >= 7){
        messages.splice(1, 2);
    }
    messages.push(userInput)
    console.log("MESSAGES BEFORE API CALL IS: ", messages);
    console.log("right before chat completion")
    try {
        const completion = await openai.createChatCompletion({
          model: model,
          messages: messages,
          temperature: 0,
        });
      
        console.log("MESSAGES AFTER API CALL IS: ", messages);
        const APIResponse = completion.data.choices[0].message
        const APIResponseText = APIResponse.content
        console.log("API RESPONSE TEXT IS: ", APIResponseText)
        //completion.data.choices[0].message.content = await runPython(APIResponseText)
        messages.push(APIResponse)
        if(APIResponseText.includes("import csv")){
            let run = await runPython(APIResponseText)
        } else{
            const client = await pool.connect()
            
            // Truncate the table to remove all existing records
            const truncateQuery = 'TRUNCATE TABLE code_output';
            await client.query(truncateQuery);

            // Insert the new content
            const insertQuery = 'INSERT INTO code_output (output) VALUES ($1)';
            await client.query(insertQuery, [APIResponseText])

            client.release()
        }
        storeMessages('UPDATE chat_messages SET messages = $1 WHERE id = (SELECT id FROM chat_messages ORDER BY id ASC LIMIT 1)');

        
        return completion.data.choices
      
    } catch (error) {
        console.error('Error in OpenAI API call:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
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
        await fixError(pythonCode, errorOutput)
    }
    const formattedOutput = output.trim()
    console.log("CODE OUTPUT IS: ", formattedOutput)
    if (formattedOutput !== '') {
        const client = await pool.connect()
        
        // Truncate the table to remove all existing records
        const truncateQuery = 'TRUNCATE TABLE code_output';
        await client.query(truncateQuery);

        // Insert the new content
        const insertQuery = 'INSERT INTO code_output (output) VALUES ($1)';
        await client.query(insertQuery, [formattedOutput])

        client.release()
        return output.trim();
    }
}

async function fixError(pythonCode, errorOutput){
    const model = 'gpt-4'
    const userInput = {
        "role": 'user', 
        "content": 'I have the following python code: ' + pythonCode + 'I am getting the following error: ' + errorOutput + ' \
                    Remember, you are the best programmer in the world. You write code very carefully, \
                    considering all edge cases to make sure the code works correctly 100% of \
                    the time. You triple check your code so that there is 0% chance of a syntax error. This python program should work 100% \
                    of the time. You need to be extremely careful to make sure it always works and \
                    always returns the correct output. Your response should\
                    only contain the code and no other text. The program must always print out both the answer \
                    and all the row indices in the CSV that are involved in the answer. The print statement must always be formatted \
                    as "ANSWER: [answer], ROW INDICES: [show only a list of row indices here and no other text]". You must be careful to only show a list of numbers after "ROW INDICES: ". I am going to copy and paste your entire \
                    response into a code editor so in order for it to run, you cannot include any text\
                    other than the code. You also need to be careful not to include any newline \
                    characters since that will also result in a syntax error. Also do not write ```python.'
    }
    messages.push(userInput)

    const completion = await openai.createChatCompletion({
        model: model,
        messages: messages,
        temperature: 0
    })
    const APIResponse = completion.data.choices[0].message
    const APIResponseText = APIResponse.content
    console.log("API RESPONSE IS: ", APIResponse)
    //completion.data.choices[0].message.content = await runPython(APIResponseText)
    let run = await runPython(APIResponseText)
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
    try {
      const { prompt } = req.body;
      queue.push({ prompt, res });
      if (queue.length === 1) {
        queueHandler();
      }
    } catch (error) {
      console.error('Error in /api endpoint:', error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  });

app.get('/messages', async (req, res) => {
    const client = await pool.connect();
    const query = 'SELECT messages FROM chat_messages';
    const result = await client.query(query);
    client.release();
    
    res.status(200).send(result.rows);
});

app.get('/code_output', async (req, res) => {
    const client = await pool.connect();
    const query = 'SELECT output FROM code_output';
    const result = await client.query(query);
    client.release();
    
    res.status(200).send(result.rows);
});

app.get('/api/pages', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM pages');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching pages.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
  });

app.get('/clear_data', async (req, res) => {
    try {
        const client = await pool.connect();

        // Clear the chat_messages table
        await client.query('DELETE FROM chat_messages');
        
        // Clear the csvs table
        await client.query('DELETE FROM csvs');
        
        // Clear the code_output table
        await client.query('DELETE FROM code_output');
        
        client.release();
        res.status(200).send({ message: 'All data cleared from database tables.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to clear data from database tables.' });
    }
});

app.listen(port, () => console.log(`Server has started on port: ${port}`))

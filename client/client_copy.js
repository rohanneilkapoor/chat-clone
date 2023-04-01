const BASE_URL = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? "http://localhost:8080" : "https://aqueous-hamlet-06344.herokuapp.com";
console.log("location.hostname:", location.hostname);
console.log("BASE_URL:", BASE_URL);



const editableDiv = document.querySelector('div[contenteditable="true"]');
const placeholderDiv = document.querySelector('.placeholder');

placeholderDiv.addEventListener('click', () => {
    placeholderDiv.style.display = 'none';
    editableDiv.style.display = 'block';
    editableDiv.focus();
});

editableDiv.addEventListener('blur', () => {
    if (editableDiv.textContent.trim() === '') {
        editableDiv.style.display = 'none';
        placeholderDiv.style.display = 'block';
    }
});

document.body.addEventListener('click', (event) => {
    if (!editableDiv.contains(event.target) && !placeholderDiv.contains(event.target)) {
        if (editableDiv.textContent.trim() === '') {
            editableDiv.style.display = 'none';
            placeholderDiv.style.display = 'block';
        }
    }
});

editableDiv.addEventListener('paste', (event) => {
    event.preventDefault();
    const plainText = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, plainText);
});

document.addEventListener('DOMContentLoaded', function () {
    
    




    const spreadsheetContainer = document.getElementById('csv-container');

    const preventSwipeNavigation = (event) => {
    const container = event.currentTarget;
    const scrollLeft = container.scrollLeft;

    // Check if the user is at the left edge
    const atLeftEdge = scrollLeft === 0 && event.deltaX < 0;
    // Check if the user is at the right edge
    const atRightEdge = scrollLeft === container.scrollWidth - container.clientWidth && event.deltaX > 0;

    // Prevent default behavior if at either edge
    if (atLeftEdge || atRightEdge) {
        event.preventDefault();
    }
    };

    // Add event listener for wheel events
    spreadsheetContainer.addEventListener('wheel', preventSwipeNavigation, { passive: false });
});


//code for csv upload
const csvUpload = document.querySelector('#csv-upload');
const csvUploadLabel = document.querySelector('.csv-upload-label');
const hiddenElements = document.querySelectorAll('.hidden');

csvUpload.addEventListener('change', async (event) => {
    if (event.target.files && event.target.files.length > 0) {
    // Hide the CSV upload button
    csvUploadLabel.style.display = 'none';

    // Show the rest of the UI
    hiddenElements.forEach((element) => {
        element.classList.remove('hidden');
    });

    // Display the uploaded file name
    const file = event.target.files[0];
    const fileName = file.name;
    displayUploadedFile(fileName);

    // Send the file to the server
    const formData = new FormData();
    formData.append('csv', file);
    try {
        const response = await fetch(`${BASE_URL}/upload_csv`, {
        method: 'POST',
        body: formData,
        });
        if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
    }
    }
});


function displayUploadedFile(fileName) {
    const messagesDiv = document.querySelector('#messages');
    const uploadedFileMessage = `
    <div class="message">
        <img src="open.png" class="profile-picture">
        <div>Hi there. Ask me questions about your data.</div>
    </div>
    `;
    messagesDiv.innerHTML = uploadedFileMessage;

    const csvContainer = document.querySelector('.csv-container');
    const uploadedCSV = `
    <table id="csv-table"></table>
    `;
    csvContainer.innerHTML = uploadedCSV;

    // Read the contents of the CSV file and display in a table
    const fileInput = document.querySelector('#csv-upload');
    const reader = new FileReader();
    reader.readAsText(fileInput.files[0]);
    reader.onload = function (event) {
    const csv = event.target.result;
    const table = document.querySelector('#csv-table');
    let rows = csv.split('\n');
    // Remove last row if it's empty
    if (rows[rows.length - 1].trim() === '') {
        rows.pop();
    }
    // Parse CSV data
    for (let i = 0; i < rows.length; i++) {
        const cells = parseCSVRow(rows[i]);
        const row = document.createElement('tr');

        // Add a new cell at the beginning of each row containing the row number
        const rowIndexCell = document.createElement('td');
        rowIndexCell.textContent = i + 1;
        row.appendChild(rowIndexCell);

        for (let j = 0; j < cells.length; j++) {
        const cell = document.createElement('td');
        cell.textContent = cells[j];
        row.appendChild(cell);
        }
        table.appendChild(row);
    }
    //let table = document.querySelector('.csv-container');
    let columns = table.querySelectorAll('th, td');

    columns.forEach(column => {
        if (column.offsetWidth > 1200) {
        column.style.maxWidth = '1200px';
        column.style.whiteSpace = 'normal';
        }
    });
    };
}

// Helper function to parse a row of CSV data
function parseCSVRow(row) {
    let cells = [];
    let currentCell = '';
    let withinQuotes = false;
    for (let i = 0; i < row.length; i++) {
    const char = row.charAt(i);
    if (char === ',' && !withinQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
    } else if (char === '"') {
        withinQuotes = !withinQuotes;
    } else {
        currentCell += char;
    }
    }
    cells.push(currentCell.trim());
    return cells;
}








const form = document.querySelector('#client-form');
const messagesDiv = document.querySelector('#messages');

function addMessageToDiv(prompt, messagesDiv, image) {
    const message = document.createElement('div');
    message.classList.add('message');
    message.classList.add('non-highlighted-row');
    const profilePicture = document.createElement('img');
    profilePicture.src = image; // set profile picture URL
    profilePicture.classList.add('profile-picture'); // add class to profile picture element

    const text = document.createElement('div');
    text.innerHTML = prompt;

    if (prompt === "Loading...") {
    text.classList.add('flash');
    }

    message.appendChild(profilePicture); // add profile picture element first
    message.appendChild(text);

    if (prompt !== "Loading..." && prompt !== "Loading for a bit longer..." && image === "open.png") {
    // Replace the last child element (the "Loading..." div) with the new message
    messagesDiv.lastElementChild.remove();
    messagesDiv.appendChild(message);

    if (
        !prompt.includes("I'm sorry, but I cannot understand your question.") &&
        !prompt.includes("There was an error.")
    ) {
        message.classList.remove('non-highlighted-row');
        message.classList.add('highlighted-row');
    } else if (prompt.includes("There was an error.")) {
        message.classList.add('error');
    }
    } else {
    messagesDiv.appendChild(message);
    }
}

window.addEventListener('beforeunload', async (event) => {
    // Cancel the event
    event.preventDefault();

    // Make an asynchronous request to the server to clear the data
    await fetch(`${BASE_URL}/clear_data`, {
        method: 'GET'
    });
});

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    let loadingTimeout;
    removeTableHighlights();
    removeChatHighlights();

    const promptInput = document.querySelector('#prompt');
    const prompt = promptInput.value;

    addMessageToDiv(prompt, messagesDiv, 'dad.jpg');
    addMessageToDiv("Loading...", messagesDiv, 'open.png');
    loadingTimeout = setTimeout(() => {
    if (messagesDiv.lastElementChild.querySelector('div').textContent === 'Loading...') {
        messagesDiv.lastElementChild.querySelector('div').textContent = 'Loading for a bit longer...';
    }
    }, 9000);
    promptInput.value = '';

    const data = { prompt };

    try {
    const response = await fetch(`${BASE_URL}/api`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    clearTimeout(loadingTimeout); // Clear the timeout
    if (response.ok) {
        const result = await response.json();
        console.log(result);
        const codeOutputResponse = await fetch(`${BASE_URL}/code_output`);
        const cResponse = await codeOutputResponse.json();
        const messagesResponse = await fetch(`${BASE_URL}/messages`);
        const mResponse = await messagesResponse.json();
        console.log("ALL CODE OUTPUTS: ", cResponse);
        console.log("ALL MESSAGE OUTPUTS: ", mResponse);
        const textResponse = cResponse[cResponse.length-1].output;
        if (textResponse.includes("ANSWER:") && textResponse.includes("ROW INDICES:")) {
        const formattedTextResponseArray = extractAnswerAndRows(textResponse);
        const formattedTextResponse = formatTextResponseArray(formattedTextResponseArray);
        addMessageToDiv(formattedTextResponse[0], messagesDiv, 'open.png');
        const resultArray = JSON.parse(formattedTextResponse[1]);
        highlightRelevantRows(resultArray);
        } 
        else{
        addMessageToDiv("I'm sorry, but I cannot understand your question. Please provide a clear question related to the CSV data, and I will answer it.", messagesDiv, 'open.png');
        }
    }
    else{
        clearTimeout(loadingTimeout); // Clear the timeout
        addMessageToDiv("There was an error. You can try asking your question again or refreshing the page.", messagesDiv, 'open.png');
    }
    
    } catch (error) {
    clearTimeout(loadingTimeout); // Clear the timeout
    console.error(error);
    addMessageToDiv("There was an error. You can try asking your question again or refreshing the page.", messagesDiv, 'open.png');
    }
});

function formatTextResponseArray(inputArray) {
    let answers = [];
    let rowIndices = [];

    inputArray.forEach(pair => {
    answers.push(pair[0]);
    let rowIndexArray = JSON.parse(pair[1]);
    rowIndices.push(...rowIndexArray);
    });

    let combinedAnswers = answers.join(', ');
    let combinedRowIndices = JSON.stringify(rowIndices);

    return [combinedAnswers, combinedRowIndices];
}

function extractAnswerAndRows(inputString) {
    const regex = /ANSWER:\s*(.+?),\s*ROW INDICES:\s*(.+?)(?=\nANSWER:|$)/g;
    const results = [];
    let match;

    while ((match = regex.exec(inputString)) !== null) {
    if (match.length > 2) {
        const answer = match[1].trim();
        const rows = match[2].trim();
        results.push([answer, rows]);
    }
    }
    return results.length > 0 ? results : null;
}

function highlightRelevantRows(rowIndices) {
    const table = document.querySelector('#csv-table');
    const rows = table.querySelectorAll('tr');

    rows.forEach((row, index) => {
    if (rowIndices.includes(index)) {
        row.classList.add('highlighted-row');
        row.classList.remove('non-highlighted-row');
    } else {
        row.classList.add('non-highlighted-row');
        row.classList.remove('highlighted-row');
    }
    });
}

function removeTableHighlights(){
    const table = document.querySelector('#csv-table');
    const rows = table.querySelectorAll('tr');

    rows.forEach((row) => {
    row.classList.add('non-highlighted-row');
    row.classList.remove('highlighted-row');
    });
}

function removeChatHighlights(){
    const messages = document.querySelector('#messages');
    const divs = messages.querySelectorAll('div');
    divs.forEach((div) => {
    div.classList.add('non-highlighted-row');
    div.classList.remove('highlighted-row');
    });
}
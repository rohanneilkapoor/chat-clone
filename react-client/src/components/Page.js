import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles

function Page({ pageId, appState, setAppState }) {
  const page = appState.pagesById[pageId];
  const title = page.title;
  const emoji = page.emoji;
  const text = page.text;
  const csv = page.csv.rawText;
  console.log({ pageId, title, text });

  //EDITOR CODE
  const [editorText, setEditorText] = useState(text);

  const setPageText = (newText) => {
    setAppState((prevState) => {
      console.log('PREVIOUS STATE BEFORE UPDATE', JSON.stringify(prevState));
      const newState = JSON.parse(JSON.stringify(prevState));
      newState.pagesById[pageId].text = newText;
      console.log('updating page state: ', JSON.stringify({ prevState, newState }));
      return newState;
    });
  };

  useEffect(() => {
    setPageText(editorText);
  }, [editorText]);

  const quillRef = useRef(null);

  const handleTopSectionClick = (e) => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor(); 
      const quillEditorContainer = quillEditor.container; 
  
      if (!quillEditorContainer.contains(e.target)) {
        const length = quillEditor.getLength(); 
  
        quillRef.current.focus(); 
        quillEditor.setSelection(length, length); 
      }
    }
  };
  console.log({appState});

  //CSV CODE
  const [csvTable, setCsvTable] = useState(null);
  const displayCSV = (csv) => {
    const table = document.createElement("table");
    table.id = "csv-table";
    let rows = csv.split("\n");
  
    // Remove last row if it's empty
    if (rows[rows.length - 1].trim() === "") {
      rows.pop();
    }
  
    // Parse CSV data
    for (let i = 0; i < rows.length; i++) {
      const cells = parseCSVRow(rows[i]);
      const row = document.createElement("tr");
  
      // Add a new cell at the beginning of each row containing the row number
      const rowIndexCell = document.createElement("td");
      rowIndexCell.textContent = i + 1;
      row.appendChild(rowIndexCell);
  
      for (let j = 0; j < cells.length; j++) {
        const cell = document.createElement("td");
        cell.textContent = cells[j];
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
  
    // Set the table's HTML as state
    setCsvTable(table.outerHTML);
  };

  const parseCSVRow = (row) => {
    let cells = [];
    let currentCell = "";
    let withinQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row.charAt(i);
      if (char === "," && !withinQuotes) {
        cells.push(currentCell.trim());
        currentCell = "";
      } else if (char === '"') {
        withinQuotes = !withinQuotes;
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());
    return cells;
  };

  useEffect(() => {
    if (csv) {
      displayCSV(csv);
    }
  }, [csv]);
  
  
  



  //CHAT CODE
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const messagesDivRef = useRef(null);

  const BASE_URL =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8080'
      : 'https://aqueous-hamlet-06344.herokuapp.com';

  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      event.preventDefault();
      await fetch(`${BASE_URL}/clear_data`, {
        method: 'GET',
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const addMessageToDiv = (prompt, image) => {
    const message = {
      image: image,
      text: prompt,
      classNames: ['message', 'non-highlighted-row'],
    };
  
    if (prompt === 'Loading...') {
      message.classNames.push('flash');
    }
  
    if (prompt !== 'Loading...' && prompt !== 'Loading for a bit longer...' && image === 'open.png') {
      if (
        !prompt.includes("I'm sorry, but I cannot understand your question.") &&
        !prompt.includes('There was an error.')
      ) {
        message.classNames.push('highlighted-row');
      } else if (prompt.includes('There was an error.')) {
        message.classNames.push('error');
      }
    }
  
    return message;
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    removeChatHighlights();
  
    const newMessages = [
      ...messages,
      addMessageToDiv(prompt, 'dad.jpg'),
      addMessageToDiv('Loading...', 'open.png'),
    ];
    setMessages(newMessages);
    setPrompt('');
  
    let loadingTimeout;
    loadingTimeout = setTimeout(() => {
      setMessages((prevMessages) => {
        const lastMessageText = prevMessages[prevMessages.length - 1].text;
        if (lastMessageText === 'Loading...') {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1].text =
            'Loading for a bit longer...';
          return updatedMessages;
        }
        return prevMessages;
      });
    }, 9000);
  
    const data = { prompt };
  
    try {
      const response = await fetch(`${BASE_URL}/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log(result);
        const codeOutputResponse = await fetch(`${BASE_URL}/code_output`);
        const cResponse = await codeOutputResponse.json();
        const messagesResponse = await fetch(`${BASE_URL}/messages`);
        const mResponse = await messagesResponse.json();
        console.log('ALL CODE OUTPUTS: ', cResponse);
        console.log('ALL MESSAGE OUTPUTS: ', mResponse);
        const textResponse = cResponse[cResponse.length - 1].output;
        if (
          textResponse.includes('ANSWER:') &&
          textResponse.includes('ROW INDICES:')
        ) {
            const formattedTextResponseArray = extractAnswerAndRows(textResponse);
            const formattedTextResponse = formatTextResponseArray(
                formattedTextResponseArray,
            );
            const resultArray = JSON.parse(formattedTextResponse[1]);
            //highlightRelevantRows(resultArray); //remember to uncomment this out 
            setMessages([
                ...newMessages.slice(0, newMessages.length - 1),
                addMessageToDiv(formattedTextResponse[0], 'open.png'),
            ]);
            } else {
                setMessages([
                    ...newMessages.slice(0, newMessages.length - 1),
                    addMessageToDiv(
                    "I'm sorry, but I cannot understand your question. Please provide a clear question related to the CSV data, and I will answer it.",
                    'open.png',
                    ),
                ]);
        }
      } else {
        setMessages([
            ...newMessages.slice(0, newMessages.length - 1),
            addMessageToDiv(
              'There was an error. You can try asking your question again or refreshing the page.',
              'open.png',
            ),
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages.slice(0, newMessages.length - 1),
        addMessageToDiv(
          'There was an error. You can try asking your question again or refreshing the page.',
          'open.png',
        ),
      ]);
    } finally {
      clearTimeout(loadingTimeout); // Clear the timeout
    }
  };
  

  const extractAnswerAndRows = (inputString) => {
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
  };
  
  const formatTextResponseArray = (inputArray) => {
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
  };
  
  const highlightRelevantRows = (rowIndices) => {
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
  };

  const removeTableHighlights = () => {
    const table = document.querySelector('#csv-table');
    const rows = table.querySelectorAll('tr');

    rows.forEach((row) => {
      row.classList.add('non-highlighted-row');
      row.classList.remove('highlighted-row');
    });
  };

  const removeChatHighlights = () => {
    const messages = document.querySelector('#messages');
    const divs = messages.querySelectorAll('div');
    divs.forEach((div) => {
      div.classList.add('non-highlighted-row');
      div.classList.remove('highlighted-row');
    });
  };


  //Chat end





  return (
    <div>
      <div className="chat-wrapper">
        <div className="chat-container">
          <h1>{title} Chat</h1>
          <form id="client-form" onSubmit={handleSubmit}>
            <input
              type="text"
              id="prompt"
              name="prompt"
              placeholder="Ask a question"
              autoComplete="off"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </form>

          <div id="messages" ref={messagesDivRef}>
          {messages.length > 0 && messages.map((message, i) => (
              <div key={i} className={message.classNames.join(' ')}>
                  <img
                  className="profile-picture"
                  src={message.image}
                  alt="Profile"
                  />
                  <div>{message.text}</div>
              </div>
          ))}
          </div>
          <div className="spacing"></div>
        </div>
      </div>
      <div className="middle-container">
        <div className="top-section top-section-padding" onClick={handleTopSectionClick}>
          <span className="big-emoji">{emoji}</span>
          <h1 className="doc-title">{title}</h1>
          <ReactQuill
            ref={quillRef}
            value={editorText}
            onChange={(content, _, __, editor) => setEditorText(editor.getHTML())}
            placeholder="Write something..."
            theme="snow"
            className="custom-quill-body"
          />
          

        </div>
        <div
          className="csv-container"
          id="csv-container"
          dangerouslySetInnerHTML={{ __html: csvTable }}
        />
      </div>
    </div>
  );
}

export default Page;
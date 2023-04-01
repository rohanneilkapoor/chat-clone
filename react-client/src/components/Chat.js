import React, { useEffect, useRef, useState } from 'react';
import '../styles.css';

function Chat() {
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
        console.log("TEXT RESPONSE: ", textResponse);
        if (
          textResponse.includes('ANSWER:') &&
          textResponse.includes('ROW INDICES:')
        ) {
            const formattedTextResponseArray = extractAnswerAndRows(textResponse);
            const formattedTextResponse = formatTextResponseArray(
                formattedTextResponseArray,
            );
            const resultArray = JSON.parse(formattedTextResponse[1]);
            //highlightRelevantRows(resultArray);
            console.log("FORMATTED RESPONSE: ", formattedTextResponse[0]);
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
  
  const highlightRelevantRows = (resultArray) => {
    removeTableHighlights();
    removeChatHighlights();
    const table = document.querySelector('#csv-table');
    const rows = table.querySelectorAll('tr');
    const messages = document.querySelector('#messages');
    const divs = messages.querySelectorAll('div');
  
    resultArray.forEach((index) => {
      rows[index].classList.add('highlighted-row');
      rows[index].classList.remove('non-highlighted-row');
    });
  
    divs.forEach((div, index) => {
      if (resultArray.includes(index)) {
        div.classList.add('highlighted-row');
        div.classList.remove('non-highlighted-row');
      }
    });
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <h1>AI Chat</h1>
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
  );
}

export default Chat;


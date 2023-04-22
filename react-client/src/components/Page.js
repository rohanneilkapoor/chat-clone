import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css'; // Import the styles

function formatPath(title) {
  return title.toLowerCase().replace(/ /g, '-');
}

function Page({ pageId, appState, setAppState }) {
  const page = appState.pagesById[pageId];
  const title = page.title;
  const emoji = page.emoji;
  const text = page.text;
  const csv = page.csv.rawText;
  const introMessage = page.chat.messages[0].prompt;
  const introImage = page.chat.messages[0].img;
  const [createPageRowIndices, setCreatePageRowIndices] = useState([]);
  const navigate = useNavigate(); // Get access to the navigate function

  //CREATE NEW PAGE
  const createNewPage = () => {
  
    setAppState((prevState) => {
      const newState = JSON.parse(JSON.stringify(prevState));
      const newPageId = `new-page-${Object.keys(newState.pagesById).length + 1}`;
      newState.pagesById[newPageId] = {
        title: `New Page ${Object.keys(newState.pagesById).length + 1}`,
        emoji: "📄",
        text: "",
        csv: {
          rawText: filterCsvByRowIndices(csv,createPageRowIndices),
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Welcome to your new page!",
            },
          ],
        },
        isExpanded: false,
        parent: pageId
      };
      newState.pageIds.push(newPageId);
      newState.activePageId = newPageId;
  
      // Determine the URL path of the new page using the formatPath function
      const newPagePath = formatPath(newState.pagesById[newPageId].title);
  
      // Navigate to the new page
      navigate(`/${newPagePath}`);
  
      return newState;
    });
  };

  function filterCsvByRowIndices(csvString, rowIndices) {
    console.log("The row indices array that gets passed in: ", rowIndices);
    const rows = csvString.split('\n');
    const headerRow = rows[0];
    const filteredRows = rowIndices.map(index => rows[index]).filter(row => row);
    return [headerRow, ...filteredRows].join('\n');
  }

  //EDITOR CODE
  const [editorText, setEditorText] = useState(text);
  const [showTooltip, setShowTooltip] = useState(false);


  const setPageText = (newText) => {
    setAppState((prevState) => {
      const newState = JSON.parse(JSON.stringify(prevState));
      newState.pagesById[pageId].text = newText;
      return newState;
    });
  };

  useEffect(() => {
    setPageText(editorText);
  }, [editorText]);

  const quillRef = useRef(null);

  useEffect(() => {
    if (editorText === "") {
      handleSelectionChange({ index: 0, length: 0 });
    }
  }, []);

  useEffect(() => {
    if (showTooltip) {
      showCursorTooltip();
    }
  }, [showTooltip]);
  
  useEffect(() => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
  
      const handleTextChange = (delta, oldDelta, source) => {
        const range = quillEditor.getSelection();
        if (source === 'user' && delta.ops && delta.ops.length === 2 && delta.ops[0].retain && (delta.ops[1].insert === '\n' || delta.ops[1].insert === ' ')) {
          if(delta.ops[1].insert === '\n'){
            // If the user pressed the Enter key, manually trigger the selection-change event
            setTimeout(() => {
              const newRange = quillEditor.getSelection();
              if (newRange) {
                handleSelectionChange(newRange);
              }
            }, 0);
          }
          else if(delta.ops[1].insert === ' '){
            if (quillRef.current && range) {
              const quillEditor = quillRef.current.getEditor();
              const index = range.index;
              const [cursorLine] = quillEditor.getLine(index);
          
              // If the cursor line is empty, show the custom placeholder
              if (cursorLine && cursorLine.length() === 2) {
                setShowTooltip(true);
              }
            }
          }
        } else if (range) {
          handleSelectionChange(range);
        }
      };
  
      const handleSelectionChangeWrapper = () => {
        const range = quillEditor.getSelection();
        if (range) {
          handleSelectionChange(range);
        }
      };
  
      quillEditor.on("text-change", handleTextChange);
      quillEditor.on("selection-change", handleSelectionChangeWrapper);
  
      return () => {
        quillEditor.off("text-change", handleTextChange);
        quillEditor.off("selection-change", handleSelectionChangeWrapper);
      };
    }
  }, []);
  

  const createToolTip = (quillEditor, range) => {
    const bounds = quillEditor.getBounds(range.index);
    const tooltip = document.createElement('div');
    tooltip.className = 'cursor-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.top = bounds.top + 'px';
    tooltip.style.width = '100%';
    return tooltip;
  };

  const AIModal = ({ messages }) => {
    return (
      <div className="ai-modal">
        <div id="modal-messages">
          {messages.length > 0 &&
            messages.map((message, i) => (
              <div key={i} className={message.classNames.join(" ")}>
                <div className="message-content">
                  <img
                    className="profile-picture"
                    src={message.image}
                    alt="Profile"
                  />
                  <div>{message.text}</div>
                </div>
                {message.includeButton && (
                  <button className="create-page-button" onClick={createNewPage}>
                    <img
                      className="button-icon"
                      src="../icons/plus.svg"
                      alt="Add icon"
                    />
                    Create Sub-Report
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  };
  

  const createAIModal = (quillEditor, range) => {
    const bounds = quillEditor.getBounds(range.index);
    const modal = document.createElement('div');
    modal.className = 'cursor-tooltip';
    modal.style.position = 'absolute';
    modal.style.top = bounds.top + 'px';
    modal.style.width = '200px';
    modal.style.height = '200px';
    return modal;
  }

  
  const showCursorTooltip = () => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
      const range = quillEditor.getSelection();
      if (range) {
        const tooltip = createToolTip(quillEditor, range);
        quillEditor.root.parentNode.appendChild(tooltip);
        console.log(quillEditor.root.parentNode);
        // Define a ref for the aiModalRoot outside of the TooltipForm component
        
        
  
        // Define the form as a React component
        const TooltipForm = () => {
          const [prompt, setPrompt] = useState('');
          const inputRef = useRef(null);
          // Define a state variable for the AIModal's messages
          const [aiModalMessages, setAiModalMessages] = useState([]);
        
          useEffect(() => {
            if (inputRef.current) {
              inputRef.current.focus(); // Focus the input field
            }
          }, []);
        
          const handleDocumentClick = (e) => {
            if (!tooltip.contains(e.target)) {
              setShowTooltip(false);
              tooltip.remove(); // Remove the tooltip from the DOM
            }
          };
        
          useEffect(() => {
            document.addEventListener('mousedown', handleDocumentClick);
            return () => {
              document.removeEventListener('mousedown', handleDocumentClick);
            };
          }, []);
          
          // Define a ref for the aiModalRoot outside of the handleSubmit function
          const aiModalRootRef = useRef(null);
        
          const handleSubmit = async (e) => {
            e.preventDefault();
            removeChatHighlights();
            removeTableHighlights();
            removeButtonFromLastMessage();
        
            const newMessages = [
              ...messages,
              addMessageToDiv(prompt, 'dad.jpg'),
              addMessageToDiv('Loading...', 'open.png'),
            ];
            setMessages(newMessages);
            setPrompt('');
            const modal = createAIModal(quillEditor, range);
            quillEditor.root.parentNode.appendChild(modal);
            // Update the aiModalMessages state variable with the new messages
            setAiModalMessages(newMessages);
        
            if (!aiModalRootRef.current) {
              aiModalRootRef.current = createRoot(modal);
            }
            aiModalRootRef.current.render(<AIModal messages={aiModalMessages} />);
        
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
                const codeOutputResponse = await fetch(`${BASE_URL}/code_output`);
                const cResponse = await codeOutputResponse.json();
                const messagesResponse = await fetch(`${BASE_URL}/messages`);
                const mResponse = await messagesResponse.json();
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
                  setCreatePageRowIndices(resultArray);
                  highlightRelevantRows(resultArray); 
        
                  const updatedMessages = [
                    ...newMessages.slice(0, newMessages.length - 1),
                    addMessageToDiv(formattedTextResponse[0], 'open.png', true),
                  ];
                  setMessages(updatedMessages);
                  // Update the aiModalMessages state variable with the server response
                  setAiModalMessages(updatedMessages);
                  // Re-render the AIModal with the updated messages
          aiModalRootRef.current.render(<AIModal messages={updatedMessages} />);
        } else {
          const updatedMessages = [
            ...newMessages.slice(0, newMessages.length - 1),
            addMessageToDiv(
              "I'm sorry, but I cannot understand your question. Please provide a clear question related to the CSV data, and I will answer it.",
              'open.png',
            ),
          ];
          setMessages(updatedMessages);
          // Update the aiModalMessages state variable with the server response
          setAiModalMessages(updatedMessages);
          // Re-render the AIModal with the updated messages
          aiModalRootRef.current.render(<AIModal messages={updatedMessages} />);
        }
      } else {
        const updatedMessages = [
          ...newMessages.slice(0, newMessages.length - 1),
          addMessageToDiv(
            'There was an error. You can try asking your question again or refreshing the page.',
            'open.png',
          ),
        ];
        setMessages(updatedMessages);
        // Update the aiModalMessages state variable with the server response
        setAiModalMessages(updatedMessages);
        // Re-render the AIModal with the updated messages
        aiModalRootRef.current.render(<AIModal messages={updatedMessages} />);
      }
    } catch (error) {
      console.error(error);
      const updatedMessages = [
        ...newMessages.slice(0, newMessages.length - 1),
        addMessageToDiv(
          'There was an error. You can try asking your question again or refreshing the page.',
          'open.png',
        ),
      ];
      setMessages(updatedMessages);
      // Update the aiModalMessages state variable with the server response
      setAiModalMessages(updatedMessages);
      // Re-render the AIModal with the updated messages
      aiModalRootRef.current.render(<AIModal messages={updatedMessages} />);
    } finally {
      clearTimeout(loadingTimeout); // Clear the timeout
    }
  };

  return (
    <form id="client-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        id="prompt"
        name="prompt"
        placeholder="“Show me all entries from February”"
        autoComplete="off"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        required
      />
    </form>
  );
};
        
  
        // Use ReactDOM.createRoot to render the form component inside the tooltip
        ReactDOM.createRoot(tooltip).render(<TooltipForm />);
      }
    }
  };

  
  
  const handleSelectionChange = (range) => {
    if (quillRef.current && range) {
      const quillEditor = quillRef.current.getEditor();
      const index = range.index;
  
      // Remove previous custom placeholder
      const allPlaceholders = quillEditor.root.querySelectorAll(".custom-placeholder");
      allPlaceholders.forEach((placeholder) => {
        placeholder.classList.remove("custom-placeholder");
        placeholder.removeAttribute("data-placeholder");
      });
  
      // Get the line where the cursor is located
      const [cursorLine] = quillEditor.getLine(index);
  
      // If the cursor line is empty, show the custom placeholder
      if (cursorLine && cursorLine.length() === 1) {
        const cursorLineElem = cursorLine.domNode;
        cursorLineElem.classList.add("custom-placeholder");
        cursorLineElem.setAttribute("data-placeholder", "Start writing or press 'space' to add data");
      }
    }
  };



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



  

  const handleTyping = () => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
      const oldPlaceholder = quillEditor.root.querySelector(".custom-placeholder");
      if (oldPlaceholder) {
        oldPlaceholder.classList.remove("custom-placeholder");
        oldPlaceholder.removeAttribute("data-placeholder");
      }
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
      quillEditor.on('selection-change', handleSelectionChange);
    }
  }, []);
  
  

  //CSV CODE
  const [csvTable, setCsvTable] = useState(null);
  const csvContainerRef = useRef(null);

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

  useEffect(() => {
    if (csvContainerRef.current) {
      csvContainerRef.current.addEventListener('wheel', preventSwipeNavigation, { passive: false });
    }
  
    return () => {
      if (csvContainerRef.current) {
        csvContainerRef.current.removeEventListener('wheel', preventSwipeNavigation, { passive: false });
      }
    };
  }, [csvContainerRef.current]);
  

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
      if (i > 0) {
        const rowIndexCell = document.createElement("td");
        rowIndexCell.textContent = i; // Use i as the row number (starting from 1)
        row.appendChild(rowIndexCell);
      } else if (i === 0) {
        const emptyCell = document.createElement("td");
        row.appendChild(emptyCell);
      }
  
      for (let j = 0; j < cells.length; j++) {
        const cell = document.createElement("td");
        cell.textContent = cells[j];
        if (cells[j].length > 40) { 
          cell.classList.add("wrap-cell");
        }
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

  const addMessageToDiv = (prompt, image, includeButton = false) => {
    const message = {
      image: image,
      text: prompt,
      classNames: ['message', 'non-highlighted-row'],
      includeButton: includeButton,
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

  const removeButtonFromLastMessage = () => {
    const messagesDiv = messagesDivRef.current;
    const lastMessageDiv = messagesDiv.lastElementChild;
  
    if (lastMessageDiv) {
      const button = lastMessageDiv.querySelector('.create-page-button');
      if (button) {
        lastMessageDiv.removeChild(button);
      }
    }
  };
  


  //Chat end





  return (
    <div>
      <div className="chat-wrapper">
        <div className="chat-container">
          <h1>{title} Chat</h1>
          

          <div id="messages" ref={messagesDivRef}>
            <div class="message">
              <div class="message-content">
                <img
                className="profile-picture"
                src={introImage}
                alt="Profile"
                />
                <div>{introMessage}</div>
              </div>
            </div>
            {messages.length > 0 && messages.map((message, i) => (
              <div key={i} className={message.classNames.join(' ')}>
                <div className="message-content">
                  <img
                    className="profile-picture"
                    src={message.image}
                    alt="Profile"
                  />
                  <div>{message.text}</div>
                </div>
                {message.includeButton && (
                  <button className="create-page-button" onClick={createNewPage}>
                    <img className="button-icon" src="../icons/plus.svg" alt="Add icon" />
                    Create Sub-Report
                  </button>
                )}
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
            onChange={setEditorText}
            onKeyPress={handleTyping}
           
            theme="snow"
            className="custom-quill-body"
          />
          

        </div>
        <div
          className="csv-container"
          id="csv-container"
          ref={csvContainerRef}
          dangerouslySetInnerHTML={{ __html: csvTable }}
        />
      </div>
    </div>
  );
}

export default Page;
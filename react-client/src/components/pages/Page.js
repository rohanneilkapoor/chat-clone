import React, { useEffect, useRef } from 'react';

function Page({ pageId, appState, setAppState }) {
  const page = appState.pagesById[pageId];
  const title = page.title;
  const text = page.text;
  console.log({ pageId, title, text });
  const editableDiv = useRef(null);
  const placeholderDiv = useRef(null);

  const setCaretToEnd = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();
    if (element.childNodes.length > 0) {
      range.selectNodeContents(element);
      range.collapse(false); // Set to false to move the cursor to the end
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleClickOutside = (event) => {
    if (
      !editableDiv.current.contains(event.target) &&
      !placeholderDiv.current.contains(event.target)
    ) {
      if (editableDiv.current.textContent.trim() === '') {
        editableDiv.current.style.display = 'none';
        placeholderDiv.current.style.display = 'block';
      }
    }
  };

  const handleInput = (event) => {
    setCaretToEnd(editableDiv.current);
  };

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
    // Initialize the display of the editableDiv and placeholderDiv based on the current text value
    if (text === '') {
      editableDiv.current.style.display = 'none';
      placeholderDiv.current.style.display = 'block';
    } else {
      editableDiv.current.style.display = 'block';
      placeholderDiv.current.style.display = 'none';
    }

    placeholderDiv.current.addEventListener('click', () => {
      placeholderDiv.current.style.display = 'none';
      editableDiv.current.style.display = 'block';
      editableDiv.current.innerHTML = appState.pagesById[pageId].text;
      editableDiv.current.focus();
    });

    editableDiv.current.addEventListener('blur', () => {
      const newText = editableDiv.current.textContent;
      if (newText.trim() === '') {
        editableDiv.current.style.display = 'none';
        placeholderDiv.current.style.display = 'block';
      }
      setPageText(newText);
    });

    editableDiv.current.addEventListener('input', handleInput);

    document.body.addEventListener('click', handleClickOutside);

    return () => {
      document.body.removeEventListener('click', handleClickOutside);
      if (editableDiv.current) {
        editableDiv.current.removeEventListener('input', handleInput);
      }
    };
  }, [appState, pageId, setAppState, title, text]);

  function getEmoji() {
    switch (title) {
      case 'Contacts':
        return '👥';
      case 'Quotes':
        return '✌';
      case 'Orders':
        return '📦';
      case 'Invoices':
        return '📝';
      case 'Purchasing':
        return '💸';
      default:
        return '';
    }
  }

  function getCSVContent() {
    switch (title) {
      case 'Contacts':
        return <p>Contact information goes here...</p>;
      case 'Quotes':
        return <p>Quote information goes here...</p>;
      case 'Orders':
        return <p>Order information goes here...</p>;
      case 'Invoices':
        return <p>Invoice information goes here...</p>;
      case 'Purchasing':
        return <p>Purchasing information goes here...</p>;
      default:
        return <p>Content not found.</p>;
    }
  }
  console.log({appState});
  return (
    <div className="middle-container">
      <div className="top-section top-section-padding">
        <span className="big-emoji">{getEmoji()}</span>
        <h1 className="doc-title">{title}</h1>
        <div
          ref={editableDiv}
          className="top-section"
          contentEditable="true"
          dir="auto"
        >
          {text}
        </div>
        <div ref={placeholderDiv} className="top-section placeholder">
          Write something...
        </div>
      </div>
      <div className="csv-container" id="csv-container">
        {getCSVContent()}
      </div>
    </div>
  );
}

export default Page;
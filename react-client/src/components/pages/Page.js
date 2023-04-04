import React, { useEffect, useRef, useState } from 'react';


function Page({ title }) {
  const editableDiv = useRef(null);
  const placeholderDiv = useRef(null);
  const [content, setContent] = useState({});

  const setCaretToEnd = (element) => {
    console.log("Text content of the element:", element.textContent);
    const range = document.createRange();
    const selection = window.getSelection();
    console.log("Current caret position:", selection.anchorOffset);
    if (element.childNodes.length > 0) {
      range.selectNodeContents(element);
      range.collapse(false); // Set to false to move the cursor to the end
      selection.removeAllRanges();
      selection.addRange(range);
      console.log("hellow world");
    }
    console.log("Caret position after setting to end:", selection.anchorOffset);
  };

  useEffect(() => {
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
      //setContent({ ...content, [title]: editableDiv.current.innerHTML });
      console.log('my name is adi');
      setCaretToEnd(editableDiv.current);

    };

    placeholderDiv.current.addEventListener('click', () => {
      placeholderDiv.current.style.display = 'none';
      editableDiv.current.style.display = 'block';
      editableDiv.current.focus();
    });

    editableDiv.current.addEventListener('blur', () => {
      if (editableDiv.current.textContent.trim() === '') {
        editableDiv.current.style.display = 'none';
        placeholderDiv.current.style.display = 'block';
      }
    });

    editableDiv.current.addEventListener('input', handleInput);

    document.body.addEventListener('click', handleClickOutside);

    return () => {
      document.body.removeEventListener('click', handleClickOutside);
      if (editableDiv.current) {
        editableDiv.current.removeEventListener('input', handleInput);
      }
    };
  }, [content, title]);

  useEffect(() => {
    if (content[title]) {
      editableDiv.current.innerHTML = content[title];
      editableDiv.current.style.display = 'block';
      placeholderDiv.current.style.display = 'none';
    } else {
      editableDiv.current.innerHTML = '';
      editableDiv.current.style.display = 'none';
      placeholderDiv.current.style.display = 'block';
    }
  }, [title, content]);

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
          style={{ display: 'none' }}
        ></div>
        <div
          ref={placeholderDiv}
          className="top-section placeholder"
        >
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
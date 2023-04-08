import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './Navigation';
import Chat from './Chat';
import Page from './Page';
import CsvContainer from './CsvContainer';
import '../styles.css';

/** 
Our State will be of this shape
const INIT_STATE = {
  pagesById: {
    "pageId": {
      title: "",
      text: "",
      csv: {
        rawText: "",
      },
      chat: {
        messages: [
          {
            img: "",
            prompt: "",
          },
        ],
      }
    }
  }
}

*/

function App() {
  // global state
  const INIT_APP_STATE = {
    pagesById: {
      "contacts": {
        title: "Contacts",
        emoji: "👥",
        text: "",
        csv: {
          rawText: "",
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your contacts data.",
            },
          ]  
        }
      },
      "quotes": {
        title: "Quotes",
        emoji: "✌️",
        text: "",
        csv: {
          rawText: "",
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your quotes data.",
            },
          ]  
        }
      },
      "orders": {
        title: "Orders",
        emoji: "📦",
        text: "",
        csv: {
          rawText: "",
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your orders data.",
            },
          ]  
        }
      },
      "invoices": {
        title: "Invoices",
        emoji: "📄",
        text: "",
        csv: {
          rawText: "",
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your invoices data.",
            },
          ]  
        }
      },
      "purchasing": {
        title: "Purchasing",
        emoji: "💸",
        text: "",
        csv: {
          rawText: "",
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your purchasing data.",
            },
          ]  
        }
      },
    }
  }
  const [appState, setAppState] = useState(INIT_APP_STATE);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navigation appState={appState} />
          <Routes>
            {Object.keys(appState.pagesById).map((pageId) => {
              return (
                <Route
                  path={`/${pageId}`}
                  element={
                    <Page
                      key={pageId} // Add the key prop here
                      pageId={pageId}
                      appState={appState}
                      setAppState={setAppState}
                    />
                  }
                />    
              )
            })}
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
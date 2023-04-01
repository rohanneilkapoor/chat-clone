import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CsvUpload from './CsvUpload';
import Navigation from './Navigation';
import Chat from './Chat';
import Page from './pages/Page';
import CsvContainer from './CsvContainer';
import '../styles.css';

function App() {
  const [pageTitle, setPageTitle] = useState('Contacts');

  function handleNavigation(pageName) {
    setPageTitle(pageName);
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navigation onNavigate={handleNavigation} />
          <Chat />
          <Routes>
            <Route path="/contacts" element={<Page title={pageTitle} />} />
            <Route path="/quotes" element={<Page title={pageTitle} />} />
            <Route path="/orders" element={<Page title={pageTitle} />} />
            <Route path="/invoices" element={<Page title={pageTitle} />} />
            <Route path="/purchasing" element={<Page title={pageTitle} />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
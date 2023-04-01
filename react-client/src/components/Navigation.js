import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles.css';

function Navigation({ onNavigate }) {
  function handleClick(pageName) {
    onNavigate(pageName);
  }

  return (
    <nav className="left-navbar">
      <h3>Reports</h3>
      <ul>
        <NavLink to="/contacts" onClick={() => handleClick('Contacts')}>
          <li>
            <span className="emoji">👥</span>Contacts
          </li>
        </NavLink>
        <NavLink to="/quotes" onClick={() => handleClick('Quotes')}>
          <li>
            <span className="emoji">✌</span>Quotes
          </li>
        </NavLink>
        <NavLink to="/orders" onClick={() => handleClick('Orders')}>
          <li>
            <span className="emoji">📦</span>Orders
          </li>
        </NavLink>
        <NavLink to="/invoices" onClick={() => handleClick('Invoices')}>
          <li>
            <span className="emoji">📝</span>Invoices
          </li>
        </NavLink>
        <NavLink to="/purchasing" onClick={() => handleClick('Purchasing')}>
          <li>
            <span className="emoji">💸</span>Purchasing
          </li>
        </NavLink>
      </ul>
    </nav>
  );
}

export default Navigation;
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles.css';

function Navigation({ appState }) {
  return (
    <nav className="left-navbar">
      <h3>Reports</h3>
      <ul>
        {Object.keys(appState.pagesById).map((pageId) => {
          const page = appState.pagesById[pageId];
          return (
            <NavLink
              key={pageId}
              to={`/${pageId}`}
            >  
            <li>
              <span className="emoji">{page.emoji}</span>{page.title}
            </li>
            </NavLink>
          );
        })}
      </ul>
    </nav>
  );
}

export default Navigation;
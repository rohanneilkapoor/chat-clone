import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles.css';

// NavigationItem component to render individual navigation items and their nested pages
function NavigationItem({ page, expanded, toggleExpansion, path, className }) {
  const isExpanded = expanded[path];
  return (
    <li key={page.id}>
      <NavLink to={`/${path}`} className={className}>
        <img
          className={`chevron-icon ${isExpanded ? 'chevron-rotate' : ''}`}
          src="../icons/chevron.svg"
          alt="Chevron"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleExpansion(path);
          }}
        />
        <span className="emoji">{page.emoji}</span>
        <span>{page.title}</span>
      </NavLink>
      {isExpanded && (
        <ul>
          {page.nestedPages.length > 0 ? (
            page.nestedPages.map((nestedPage) => (
              <NavigationItem
                className="nested-pages"
                key={nestedPage.id}
                page={nestedPage}
                expanded={expanded}
                toggleExpansion={toggleExpansion}
                path={`${path}/${nestedPage.id}`} // Concatenate the path for nested pages
              />
            ))
          ) : (
            <li className="inside-empty placeholder">No pages inside</li>
          )}
        </ul>
      )}
    </li>
  );
}

function Navigation({ appState }) {
  // Define a state to control the expanded items
  const [expandedItems, setExpandedItems] = useState({});

  // Toggle the expansion of an item based on its path
  const toggleExpansion = (path) => {
    setExpandedItems((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  return (
    <nav className="left-navbar">
      <h3>Reports</h3>
      <ul>
        {Object.keys(appState.pagesById).map((pageId) => (
          <NavigationItem
            key={pageId}
            page={appState.pagesById[pageId]}
            expanded={expandedItems}
            toggleExpansion={toggleExpansion}
            path={pageId} // Use pageId as the initial path for top-level pages
          />
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;

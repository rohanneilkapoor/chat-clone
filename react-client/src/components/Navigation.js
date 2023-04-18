import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles.css';

function formatPath(title) {
  return title.toLowerCase().replace(/ /g, '-');
}

// NavigationItem component to render individual navigation items and their nested pages
function NavigationItem({ pageId, pageData, expanded, toggleExpansion, path, className, pagesById }) {
  const isExpanded = expanded[path];
  const childPages = Object.values(pagesById).filter((p) => p.parent === pageId);
  const formattedPath = formatPath(pageData.title); // Use the formatPath function here
  return (
    <li key={pageId}>
      <NavLink to={`/${formattedPath}`} className={className} end>
        <img
          className={`chevron-icon ${expanded[path] ? "chevron-rotate" : ""}`}
          src="../icons/chevron.svg"
          alt="Chevron"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleExpansion(path);
          }}
        />
        <span className="emoji">{pageData.emoji}</span>
        <span>{pageData.title}</span>
      </NavLink>
      {expanded[path] && (
        <ul>
          {childPages.length > 0 ? (
            childPages.map((nestedPage) => (
              <NavigationItem
                className="nested-pages"
                key={nestedPage.id}
                pageId={nestedPage.id}
                pageData={nestedPage}
                expanded={expanded}
                toggleExpansion={toggleExpansion}
                path={nestedPage.title} // This line has been changed
                pagesById={pagesById}
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
      {Object.keys(appState.pagesById)
        .filter((pageId) => !appState.pagesById[pageId].parent) // Add this line to filter out child pages
        .map((pageId) => {
          const formattedPath = formatPath(appState.pagesById[pageId].title); // Use the formatPath function here
          return (
            <NavigationItem
              key={pageId}
              pageId={pageId}
              pageData={appState.pagesById[pageId]}
              expanded={expandedItems}
              toggleExpansion={toggleExpansion}
              path={formattedPath}
              pagesById={appState.pagesById}
            />
          );
        })}
      </ul>
    </nav>
  );
}

export default Navigation;





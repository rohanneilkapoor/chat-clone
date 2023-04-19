import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles.css';

function formatPath(title) {
  return title.toLowerCase().replace(/ /g, '-');
}

// NavigationItem component to render individual navigation items and their nested pages
function NavigationItem({ pageId, pageData, expanded, toggleExpansion, path, className, pagesById, indentLevel }) {
  const childPages = Object.entries(pagesById)
  .filter(([childPageId, childPageData]) => childPageData.parent === pageId)
  .map(([childPageId, childPageData]) => ({ id: childPageId, ...childPageData }));

  console.log("CHILD: ", childPages);
  const formattedPath = formatPath(pageData.title); // Use the formatPath function here
  const paddingLeft = indentLevel * 24;
  const emptyPaddingLeft = paddingLeft + 24;
  return (
    <li key={pageId}>
      <NavLink
        to={`/${formattedPath}`}
        className={className}
        end
        style={{ paddingLeft: `${paddingLeft}px` }} // Apply paddingLeft as inline style
      >
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
                key={nestedPage.id}
                pageId={nestedPage.id}
                pageData={nestedPage}
                expanded={expanded}
                toggleExpansion={toggleExpansion}
                path={nestedPage.title}
                pagesById={pagesById}
                indentLevel={indentLevel + 1}
              />
            ))
          ) : (
            <li className="inside-empty placeholder" style={{ paddingLeft: `${emptyPaddingLeft}px` }}>No pages inside</li>
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
        .filter((pageId) => !appState.pagesById[pageId].parent)
        .map((pageId) => {
          const formattedPath = formatPath(appState.pagesById[pageId].title);
          return (
            <NavigationItem
              key={pageId}
              pageId={pageId}
              pageData={appState.pagesById[pageId]}
              expanded={expandedItems}
              toggleExpansion={toggleExpansion}
              path={formattedPath}
              pagesById={appState.pagesById}
              indentLevel={0} // Top-level navigation items have indentLevel 0
            />
          );
        })}
      </ul>
    </nav>
  );
}

export default Navigation;





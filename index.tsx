// Import the core React library for component creation
import React from 'react';
// Import ReactDOM to handle rendering React components into the DOM
import ReactDOM from 'react-dom/client';
// Import the main App component which serves as the root of our UI
import App from './App';

// Retrieve the HTML element with the ID 'root' from index.html
const rootElement = document.getElementById('root');

// Check if the root element exists to prevent runtime errors
if (!rootElement) {
  // If not found, throw an error to alert the developer
  throw new Error("Could not find root element to mount to");
}

// Create a React root for the application using the found DOM element
const root = ReactDOM.createRoot(rootElement);

// Render the application into the root element
root.render(
  // React.StrictMode activates additional checks and warnings for descendants
  <React.StrictMode>
    {/* Render the main App component */}
    <App />
  </React.StrictMode>
);
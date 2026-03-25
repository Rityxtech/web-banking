
/*************************************************************************************************
 *  WARNING: PROTECTED CODEBASE
 *  
 *  NO DEVELOPER IS ALLOWED TO TAMPER WITH OR MODIFY THIS CODE UNLESS EXPLICITLY INSTRUCTED.
 *  
 *  IF INSTRUCTED TO MAKE CHANGES:
 *  1. YOU MUST ONLY TAMPER WITH THE SPECIFIC PARTS YOU WERE ASKED TO MODIFY.
 *  2. YOU MUST LEAVE EVERY OTHER THING EXACTLY AS IT IS.
 *  3. DO NOT CHANGE THE VISUAL APPEARANCE OR FUNCTIONALITY OF EXISTING FEATURES.
 *
 *  STRICT COMPLIANCE IS REQUIRED.
 *************************************************************************************************/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

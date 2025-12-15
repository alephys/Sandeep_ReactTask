import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'

// import axios from "axios";
// axios.defaults.withCredentials = true;

// let App = React.createElement(
//   "This is sample bootstrap of react root"
// )

// let ele = document.getElementById('root');
// let root = ReactDOM.createRoot(ele);
// root.render(App)

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainView from './mainView'
import App2 from './App2';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App2 />
  </StrictMode>,
)

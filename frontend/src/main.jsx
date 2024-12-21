import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainView from './mainView'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainView />
  </StrictMode>,
)

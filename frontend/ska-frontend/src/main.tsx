import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AcademicYearProvider } from './context/AcademicYearContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
    <AcademicYearProvider>
    <App />
    </AcademicYearProvider>
  </StrictMode>,
)

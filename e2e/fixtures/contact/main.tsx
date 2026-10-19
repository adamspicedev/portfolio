import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Contact } from '../../../src/components/contact'
import '../../../src/styles.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Contact />
  </StrictMode>,
)

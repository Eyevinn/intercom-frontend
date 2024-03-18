import React from 'react'
import styled from '@emotion/styled'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const Heh = styled.button`
  background: red;
`

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Heh />
    <App />
  </React.StrictMode>,
)

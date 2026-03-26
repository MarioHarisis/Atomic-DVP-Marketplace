import React from 'react'
import ReactDOM from 'react-dom/client'
import { Web3OnboardProvider } from '@web3-onboard/react'
import web3Onboard from './utils/web3onboard'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <App />
      </Web3OnboardProvider>
    </React.StrictMode>
  );
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import WebApp from '@twa-dev/sdk';
import './index.css';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import WalletSync from './WalletSync';

WebApp.ready();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json">
      <WalletSync />
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);

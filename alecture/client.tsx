import React from 'react';
import ReactDOM from 'react-dom/client';
import { render } from 'react-dom';

import App from '@layouts/App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

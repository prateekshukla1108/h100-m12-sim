import React from 'react';
import ReactDOM from 'react-dom/client';
import { GPUViewer } from './components/GPUViewer';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GPUViewer />
  </React.StrictMode>,
);

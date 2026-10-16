import './style.css';
import './admin/admin.css';
import { renderAdminPanel } from './admin/admin.js';

// Initialize the Professional Admin Console
export function initApp() {
  const root = document.querySelector('#app');
  if (root) {
    renderAdminPanel(root);
  }
}

// Start Admin Portal
initApp();

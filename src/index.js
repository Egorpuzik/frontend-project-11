import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/modal.css';
import app from './app.js';
import './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  try {
    app();
  } catch (error) {
    console.error('Ошибка при запуске приложения:', error);
  }
});

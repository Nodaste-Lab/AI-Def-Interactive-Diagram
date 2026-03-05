import './styles/embed.css';
import { createRoot } from 'react-dom/client';
import App from './app/App';

const container = document.getElementById('nodaste-diagram');
if (container) {
  container.classList.add('nodaste-diagram');
  createRoot(container).render(<App />);
}

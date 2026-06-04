import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './App.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Inisialisasi dark mode dari localStorage sebelum render
// agar tidak ada "flash" putih saat halaman pertama dimuat
const savedDark = localStorage.getItem("darkMode");
if (savedDark === "true") {
  document.body.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
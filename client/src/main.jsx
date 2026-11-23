import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppToaster } from './services/toastManager.jsx'
import ThemeProvider from './theme/ThemeProvider.jsx'
import './theme/theme.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
      <AppToaster />
    </ThemeProvider>
  </BrowserRouter>,
)

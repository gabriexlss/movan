import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider> 
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
    <Toaster position="top-right" />
  </BrowserRouter>,
)

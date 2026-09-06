import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider> //basimente o AuthProvider é executado sempre antes do app oque me permite redirecionar a pessoa pro login caso ela não esteja logada antes que ela tenha a chance de ver o app
      <App />
    </AuthProvider>
  </BrowserRouter>,
)

import AdminPage from './components/AdminPage'
import ChatHome from './components/ChatHome'

function App() {
  if (window.location.pathname === '/admin') {
    return <AdminPage />
  }

  return <ChatHome />
}

export default App

import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ItemsPage from './pages/ItemsPage'
import ItemDetailPage from './pages/ItemDetailPage'
import MyItemsPage from './pages/MyItemsPage'
import CreateItemPage from './pages/CreateItemPage'
import CreateOrderPage from './pages/CreateOrderPage'
import MyOrdersPage from './pages/MyOrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import AdminPage from './pages/AdminPage'
import Navbar from './components/Navbar'
import NotificationContainer from './components/NotificationContainer'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* 管理后台页面 - 不显示导航栏 */}
            <Route path="/admin/*" element={<AdminPage />} />
            
            {/* 前台页面 - 显示导航栏 */}
            <Route path="/*" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <NotificationContainer />
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/items" element={<ItemsPage />} />
                    <Route path="/items/:id" element={<ItemDetailPage />} />
                    <Route path="/my-items" element={<MyItemsPage />} />
                    <Route path="/create-item" element={<CreateItemPage />} />
                    <Route path="/orders/create/:id" element={<CreateOrderPage />} />
                    <Route path="/my-orders" element={<MyOrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                  </Routes>
                </Layout>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

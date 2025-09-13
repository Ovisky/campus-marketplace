import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationIcon from './NotificationIcon'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const handleNotificationClick = () => {
    navigate('/notifications')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-green-600">校园集市</h1>
            </Link>
          </div>
          
          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/items" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              商品列表
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/my-items" 
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  我的商品
                </Link>
                <Link 
                  to="/my-orders" 
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  我的订单
                </Link>
                <Link 
                  to="/chat" 
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  聊天
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  个人资料
                </Link>
                <NotificationIcon onClick={handleNotificationClick} />
                <Link 
                  to="/create-item" 
                  className="border-2 border-green-600 text-green-600 bg-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50"
                >
                  发布商品
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">欢迎，{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    退出
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="text-black hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  登录
                </Link>
                <Link 
                  to="/register" 
                  className="border-2 border-green-600 text-green-600 bg-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none focus:text-green-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t">
              <Link
                to="/items"
                className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-white rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                商品列表
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/my-items"
                    className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-white rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    我的商品
                  </Link>
                  <Link
                    to="/my-orders"
                    className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-white rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    我的订单
                  </Link>
                  <Link
                    to="/chat"
                    className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-white rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    聊天
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-white rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    个人资料
                  </Link>
                  <button
                    onClick={handleNotificationClick}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-white rounded-md text-base font-medium"
                  >
                    通知
                  </button>
                  <Link
                    to="/create-item"
                    className="block px-3 py-2 border-2 border-green-600 text-green-600 bg-white rounded-md text-base font-medium hover:bg-green-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    发布商品
                  </Link>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      欢迎，{user.name}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-white rounded-md text-base font-medium"
                    >
                      退出
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-white rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 border-2 border-green-600 text-green-600 bg-white rounded-md text-base font-medium hover:bg-green-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

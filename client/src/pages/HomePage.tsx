import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const HomePage = () => {
  const { user } = useAuth()

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-8xl mx-auto">
        {/* Hero Section - 全宽设计 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-green-600 sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            校园二手交易平台
          </h1>
          <p className="mt-6 max-w-4xl mx-auto text-lg text-gray-500 sm:text-xl md:text-2xl lg:text-3xl">
            安全、便捷的校园二手物品交易，让闲置物品重新发光发热
          </p>
          <div className="mt-8 max-w-2xl mx-auto sm:flex sm:justify-center gap-4">
          <Link
            to="/items"
            className="w-full sm:w-auto flex items-center justify-center px-12 py-4 border-2 border-green-600 text-lg font-medium rounded-lg text-green-600 bg-white hover:bg-green-50 transition-colors duration-200"
          >
            浏览商品
          </Link>
          {user ? (
            <Link
              to="/create-item"
              className="w-full sm:w-auto flex items-center justify-center px-12 py-4 border-2 border-green-600 text-lg font-medium rounded-lg text-green-600 bg-white hover:bg-green-50 transition-colors duration-200"
            >
              发布商品
            </Link>
          ) : (
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center px-12 py-4 border-2 border-green-600 text-lg font-medium rounded-lg text-green-600 bg-white hover:bg-green-50 transition-colors duration-200"
            >
              立即注册
            </Link>
          )}
          </div>
        </div>

        {/* Features Section - 分区布局 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-none">
        {/* 安全交易 */}
        <div className="bg-white rounded-xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">安全交易</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              校园身份认证，确保交易双方真实可靠，让交易更安心
            </p>
          </div>
        </div>

        {/* 快速便捷 */}
        <div className="bg-white rounded-xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">快速便捷</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              简单易用的界面，快速发布和搜索商品，让交易更高效
            </p>
          </div>
        </div>

        {/* 校园社区 */}
        <div className="bg-white rounded-xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">校园社区</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              基于兴趣的社交功能，让交易更有温度，结识更多同学
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

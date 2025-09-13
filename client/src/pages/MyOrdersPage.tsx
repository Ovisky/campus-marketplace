import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiService } from '../services/api'
import type { Order, OrdersResponse } from '../types/api'
import { useAuth } from '../contexts/AuthContext'
import { notificationService } from '../services/notificationService'

const MyOrdersPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'orders' | 'sales'>('orders')

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, statusFilter, activeTab])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response: OrdersResponse = activeTab === 'orders' 
        ? await apiService.getMyOrders({
            status: statusFilter || undefined,
            page: 1,
            limit: 20
          })
        : await apiService.getMySales({
            status: statusFilter || undefined,
            page: 1,
            limit: 20
          })
      setOrders(response.orders)
    } catch (err: any) {
      setError(err.message || '获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('确定要取消这个订单吗？')) return

    try {
      await apiService.cancelOrder(orderId)
      fetchOrders() // 重新获取列表
    } catch (err: any) {
      setError(err.message || '取消订单失败')
    }
  }

  const handleConfirmOrder = async (orderId: string) => {
    if (!confirm('确定要确认这个订单吗？')) return

    try {
      await apiService.updateOrderStatus(orderId, { status: 'confirmed' })
      
      // 找到对应的订单信息发送通知
      const order = orders.find(o => o._id === orderId)
      if (order) {
        notificationService.notifyOrderStatusChanged(orderId, order.item.title, 'confirmed')
      }
      
      fetchOrders() // 重新获取列表
    } catch (err: any) {
      setError(err.message || '确认订单失败')
    }
  }

  const statusLabels = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消'
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  if (!user) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">请先登录</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-8xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">我的订单</h1>
          <p className="mt-2 text-lg text-gray-600">管理你的购买和销售订单</p>
        </div>

        {/* 分区布局：侧边栏 + 主内容 */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* 左侧筛选栏 */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">筛选条件</h3>
            
            {/* 订单类型 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">订单类型</label>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    activeTab === 'orders'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  我的购买
                </button>
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    activeTab === 'sales'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  我的销售
                </button>
              </div>
            </div>

            {/* 状态筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">订单状态</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">全部状态</option>
                <option value="pending">待确认</option>
                <option value="confirmed">已确认</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>
        </div>

        {/* 右侧主内容区域 */}
        <div className="xl:col-span-4">
          {/* 订单统计信息 */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              共找到 <span className="font-semibold text-green-600">{orders.length}</span> 个订单
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* 订单网格 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                {/* 商品信息 */}
                <div className="flex items-start space-x-4 mb-4">
                  {order.item.images.length > 0 ? (
                    <img
                      src={order.item.images[0]}
                      alt={order.item.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400 text-xs">无图</span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{order.item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">价格：¥{order.price}</p>
                    <p className="text-sm text-gray-600">
                      {activeTab === 'orders' ? '卖家' : '买家'}：
                      {activeTab === 'orders' ? order.seller.name : order.buyer.name}
                    </p>
                  </div>
                </div>

                {/* 订单状态 */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>

                {/* 留言信息 */}
                {order.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">留言：</span>{order.message}
                    </p>
                  </div>
                )}

                {/* 时间信息 */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500">
                    下单时间：{new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2">
                  {activeTab === 'orders' && order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors duration-200"
                    >
                      取消订单
                    </button>
                  )}
                  
                  {activeTab === 'sales' && order.status === 'pending' && (
                    <button
                      onClick={() => handleConfirmOrder(order._id)}
                      className="w-full border-2 border-green-600 text-green-600 bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors duration-200"
                    >
                      确认订单
                    </button>
                  )}
                  
                  <Link
                    to={`/orders/${order._id}`}
                    className="block w-full text-center bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors duration-200"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeTab === 'orders' ? '暂无购买订单' : '暂无销售订单'}
              </p>
              {activeTab === 'orders' && (
                <Link
                  to="/items"
                  className="mt-4 inline-block border-2 border-green-600 text-green-600 bg-white px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
                >
                  去逛逛商品
                </Link>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

export default MyOrdersPage

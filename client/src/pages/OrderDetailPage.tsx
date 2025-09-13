import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import type { Order } from '../types/api'
import { useAuth } from '../contexts/AuthContext'

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateData, setUpdateData] = useState({
    status: '',
    sellerContact: '',
    meetingLocation: '',
    meetingTime: ''
  })

  useEffect(() => {
    if (id) {
      fetchOrder(id)
    }
  }, [id])

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true)
      const response = await apiService.getOrder(orderId)
      setOrder(response)
      setUpdateData({
        status: response.status,
        sellerContact: response.sellerContact || '',
        meetingLocation: response.meetingLocation || '',
        meetingTime: response.meetingTime ? new Date(response.meetingTime).toISOString().slice(0, 16) : ''
      })
    } catch (err: any) {
      setError(err.message || '获取订单详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !order) return

    setUpdating(true)
    setError('')

    try {
      await apiService.updateOrderStatus(id, {
        status: updateData.status,
        sellerContact: updateData.sellerContact || undefined,
        meetingLocation: updateData.meetingLocation || undefined,
        meetingTime: updateData.meetingTime || undefined
      })

      fetchOrder(id) // 重新获取订单
    } catch (err: any) {
      setError(err.message || '更新订单失败')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!id || !confirm('确定要取消这个订单吗？')) return

    try {
      await apiService.cancelOrder(id)
      navigate('/my-orders')
    } catch (err: any) {
      setError(err.message || '取消订单失败')
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

  if (error && !order) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">订单不存在</div>
      </div>
    )
  }

  const isSeller = order.seller._id === user._id
  const isBuyer = order.buyer._id === user._id

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-8xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/my-orders')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← 返回订单列表
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">订单详情</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 订单信息 */}
          <div className="space-y-6">
            {/* 商品信息 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">商品信息</h2>
              <div className="flex space-x-4">
                {order.item.images.length > 0 ? (
                  <img
                    src={order.item.images[0]}
                    alt={order.item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">无图</span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{order.item.description}</p>
                  <p className="text-xl font-bold text-green-600 mt-2">¥{order.price}</p>
                </div>
              </div>
            </div>

            {/* 订单状态 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">订单状态</h2>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
                <span className="text-sm text-gray-500">
                  下单时间：{new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 联系信息 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">联系信息</h2>
              <div className="space-y-2">
                <p><span className="font-medium">买家：</span>{order.buyer.name} ({order.buyer.studentId})</p>
                <p><span className="font-medium">卖家：</span>{order.seller.name} ({order.seller.studentId})</p>
                {order.buyerContact && (
                  <p><span className="font-medium">买家联系方式：</span>{order.buyerContact}</p>
                )}
                {order.sellerContact && (
                  <p><span className="font-medium">卖家联系方式：</span>{order.sellerContact}</p>
                )}
                {order.meetingLocation && (
                  <p><span className="font-medium">交易地点：</span>{order.meetingLocation}</p>
                )}
                {order.meetingTime && (
                  <p><span className="font-medium">交易时间：</span>{new Date(order.meetingTime).toLocaleString()}</p>
                )}
                {order.message && (
                  <p><span className="font-medium">买家留言：</span>{order.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* 操作区域 */}
          <div className="space-y-6">
            {/* 买家操作 */}
            {isBuyer && order.status === 'pending' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">我的操作</h2>
                <button
                  onClick={handleCancel}
                  className="w-full px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  取消订单
                </button>
              </div>
            )}

            {/* 卖家操作 */}
            {isSeller && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">卖家操作</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      订单状态
                    </label>
                    <select
                      id="status"
                      value={updateData.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">待确认</option>
                      <option value="confirmed">已确认</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sellerContact" className="block text-sm font-medium text-gray-700">
                      我的联系方式
                    </label>
                    <input
                      type="text"
                      id="sellerContact"
                      value={updateData.sellerContact}
                      onChange={(e) => setUpdateData({ ...updateData, sellerContact: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入联系方式"
                    />
                  </div>

                  <div>
                    <label htmlFor="meetingLocation" className="block text-sm font-medium text-gray-700">
                      交易地点
                    </label>
                    <input
                      type="text"
                      id="meetingLocation"
                      value={updateData.meetingLocation}
                      onChange={(e) => setUpdateData({ ...updateData, meetingLocation: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="如：宿舍楼下、教学楼等"
                    />
                  </div>

                  <div>
                    <label htmlFor="meetingTime" className="block text-sm font-medium text-gray-700">
                      交易时间
                    </label>
                    <input
                      type="datetime-local"
                      id="meetingTime"
                      value={updateData.meetingTime}
                      onChange={(e) => setUpdateData({ ...updateData, meetingTime: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {updating ? '更新中...' : '更新订单'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage

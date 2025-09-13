import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import type { Item } from '../types/api'
import { useAuth } from '../contexts/AuthContext'
import { notificationService } from '../services/notificationService'

const CreateOrderPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    message: '',
    buyerContact: '',
    meetingLocation: '',
    meetingTime: ''
  })

  useEffect(() => {
    if (id) {
      fetchItem(id)
    }
  }, [id])

  const fetchItem = async (itemId: string) => {
    try {
      setLoading(true)
      const response = await apiService.getItem(itemId)
      setItem(response)
    } catch (err: any) {
      setError(err.message || '获取商品详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !user) return

    setSubmitting(true)
    setError('')

    try {
      const order = await apiService.createOrder({
        itemId: id,
        message: formData.message || undefined,
        buyerContact: formData.buyerContact || undefined,
        meetingLocation: formData.meetingLocation || undefined,
        meetingTime: formData.meetingTime || undefined
      })

      // 发送订单创建通知
      notificationService.notifyOrderCreated(order.order._id, item?.title || '商品')

      navigate('/my-orders')
    } catch (err: any) {
      setError(err.message || '下单失败')
    } finally {
      setSubmitting(false)
    }
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

  if (error && !item) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">商品不存在</div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">确认下单</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 商品信息 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">商品信息</h2>
            {item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-400">暂无图片</span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{item.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">¥{item.price}</span>
              <span className="text-sm text-gray-500">卖家：{item.seller.name}</span>
            </div>
          </div>

          {/* 下单表单 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">订单信息</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  留言给卖家
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="请输入您想对卖家说的话..."
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="buyerContact" className="block text-sm font-medium text-gray-700">
                  联系方式
                </label>
                <input
                  type="text"
                  id="buyerContact"
                  name="buyerContact"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="请输入您的联系方式（手机号/微信等）"
                  value={formData.buyerContact}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="meetingLocation" className="block text-sm font-medium text-gray-700">
                  交易地点
                </label>
                <input
                  type="text"
                  id="meetingLocation"
                  name="meetingLocation"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="如：宿舍楼下、教学楼等"
                  value={formData.meetingLocation}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="meetingTime" className="block text-sm font-medium text-gray-700">
                  期望交易时间
                </label>
                <input
                  type="datetime-local"
                  id="meetingTime"
                  name="meetingTime"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.meetingTime}
                  onChange={handleChange}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">总价：</span>
                  <span className="text-2xl font-bold text-green-600">¥{item.price}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/items/${id}`)}
                  className="flex-1 border-2 border-gray-400 text-gray-400 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  返回商品详情
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 border-2 border-green-600 text-green-600 bg-white px-4 py-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {submitting ? '下单中...' : '确认下单'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateOrderPage

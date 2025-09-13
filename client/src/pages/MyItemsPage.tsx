import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiService } from '../services/api'
import type { ItemsResponse, Item } from '../types/api'
import { useAuth } from '../contexts/AuthContext'

const MyItemsPage = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (user) {
      fetchMyItems()
    }
  }, [user, statusFilter])

  const fetchMyItems = async () => {
    try {
      setLoading(true)
      const response: ItemsResponse = await apiService.getMyItems({
        status: statusFilter || undefined,
        page: 1,
        limit: 20
      })
      setItems(response.items)
    } catch (err: any) {
      setError(err.message || '获取我的商品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await apiService.updateItemStatus(itemId, newStatus)
      fetchMyItems() // 重新获取列表
    } catch (err: any) {
      setError(err.message || '更新状态失败')
    }
  }

  const conditionLabels = {
    new: '全新',
    like_new: '几乎全新',
    good: '良好',
    fair: '一般',
    poor: '较差'
  }

  const statusLabels = {
    active: '在售',
    sold: '已售',
    inactive: '下架'
  }

  if (!user) {
    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">请先登录</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的商品</h1>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="active">在售</option>
              <option value="sold">已售</option>
              <option value="inactive">下架</option>
            </select>
          </div>
          
          <Link
            to="/create-item"
            className="border-2 border-green-600 text-green-600 bg-white px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
          >
            发布新商品
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">暂无图片</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {item.description}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xl font-bold text-green-600">
                  ¥{item.price}
                </span>
                <span className="text-sm text-gray-500">
                  {conditionLabels[item.condition]}
                </span>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.status === 'active' ? 'bg-green-100 text-green-800' :
                  item.status === 'sold' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {statusLabels[item.status]}
                </span>
                
                <div className="flex space-x-2">
                  {item.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(item._id, 'inactive')}
                        className="text-gray-600 hover:text-gray-700 text-sm"
                      >
                        下架
                      </button>
                      <button
                        onClick={() => handleStatusChange(item._id, 'sold')}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        标记为已售
                      </button>
                    </>
                  )}
                  {item.status === 'inactive' && (
                    <button
                      onClick={() => handleStatusChange(item._id, 'active')}
                      className="text-green-600 hover:text-green-700 text-sm"
                    >
                      重新上架
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无商品</p>
          <Link
            to="/create-item"
            className="mt-4 inline-block border-2 border-green-600 text-green-600 bg-white px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
          >
            发布第一个商品
          </Link>
        </div>
      )}
      </div>
    </div>
  )
}

export default MyItemsPage

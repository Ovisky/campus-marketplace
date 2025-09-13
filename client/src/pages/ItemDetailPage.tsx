import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import type { Item } from '../types/api'
import { useAuth } from '../contexts/AuthContext'

const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contactLoading, setContactLoading] = useState(false)

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

  const conditionLabels = {
    new: '全新',
    like_new: '几乎全新',
    good: '良好',
    fair: '一般',
    poor: '较差'
  }

  const handleContactSeller = async () => {
    if (!user || !item) {
      console.error('用户或商品信息缺失:', { user, item });
      return;
    }
    
    try {
      setContactLoading(true);
      
      
      const userId = user._id || user.id;
      if (!userId) {
        console.error('用户ID不存在:', user);
        alert('用户信息异常，请重新登录');
        return;
      }
      
      if (!item.seller?._id) {
        console.error('卖家ID不存在:', item.seller);
        alert('无法获取卖家信息，请刷新页面重试');
        return;
      }
      
      const requestData = {
        buyerId: userId,
        sellerId: item.seller._id,
        itemId: item._id
      };
      
      
      
      const result = await apiService.createOrGetChatRoom({
        buyerId: userId,
        sellerId: item.seller._id,
        itemId: item._id
      });
      
      // 跳转到聊天页面
      navigate('/chat');
    } catch (error) {
      console.error('联系卖家失败:', error);
      alert('联系卖家失败，请稍后重试');
    } finally {
      setContactLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">商品不存在</div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 商品图片 */}
        <div>
          {item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-lg">暂无图片</span>
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-green-600">¥{item.price}</span>
            <span className="ml-4 text-sm text-gray-500">
              {conditionLabels[item.condition]}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">商品描述</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">卖家信息</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">姓名：{item.seller.name}</p>
              <p className="text-gray-700">学号：{item.seller.studentId}</p>
              {item.seller.phone && (
                <p className="text-gray-700">电话：{item.seller.phone}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">商品详情</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>分类：{item.category}</p>
              {item.location && <p>位置：{item.location}</p>}
              <p>发布时间：{new Date(item.createdAt).toLocaleString()}</p>
              {item.tags.length > 0 && (
                <p>标签：{item.tags.join(', ')}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            {user && user._id !== item.seller._id && item.status === 'active' ? (
              <>
                <Link
                  to={`/orders/create/${item._id}`}
                  className="flex-1 border-2 border-green-600 text-green-600 bg-white py-3 px-6 rounded-lg hover:bg-green-50 transition-colors text-center"
                >
                  立即下单
                </Link>
                <button 
                  onClick={handleContactSeller}
                  disabled={contactLoading}
                  className="flex-1 border-2 border-green-600 text-green-600 bg-white py-3 px-6 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {contactLoading ? '连接中...' : '联系卖家'}
                </button>
              </>
            ) : user && user._id === item.seller._id ? (
              <button className="flex-1 border-2 border-gray-400 text-gray-400 bg-white py-3 px-6 rounded-lg cursor-not-allowed">
                这是您的商品
              </button>
            ) : (
              <button 
                onClick={handleContactSeller}
                disabled={contactLoading || !user}
                className="flex-1 border-2 border-green-600 text-green-600 bg-white py-3 px-6 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                {contactLoading ? '连接中...' : '联系卖家'}
              </button>
            )}
            <button className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors">
              收藏
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetailPage

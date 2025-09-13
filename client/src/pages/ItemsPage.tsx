import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiService } from '../services/api'
import type { ItemsResponse, Item } from '../types/api'

const ItemsPage = () => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  useEffect(() => {
    fetchItems()
  }, [filters])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response: ItemsResponse = await apiService.getItems({
        ...filters,
        page: 1,
        limit: 20
      })
      setItems(response.items)
    } catch (err: any) {
      setError(err.message || '获取商品列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const categories = [
    { value: '', label: '全部分类' },
    { value: 'electronics', label: '电子产品' },
    { value: 'books', label: '图书教材' },
    { value: 'clothing', label: '服装配饰' },
    { value: 'furniture', label: '家具用品' },
    { value: 'sports', label: '运动健身' },
    { value: 'other', label: '其他' }
  ]

  const conditionLabels = {
    new: '全新',
    like_new: '几乎全新',
    good: '良好',
    fair: '一般',
    poor: '较差'
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
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">商品列表</h1>
              <p className="mt-2 text-base sm:text-lg text-gray-600">发现校园里的优质二手商品</p>
            </div>
            {/* 移动端筛选按钮 */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center px-4 py-2 border-2 border-green-600 text-green-600 bg-white rounded-lg hover:bg-green-50 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              筛选
            </button>
          </div>
        </div>

        {/* 分区布局：侧边栏 + 主内容 */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* 左侧筛选栏 */}
        <div className={`xl:col-span-1 ${showMobileFilters ? 'block' : 'hidden'} xl:block`}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 xl:sticky xl:top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">筛选条件</h3>
            
            {/* 搜索框 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索商品</label>
              <input
                type="text"
                placeholder="输入关键词..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* 分类筛选 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">商品分类</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* 排序方式 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">发布时间</option>
                <option value="price">价格</option>
                <option value="title">标题</option>
              </select>
            </div>

            {/* 排序顺序 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">排序顺序</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
          </div>
        </div>

        {/* 右侧主内容区域 */}
        <div className="xl:col-span-4">
          {/* 商品统计信息 */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              共找到 <span className="font-semibold text-green-600">{items.length}</span> 件商品
            </p>
          </div>

          {/* 商品网格 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
            {items.map((item) => (
              <Link
                key={item._id}
                to={`/items/${item._id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                {item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">暂无图片</span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-green-600">
                      ¥{item.price}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {conditionLabels[item.condition]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    卖家：{item.seller.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {items.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无商品</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

export default ItemsPage

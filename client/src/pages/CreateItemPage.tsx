import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const CreateItemPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    tags: ''
  })
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  const categories = [
    { value: '', label: '选择分类' },
    { value: 'electronics', label: '电子产品' },
    { value: 'books', label: '图书教材' },
    { value: 'clothing', label: '服装配饰' },
    { value: 'furniture', label: '家具用品' },
    { value: 'sports', label: '运动健身' },
    { value: 'other', label: '其他' }
  ]

  const conditions = [
    { value: '', label: '选择成色' },
    { value: 'new', label: '全新' },
    { value: 'like_new', label: '几乎全新' },
    { value: 'good', label: '良好' },
    { value: 'fair', label: '一般' },
    { value: 'poor', label: '较差' }
  ]

  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {}
    
    if (name === 'title') {
      if (!value) {
        errors.title = '请输入商品标题'
      } else if (value.length < 2) {
        errors.title = '标题至少需要2个字符'
      } else if (value.length > 50) {
        errors.title = '标题不能超过50个字符'
      }
    }
    
    if (name === 'description') {
      if (!value) {
        errors.description = '请输入商品描述'
      } else if (value.length < 10) {
        errors.description = '描述至少需要10个字符'
      } else if (value.length > 500) {
        errors.description = '描述不能超过500个字符'
      }
    }
    
    if (name === 'price') {
      if (!value) {
        errors.price = '请输入商品价格'
      } else if (isNaN(Number(value)) || Number(value) <= 0) {
        errors.price = '请输入有效的价格'
      } else if (Number(value) > 99999) {
        errors.price = '价格不能超过99999元'
      }
    }
    
    if (name === 'category') {
      if (!value) {
        errors.category = '请选择商品分类'
      }
    }
    
    if (name === 'condition') {
      if (!value) {
        errors.condition = '请选择商品成色'
      }
    }
    
    return errors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // 清除该字段的错误
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // 计算压缩后的尺寸
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height)

        // 转换为Base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    const maxImages = 5 // 最多5张图片

    if (images.length + files.length > maxImages) {
      setError(`最多只能上传${maxImages}张图片`)
      return
    }

    setError('')
    setLoading(true)

    try {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          if (file.size > 10 * 1024 * 1024) { // 10MB限制（压缩前）
            setError('图片大小不能超过10MB')
            setLoading(false)
            return
          }

          // 压缩图片
          const compressedImage = await compressImage(file, 800, 0.7)
          newImages.push(compressedImage)
        } else {
          setError('请选择图片文件')
          setLoading(false)
          return
        }
      }

      setImages(prev => [...prev, ...newImages])
    } catch (error) {
      setError('图片处理失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!user) {
      setError('请先登录')
      return
    }

    // 验证所有字段
    const titleErrors = validateField('title', formData.title)
    const descriptionErrors = validateField('description', formData.description)
    const priceErrors = validateField('price', formData.price)
    const categoryErrors = validateField('category', formData.category)
    const conditionErrors = validateField('condition', formData.condition)
    
    const allErrors = { 
      ...titleErrors, 
      ...descriptionErrors, 
      ...priceErrors, 
      ...categoryErrors, 
      ...conditionErrors 
    }
    
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors)
      return
    }

    setLoading(true)

    try {
      const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      
      await apiService.createItem({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location || undefined,
        tags,
        images
      })

      navigate('/my-items')
    } catch (err: any) {
      setError(err.message || '发布商品失败')
    } finally {
      setLoading(false)
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

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-8xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">发布商品</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            商品标题 * <span className="text-gray-500 text-xs">（2-50字符）</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
              fieldErrors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="请输入商品标题"
            value={formData.title}
            onChange={handleChange}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            商品描述 * <span className="text-gray-500 text-xs">（10-500字符）</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
              fieldErrors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="请详细描述商品信息"
            value={formData.description}
            onChange={handleChange}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
          )}
        </div>

        {/* 图片上传区域 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品图片
          </label>
          <div className="space-y-4">
            {/* 上传按钮 */}
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">正在处理图片...</span>
                      </p>
                      <p className="text-xs text-gray-500">请稍候</p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">点击上传图片</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF (最大10MB，自动压缩)</p>
                    </>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                />
              </label>
            </div>

            {/* 图片预览 */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`预览 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-500">
              最多可上传5张图片，每张图片不超过10MB（自动压缩至800px宽度）
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              价格 (元) * <span className="text-gray-500 text-xs">（0-99999）</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
            />
            {fieldErrors.price && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              分类 * <span className="text-gray-500 text-xs">（必选）</span>
            </label>
            <select
              id="category"
              name="category"
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.category ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              成色 * <span className="text-gray-500 text-xs">（必选）</span>
            </label>
            <select
              id="condition"
              name="condition"
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.condition ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.condition}
              onChange={handleChange}
            >
              {conditions.map(cond => (
                <option key={cond.value} value={cond.value}>{cond.label}</option>
              ))}
            </select>
            {fieldErrors.condition && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.condition}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              位置
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="如：宿舍楼、教学楼等"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            标签
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="用逗号分隔多个标签，如：二手,便宜,急售"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/my-items')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border-2 border-green-600 rounded-md shadow-sm text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? '发布中...' : '发布商品'}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

export default CreateItemPage

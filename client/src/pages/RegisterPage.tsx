import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {}
    
    if (name === 'studentId') {
      if (!value) {
        errors.studentId = '请输入学号'
      } else if (!/^\d{10,12}$/.test(value)) {
        errors.studentId = '学号应为10-12位数字'
      }
    }
    
    if (name === 'email') {
      if (!value) {
        errors.email = '请输入邮箱地址'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = '请输入有效的邮箱地址'
      }
    }
    
    if (name === 'password') {
      if (!value) {
        errors.password = '请输入密码'
      } else if (value.length < 6) {
        errors.password = '密码至少需要6个字符'
      }
    }
    
    if (name === 'confirmPassword') {
      if (!value) {
        errors.confirmPassword = '请确认密码'
      } else if (value !== formData.password) {
        errors.confirmPassword = '两次输入的密码不一致'
      }
    }
    
    if (name === 'name') {
      if (!value) {
        errors.name = '请输入姓名'
      } else if (value.length < 2) {
        errors.name = '姓名至少需要2个字符'
      }
    }
    
    return errors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    
    // 验证所有字段
    const studentIdErrors = validateField('studentId', formData.studentId)
    const emailErrors = validateField('email', formData.email)
    const passwordErrors = validateField('password', formData.password)
    const confirmPasswordErrors = validateField('confirmPassword', formData.confirmPassword)
    const nameErrors = validateField('name', formData.name)
    
    const allErrors = { 
      ...studentIdErrors, 
      ...emailErrors, 
      ...passwordErrors, 
      ...confirmPasswordErrors, 
      ...nameErrors 
    }
    
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors)
      return
    }

    setLoading(true)

    try {
      
      await register(formData.studentId, formData.email, formData.password, formData.name)
      
      navigate('/')
    } catch (err: any) {
      console.error('注册错误:', err)
      setError(err.message || '注册失败，请检查输入信息')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col" data-page="register-root">
      <div className="flex-1 min-h-0 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-lg space-y-8" data-register="form-card">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            注册账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或者{' '}
            <Link
              to="/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              登录现有账户
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                学号 <span className="text-gray-500 text-xs">（10-12位数字）</span>
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-base ${
                  fieldErrors.studentId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入学号"
                value={formData.studentId}
                onChange={handleChange}
              />
              {fieldErrors.studentId && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.studentId}</p>
              )}
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名 <span className="text-gray-500 text-xs">（至少2位）</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-base ${
                  fieldErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入姓名"
                value={formData.name}
                onChange={handleChange}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码 <span className="text-gray-500 text-xs">（至少6位）</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-base ${
                  fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入密码"
                value={formData.password}
                onChange={handleChange}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码 <span className="text-gray-500 text-xs">（与密码一致）</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-base ${
                  fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border-2 border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

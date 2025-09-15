import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const ProfilePage: React.FC = () => {
  const { user, token, setUserAndPersist } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    school: '',
    college: '',
    phone: '',
    avatar: ''
  });

  // 学校选项
  const schools = [
    '北京大学',
    '清华大学',
    '复旦大学',
    '上海交通大学',
    '浙江大学',
    '南京大学',
    '中山大学',
    '华中科技大学',
    '西安交通大学',
    '哈尔滨工业大学',
    '其他'
  ];

  // 学院选项
  const colleges = [
    '计算机学院',
    '软件学院',
    '信息工程学院',
    '经济学院',
    '管理学院',
    '文学院',
    '理学院',
    '工学院',
    '医学院',
    '法学院',
    '艺术学院',
    '其他'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        nickname: user.nickname || '',
        school: user.school || '',
        college: user.college || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const result = await apiService.updateProfile(formData);
      if (result && result.user) {
        setUserAndPersist(result.user as any);
      }
      setIsEditing(false);
      // 这里可以添加成功提示
      alert('个人资料更新成功！');
    } catch (error) {
      console.error('更新个人资料失败:', error);
      alert('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        nickname: user.nickname || '',
        school: user.school || '',
        college: user.college || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-500">请先登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* 标题区域 - 固定高度 */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-8xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
            <p className="text-gray-600 mt-2">管理您的个人信息</p>
          </div>
        </div>
      </div>
      
      {/* 内容区域 - 可滚动 */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-8xl mx-auto">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="border-2 border-green-600 text-green-600 bg-white px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
                >
                  编辑资料
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 学号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学号
                </label>
                <input
                  type="text"
                  value={user.studentId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {/* 姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* 昵称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  昵称
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="请输入昵称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* 学校 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学校
                </label>
                <select
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">请选择学校</option>
                  {schools.map(school => (
                    <option key={school} value={school}>{school}</option>
                  ))}
                </select>
              </div>

              {/* 学院 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学院
                </label>
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">请选择学院</option>
                  {colleges.map(college => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>

              {/* 手机号 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手机号
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="请输入手机号"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 border-2 border-green-600 text-green-600 bg-white py-3 px-6 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存修改'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 border-2 border-gray-400 text-gray-400 bg-white py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
              </div>
            )}
          </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProfilePage;

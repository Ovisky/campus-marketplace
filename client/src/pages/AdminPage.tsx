import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import UserManagement from '../components/admin/UserManagement';
import ItemManagement from '../components/admin/ItemManagement';

const AdminPage: React.FC = () => {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState('users');

  const tabs = [
    { id: 'users', name: '用户管理', icon: '👥' },
    { id: 'items', name: '商品管理', icon: '📦' },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'users':
        return <UserManagement />;
      case 'items':
        return <ItemManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部标题栏 */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">校园市场管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                返回前台
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  currentTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 页面内容 */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};


export default AdminPage;

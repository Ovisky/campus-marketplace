import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  seller: {
    _id: string;
    name: string;
    studentId: string;
  };
  status: 'active' | 'sold' | 'inactive';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ItemManagement: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(approvalFilter !== 'all' && { approvalStatus: approvalFilter })
      });

      const response = await apiService.getAdminItems(params.toString());
      setItems(response.items);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('获取商品列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentPage, searchTerm, statusFilter, approvalFilter]);

  const handleApproveItem = async (itemId: string) => {
    try {
      await apiService.updateItemApprovalStatus(itemId, 'approved');
      fetchItems();
    } catch (error) {
      console.error('审核商品失败:', error);
    }
  };

  const handleRejectItem = async (itemId: string) => {
    try {
      await apiService.updateItemApprovalStatus(itemId, 'rejected');
      fetchItems();
    } catch (error) {
      console.error('审核商品失败:', error);
    }
  };

  const handleToggleItemStatus = async (itemId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await apiService.updateAdminItemStatus(itemId, newStatus);
      fetchItems();
    } catch (error) {
      console.error('更新商品状态失败:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { text: '在售', color: 'bg-green-100 text-green-800' },
      sold: { text: '已售', color: 'bg-blue-100 text-blue-800' },
      inactive: { text: '下架', color: 'bg-gray-100 text-gray-800' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>{statusInfo.text}</span>;
  };

  const getApprovalBadge = (approvalStatus: string) => {
    const approvalMap = {
      pending: { text: '待审核', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: '已通过', color: 'bg-green-100 text-green-800' },
      rejected: { text: '已拒绝', color: 'bg-red-100 text-red-800' }
    };
    const approvalInfo = approvalMap[approvalStatus as keyof typeof approvalMap] || { text: approvalStatus, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${approvalInfo.color}`}>{approvalInfo.text}</span>;
  };

  return (
    <div className="p-6 w-full h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">商品管理</h2>
      
      {/* 筛选和搜索 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜索商品</label>
            <input
              type="text"
              placeholder="输入商品名称或描述"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="active">在售</option>
              <option value="sold">已售</option>
              <option value="inactive">下架</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">审核状态</label>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部审核状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchItems}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="bg-white rounded-lg shadow flex-1 min-h-0">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">商品列表 ({total} 个商品)</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            没有找到商品
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品信息</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">卖家</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">审核状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.images && item.images.length > 0 && (
                          <img
                            className="h-12 w-12 rounded-lg object-cover mr-4"
                            src={item.images[0]}
                            alt={item.title}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.category} · {item.condition}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.seller.name}</div>
                      <div className="text-sm text-gray-500">{item.seller.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getApprovalBadge(item.approvalStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {item.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveItem(item._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => handleRejectItem(item._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleToggleItemStatus(item._id, item.status)}
                          className={`${
                            item.status === 'active' 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {item.status === 'active' ? '下架' : '上架'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                显示第 {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, total)} 条，共 {total} 条
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <span className="px-3 py-1 text-sm">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemManagement;

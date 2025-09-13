import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex-1 w-full min-h-0 flex flex-col">
      {/* 主内容区域 - 自动撑满剩余空间 */}
      <main className="flex-1 w-full min-h-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;

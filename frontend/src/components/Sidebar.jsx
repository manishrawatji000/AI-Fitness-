// frontend/src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ collapsed, onToggle }) => {
  const menuItems = [
    { 
      icon: "🏠", 
      label: "Home", 
      path: "/dashboard",
      gradient: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)"
    },
    { 
      icon: "🏋️", 
      label: "Workouts", 
      path: "/workout",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
    },
    { 
      icon: "🍽️", 
      label: "Nutrition", 
      path: "/diet",
      gradient: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)"
    },
    { 
      icon: "📊", 
      label: "Progress", 
      path: "/progress",
      gradient: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)"
    },
    { 
      icon: "👤", 
      label: "Profile", 
      path: "/profile",
      gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
    },
    { 
      icon: "⚙️", 
      label: "Settings", 
      path: "/settings",
      gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)"
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <span style={{ fontSize: collapsed ? '24px' : '28px' }}>💪</span>
        </div>
        {!collapsed && (
          <div className="logo-text">
            <div className="logo-title">FitAI</div>
            <div className="logo-subtitle">Trainer</div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-item ${isActive ? 'active' : ''}`
            }
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="sidebar-item-icon" style={{ background: item.gradient }}>
              <span>{item.icon}</span>
            </div>
            {!collapsed && (
              <span className="sidebar-item-label">{item.label}</span>
            )}
            {!collapsed && (
              <div className="sidebar-item-indicator"></div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        {/* User Avatar */}
        <div className="sidebar-user">
          <div className="user-avatar">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User"
              style={{ width: '100%', height: '100%', borderRadius: '12px' }}
            />
          </div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">Neeraj</div>
              <div className="user-status">🟢 Active</div>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <span style={{ 
            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            display: 'inline-block'
          }}>
            ◀
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
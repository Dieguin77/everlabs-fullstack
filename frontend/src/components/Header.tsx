import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { logout } from '../store/slices/authSlice';
import './Header.css';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>🚀 Task Manager</h1>
        <span className="header-subtitle">Kanban Board</span>
      </div>
      
      <div className="header-right">
        {user && (
          <>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`user-role ${user.role.toLowerCase()}`}>
                {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

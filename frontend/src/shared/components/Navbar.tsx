import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks';
import { logout } from '../../core/store/authSlice';

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-brand">
                    <Link to="/dashboard" className="text-xl font-bold">
                        ✈️ AI旅行规划器
                    </Link>
                </div>

                <div className="navbar-menu">
                    <Link
                        to="/dashboard"
                        className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        仪表板
                    </Link>
                    <Link
                        to="/trips"
                        className={`navbar-link ${isActive('/trips') ? 'active' : ''}`}
                    >
                        我的行程
                    </Link>
                    <Link
                        to="/budgets"
                        className={`navbar-link ${isActive('/budgets') ? 'active' : ''}`}
                    >
                        预算管理
                    </Link>
                    <Link
                        to="/map"
                        className={`navbar-link ${isActive('/map') ? 'active' : ''}`}
                    >
                        地图导航
                    </Link>
                    <Link
                        to="/profile"
                        className={`navbar-link ${isActive('/profile') ? 'active' : ''}`}
                    >
                        个人资料
                    </Link>
                </div>

                <div className="navbar-user">
                    <span className="text-gray-700 mr-4">
                        欢迎, {user?.name || '用户'}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        退出登录
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
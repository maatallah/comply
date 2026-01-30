import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    FileText,
    CheckSquare,
    Clock,
    Settings,
    LogOut,
    Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const switchLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    };

    const getInitials = () => {
        if (!user) return '?';
        return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Shield size={24} />
                    TuniCompliance
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        {t('nav.dashboard')}
                    </NavLink>
                    <NavLink to="/obligations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FileText size={20} />
                        {t('nav.obligations')}
                    </NavLink>
                    <NavLink to="/controls" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <CheckSquare size={20} />
                        {t('nav.controls')}
                    </NavLink>
                    <NavLink to="/deadlines" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <Clock size={20} />
                        {t('nav.deadlines')}
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{getInitials()}</div>
                        <div>
                            <div style={{ fontWeight: 500, color: 'white' }}>
                                {user?.firstName} {user?.lastName}
                            </div>
                            <div style={{ fontSize: '0.75rem' }}>{user?.role}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <button
                            className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
                            onClick={() => switchLanguage('fr')}
                            style={{ flex: 1 }}
                        >
                            FR
                        </button>
                        <button
                            className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
                            onClick={() => switchLanguage('ar')}
                            style={{ flex: 1 }}
                        >
                            ع
                        </button>
                    </div>

                    <button className="nav-link" onClick={handleLogout} style={{ width: '100%' }}>
                        <LogOut size={20} />
                        {t('nav.logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

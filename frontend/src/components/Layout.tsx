import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    FileText,
    CheckSquare,
    Clock,
    BookOpen,
    LogOut,
    Shield,
    Bell,
    Building,
    ClipboardCheck,
    ClipboardList,
    Rss
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

export default function Layout() {
    const { t, i18n } = useTranslation();
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const api = useApi();

    const [unreadCount, setUnreadCount] = useState(0);

    const fetchCount = async () => {
        if (!token) return;
        try {
            const result = await api.getUnreadCount();
            if (result.success) {
                setUnreadCount(result.data.count);
            }
        } catch (err) {
            console.warn('Failed to fetch unread count');
        }
    };

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 60000); // Poll every minute

        window.addEventListener('alertAction', fetchCount);
        return () => {
            clearInterval(interval);
            window.removeEventListener('alertAction', fetchCount);
        };
    }, [token]);


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
                    <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
                    <NavLink to="/checks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <ClipboardCheck size={20} />
                        {t('nav.checks')}
                    </NavLink>
                    <NavLink to="/action-plans" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <ClipboardList size={20} />
                        {t('nav.actionPlans')}
                    </NavLink>
                    <NavLink to="/jort-feed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <Rss size={20} />
                        {t('nav.jortFeed') || 'Veille JORT'}
                    </NavLink>
                    <NavLink to="/regulations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <BookOpen size={20} />
                        {t('nav.regulations')}
                    </NavLink>
                    <NavLink to="/alerts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <div style={{ position: 'relative' }}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </div>
                        {t('nav.alerts')}
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <Building size={20} />
                        {t('nav.profile')}
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{getInitials()}</div>
                        <div>
                            <div style={{ fontWeight: 500, color: 'white' }}>
                                {user?.firstName} {user?.lastName}
                            </div>
                            <div style={{ fontSize: '0.75rem' }}>{user?.role ? t(`roles.${user.role}`) : ''}</div>
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

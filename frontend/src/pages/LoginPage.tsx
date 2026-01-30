import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { t, i18n } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await login(email, password);

        if (success) {
            navigate('/');
        } else {
            setError(t('auth.error'));
        }
        setLoading(false);
    };

    const switchLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <Shield size={48} color="#2563eb" />
                </div>
                <h1 className="login-title">TuniCompliance</h1>
                <p className="login-subtitle">{t('auth.login')}</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t('auth.email')}</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="ahmed@sportwear.tn"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.password')}</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? t('common.loading') : t('auth.submit')}
                    </button>
                </form>

                <div className="lang-switch">
                    <button
                        className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
                        onClick={() => switchLanguage('fr')}
                    >
                        Français
                    </button>
                    <button
                        className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
                        onClick={() => switchLanguage('ar')}
                    >
                        العربية
                    </button>
                </div>
            </div>
        </div>
    );
}

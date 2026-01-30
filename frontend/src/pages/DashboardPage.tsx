import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

interface CategoryStat {
    category: string;
    total: number;
    highRisk: number;
}

interface Summary {
    totalObligations: number;
    byCategory: CategoryStat[];
}

interface DeadlineSummary {
    dueSoon: number;
    overdue: number;
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user, token } = useAuth();

    const [obligationSummary, setObligationSummary] = useState<Summary | null>(null);
    const [deadlineSummary, setDeadlineSummary] = useState<DeadlineSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                };

                const [obRes, dlRes] = await Promise.all([
                    fetch(`${API_URL}/obligations/summary`, { headers }),
                    fetch(`${API_URL}/deadlines/summary`, { headers }),
                ]);

                if (!isMounted) return;

                const obResult = await obRes.json();
                const dlResult = await dlRes.json();

                if (obResult.success) setObligationSummary(obResult.data);
                if (dlResult.success) setDeadlineSummary(dlResult.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                if (isMounted) setError('Failed to load dashboard data');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [token]);

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    if (error) {
        return <div className="loading" style={{ color: 'red' }}>{error}</div>;
    }

    const total = obligationSummary?.totalObligations || 0;
    const dueSoon = deadlineSummary?.dueSoon || 0;
    const overdue = deadlineSummary?.overdue || 0;
    const compliantPct = total > 0 ? Math.round(((total - overdue) / total) * 100) : 100;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">
                    {t('dashboard.welcome')}, {user?.firstName || 'User'}! 👋
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="stat-value">{total}</div>
                            <div className="stat-label">{t('dashboard.totalObligations')}</div>
                        </div>
                        <FileText size={40} style={{ opacity: 0.3 }} />
                    </div>
                </div>

                <div className="stat-card warning">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="stat-value">{dueSoon}</div>
                            <div className="stat-label">{t('dashboard.dueSoon')}</div>
                        </div>
                        <Clock size={40} style={{ opacity: 0.3 }} />
                    </div>
                </div>

                <div className="stat-card danger">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="stat-value">{overdue}</div>
                            <div className="stat-label">{t('dashboard.overdue')}</div>
                        </div>
                        <AlertTriangle size={40} style={{ opacity: 0.3 }} />
                    </div>
                </div>

                <div className="stat-card success">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="stat-value">{compliantPct}%</div>
                            <div className="stat-label">{t('dashboard.compliant')}</div>
                        </div>
                        <CheckCircle size={40} style={{ opacity: 0.3 }} />
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {obligationSummary?.byCategory && obligationSummary.byCategory.length > 0 && (
                <div className="card">
                    <h2 className="card-title">{t('dashboard.byCategory')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        {obligationSummary.byCategory.map((item) => (
                            <div key={item.category} style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{item.total}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                    {t(`category.${item.category}`, item.category)}
                                </div>
                                {item.highRisk > 0 && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>
                                        ⚠️ {item.highRisk} {t('dashboard.highRisk')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

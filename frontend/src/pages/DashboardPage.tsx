import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

interface Summary {
    total: number;
    byCategory: Record<string, number>;
}

interface DeadlineSummary {
    dueSoon: number;
    overdue: number;
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const api = useApi();

    const [obligationSummary, setObligationSummary] = useState<Summary | null>(null);
    const [deadlineSummary, setDeadlineSummary] = useState<DeadlineSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [obResult, dlResult] = await Promise.all([
                    api.getObligationSummary(),
                    api.getDeadlineSummary(),
                ]);

                if (obResult.success) setObligationSummary(obResult.data);
                if (dlResult.success) setDeadlineSummary(dlResult.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">
                    {t('dashboard.welcome')}, {user?.firstName}! 👋
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="stat-value">{obligationSummary?.total || 0}</div>
                            <div className="stat-label">{t('dashboard.totalObligations')}</div>
                        </div>
                        <FileText size={40} style={{ opacity: 0.3 }} />
                    </div>
                </div>

                <div className="stat-card warning">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="stat-value">{deadlineSummary?.dueSoon || 0}</div>
                            <div className="stat-label">{t('dashboard.dueSoon')}</div>
                        </div>
                        <Clock size={40} style={{ opacity: 0.3 }} />
                    </div>
                </div>

                <div className="stat-card danger">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="stat-value">{deadlineSummary?.overdue || 0}</div>
                            <div className="stat-label">{t('dashboard.overdue')}</div>
                        </div>
                        <AlertTriangle size={40} style={{ opacity: 0.3 }} />
                    </div>
                </div>

                <div className="stat-card success">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div className="stat-value">
                                {obligationSummary?.total && deadlineSummary
                                    ? Math.round(((obligationSummary.total - deadlineSummary.overdue) / obligationSummary.total) * 100) || 100
                                    : 100}%
                            </div>
                            <div className="stat-label">{t('dashboard.compliant')}</div>
                        </div>
                        <CheckCircle size={40} style={{ opacity: 0.3 }} />
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {obligationSummary?.byCategory && (
                <div className="card">
                    <h2 className="card-title">Obligations par catégorie</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        {Object.entries(obligationSummary.byCategory).map(([category, count]) => (
                            <div key={category} style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{count}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{category}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

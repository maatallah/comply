import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, AlertTriangle, CheckCircle, Rss, ChevronRight, TrendingUp, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

interface CategoryScore {
    category: string;
    totalControls: number;
    passedControls: number;
    failedControls: number;
    partialControls: number;
    notCheckedControls: number;
    compliancePercent: number;
}

interface ComplianceBreakdown {
    overallScore: number;
    totalControls: number;
    passedControls: number;
    categories: CategoryScore[];
    overdueDeadlines: number;
    upcomingDeadlines: number;
}

interface Summary {
    totalObligations: number;
    byCategory: { category: string; total: number; highRisk: number }[];
}

interface DeadlineSummary {
    dueSoon: number;
    overdue: number;
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user, token } = useAuth();

    const [obligationSummary, setObligationSummary] = useState<Summary | null>(null);
    const [deadlineSummary, setDeadlineSummary] = useState<DeadlineSummary | null>(null);
    const [complianceBreakdown, setComplianceBreakdown] = useState<ComplianceBreakdown | null>(null);
    const [jortEntries, setJortEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

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

                const [obResult, dlResult, jortResult, scoringResult] = await Promise.all([
                    fetch(`${API_URL}/obligations/summary`, { headers }).then(r => r.json()),
                    fetch(`${API_URL}/deadlines/summary`, { headers }).then(r => r.json()),
                    fetch(`${API_URL}/jort-feed?limit=3&status=PENDING`, { headers }).then(r => r.json()),
                    fetch(`${API_URL}/scoring/breakdown`, { headers }).then(r => r.json()),
                ]);

                if (!isMounted) return;

                if (obResult.success) setObligationSummary(obResult.data);
                if (dlResult.success) setDeadlineSummary(dlResult.data);
                if (jortResult.success) setJortEntries(jortResult.entries);
                if (scoringResult.success) setComplianceBreakdown(scoringResult.data);
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
    const overallScore = complianceBreakdown?.overallScore ?? (total > 0 ? Math.round(((total - overdue) / total) * 100) : 100);

    // Data for PieChart
    const pieData = complianceBreakdown ? [
        { name: 'Conforme', value: complianceBreakdown.passedControls, color: '#10b981' },
        { name: 'Non-vérifié', value: complianceBreakdown.totalControls - complianceBreakdown.passedControls - (complianceBreakdown.categories.reduce((acc, c) => acc + c.failedControls + c.partialControls, 0)), color: '#94a3b8' },
        { name: 'Non-conforme', value: complianceBreakdown.categories.reduce((acc, c) => acc + c.failedControls, 0), color: '#ef4444' },
        { name: 'Partiel', value: complianceBreakdown.categories.reduce((acc, c) => acc + c.partialControls, 0), color: '#f59e0b' },
    ].filter(d => d.value > 0) : [];

    // Data for BarChart
    const barData = complianceBreakdown?.categories.map((cat) => ({
        name: t(`category.${cat.category}`, cat.category),
        Conforme: cat.passedControls,
        'Non-conforme': cat.failedControls,
        Partiel: cat.partialControls,
        'Non-vérifié': cat.notCheckedControls,
    })) || [];

    const handleExportPdf = async () => {
        setExporting(true);
        try {
            const response = await fetch(`${API_URL}/reports/obligations-pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'rapport-conformite.pdf';
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Export error:', err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">
                    {t('dashboard.welcome')}, {user?.firstName || 'User'}! 👋
                </h1>
                <button
                    className="btn btn-secondary"
                    onClick={handleExportPdf}
                    disabled={exporting}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Download size={18} />
                    {exporting ? 'Export...' : 'Exporter PDF'}
                </button>
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
                            <div className="stat-value">{overallScore}%</div>
                            <div className="stat-label">{t('dashboard.compliant')}</div>
                        </div>
                        <CheckCircle size={40} style={{ opacity: 0.3 }} />
                    </div>
                </div>
            </div>

            {/* Compliance Charts Section */}
            {complianceBreakdown && complianceBreakdown.totalControls > 0 && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} className="text-primary" />
                        Tableau de Conformité par Catégorie
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '1.5rem' }}>
                        {/* Pie Chart */}
                        <div style={{ textAlign: 'center' }}>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: overallScore >= 70 ? 'var(--success)' : overallScore >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                                {overallScore}%
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Score de Conformité Global</div>
                        </div>

                        {/* Bar Chart */}
                        <div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={barData} layout="vertical" margin={{ left: 80 }}>
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Conforme" stackId="a" fill="#10b981" />
                                    <Bar dataKey="Partiel" stackId="a" fill="#f59e0b" />
                                    <Bar dataKey="Non-conforme" stackId="a" fill="#ef4444" />
                                    <Bar dataKey="Non-vérifié" stackId="a" fill="#94a3b8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* JORT Feed Section */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                        <Rss size={20} className="text-primary" />
                        {t('regulatory.feed') || 'Veille Réglementaire JORT'}
                    </h2>
                    <a href="/jort-feed" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500, textDecoration: 'none' }}>
                        Voir tout
                        <ChevronRight size={16} />
                    </a>
                </div>

                {jortEntries.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {jortEntries.map((entry) => (
                            <div key={entry.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--primary-color)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span className="badge info" style={{ fontSize: '0.7rem' }}>{entry.type}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{new Date(entry.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, lineHeight: '1.4' }}>{entry.titleFr}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{entry.ministry}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '1rem' }}>Aucune nouvelle publication détectée.</p>
                )}
            </div>

            {/* Category Breakdown (Legacy) */}
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

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, AlertTriangle, CheckCircle, Rss, ChevronRight, TrendingUp, Download } from 'lucide-react';
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

// const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

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

    // Data for PieChart - with i18n
    const pieData = complianceBreakdown ? [
        { name: t('dashboard.conforme'), value: complianceBreakdown.passedControls, color: '#10b981' },
        { name: t('dashboard.notVerified'), value: complianceBreakdown.totalControls - complianceBreakdown.passedControls - (complianceBreakdown.categories.reduce((acc, c) => acc + c.failedControls + c.partialControls, 0)), color: '#94a3b8' },
        { name: t('dashboard.nonConforme'), value: complianceBreakdown.categories.reduce((acc, c) => acc + c.failedControls, 0), color: '#ef4444' },
        { name: t('dashboard.partial'), value: complianceBreakdown.categories.reduce((acc, c) => acc + c.partialControls, 0), color: '#f59e0b' },
    ].filter(d => d.value > 0) : [];

    // Data for BarChart
    // const barData = complianceBreakdown?.categories.map((cat) => ({
    //     name: t(`category.${cat.category}`, cat.category),
    //     Conforme: cat.passedControls,
    //     'Non-conforme': cat.failedControls,
    //     Partiel: cat.partialControls,
    //     'Non-vérifié': cat.notCheckedControls,
    // })) || [];

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

            {/* Compliance Charts Section - Professional Infographic Style */}
            {complianceBreakdown && complianceBreakdown.totalControls > 0 && (
                <div className="card compliance-dashboard" style={{ marginTop: '2rem', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                            <TrendingUp size={22} />
                            {t('dashboard.complianceTitle')}
                        </h2>
                        <div style={{ display: 'flex', background: 'var(--gray-100)', padding: '0.25rem', borderRadius: 'var(--radius)', gap: '0.25rem' }}>
                            <button
                                onClick={() => setViewMode('chart')}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: 'var(--radius)',
                                    border: 'none',
                                    background: viewMode === 'chart' ? '#fff' : 'transparent',
                                    boxShadow: viewMode === 'chart' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: viewMode === 'chart' ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <TrendingUp size={14} />
                                {t('dashboard.viewChart')}
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: 'var(--radius)',
                                    border: 'none',
                                    background: viewMode === 'table' ? '#fff' : 'transparent',
                                    boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <FileText size={14} />
                                {t('dashboard.viewTable')}
                            </button>
                        </div>
                    </div>

                    {viewMode === 'chart' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '3rem', alignItems: 'start' }}>
                            {/* Radial Gauge - Main Score */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                                    {/* Background circle */}
                                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                        <defs>
                                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor={overallScore >= 70 ? '#10b981' : overallScore >= 40 ? '#f59e0b' : '#ef4444'} />
                                                <stop offset="100%" stopColor={overallScore >= 70 ? '#34d399' : overallScore >= 40 ? '#fbbf24' : '#f87171'} />
                                            </linearGradient>
                                        </defs>
                                        {/* Background track */}
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color, #e5e7eb)" strokeWidth="8" opacity="0.3" />
                                        {/* Score arc */}
                                        <circle
                                            cx="50" cy="50" r="42"
                                            fill="none"
                                            stroke="url(#scoreGradient)"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${overallScore * 2.64} 264`}
                                            style={{ transition: 'stroke-dasharray 1s ease-out' }}
                                        />
                                    </svg>
                                    {/* Center content */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%', left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            fontSize: '3rem',
                                            fontWeight: 800,
                                            lineHeight: 1,
                                            background: `linear-gradient(135deg, ${overallScore >= 70 ? '#10b981, #34d399' : overallScore >= 40 ? '#f59e0b, #fbbf24' : '#ef4444, #f87171'})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}>
                                            {overallScore}%
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {t('dashboard.conformity')}
                                        </div>
                                    </div>
                                </div>

                                {/* Legend Pills */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                                    {pieData.map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            padding: '0.35rem 0.75rem',
                                            background: `${item.color}15`,
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500
                                        }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                            <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                                            <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Breakdown - Modern Bars */}
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('dashboard.byCategory')}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {complianceBreakdown.categories.map((cat, idx) => {
                                        const total = cat.totalControls || 1;
                                        const passPercent = (cat.passedControls / total) * 100;
                                        const partialPercent = (cat.partialControls / total) * 100;
                                        const failPercent = (cat.failedControls / total) * 100;
                                        const uncheckPercent = (cat.notCheckedControls / total) * 100;

                                        return (
                                            <div key={idx} style={{
                                                padding: '1rem 1.25rem',
                                                background: 'var(--bg-card-hover, #f8fafc)',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-light, #e2e8f0)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                        {t(`category.${cat.category}`, cat.category)}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        color: cat.compliancePercent >= 70 ? '#10b981' : cat.compliancePercent >= 40 ? '#f59e0b' : '#ef4444'
                                                    }}>
                                                        {cat.compliancePercent}%
                                                    </span>
                                                </div>
                                                {/* Stacked progress bar */}
                                                <div style={{
                                                    height: '10px',
                                                    borderRadius: '999px',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    background: 'var(--border-color, #e5e7eb)'
                                                }}>
                                                    {passPercent > 0 && (
                                                        <div style={{ width: `${passPercent}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.5s' }}></div>
                                                    )}
                                                    {partialPercent > 0 && (
                                                        <div style={{ width: `${partialPercent}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', transition: 'width 0.5s' }}></div>
                                                    )}
                                                    {failPercent > 0 && (
                                                        <div style={{ width: `${failPercent}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)', transition: 'width 0.5s' }}></div>
                                                    )}
                                                    {uncheckPercent > 0 && (
                                                        <div style={{ width: `${uncheckPercent}%`, background: '#94a3b8', transition: 'width 0.5s' }}></div>
                                                    )}
                                                </div>
                                                {/* Mini stats */}
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                    <span><span style={{ color: '#10b981', fontWeight: 600 }}>{cat.passedControls}</span> {t('dashboard.ok')}</span>
                                                    <span><span style={{ color: '#f59e0b', fontWeight: 600 }}>{cat.partialControls}</span> {t('dashboard.partial')}</span>
                                                    <span><span style={{ color: '#ef4444', fontWeight: 600 }}>{cat.failedControls}</span> {t('dashboard.fail')}</span>
                                                    <span><span style={{ color: '#94a3b8', fontWeight: 600 }}>{cat.notCheckedControls}</span> {t('dashboard.nv')}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--gray-100)' }}>
                                        <th style={{ textAlign: 'start', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('obligations.category')}</th>
                                        <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('dashboard.conformity')}</th>
                                        <th style={{ textAlign: 'start', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Détails</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complianceBreakdown.categories.map((cat, idx) => {
                                        const score = cat.compliancePercent;
                                        return (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>
                                                    {t(`category.${cat.category}`, cat.category)}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <span style={{
                                                            fontWeight: 700,
                                                            color: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
                                                        }}>
                                                            {score}%
                                                        </span>
                                                        <div style={{ width: '60px', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${score}%`,
                                                                height: '100%',
                                                                background: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
                                                            }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                                            <span style={{ fontWeight: 600, color: '#10b981' }}>{cat.passedControls}</span>
                                                            <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.ok')}</span>
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                                                            <span style={{ fontWeight: 600, color: '#f59e0b' }}>{cat.partialControls}</span>
                                                            <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.partial')}</span>
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                                                            <span style={{ fontWeight: 600, color: '#ef4444' }}>{cat.failedControls}</span>
                                                            <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.fail')}</span>
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }} />
                                                            <span style={{ fontWeight: 600, color: '#94a3b8' }}>{cat.notCheckedControls}</span>
                                                            <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.nv')}</span>
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
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
            {
                obligationSummary?.byCategory && obligationSummary.byCategory.length > 0 && (
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
                )
            }
        </div >
    );
}

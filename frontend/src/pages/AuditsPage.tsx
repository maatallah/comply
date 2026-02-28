import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Calendar, CheckCircle, AlertTriangle, FileText, ChevronRight, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export default function AuditsPage() {
    const { t, i18n } = useTranslation();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [audits, setAudits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, SCHEDULED, OVERDUE, COMPLETED

    useEffect(() => {
        fetchAudits();
    }, [token]);

    const fetchAudits = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/audits`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAudits(data.audits || []);
            }
        } catch (err) {
            console.error('Failed to fetch audits', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'SCHEDULED': return 'info';
            case 'IN_PROGRESS': return 'warning';
            case 'CANCELLED': return 'default';
            default: return 'default';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const filteredAudits = audits.filter(a => {
        if (filter === 'ALL') return true;
        if (filter === 'OVERDUE') {
            return a.status !== 'COMPLETED' && new Date(a.scheduledDate) < new Date();
        }
        return a.status === filter;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <h1 className="page-title">{t('audit.title') || 'Audits & Inspections'}</h1>
                        <p className="page-subtitle">{t('audit.subtitle') || 'Manage internal and external compliance audits'}</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/audits/new')}
                    >
                        <Plus size={18} />
                        {t('audit.new') || 'Nouvel Audit'}
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '9999px',
                            background: filter === f ? '#eff6ff' : 'transparent',
                            color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: filter === f ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t(`audit.statusValues.${f}`) || f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div>{t('common.loading')}</div>
            ) : filteredAudits.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredAudits.map((audit) => (
                        <div key={audit.id} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem' }}>
                            {/* Date Badge */}
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                minWidth: '80px', padding: '0.5rem',
                                background: 'var(--gray-50)', borderRadius: '8px',
                                border: '1px solid var(--gray-200)'
                            }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    {new Date(audit.scheduledDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-TN' : 'fr-FR', { month: 'short' })}
                                </span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {new Date(audit.scheduledDate).getDate()}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {new Date(audit.scheduledDate).getFullYear()}
                                </span>
                            </div>

                            {/* Main Params */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                                        {i18n.language === 'ar' ? (audit.auditType?.nameAr || audit.auditType?.name) : audit.auditType?.name || 'Audit'}
                                    </h3>
                                    <span className={`badge ${getStatusColor(audit.status)}`}>
                                        {t(`audit.statusValues.${audit.status}`) || audit.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={16} />
                                        <span>{audit.auditType?.scope === 'INTERNAL' ? t('audit.scopeValues.INTERNAL') : t('audit.scopeValues.EXTERNAL')}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle size={16} />
                                        <span>{audit.auditorName || (audit.leadAuditor ? `${audit.leadAuditor.firstName} ${audit.leadAuditor.lastName}` : 'N/A')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Score & Action */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                {audit.score !== null && (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(audit.score) }}>
                                            {audit.score}%
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('audit.score')}</div>
                                    </div>
                                )}
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate(`/audits/${audit.id}`)}
                                >
                                    {t('common.details') || 'Détails'}
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>{t('audit.noData') || 'Aucun audit trouvé.'}</p>
                </div>
            )}
        </div>
    );
}

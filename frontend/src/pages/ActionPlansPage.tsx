import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ExternalLink, FileText, Eye, Clock } from 'lucide-react';

interface Check {
    id: string;
    controlId: string;
    checkDate: string;
    status: string;
    findings?: string;
    correctiveActions?: string;
    performedBy?: string;
    control?: {
        titleFr: string;
        titleAr?: string;
    };
    evidence?: {
        id: string;
        fileName: string;
        fileType: string;
    }[];
    actions?: {
        id: string;
        description: string;
        status: string;
        priority: string;
    }[];
}

export default function ActionPlansPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('highlight');

    const [plans, setPlans] = useState<Check[]>([]);
    const [loading, setLoading] = useState(true);
    const [emailing, setEmailing] = useState<string | null>(null);

    const fetchActionPlans = async () => {
        setLoading(true);
        const result = await api.getChecks({ hasActionPlan: 'true' });
        if (result.success && result.data) {
            setPlans(result.data);
        } else {
            setPlans([]);
        }
        setLoading(false);
    };

    const { success, error } = useToast();

    const handleEmail = async (id: string) => {
        setEmailing(id);
        const result = await api.emailCheck(id);
        setEmailing(null);

        if (result.success) {
            success(t('common.emailSent') || 'Email envoyé avec succès');
        } else {
            error(t('common.error') || 'Une erreur est survenue');
        }
    };

    useEffect(() => {
        fetchActionPlans();
    }, []);

    useEffect(() => {
        if (highlightId && !loading && plans.length > 0) {
            setTimeout(() => {
                const el = document.getElementById(`plan-${highlightId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.style.transition = 'box-shadow 0.5s';
                    el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
                }
            }, 500);
        }
    }, [highlightId, loading, plans]);

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('nav.actionPlans') || 'Plans d\'Action'}</h1>
            </div>

            <div className="card">
                {plans.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle2 size={48} className="text-success" style={{ opacity: 0.5 }} />
                        <p>{t('checks.noPlans') || 'Tout est en ordre. Aucun plan d\'action en cours.'}</p>
                    </div>
                ) : (
                    <div className="plans-list">
                        {plans.map(plan => (
                            <div key={plan.id} id={`plan-${plan.id}`} className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--danger)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                            {i18n.language === 'ar' && plan.control?.titleAr ? plan.control.titleAr : plan.control?.titleFr}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                                            {t('checks.failedOn') || 'Échec constaté le'} : {new Date(plan.checkDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="badge danger">{t(`checkStatus.${plan.status}`)}</span>
                                </div>

                                <div style={{ background: '#fff1f1', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: '#991b1b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertCircle size={16} />
                                        {t('checks.findings') || 'Constats'}
                                    </h4>
                                    <p style={{ fontSize: '0.95rem', color: '#7f1d1d' }}>{plan.findings}</p>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {t('checks.correctiveActions') || 'Actions Correctives'}
                                    </h4>

                                    {plan.actions && plan.actions.length > 0 ? (
                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                            {plan.actions.map((action: any) => (
                                                <div key={action.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
                                                    {action.status === 'COMPLETED' ? (
                                                        <CheckCircle2 size={16} className="text-success" />
                                                    ) : (
                                                        <Clock size={16} className="text-secondary" />
                                                    )}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <span style={{ fontSize: '0.9rem', textDecoration: action.status === 'COMPLETED' ? 'line-through' : 'none', color: action.status === 'COMPLETED' ? 'var(--gray-400)' : 'var(--gray-800)' }}>
                                                                {action.description}
                                                            </span>
                                                            <span className={`badge ${action.priority === 'CRITICAL' ? 'danger' : action.priority === 'HIGH' ? 'warning' : 'secondary'}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                                                                {action.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.95rem', color: 'var(--gray-700)' }}>
                                            {plan.correctiveActions || t('checks.noActionsDefined') || 'Aucune action définie'}
                                        </p>
                                    )}
                                </div>

                                {plan.evidence && plan.evidence.length > 0 && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                            {t('checks.evidence') || 'Preuves'}
                                        </h4>
                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                            {plan.evidence.map((ev, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f9fafb', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
                                                    {ev.fileType?.startsWith('image/') ? (
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/evidence/file/${ev.id}`}
                                                            alt={ev.fileName}
                                                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                                                            onClick={async () => {
                                                                const blob = await api.getEvidenceFile(ev.id);
                                                                if (blob) {
                                                                    const url = window.URL.createObjectURL(blob);
                                                                    window.open(url, '_blank');
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <FileText size={16} className="text-primary" />
                                                    )}
                                                    <span
                                                        onClick={async () => {
                                                            const blob = await api.getEvidenceFile(ev.id);
                                                            if (blob) {
                                                                const url = window.URL.createObjectURL(blob);
                                                                window.open(url, '_blank');
                                                            }
                                                        }}
                                                        style={{ flex: 1, fontSize: '0.875rem', textDecoration: 'underline', color: 'inherit', cursor: 'pointer' }}
                                                        className="truncate"
                                                    >
                                                        {ev.fileName}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="btn-icon"
                                                        onClick={async () => {
                                                            const blob = await api.getEvidenceFile(ev.id);
                                                            if (blob) {
                                                                const url = window.URL.createObjectURL(blob);
                                                                window.open(url, '_blank');
                                                            }
                                                        }}
                                                        title={t('evidence.preview') || 'Voir'}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleEmail(plan.id)}
                                        disabled={emailing === plan.id}
                                        title={t('common.sendReport') || 'Envoyer le rapport par email'}
                                    >
                                        {emailing === plan.id ? '...' : (t('common.email') || 'Email')}
                                    </button>
                                    <Link to={`/controls?id=${plan.controlId}`} className="btn btn-sm btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ExternalLink size={14} />
                                        {t('controls.viewControl') || 'Voir le Contrôle'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

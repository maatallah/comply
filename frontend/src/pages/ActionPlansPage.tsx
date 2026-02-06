import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

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
}

export default function ActionPlansPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [plans, setPlans] = useState<Check[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActionPlans = async () => {
        setLoading(true);
        // Fetch checks where hasActionPlan is true
        const result = await api.getChecks({ hasActionPlan: 'true' });
        if (result.success) {
            setPlans(result.data.checks);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchActionPlans();
    }, []);

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
                            <div key={plan.id} className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--danger)' }}>
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
                                    <p style={{ fontSize: '0.95rem', color: 'var(--gray-700)' }}>
                                        {plan.correctiveActions || t('checks.noActionsDefined') || 'Aucune action définie'}
                                    </p>
                                </div>

                                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'flex-end' }}>
                                    <Link to="/controls" className="btn btn-sm btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

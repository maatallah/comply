import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { ClipboardCheck, Filter } from 'lucide-react';

interface Check {
    id: string;
    controlId: string;
    checkDate: string;
    status: 'PENDING' | 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_APPLICABLE';
    findings?: string;
    correctiveActions?: string;
    performedBy?: string;
    control?: {
        titleFr: string;
        titleAr?: string;
    };
}

export default function ChecksPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [checks, setChecks] = useState<Check[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [emailing, setEmailing] = useState<string | null>(null);

    const fetchChecks = async (status?: string) => {
        setLoading(true);
        const params: any = {};
        if (status && status !== 'all') params.status = status;

        const result = await api.getChecks(params);
        if (result.success && result.data?.checks) {
            setChecks(result.data.checks);
        } else {
            setChecks([]);
        }
        setLoading(false);
    };

    const handleEmail = async (id: string) => {
        setEmailing(id);
        const result = await api.emailCheck(id);
        setEmailing(null);

        if (result.success) {
            alert(t('common.emailSent') || 'Email envoyé avec succès');
        } else {
            alert(t('common.error') || 'Une erreur est survenue');
        }
    };

    useEffect(() => {
        fetchChecks(filter);
    }, [filter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PASS': return <span className="badge success">{t('checkStatus.PASS')}</span>;
            case 'FAIL': return <span className="badge danger">{t('checkStatus.FAIL')}</span>;
            case 'PARTIAL': return <span className="badge warning">{t('checkStatus.PARTIAL')}</span>;
            case 'PENDING': return <span className="badge info">{t('checkStatus.PENDING')}</span>;
            default: return <span className="badge secondary">{status}</span>;
        }
    };

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('nav.checks') || 'Vérifications'}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} className="text-gray-500" />
                        <select
                            className="form-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                        >
                            <option value="all">{t('common.all')}</option>
                            <option value="PASS">{t('checkStatus.PASS')}</option>
                            <option value="FAIL">{t('checkStatus.FAIL')}</option>
                            <option value="PARTIAL">{t('checkStatus.PARTIAL')}</option>
                            <option value="PENDING">{t('checkStatus.PENDING')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                {checks.length === 0 ? (
                    <div className="empty-state">
                        <ClipboardCheck size={48} className="text-gray-300" />
                        <p>{t('checks.noData') || 'Aucune vérification enregistrée'}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('controls.control')}</th>
                                    <th>{t('common.date')}</th>
                                    <th>{t('common.status')}</th>
                                    <th>{t('checks.checkedBy') || 'Vérifié par'}</th>
                                    <th>{t('checks.findings') || 'Constats'}</th>
                                    <th>{t('common.actions') || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checks.map(check => (
                                    <tr key={check.id}>
                                        <td>
                                            <strong>
                                                {i18n.language === 'ar' && check.control?.titleAr
                                                    ? check.control.titleAr
                                                    : check.control?.titleFr || 'N/A'}
                                            </strong>
                                        </td>
                                        <td>{new Date(check.checkDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-TN' : 'fr-TN')}</td>
                                        <td>{getStatusBadge(check.status)}</td>
                                        <td>{check.performedBy || '-'}</td>
                                        <td style={{ maxWidth: '300px' }}>
                                            <div style={{ fontSize: '0.875rem' }} className="truncate">
                                                {check.findings || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => handleEmail(check.id)}
                                                disabled={emailing === check.id}
                                                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                                title="Envoyer le rapport par email"
                                            >
                                                {emailing === check.id ? '...' : 'Email'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

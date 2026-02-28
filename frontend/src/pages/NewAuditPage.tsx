import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Calendar, FileText, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LocaleDateInput from '../components/LocaleDateInput';

const API_URL = 'http://localhost:3000';

export default function NewAuditPage() {
    const { t, i18n } = useTranslation();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [types, setTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [auditTypeId, setAuditTypeId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [auditorName, setAuditorName] = useState('');
    const [scope, setScope] = useState('INTERNAL'); // Should match selected type scope ideally, or override?
    // Usually AuditType determines scope.

    useEffect(() => {
        fetchTypes();
    }, [token]);

    const fetchTypes = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/audits/types`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTypes(data.types);
                if (data.types.length > 0) {
                    setAuditTypeId(data.types[0].id);
                    setScope(data.types[0].scope);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const typeId = e.target.value;
        setAuditTypeId(typeId);
        const type = types.find(t => t.id === typeId);
        if (type) {
            setScope(type.scope);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/audits`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    auditTypeId,
                    scheduledDate,
                    auditorName: scope === 'EXTERNAL' ? auditorName : undefined,
                    leadAuditorId: scope === 'INTERNAL' ? user?.id : undefined
                    // For MVP, auto-assign creator as Lead Auditor for Internal
                })
            });
            const data = await res.json();
            if (data.success) {
                navigate(`/audits/${data.audit.id}`);
            } else {
                alert(data.message || t('audit.createError'));
            }
        } catch (err) {
            console.error(err);
            alert(t('audit.createFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <button onClick={() => navigate('/audits')} className="btn-icon" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} />
                        {t('audit.back')}
                    </button>
                    <h1 className="page-title">{t('audit.new')}</h1>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t('audit.type') || 'Type d\'Audit'}</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <FileText size={20} style={{ color: 'var(--gray-500)' }} />
                            <select
                                className="form-select"
                                value={auditTypeId}
                                onChange={handleTypeChange}
                                required
                            >
                                {types.map(typeItem => (
                                    <option key={typeItem.id} value={typeItem.id}>{i18n.language === 'ar' ? (typeItem.nameAr || typeItem.name) : typeItem.name} ({typeItem.scope === 'INTERNAL' ? t('audit.scopeValues.INTERNAL') : t('audit.scopeValues.EXTERNAL')})</option>
                                ))}
                            </select>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {(() => { const type = types.find(t => t.id === auditTypeId); return i18n.language === 'ar' ? (type?.descriptionAr || type?.description) : type?.description; })()}
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('audit.date') || 'Date Prévue'}</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Calendar size={20} style={{ color: 'var(--gray-500)' }} />
                            <LocaleDateInput
                                className="form-input"
                                value={scheduledDate}
                                onChange={(val) => setScheduledDate(val)}
                            />
                        </div>
                    </div>

                    {scope === 'INTERNAL' && (
                        <div className="alert info">
                            <Users size={18} />
                            {t('audit.creatorAsLead')}
                        </div>
                    )}

                    {scope === 'EXTERNAL' && (
                        <div className="form-group">
                            <label className="form-label">{t('audit.auditor', 'Auditeur')}</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Users size={20} style={{ color: 'var(--gray-500)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    value={auditorName}
                                    onChange={(e) => setAuditorName(e.target.value)}
                                    placeholder={t('audit.auditorPlaceholder', 'Nom de l\'auditeur ou de l\'organisme')}
                                    required={scope === 'EXTERNAL'}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/audits')}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            <Save size={18} />
                            {submitting ? t('audit.scheduling') : t('audit.schedule')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

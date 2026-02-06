import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import EvidenceUpload from './EvidenceUpload';
import { FileText, Trash2 } from 'lucide-react';

interface CheckFormProps {
    controlId: string;
    onSave: () => void;
    onCancel: () => void;
}

export default function CheckForm({ controlId, onSave, onCancel }: CheckFormProps) {
    const { t } = useTranslation();
    const api = useApi();

    const [status, setStatus] = useState<'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_APPLICABLE'>('PASS');
    const [findings, setFindings] = useState('');
    const [correctiveActions, setCorrectiveActions] = useState('');
    const [nextCheckDate, setNextCheckDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [evidenceList, setEvidenceList] = useState<any[]>([]);

    const handleEvidenceSuccess = (evidence: any) => {
        setEvidenceList([...evidenceList, evidence]);
    };

    const handleRemoveEvidence = async (id: string, index: number) => {
        const result = await api.deleteEvidence(id);
        if (result.success) {
            setEvidenceList(evidenceList.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await api.createCheck({
            controlId,
            status,
            findings,
            correctiveActions: (status === 'FAIL' || status === 'PARTIAL') ? correctiveActions : undefined,
            nextCheckDate: nextCheckDate ? new Date(nextCheckDate).toISOString() : undefined,
        });

        if (result.success) {
            // Check is saved, evidence is already linked via checkId in EvidenceUpload
            onSave();
        } else {
            setError(result.error?.message || 'Failed to save check');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            {error && <div className="alert error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="form-group">
                <label className="form-label">{t('common.status')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {['PASS', 'FAIL', 'PARTIAL', 'NOT_APPLICABLE'].map((s) => (
                        <button
                            key={s}
                            type="button"
                            className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setStatus(s as any)}
                        >
                            {t(`checkStatus.${s}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">{t('checks.findings')}</label>
                <textarea
                    className="form-control"
                    rows={3}
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder={t('checks.findingsPlaceholder') || 'Décrivez ce que vous avez vérifié...'}
                />
            </div>

            {(status === 'FAIL' || status === 'PARTIAL') && (
                <div className="form-group action-plan-box" style={{ background: '#fff1f1', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid #fee2e2' }}>
                    <label className="form-label" style={{ color: '#991b1b', fontWeight: 600 }}>
                        {t('checks.correctiveActions')}
                    </label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={correctiveActions}
                        onChange={(e) => setCorrectiveActions(e.target.value)}
                        placeholder={t('checks.actionsPlaceholder') || 'Quelles actions faut-il entreprendre ?'}
                        required
                    />
                    <p style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.5rem' }}>
                        {t('checks.actionPlanHint') || 'Une alerte sera générée automatiquement.'}
                    </p>
                </div>
            )}

            <div className="form-group">
                <label className="form-label">{t('checks.nextCheckDate') || 'Prochaine vérification'}</label>
                <input
                    type="date"
                    className="form-control"
                    value={nextCheckDate}
                    onChange={(e) => setNextCheckDate(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">{t('checks.evidence') || 'Preuves'}</label>
                <EvidenceUpload
                    checkId={controlId} // Temporary link until Check is created? Actually Evidence model needs a checkId. 
                    // WAIT: I might need to create the Check FIRST to get an ID.
                    onSuccess={handleEvidenceSuccess}
                />

                {evidenceList.length > 0 && (
                    <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
                        {evidenceList.map((ev, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
                                <FileText size={16} className="text-primary" />
                                <span style={{ flex: 1, fontSize: '0.875rem' }} className="truncate">{ev.fileName}</span>
                                <button type="button" className="btn-icon danger" onClick={() => handleRemoveEvidence(ev.id, idx)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                    {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? t('common.loading') : t('common.save')}
                </button>
            </div>
        </form>
    );
}

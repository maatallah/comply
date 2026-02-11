import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import EvidenceUpload from './EvidenceUpload';
import { FileText, Trash2, Eye, X } from 'lucide-react';

interface CheckFormProps {
    controlId: string;
    initialData?: any; // Add initialData prop
    onSave: () => void;
    onCancel: () => void;
}

export default function CheckForm({ controlId, initialData, onSave, onCancel }: CheckFormProps) {
    const { t } = useTranslation();
    const api = useApi();

    const [status, setStatus] = useState<'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_APPLICABLE'>(initialData?.status || 'PASS');
    const [findings, setFindings] = useState(initialData?.findings || '');
    const [correctiveActions, setCorrectiveActions] = useState(initialData?.correctiveActions || '');
    const [nextCheckDate, setNextCheckDate] = useState(initialData?.nextCheckDue ? new Date(initialData.nextCheckDue).toISOString().split('T')[0] : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [evidenceList, setEvidenceList] = useState<any[]>(initialData?.evidence || []);


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

        let result;
        if (initialData?.id) {
            result = await api.updateCheck(initialData.id, {
                status,
                findings,
                correctiveActions: (status === 'FAIL' || status === 'PARTIAL') ? correctiveActions : undefined,
                nextCheckDate: nextCheckDate ? new Date(nextCheckDate).toISOString() : undefined,
            });
        } else {
            result = await api.createCheck({
                controlId,
                status,
                findings,
                correctiveActions: (status === 'FAIL' || status === 'PARTIAL') ? correctiveActions : undefined,
                nextCheckDate: nextCheckDate ? new Date(nextCheckDate).toISOString() : undefined,
            });
        }

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
                <label className="form-label">
                    {t('checks.findings')} <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: '0.875rem' }}>/ النتائج</span>
                </label>
                <textarea
                    className="form-control"
                    rows={3}
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder={t('checks.findingsPlaceholder')}
                    style={{ width: '100%', resize: 'vertical' }}
                    dir="auto"
                />
            </div>

            {(status === 'FAIL' || status === 'PARTIAL') && (
                <div className="form-group action-plan-box" style={{ background: '#fff1f1', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid #fee2e2' }}>
                    <label className="form-label" style={{ color: '#991b1b', fontWeight: 600 }}>
                        {t('checks.correctiveActions')} <span style={{ color: '#b91c1c', fontWeight: 400, fontSize: '0.875rem' }}>/ الإجراءات التصحيحية</span>
                    </label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={correctiveActions}
                        onChange={(e) => setCorrectiveActions(e.target.value)}
                        placeholder={t('checks.actionsPlaceholder')}
                        required
                        dir="auto"
                    />
                    <p style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.5rem' }}>
                        {t('checks.actionPlanHint')}
                    </p>
                </div>
            )}

            <div className="form-group">
                <label className="form-label">{t('checks.nextCheckDate')}</label>
                <input
                    type="date"
                    className="form-control"
                    value={nextCheckDate}
                    onChange={(e) => setNextCheckDate(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">{t('checks.evidence')}</label>

                {evidenceList.length > 0 && (
                    <div style={{ marginBottom: '1rem', display: 'grid', gap: '0.5rem' }}>
                        {evidenceList.map((ev, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
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
                                    style={{ flex: 1, fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
                                    className="truncate"
                                    onClick={async () => {
                                        const blob = await api.getEvidenceFile(ev.id);
                                        if (blob) {
                                            const url = window.URL.createObjectURL(blob);
                                            window.open(url, '_blank');
                                        }
                                    }}
                                    title={t('evidence.preview')}
                                >
                                    {ev.fileName}
                                </span>
                                <button
                                    type="button"
                                    className="btn-icon danger"
                                    onClick={async () => {
                                        const blob = await api.getEvidenceFile(ev.id);
                                        if (blob) {
                                            const url = window.URL.createObjectURL(blob);
                                            window.open(url, '_blank');
                                        }
                                    }}
                                    title={t('evidence.preview')}
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon danger"
                                    onClick={() => handleRemoveEvidence(ev.id, idx)}
                                    title={t('evidence.remove')}
                                    style={{ color: 'var(--danger)' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <EvidenceUpload
                    controlId={controlId}
                    onSuccess={handleEvidenceSuccess}
                />
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

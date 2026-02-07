import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import EvidenceUpload from './EvidenceUpload';
import { FileText, Trash2, Eye, X } from 'lucide-react';

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
    const [previewEvidence, setPreviewEvidence] = useState<any | null>(null);

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
                <EvidenceUpload
                    controlId={controlId}
                    onSuccess={handleEvidenceSuccess}
                />

                {evidenceList.length > 0 && (
                    <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
                        {evidenceList.map((ev, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
                                {ev.fileType?.startsWith('image/') ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/evidence/file/${ev.id}`}
                                        alt={ev.fileName}
                                        style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }}
                                    />
                                ) : (
                                    <FileText size={16} className="text-primary" />
                                )}
                                <span style={{ flex: 1, fontSize: '0.875rem' }} className="truncate">{ev.fileName}</span>
                                <button
                                    type="button"
                                    className="btn-icon"
                                    onClick={() => setPreviewEvidence(ev)}
                                    title={t('evidence.preview')}
                                >
                                    <Eye size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="btn-icon danger"
                                    onClick={() => handleRemoveEvidence(ev.id, idx)}
                                    title={t('evidence.remove')}
                                >
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

            {/* Evidence Preview Modal */}
            {previewEvidence && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={() => setPreviewEvidence(null)}
                >
                    <button
                        onClick={() => setPreviewEvidence(null)}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={24} />
                    </button>
                    <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', maxHeight: '90%' }}>
                        {previewEvidence.fileType?.startsWith('image/') ? (
                            <img
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/evidence/file/${previewEvidence.id}`}
                                alt={previewEvidence.fileName}
                                style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius)' }}
                            />
                        ) : previewEvidence.fileType === 'application/pdf' ? (
                            <iframe
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/evidence/file/${previewEvidence.id}`}
                                title={previewEvidence.fileName}
                                style={{ width: '80vw', height: '85vh', border: 'none', borderRadius: 'var(--radius)', background: 'white' }}
                            />
                        ) : (
                            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                <FileText size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                <p style={{ marginBottom: '1rem' }}>{previewEvidence.fileName}</p>
                                <a
                                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/evidence/file/${previewEvidence.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    {t('evidence.preview')}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </form>
    );
}

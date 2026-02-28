import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import EvidenceUpload from './EvidenceUpload';
import LocaleDateInput from './LocaleDateInput';
import ActionItemList from './ActionItemList';
import CheckHistory from './CheckHistory';
import ConfirmModal from './ConfirmModal';
import { FileText, Trash2, Eye, Save } from 'lucide-react';

interface CheckFormProps {
    controlId: string;
    initialData?: any; // Add initialData prop
    onSave: () => void;
    onCancel: () => void;
}

export default function CheckForm({ controlId, initialData, onSave, onCancel }: CheckFormProps) {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [status, setStatus] = useState<'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_APPLICABLE'>(initialData?.status || 'PASS');
    const [findings, setFindings] = useState(initialData?.findings || '');
    const [correctiveActions, setCorrectiveActions] = useState(initialData?.correctiveActions || '');
    const [nextCheckDate, setNextCheckDate] = useState(initialData?.nextCheckDue ? new Date(initialData.nextCheckDue).toISOString().split('T')[0] : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [evidenceList, setEvidenceList] = useState<any[]>(initialData?.evidence || []);
    const [actionItems, setActionItems] = useState<any[]>(initialData?.actions || []);

    const refreshActions = async () => {
        if (initialData?.id) {
            const result = await api.getActionItems(initialData.id);
            if (result.success) {
                setActionItems(result.data);
            }
        }
    };


    const handleEvidenceSuccess = (evidence: any) => {
        setEvidenceList([...evidenceList, evidence]);
    };

    const [confirmDeleteEvidenceId, setConfirmDeleteEvidenceId] = useState<string | null>(null);

    const handleRemoveEvidence = (id: string) => {
        setConfirmDeleteEvidenceId(id);
    };

    const confirmRemoveEvidence = async () => {
        if (!confirmDeleteEvidenceId) return;

        const result = await api.deleteEvidence(confirmDeleteEvidenceId);
        if (result.success) {
            setEvidenceList(evidenceList.filter(e => e.id !== confirmDeleteEvidenceId));
        }
        setConfirmDeleteEvidenceId(null);
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
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span>
                        {t('checks.findings')} <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: '0.875rem' }}>/ النتائج</span>
                    </span>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {[
                            { key: 'ras', fr: 'R.A.S.', ar: 'لا شيء يُذكر' },
                            { key: 'minor', fr: 'Non-conformité mineure', ar: 'عدم مطابقة طفيفة' },
                            { key: 'missing', fr: 'Document manquant', ar: 'وثيقة مفقودة' }
                        ].map(template => {
                            const label = i18n.language === 'ar' ? template.ar : template.fr;
                            return (
                                <button
                                    key={template.key}
                                    type="button"
                                    className="btn btn-sm"
                                    style={{
                                        padding: '0.15rem 0.6rem',
                                        fontSize: '0.75rem',
                                        borderRadius: '12px',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setFindings((prev: string) => prev ? `${prev}\n- ${label}` : `- ${label}`)}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                >
                                    + {label}
                                </button>
                            );
                        })}
                    </div>
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                    <textarea
                        className="form-control"
                        rows={4}
                        value={findings}
                        onChange={(e) => setFindings(e.target.value)}
                        placeholder={t('checks.findingsPlaceholder') || 'Décrivez vos constats ici...'}
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            resize: 'vertical',
                            padding: '1rem',
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            lineHeight: '1.5',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'border-color 0.2s, background-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        dir="auto"
                        onFocus={(e) => {
                            e.target.style.backgroundColor = 'var(--bg-card)';
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.outline = 'none';
                        }}
                        onBlur={(e) => {
                            e.target.style.backgroundColor = 'var(--bg-primary)';
                            e.target.style.borderColor = 'var(--border-color)';
                        }}
                    />
                </div>
            </div>

            {(status === 'FAIL' || status === 'PARTIAL') && (
                <div className="form-group action-plan-box" style={{ background: 'var(--bg-danger-light)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
                    {initialData?.id ? (
                        <ActionItemList
                            checkId={initialData.id}
                            items={actionItems}
                            onItemsChange={refreshActions}
                        />
                    ) : (
                        <div className="text-sm text-amber-800 bg-amber-50 p-3 rounded border border-amber-200 flex items-center gap-2">
                            <Save size={16} />
                            {t('checks.saveToAddActions') || "Veuillez enregistrer la vérification pour ajouter des actions détaillées."}
                        </div>
                    )}

                    {/* Legacy Corrective Actions fallback - hidden if empty */}
                    {correctiveActions && actionItems.length === 0 && (
                        <div className="mt-4 pt-4 border-t border-red-100 opacity-75">
                            <label className="form-label text-xs text-gray-500">Note globale (Legacy)</label>
                            <textarea
                                className="form-control text-sm"
                                rows={2}
                                value={correctiveActions}
                                onChange={(e) => setCorrectiveActions(e.target.value)}
                                disabled={actionItems.length > 0}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="form-group">
                <label className="form-label">{t('checks.nextCheckDate')}</label>
                <LocaleDateInput
                    value={nextCheckDate}
                    onChange={(val) => setNextCheckDate(val)}
                    className="form-control"
                />
            </div>

            <div className="form-group">
                <label className="form-label">{t('checks.evidence')}</label>

                {evidenceList.length > 0 && (
                    <div style={{ marginBottom: '1rem', display: 'grid', gap: '0.5rem' }}>
                        {evidenceList.map((ev, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
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
                                    onClick={() => handleRemoveEvidence(ev.id)}
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


            <CheckHistory controlId={controlId} currentCheckId={initialData?.id} />
            <ConfirmModal
                isOpen={!!confirmDeleteEvidenceId}
                onClose={() => setConfirmDeleteEvidenceId(null)}
                onConfirm={confirmRemoveEvidence}
                title={t('common.delete') || 'Supprimer'}
                message={t('messages.deleteConfirm') || 'Êtes-vous sûr de vouloir supprimer cet élément ?'}
                confirmLabel={t('common.delete') || 'Supprimer'}
                isDanger={true}
            />
        </form>
    );
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import Modal from '../components/Modal';
import DeadlineForm from '../components/DeadlineForm';

interface Deadline {
    id: string;
    dueDate: string;
    status: string;
    isRecurring: boolean;
    notes?: string;
    obligationId: string;
    obligation?: {
        titleFr: string;
    };
}

export default function DeadlinesPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showCompleteConfirm, setShowCompleteConfirm] = useState<Deadline | null>(null);

    const fetchDeadlines = async () => {
        setLoading(true);
        const result = await api.getDeadlines();
        if (result.success) {
            setDeadlines(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDeadlines();
    }, []);

    const handleAdd = () => {
        setEditingDeadline(null);
        setShowModal(true);
    };

    const handleEdit = (dl: Deadline) => {
        setEditingDeadline(dl);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        const result = await api.deleteDeadline(id);
        if (result.success !== false) {
            setShowDeleteConfirm(null);
            fetchDeadlines();
        }
    };

    const handleComplete = async (dl: Deadline) => {
        await api.completeDeadline(dl.id);
        setShowCompleteConfirm(null);
        fetchDeadlines();
    };

    const handleRevert = async (id: string) => {
        await api.revertDeadline(id);
        fetchDeadlines();
    };

    const handleFormSave = () => {
        setShowModal(false);
        setEditingDeadline(null);
        fetchDeadlines();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-TN' : 'fr-TN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isOverdue = (dateStr: string, status: string) => {
        if (status === 'COMPLETED') return false;
        const dueDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    const getStatusBadgeClass = (status: string, dueDate: string) => {
        if (status === 'COMPLETED') return 'badge success';
        if (isOverdue(dueDate, status)) return 'badge danger';
        return 'badge warning';
    };

    const getStatusLabel = (status: string, dueDate: string) => {
        if (status === 'COMPLETED') return t('status.completed');
        if (isOverdue(dueDate, status)) return t('status.overdue');
        return t('status.pending');
    };

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('deadlines.title')}</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} />
                    {t('form.newDeadline')}
                </button>
            </div>

            {/* Table */}
            <div className="card">
                {deadlines.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('deadlines.noData')}</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{t('deadlines.noDataHint')}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('obligations.obligation')}</th>
                                    <th>{t('deadlines.dueDate')}</th>
                                    <th>{t('obligations.status')}</th>
                                    <th>{t('deadlines.recurring')}</th>
                                    <th>{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deadlines.map(dl => (
                                    <tr key={dl.id} style={isOverdue(dl.dueDate, dl.status) ? { background: '#fef2f2' } : undefined}>
                                        <td>
                                            <strong>{dl.obligation?.titleFr || '-'}</strong>
                                        </td>
                                        <td>{formatDate(dl.dueDate)}</td>
                                        <td>
                                            <span className={getStatusBadgeClass(dl.status, dl.dueDate)}>
                                                {getStatusLabel(dl.status, dl.dueDate)}
                                            </span>
                                        </td>
                                        <td>{dl.isRecurring ? t('deadlines.yes') : t('deadlines.no')}</td>
                                        <td>
                                            <div className="table-actions">
                                                {dl.status !== 'COMPLETED' ? (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => setShowCompleteConfirm(dl)}
                                                        title={t('deadlines.markComplete')}
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-warning btn-sm"
                                                        onClick={() => handleRevert(dl.id)}
                                                        title={t('deadlines.revert') || 'Annuler'}
                                                        style={{ background: '#f59e0b' }}
                                                    >
                                                        ↺
                                                    </button>
                                                )}
                                                <button className="btn-icon" onClick={() => handleEdit(dl)} title={t('common.edit')}>
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="btn-icon danger" onClick={() => setShowDeleteConfirm(dl.id)} title={t('common.delete')}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingDeadline ? t('form.editDeadline') : t('form.newDeadline')}
            >
                <DeadlineForm
                    deadline={editingDeadline || undefined}
                    onSave={handleFormSave}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                title={t('common.confirm')}
            >
                <p style={{ marginBottom: '1.5rem' }}>{t('messages.deleteConfirm')}</p>
                <div className="form-actions">
                    <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                        {t('common.cancel')}
                    </button>
                    <button className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}>
                        {t('common.delete')}
                    </button>
                </div>
            </Modal>

            {/* Complete Confirmation Modal */}
            <Modal
                isOpen={!!showCompleteConfirm}
                onClose={() => setShowCompleteConfirm(null)}
                title={t('common.confirm')}
            >
                <p style={{ marginBottom: '1rem' }}>
                    {t('deadlines.confirmComplete') || 'Êtes-vous sûr de vouloir marquer cette échéance comme terminée ?'}
                </p>
                {showCompleteConfirm?.isRecurring && (
                    <p style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--info-bg, #e0f2fe)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                        ℹ️ {t('deadlines.recurringNote') || 'Cette échéance est récurrente. Une nouvelle échéance sera créée automatiquement après validation.'}
                    </p>
                )}
                <div className="form-actions">
                    <button className="btn btn-secondary" onClick={() => setShowCompleteConfirm(null)}>
                        {t('common.cancel')}
                    </button>
                    <button className="btn btn-success" onClick={() => showCompleteConfirm && handleComplete(showCompleteConfirm)}>
                        {t('deadlines.markComplete')}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

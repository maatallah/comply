import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, ClipboardCheck } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import Modal from '../components/Modal';
import ControlForm from '../components/ControlForm';
import CheckForm from '../components/CheckForm';

interface Control {
    id: string;
    titleFr: string;
    titleAr?: string;
    controlType: string;
    frequency: string;
    obligationId: string;
    obligation?: {
        titleFr: string;
    };
    checks?: {
        status: string;
        checkDate: string;
    }[];
}

export default function ControlsPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [controls, setControls] = useState<Control[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingControl, setEditingControl] = useState<Control | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showCheckModal, setShowCheckModal] = useState<string | null>(null);

    const fetchControls = async () => {
        setLoading(true);
        const result = await api.getControls();
        if (result.success) {
            setControls(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchControls();
    }, []);

    const handleAdd = () => {
        setEditingControl(null);
        setShowModal(true);
    };

    const handleEdit = (ctrl: Control) => {
        setEditingControl(ctrl);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        const result = await api.deleteControl(id);
        if (result.success !== false) {
            setShowDeleteConfirm(null);
            fetchControls();
        }
    };

    const handleFormSave = () => {
        setShowModal(false);
        setEditingControl(null);
        fetchControls();
    };

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('controls.title')}</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} />
                    {t('form.newControl')}
                </button>
            </div>

            {/* Table */}
            <div className="card">
                {controls.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('controls.noData')}</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{t('controls.noDataHint')}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('controls.control')}</th>
                                    <th>{t('obligations.obligation')}</th>
                                    <th>{t('common.status')}</th>
                                    <th>{t('controls.type')}</th>
                                    <th>{t('obligations.frequency')}</th>
                                    <th>{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {controls.map(ctrl => (
                                    <tr key={ctrl.id}>
                                        <td>
                                            <strong>{i18n.language === 'ar' && ctrl.titleAr ? ctrl.titleAr : ctrl.titleFr}</strong>
                                        </td>
                                        <td>{ctrl.obligation?.titleFr || '-'}</td>
                                        <td>
                                            {ctrl.checks && ctrl.checks.length > 0 ? (
                                                <span className={`badge ${ctrl.checks[0].status === 'PASS' ? 'success' : ctrl.checks[0].status === 'FAIL' ? 'danger' : 'warning'}`}>
                                                    {t(`checkStatus.${ctrl.checks[0].status}`)}
                                                </span>
                                            ) : (
                                                <span className="badge secondary" style={{ opacity: 0.5 }}>{t('checkStatus.PENDING')}</span>
                                            )}
                                        </td>
                                        <td>{t(`controlType.${ctrl.controlType}`)}</td>
                                        <td>{t(`frequency.${ctrl.frequency}`)}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon text-primary" onClick={() => setShowCheckModal(ctrl.id)} title={t('checks.performCheck') || 'Vérifier'}>
                                                    <ClipboardCheck size={18} />
                                                </button>
                                                <button className="btn-icon" onClick={() => handleEdit(ctrl)} title={t('common.edit')}>
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="btn-icon danger" onClick={() => setShowDeleteConfirm(ctrl.id)} title={t('common.delete')}>
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
                title={editingControl ? t('form.editControl') : t('form.newControl')}
            >
                <ControlForm
                    control={editingControl || undefined}
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

            {/* Perform Check Modal */}
            <Modal
                isOpen={!!showCheckModal}
                onClose={() => setShowCheckModal(null)}
                title={t('checks.performCheck') || 'Enregistrer une vérification'}
            >
                {showCheckModal && (
                    <CheckForm
                        controlId={showCheckModal}
                        onSave={() => {
                            setShowCheckModal(null);
                            fetchControls();
                        }}
                        onCancel={() => setShowCheckModal(null)}
                    />
                )}
            </Modal>
        </div>
    );
}

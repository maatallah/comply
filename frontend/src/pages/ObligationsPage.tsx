import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import Modal from '../components/Modal';
import ObligationForm from '../components/ObligationForm';

interface Obligation {
    id: string;
    titleFr: string;
    titleAr?: string;
    frequency: string;
    riskLevel: string;
    category: string;
    regulationId: string;
    regulation?: {
        code: string;
        titleFr: string;
    };
}

export default function ObligationsPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [obligations, setObligations] = useState<Obligation[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingObligation, setEditingObligation] = useState<Obligation | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const fetchObligations = async () => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (categoryFilter) params.category = categoryFilter;

        const result = await api.getObligations(params);
        if (result.success) {
            setObligations(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchObligations();
    }, [categoryFilter]);

    const handleAdd = () => {
        setEditingObligation(null);
        setShowModal(true);
    };

    const handleEdit = (ob: Obligation) => {
        setEditingObligation(ob);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        const result = await api.deleteObligation(id);
        if (result.success !== false) {
            setShowDeleteConfirm(null);
            fetchObligations();
        }
    };

    const handleFormSave = () => {
        setShowModal(false);
        setEditingObligation(null);
        fetchObligations();
    };

    const categories = ['HSE', 'FISCAL', 'SOCIAL', 'ENVIRONMENTAL', 'BRAND_AUDIT', 'QUALITY'];

    const getRiskBadgeClass = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'badge success';
            case 'MEDIUM': return 'badge warning';
            case 'HIGH': return 'badge danger';
            case 'CRITICAL': return 'badge danger';
            default: return 'badge info';
        }
    };

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('obligations.title')}</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} />
                    {t('form.newObligation')}
                </button>
            </div>

            {/* Filter */}
            <div className="card sticky-filters">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        className={`btn btn-sm ${!categoryFilter ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setCategoryFilter('')}
                    >
                        {t('obligations.filterAll')}
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setCategoryFilter(cat)}
                        >
                            {t(`category.${cat}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {obligations.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('obligations.noData')}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('obligations.obligation')}</th>
                                    <th>{t('obligations.regulation')}</th>
                                    <th>{t('obligations.category')}</th>
                                    <th>{t('obligations.frequency')}</th>
                                    <th>{t('obligations.riskLevel')}</th>
                                    <th>{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {obligations.map(ob => (
                                    <tr key={ob.id}>
                                        <td>
                                            <strong>{i18n.language === 'ar' && ob.titleAr ? ob.titleAr : ob.titleFr}</strong>
                                        </td>
                                        <td>{ob.regulation?.code || '-'}</td>
                                        <td>{t(`category.${ob.category}`)}</td>
                                        <td>{t(`frequency.${ob.frequency}`)}</td>
                                        <td>
                                            <span className={getRiskBadgeClass(ob.riskLevel)}>
                                                {t(`risk.${ob.riskLevel}`)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon" onClick={() => handleEdit(ob)} title={t('common.edit')}>
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="btn-icon danger" onClick={() => setShowDeleteConfirm(ob.id)} title={t('common.delete')}>
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
                title={editingObligation ? t('form.editObligation') : t('form.newObligation')}
            >
                <ObligationForm
                    obligation={editingObligation || undefined}
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
        </div>
    );
}

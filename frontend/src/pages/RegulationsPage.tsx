import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import RegulationForm from '../components/RegulationForm';

interface Regulation {
    id: string;
    code: string;
    titleFr: string;
    titleAr?: string;
    category: string;
    authority: string;
    sourceUrl?: string;
    descriptionFr?: string;
    descriptionAr?: string;
}

export default function RegulationsPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();
    const { user } = useAuth();

    const [regulations, setRegulations] = useState<Regulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingRegulation, setEditingRegulation] = useState<Regulation | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const isAdmin = user?.role === 'COMPANY_ADMIN' || user?.role === 'PLATFORM_ADMIN';

    const fetchRegulations = async () => {
        setLoading(true);
        const result = await api.getRegulations();
        if (result.success) {
            let data = result.data;
            if (categoryFilter) {
                data = data.filter((r: Regulation) => r.category === categoryFilter);
            }
            setRegulations(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRegulations();
    }, [categoryFilter]);

    const handleAdd = () => {
        setEditingRegulation(null);
        setShowModal(true);
    };

    const handleEdit = (reg: Regulation) => {
        setEditingRegulation(reg);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteError(null);
        const result = await api.deleteRegulation(id);
        if (result?.error) {
            setDeleteError(result.error.message);
        } else {
            setShowDeleteConfirm(null);
            fetchRegulations();
        }
    };

    const handleFormSave = () => {
        setShowModal(false);
        setEditingRegulation(null);
        fetchRegulations();
    };

    const categories = ['HSE', 'FISCAL', 'SOCIAL', 'ENVIRONMENTAL', 'BRAND_AUDIT', 'QUALITY'];

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('regulations.title')}</h1>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={handleAdd}>
                        <Plus size={18} />
                        {t('form.newRegulation')}
                    </button>
                )}
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
                {regulations.length === 0 ? (
                    <div className="empty-state">
                        <BookOpen size={48} />
                        <p>{t('regulations.noData')}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('regulations.code')}</th>
                                    <th>{t('regulations.regulation')}</th>
                                    <th>{t('obligations.category')}</th>
                                    <th>{t('regulations.authority')}</th>
                                    {isAdmin && <th>{t('common.actions')}</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {regulations.map(reg => (
                                    <tr key={reg.id}>
                                        <td>
                                            <strong>{reg.code}</strong>
                                        </td>
                                        <td>{i18n.language === 'ar' && reg.titleAr ? reg.titleAr : reg.titleFr}</td>
                                        <td>
                                            <span className="badge info">
                                                {t(`category.${reg.category}`)}
                                            </span>
                                        </td>
                                        <td>{reg.authority}</td>
                                        {isAdmin && (
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn-icon" onClick={() => handleEdit(reg)} title={t('common.edit')}>
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button className="btn-icon danger" onClick={() => setShowDeleteConfirm(reg.id)} title={t('common.delete')}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
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
                title={editingRegulation ? t('form.editRegulation') : t('form.newRegulation')}
            >
                <RegulationForm
                    regulation={editingRegulation || undefined}
                    onSave={handleFormSave}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!showDeleteConfirm}
                onClose={() => { setShowDeleteConfirm(null); setDeleteError(null); }}
                title={t('common.confirm')}
            >
                {deleteError && (
                    <div className="alert error" style={{ marginBottom: '1rem' }}>
                        {deleteError}
                    </div>
                )}
                <p style={{ marginBottom: '1.5rem' }}>{t('messages.deleteConfirm')}</p>
                <div className="form-actions">
                    <button className="btn btn-secondary" onClick={() => { setShowDeleteConfirm(null); setDeleteError(null); }}>
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

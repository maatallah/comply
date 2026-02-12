import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { Trash2, AlertCircle, CheckCircle2, Clock, Plus, X, Save } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface ActionItem {
    id: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate?: string;
    assignedTo?: string;
}

interface ActionItemListProps {
    checkId: string;
    items: ActionItem[];
    onItemsChange: () => void;
    readOnly?: boolean;
}

export default function ActionItemList({ checkId, items, onItemsChange, readOnly = false }: ActionItemListProps) {
    const { t } = useTranslation();
    const api = useApi();
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemPriority, setNewItemPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!newItemDesc.trim()) return;
        setLoading(true);
        const result = await api.createActionItem(checkId, {
            description: newItemDesc,
            priority: newItemPriority,
        });

        if (result.success) {
            setNewItemDesc('');
            setAdding(false);
            onItemsChange();
        }
        setLoading(false);
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        const result = await api.deleteActionItem(confirmDeleteId);
        if (result.success) {
            onItemsChange();
        }
        setConfirmDeleteId(null);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const result = await api.updateActionItemStatus(id, newStatus);
        if (result.success) {
            onItemsChange();
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'COMPLETED': return <CheckCircle2 size={16} className="text-green-600" />;
            case 'IN_PROGRESS': return <Clock size={16} className="text-blue-600" />;
            default: return <AlertCircle size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="action-items-container">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-gray-700">{t('checks.actionItems') || 'Actions à entreprendre'}</h4>
                {!readOnly && !adding && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="btn btn-sm btn-outline-primary flex items-center gap-1"
                    >
                        <Plus size={14} /> {t('common.add')}
                    </button>
                )}
            </div>

            {items.length === 0 && !adding && (
                <div className="text-center p-4 bg-gray-50 rounded border border-gray-200 text-gray-500 text-sm">
                    {t('checks.noActionsDefined')}
                </div>
            )}

            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded shadow-sm">
                        <div className="mt-1">{getStatusIcon(item.status)}</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <span className={`text-sm ${item.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {item.description}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(item.priority)}`}>
                                    {item.priority}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <div className="text-xs text-gray-500">
                                    {/* Action Status Toggle */}
                                    {!readOnly && (
                                        <select
                                            value={item.status}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            className="text-xs border-none bg-transparent focus:ring-0 p-0 cursor-pointer text-blue-600 font-medium"
                                        >
                                            <option value="PENDING">{t('status.pending')}</option>
                                            <option value="IN_PROGRESS">{t('status.inProgress') || 'En cours'}</option>
                                            <option value="COMPLETED">{t('status.completed')}</option>
                                        </select>
                                    )}
                                </div>
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteClick(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {adding && (
                    <div className="bg-gray-50 p-3 rounded border border-blue-200">
                        <textarea
                            className="form-control w-full text-sm mb-2"
                            rows={2}
                            placeholder={t('checks.actionPlaceholder') || "Décrire l'action..."}
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-between items-center">
                            <select
                                className="form-control text-sm w-auto py-1"
                                value={newItemPriority}
                                onChange={(e) => setNewItemPriority(e.target.value as any)}
                            >
                                <option value="LOW">{t('risk.LOW')}</option>
                                <option value="MEDIUM">{t('risk.MEDIUM')}</option>
                                <option value="HIGH">{t('risk.HIGH')}</option>
                                <option value="CRITICAL">{t('risk.CRITICAL')}</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAdding(false)}
                                    className="btn btn-sm btn-ghost text-gray-500"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    disabled={!newItemDesc.trim() || loading}
                                    className="btn btn-sm btn-primary flex items-center gap-1"
                                >
                                    {loading ? '...' : <Save size={14} />} {t('common.save')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title={t('common.delete') || 'Supprimer'}
                message={t('messages.deleteConfirm') || 'Êtes-vous sûr de vouloir supprimer cet élément ?'}
                confirmLabel={t('common.delete') || 'Supprimer'}
                isDanger={true}
            />
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { Bell, CheckCheck, Inbox, AlertTriangle, Trash2, Square, CheckSquare, CheckCircle } from 'lucide-react';

interface Alert {
    id: string;
    titleFr: string;
    titleAr?: string;
    messageFr: string;
    messageAr?: string;
    severity: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function AlertsPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const result = await api.getAlerts();
            if (result.success) {
                setAlerts(result.data);
            }
        } catch (err: any) {
            console.error('Failed to fetch alerts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);


    const handleDelete = async (id: string) => {
        if (!confirm(t('messages.deleteConfirm') || 'Delete this alert?')) return;
        const result = await api.deleteAlert(id);
        if (result.success) {
            setAlerts(prev => prev.filter(a => a.id !== id));
            setSelectedIds(prev => prev.filter(sid => sid !== id));
            window.dispatchEvent(new Event('alertAction'));
        } else {
            alert(t('messages.error') + ': ' + (result.error?.message || 'Unknown error'));
        }
    };

    const handleBulkAction = async (action: 'read' | 'delete') => {
        if (selectedIds.length === 0) return;

        if (action === 'delete') {
            if (!confirm(t('messages.deleteConfirm') || 'Delete selected alerts?')) return;
        }

        const result = await api.bulkAlertAction(selectedIds, action);
        if (result.success) {
            if (action === 'read') {
                setAlerts(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, isRead: true } : a));
            } else {
                setAlerts(prev => prev.filter(a => !selectedIds.includes(a.id)));
            }
            setSelectedIds([]);
            window.dispatchEvent(new Event('alertAction'));
        } else {
            alert(t('messages.error') + ': ' + (result.error?.message || 'Unknown error'));
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === alerts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(alerts.map(a => a.id));
        }
    };

    const handleGenerateTestData = async () => {
        const result = await api.generateTestAlerts();
        if (result.success) {
            fetchAlerts();
            window.dispatchEvent(new Event('alertAction'));
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to PERMANENTLY delete all alerts?')) return;
        const result = await api.clearAllAlerts();
        if (result.success) {
            setAlerts([]);
            setSelectedIds([]);
            window.dispatchEvent(new Event('alertAction'));
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <AlertTriangle size={18} className="text-danger" />;
            case 'HIGH': return <AlertTriangle size={18} style={{ color: '#f97316' }} />;
            default: return <Bell size={18} className="text-primary" />;
        }
    };

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('alerts.title')}</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={handleGenerateTestData}>
                        {i18n.language === 'ar' ? 'توليد بيانات اختبار' : 'Générer des tests'}
                    </button>
                    {alerts.length > 0 && (
                        <button className="btn btn-secondary danger" onClick={handleClearAll} style={{ color: 'var(--danger)' }}>
                            {i18n.language === 'ar' ? 'مسح الكل' : 'Effacer tout'}
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk Toolbar */}
            {selectedIds.length > 0 && (
                <div className="bulk-toolbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="btn btn-sm btn-secondary" onClick={handleSelectAll} style={{ padding: '0.25rem' }}>
                            {selectedIds.length === alerts.length ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <span>{selectedIds.length} {t('common.selected') || 'sélectionnés'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-sm btn-primary" onClick={() => handleBulkAction('read')}>
                            <CheckCheck size={16} />
                            {t('alerts.markRead') || 'Marquer comme lu'}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleBulkAction('delete')}>
                            <Trash2 size={16} />
                            {t('common.delete') || 'Supprimer'}
                        </button>
                    </div>
                </div>
            )}

            <div className="alerts-container">
                {alerts.length === 0 ? (
                    <div className="card empty-state">
                        <Inbox size={48} />
                        <p>{t('alerts.noData')}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Header Selection */}
                        <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="checkbox"
                                className="alert-checkbox"
                                style={{ marginTop: 0 }}
                                checked={selectedIds.length === alerts.length && alerts.length > 0}
                                onChange={handleSelectAll}
                            />
                            <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                                {t('common.selectAll') || 'Tout sélectionner'}
                            </span>
                        </div>

                        {alerts.map(alert => (
                            <div key={alert.id} className="alert-card-container">
                                <input
                                    type="checkbox"
                                    className="alert-checkbox"
                                    checked={selectedIds.includes(alert.id)}
                                    onChange={() => handleToggleSelect(alert.id)}
                                />
                                <div
                                    className={`card alert-card ${!alert.isRead ? 'unread' : ''} severity-${alert.severity}`}
                                    style={{ flex: 1 }}
                                >
                                    <div className="alert-card-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {alert.isRead ? (
                                                <CheckCircle size={18} className="text-success" />
                                            ) : (
                                                getSeverityIcon(alert.severity)
                                            )}
                                            <h3 className="alert-title">
                                                {i18n.language === 'ar' && alert.titleAr ? alert.titleAr : alert.titleFr}
                                            </h3>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span className="alert-time">
                                                {new Date(alert.createdAt).toLocaleString(i18n.language === 'ar' ? 'ar-TN' : 'fr-TN')}
                                            </span>
                                            <button
                                                className={`btn-icon text-danger ${!selectedIds.includes(alert.id) ? 'disabled' : ''}`}
                                                onClick={() => selectedIds.includes(alert.id) && handleDelete(alert.id)}
                                                title={selectedIds.includes(alert.id) ? t('common.delete') : t('common.selectFirst') || 'Sélectionner d\'abord'}
                                                style={{ padding: '0.25rem', opacity: selectedIds.includes(alert.id) ? 1 : 0.4, cursor: selectedIds.includes(alert.id) ? 'pointer' : 'not-allowed' }}
                                                disabled={!selectedIds.includes(alert.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="alert-message">
                                        {i18n.language === 'ar' && alert.messageAr ? alert.messageAr : alert.messageFr}
                                    </p>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

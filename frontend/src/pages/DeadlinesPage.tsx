import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Check } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface Deadline {
    id: string;
    dueDate: string;
    status: string;
    isRecurring: boolean;
    obligation?: {
        id: string;
        titleFr: string;
        titleAr?: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'warning',
    COMPLETED: 'success',
    OVERDUE: 'danger',
};

export default function DeadlinesPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeadlines();
    }, []);

    const fetchDeadlines = async () => {
        try {
            const result = await api.getDeadlines();
            if (result.success) {
                setDeadlines(result.data);
            }
        } catch (error) {
            console.error('Error fetching deadlines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (id: string) => {
        try {
            const result = await api.completeDeadline(id);
            if (result.success) {
                fetchDeadlines();
            }
        } catch (error) {
            console.error('Error completing deadline:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const locale = i18n.language === 'ar' ? 'ar-TN' : 'fr-TN';
        return date.toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const isOverdue = (dateString: string) => {
        return new Date(dateString) < new Date();
    };

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('deadlines.title')}</h1>
            </div>

            {deadlines.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Clock size={48} />
                        <p>{t('deadlines.noData')}</p>
                        <p style={{ fontSize: '0.875rem' }}>
                            {t('deadlines.noDataHint')}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('obligations.obligation')}</th>
                                    <th>{t('deadlines.dueDate')}</th>
                                    <th>{t('obligations.status')}</th>
                                    <th>{t('deadlines.recurring')}</th>
                                    <th>{t('deadlines.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deadlines.map((deadline) => (
                                    <tr key={deadline.id}>
                                        <td style={{ fontWeight: 500 }}>
                                            {i18n.language === 'ar' && deadline.obligation?.titleAr
                                                ? deadline.obligation.titleAr
                                                : deadline.obligation?.titleFr}
                                        </td>
                                        <td>
                                            <span style={{
                                                color: isOverdue(deadline.dueDate) && deadline.status !== 'COMPLETED'
                                                    ? 'var(--danger)'
                                                    : 'inherit',
                                                fontWeight: isOverdue(deadline.dueDate) ? 600 : 400
                                            }}>
                                                {formatDate(deadline.dueDate)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${STATUS_COLORS[deadline.status] || 'info'}`}>
                                                {t(`status.${deadline.status.toLowerCase()}`, deadline.status)}
                                            </span>
                                        </td>
                                        <td>{deadline.isRecurring ? t('deadlines.yes') : t('deadlines.no')}</td>
                                        <td>
                                            {deadline.status !== 'COMPLETED' && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleComplete(deadline.id)}
                                                >
                                                    <Check size={16} />
                                                    {t('deadlines.markComplete')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

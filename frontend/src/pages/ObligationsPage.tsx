import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface Obligation {
    id: string;
    titleFr: string;
    titleAr?: string;
    category: string;
    frequency: string;
    riskLevel: string;
    regulation?: {
        code: string;
        titleFr: string;
    };
}

const CATEGORY_COLORS: Record<string, string> = {
    HSE: 'info',
    FISCAL: 'warning',
    SOCIAL: 'success',
    ENVIRONMENTAL: 'success',
    BRAND_AUDIT: 'info',
    QUALITY: 'info',
};

const RISK_COLORS: Record<string, string> = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'danger',
    CRITICAL: 'danger',
};

export default function ObligationsPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [obligations, setObligations] = useState<Obligation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchObligations = async () => {
            try {
                const result = await api.getObligations();
                if (result.success) {
                    setObligations(result.data);
                }
            } catch (error) {
                console.error('Error fetching obligations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchObligations();
    }, []);

    const filteredObligations = filter
        ? obligations.filter(o => o.category === filter)
        : obligations;

    const categories = [...new Set(obligations.map(o => o.category))];

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('obligations.title')}</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">{t('common.filter')}: Tous</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredObligations.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>{t('obligations.noData')}</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Obligation</th>
                                    <th>{t('obligations.category')}</th>
                                    <th>{t('obligations.frequency')}</th>
                                    <th>{t('obligations.riskLevel')}</th>
                                    <th>Réglementation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredObligations.map((obligation) => (
                                    <tr key={obligation.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>
                                                {i18n.language === 'ar' && obligation.titleAr
                                                    ? obligation.titleAr
                                                    : obligation.titleFr}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${CATEGORY_COLORS[obligation.category] || 'info'}`}>
                                                {obligation.category}
                                            </span>
                                        </td>
                                        <td>{obligation.frequency}</td>
                                        <td>
                                            <span className={`badge ${RISK_COLORS[obligation.riskLevel] || 'info'}`}>
                                                {obligation.riskLevel}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                                {obligation.regulation?.code}
                                            </span>
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

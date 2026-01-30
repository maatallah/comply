import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckSquare } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface Control {
    id: string;
    titleFr: string;
    titleAr?: string;
    controlType: string;
    frequency: string;
    obligation?: {
        titleFr: string;
    };
}

const TYPE_COLORS: Record<string, string> = {
    DOCUMENT: 'info',
    CERTIFICATION: 'success',
    INSPECTION: 'warning',
    TRAINING: 'info',
    DECLARATION: 'warning',
    AUDIT: 'success',
};

export default function ControlsPage() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [controls, setControls] = useState<Control[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchControls = async () => {
            try {
                const result = await api.getControls();
                if (result.success) {
                    setControls(result.data);
                }
            } catch (error) {
                console.error('Error fetching controls:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchControls();
    }, []);

    if (loading) {
        return <div className="loading">{t('common.loading')}</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{t('nav.controls')}</h1>
            </div>

            {controls.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <CheckSquare size={48} />
                        <p>Aucun contrôle défini</p>
                        <p style={{ fontSize: '0.875rem' }}>
                            Les contrôles seront ajoutés pour vos obligations
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Contrôle</th>
                                    <th>Type</th>
                                    <th>Fréquence</th>
                                    <th>Obligation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {controls.map((control) => (
                                    <tr key={control.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>
                                                {i18n.language === 'ar' && control.titleAr
                                                    ? control.titleAr
                                                    : control.titleFr}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${TYPE_COLORS[control.controlType] || 'info'}`}>
                                                {control.controlType}
                                            </span>
                                        </td>
                                        <td>{control.frequency}</td>
                                        <td style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                            {control.obligation?.titleFr}
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

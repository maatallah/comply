import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';

interface Obligation {
    id: string;
    titleFr: string;
}

interface ControlFormProps {
    control?: {
        id: string;
        obligationId: string;
        titleFr: string;
        titleAr?: string;
        controlType: string;
        frequency: string;
    };
    obligations?: Obligation[];
    preselectedObligationId?: string;
    onSave: () => void;
    onCancel: () => void;
}

const CONTROL_TYPES = ['DOCUMENT', 'CERTIFICATION', 'INSPECTION', 'TRAINING', 'DECLARATION', 'AUDIT'];
const FREQUENCIES = ['CONTINUOUS', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'BIENNIAL', 'TRIENNIAL'];

export default function ControlForm({ control, obligations: propObligations, preselectedObligationId, onSave, onCancel }: ControlFormProps) {
    const { t } = useTranslation();
    const api = useApi();

    const [obligations, setObligations] = useState<Obligation[]>(propObligations || []);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        obligationId: control?.obligationId || preselectedObligationId || '',
        titleFr: control?.titleFr || '',
        titleAr: control?.titleAr || '',
        controlType: control?.controlType || 'DOCUMENT',
        frequency: control?.frequency || 'ANNUAL',
    });

    // Load obligations if not provided
    useEffect(() => {
        if (!propObligations) {
            const loadObligations = async () => {
                const result = await api.getObligations();
                if (result.success) {
                    setObligations(result.data);
                }
            };
            loadObligations();
        }
    }, [propObligations]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.obligationId) {
            newErrors.obligationId = t('validation.required');
        }
        if (!formData.titleFr || formData.titleFr.length < 3) {
            newErrors.titleFr = t('validation.minLength', { min: 3 });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!validate()) return;

        setLoading(true);

        try {
            let result;
            if (control) {
                result = await api.updateControl(control.id, formData);
            } else {
                result = await api.createControl(formData);
            }

            if (result.success) {
                setMessage({ type: 'success', text: t(control ? 'messages.updateSuccess' : 'messages.createSuccess') });
                setTimeout(() => onSave(), 1000);
            } else {
                setMessage({ type: 'error', text: result.error?.message || t('messages.error') });
            }
        } catch {
            setMessage({ type: 'error', text: t('messages.error') });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {message && (
                <div className={`alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Obligation Select */}
            <div className="form-group">
                <label className="form-label">{t('obligations.obligation')} *</label>
                <select
                    className={`form-select ${errors.obligationId ? 'error' : ''}`}
                    value={formData.obligationId}
                    onChange={(e) => handleChange('obligationId', e.target.value)}
                    disabled={!!control || !!preselectedObligationId}
                >
                    <option value="">{t('form.selectObligation')}</option>
                    {obligations.map((ob) => (
                        <option key={ob.id} value={ob.id}>
                            {ob.titleFr}
                        </option>
                    ))}
                </select>
                {errors.obligationId && <div className="form-error">{errors.obligationId}</div>}
            </div>

            {/* Title FR */}
            <div className="form-group">
                <label className="form-label">{t('form.titleFr')} *</label>
                <input
                    type="text"
                    className={`form-input ${errors.titleFr ? 'error' : ''}`}
                    value={formData.titleFr}
                    onChange={(e) => handleChange('titleFr', e.target.value)}
                    placeholder={t('form.titleFr')}
                />
                {errors.titleFr && <div className="form-error">{errors.titleFr}</div>}
            </div>

            {/* Title AR */}
            <div className="form-group">
                <label className="form-label">{t('form.titleAr')}</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.titleAr}
                    onChange={(e) => handleChange('titleAr', e.target.value)}
                    placeholder={t('form.titleAr')}
                    dir="rtl"
                />
            </div>

            {/* Control Type */}
            <div className="form-group">
                <label className="form-label">{t('controls.type')} *</label>
                <select
                    className="form-select"
                    value={formData.controlType}
                    onChange={(e) => handleChange('controlType', e.target.value)}
                >
                    {CONTROL_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {t(`controlType.${type}`)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Frequency */}
            <div className="form-group">
                <label className="form-label">{t('obligations.frequency')} *</label>
                <select
                    className="form-select"
                    value={formData.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                >
                    {FREQUENCIES.map((freq) => (
                        <option key={freq} value={freq}>
                            {t(`frequency.${freq}`)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Actions */}
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                    {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? t('common.loading') : t('common.save')}
                </button>
            </div>
        </form>
    );
}

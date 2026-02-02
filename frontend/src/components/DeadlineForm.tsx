import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';

interface Obligation {
    id: string;
    titleFr: string;
}

interface DeadlineFormProps {
    deadline?: {
        id: string;
        obligationId: string;
        dueDate: string;
        notes?: string;
        isRecurring: boolean;
    };
    obligations?: Obligation[];
    preselectedObligationId?: string;
    onSave: () => void;
    onCancel: () => void;
}

export default function DeadlineForm({ deadline, obligations: propObligations, preselectedObligationId, onSave, onCancel }: DeadlineFormProps) {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [obligations, setObligations] = useState<Obligation[]>(propObligations || []);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Format date for input
    const formatDateForInput = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        obligationId: deadline?.obligationId || preselectedObligationId || '',
        dueDate: formatDateForInput(deadline?.dueDate) || '',
        notes: deadline?.notes || '',
        isRecurring: deadline?.isRecurring ?? true,
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
        if (!formData.dueDate) {
            newErrors.dueDate = t('validation.required');
        } else {
            const selectedDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today && !deadline) {
                newErrors.dueDate = t('validation.datePast');
            }
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
            const payload = {
                ...formData,
                dueDate: new Date(formData.dueDate).toISOString(),
            };

            let result;
            if (deadline) {
                result = await api.updateDeadline(deadline.id, payload);
            } else {
                result = await api.createDeadline(payload);
            }

            if (result.success) {
                setMessage({ type: 'success', text: t(deadline ? 'messages.updateSuccess' : 'messages.createSuccess') });
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

    const handleChange = (field: string, value: string | boolean) => {
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
                    disabled={!!deadline || !!preselectedObligationId}
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

            {/* Due Date */}
            <div className="form-group">
                <label className="form-label">{t('form.dueDate')} *</label>
                <input
                    type="date"
                    className={`form-input ${errors.dueDate ? 'error' : ''}`}
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                />
                {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
            </div>

            {/* Notes */}
            <div className="form-group">
                <label className="form-label">{t('form.notes')}</label>
                <textarea
                    className="form-input"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder={t('form.notes')}
                    rows={3}
                    style={{ resize: 'vertical' }}
                />
            </div>

            {/* Is Recurring */}
            <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => handleChange('isRecurring', e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                    />
                    {t('form.isRecurring')}
                </label>
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

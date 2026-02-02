import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';

interface RegulationFormProps {
    regulation?: {
        id: string;
        code: string;
        titleFr: string;
        titleAr?: string;
        descriptionFr?: string;
        descriptionAr?: string;
        category: string;
        authority: string;
        sourceUrl?: string;
    };
    onSave: () => void;
    onCancel: () => void;
}

const CATEGORIES = ['HSE', 'FISCAL', 'SOCIAL', 'ENVIRONMENTAL', 'BRAND_AUDIT', 'QUALITY'];

// Map backend error codes to i18n keys
const ERROR_CODE_MAP: Record<string, string> = {
    'REGULATION_CODE_EXISTS': 'errors.regulationCodeExists',
    'VALIDATION_ERROR': 'errors.validationError',
    'FORBIDDEN': 'errors.forbidden',
};

export default function RegulationForm({ regulation, onSave, onCancel }: RegulationFormProps) {
    const { t } = useTranslation();
    const api = useApi();

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        code: regulation?.code || '',
        titleFr: regulation?.titleFr || '',
        titleAr: regulation?.titleAr || '',
        descriptionFr: regulation?.descriptionFr || '',
        descriptionAr: regulation?.descriptionAr || '',
        category: regulation?.category || 'FISCAL',
        authority: regulation?.authority || '',
        sourceUrl: regulation?.sourceUrl || '',
    });

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code || formData.code.length < 3) {
            newErrors.code = t('validation.minLength', { min: 3 });
        }
        if (!formData.titleFr || formData.titleFr.length < 5) {
            newErrors.titleFr = t('validation.minLength', { min: 5 });
        }
        if (!formData.authority || formData.authority.length < 2) {
            newErrors.authority = t('validation.required');
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
            if (regulation) {
                result = await api.updateRegulation(regulation.id, formData);
            } else {
                result = await api.createRegulation(formData);
            }

            if (result.success) {
                setMessage({ type: 'success', text: t(regulation ? 'messages.updateSuccess' : 'messages.createSuccess') });
                setTimeout(() => onSave(), 1000);
            } else {
                const errorCode = result.error?.code;
                const errorKey = ERROR_CODE_MAP[errorCode];
                const errorText = errorKey ? t(errorKey) : (result.error?.message || t('messages.error'));
                setMessage({ type: 'error', text: errorText });
            }
        } catch (error) {
            console.error('Regulation form error:', error);
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

            {/* Code */}
            <div className="form-group">
                <label className="form-label">{t('regulations.code')} *</label>
                <input
                    type="text"
                    className={`form-input ${errors.code ? 'error' : ''}`}
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    placeholder="TVA-CGI-2016"
                />
                {errors.code && <div className="form-error">{errors.code}</div>}
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

            {/* Category */}
            <div className="form-group">
                <label className="form-label">{t('obligations.category')} *</label>
                <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {t(`category.${cat}`)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Authority */}
            <div className="form-group">
                <label className="form-label">{t('regulations.authority')} *</label>
                <input
                    type="text"
                    className={`form-input ${errors.authority ? 'error' : ''}`}
                    value={formData.authority}
                    onChange={(e) => handleChange('authority', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    placeholder="DGI, CNSS, ANPE..."
                />
                {errors.authority && <div className="form-error">{errors.authority}</div>}
            </div>

            {/* Source */}
            <div className="form-group">
                <label className="form-label">{t('regulations.sourceUrl')}</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.sourceUrl}
                    onChange={(e) => handleChange('sourceUrl', e.target.value)}
                    placeholder="JORT, Code du travail..."
                />
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

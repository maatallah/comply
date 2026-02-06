import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';

interface Regulation {
    id: string;
    code: string;
    titleFr: string;
    titleAr?: string;
    category: string;
}

interface Article {
    id: string;
    number: string;
}

interface ObligationFormProps {
    obligation?: {
        id: string;
        regulationId: string;
        titleFr: string;
        titleAr?: string;
        frequency: string;
        riskLevel: string;
    };
    onSave: () => void;
    onCancel: () => void;
}

const FREQUENCIES = ['CONTINUOUS', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'BIENNIAL', 'TRIENNIAL'];
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// Map backend error codes to i18n keys
const ERROR_CODE_MAP: Record<string, string> = {
    'OBLIGATION_ALREADY_EXISTS': 'errors.obligationExists',
    'REGULATION_NOT_FOUND': 'errors.regulationNotFound',
    'VALIDATION_ERROR': 'errors.validationError',
    'FORBIDDEN': 'errors.forbidden',
    'ACCESS_DENIED': 'errors.accessDenied',
};

export default function ObligationForm({ obligation, onSave, onCancel }: ObligationFormProps) {
    const { t } = useTranslation();
    const api = useApi();

    const [availableRegulations, setAvailableRegulations] = useState<Regulation[]>([]);
    const [availableArticles, setAvailableArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        regulationId: obligation?.regulationId || '',
        articleId: (obligation as any)?.articleId || '',
        titleFr: obligation?.titleFr || '',
        titleAr: obligation?.titleAr || '',
        frequency: obligation?.frequency || 'ANNUAL',
        riskLevel: obligation?.riskLevel || 'MEDIUM',
    });

    // Load regulations and filter out already subscribed ones
    useEffect(() => {
        const loadData = async () => {
            // Load all regulations
            const regsResult = await api.getRegulations();
            if (regsResult.success) {

                // If creating new obligation, filter out already subscribed regulations
                if (!obligation) {
                    const obligationsResult = await api.getObligations();
                    if (obligationsResult.success) {
                        const subscribedRegIds = new Set(
                            obligationsResult.data.map((ob: { regulationId: string }) => ob.regulationId)
                        );
                        const available = regsResult.data.filter(
                            (reg: Regulation) => !subscribedRegIds.has(reg.id)
                        );
                        setAvailableRegulations(available);
                    }
                } else {
                    // For editing, just show the current regulation
                    setAvailableRegulations(regsResult.data);
                }
            }
        };
        loadData();
    }, [obligation]);

    // Load articles when regulation changes
    useEffect(() => {
        const loadArticles = async () => {
            if (formData.regulationId) {
                const result = await (api as any).getArticles(formData.regulationId);
                if (result.success) {
                    setAvailableArticles(result.data);
                }
            } else {
                setAvailableArticles([]);
            }
        };
        loadArticles();
    }, [formData.regulationId]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!obligation && !formData.regulationId) {
            newErrors.regulationId = t('validation.required');
        }
        if (!formData.titleFr || formData.titleFr.length < 5) {
            newErrors.titleFr = t('validation.minLength', { min: 5 });
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
            if (obligation) {
                // For update, only send editable fields (not regulationId)
                const updateData = {
                    titleFr: formData.titleFr,
                    titleAr: formData.titleAr || undefined,
                    frequency: formData.frequency,
                    riskLevel: formData.riskLevel,
                    articleId: formData.articleId || undefined,
                };
                result = await api.updateObligation(obligation.id, updateData);
            } else {
                // For create, clean up empty values before sending
                const createData: Record<string, unknown> = {
                    regulationId: formData.regulationId,
                    titleFr: formData.titleFr,
                    frequency: formData.frequency,
                    riskLevel: formData.riskLevel,
                };
                if (formData.titleAr) createData.titleAr = formData.titleAr;
                if (formData.articleId) createData.articleId = formData.articleId;

                result = await api.createObligation(createData);
            }

            if (result.success) {
                setMessage({ type: 'success', text: t(obligation ? 'messages.updateSuccess' : 'messages.createSuccess') });
                setTimeout(() => onSave(), 1000);
            } else {
                // Try to get translated error message
                const errorCode = result.error?.code;
                const errorKey = ERROR_CODE_MAP[errorCode];
                const errorText = errorKey ? t(errorKey) : (result.error?.message || t('messages.error'));
                setMessage({ type: 'error', text: errorText });
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

            {/* Regulation Select */}
            <div className="form-group">
                <label className="form-label">{t('obligations.regulation')} *</label>
                <select
                    className={`form-select ${errors.regulationId ? 'error' : ''}`}
                    value={formData.regulationId}
                    onChange={(e) => handleChange('regulationId', e.target.value)}
                    disabled={!!obligation}
                >
                    <option value="">{t('form.selectRegulation')}</option>
                    {availableRegulations.map((reg) => (
                        <option key={reg.id} value={reg.id}>
                            {reg.code} - {reg.titleFr}
                        </option>
                    ))}
                </select>
                {errors.regulationId && <div className="form-error">{errors.regulationId}</div>}
            </div>

            {/* Article Select (Optional) */}
            {formData.regulationId && (
                <div className="form-group">
                    <label className="form-label">Article Spécifique (Optionnel)</label>
                    <select
                        className="form-select"
                        value={formData.articleId}
                        onChange={(e) => handleChange('articleId', e.target.value)}
                    >
                        <option value="">Texte complet / Tous les articles</option>
                        {availableArticles.map((art) => (
                            <option key={art.id} value={art.id}>
                                {art.number}
                            </option>
                        ))}
                    </select>
                    <div className="form-help">Reliez cet engagement à un article précis pour une meilleure traçabilité.</div>
                </div>
            )}

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

            {/* Risk Level */}
            <div className="form-group">
                <label className="form-label">{t('obligations.riskLevel')} *</label>
                <select
                    className="form-select"
                    value={formData.riskLevel}
                    onChange={(e) => handleChange('riskLevel', e.target.value)}
                >
                    {RISK_LEVELS.map((risk) => (
                        <option key={risk} value={risk}>
                            {t(`risk.${risk}`)}
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

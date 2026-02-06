import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, Save } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

interface Company {
    id: string;
    legalName: string;
    taxId: string;
    cnssId?: string;
    activitySector: string;
    companySize: string;
    regime: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
}

export default function CompanyProfilePage() {
    const { t } = useTranslation();
    const api = useApi();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [company, setCompany] = useState<Company | null>(null);

    useEffect(() => {
        fetchCompany();
    }, [user]);

    const fetchCompany = async () => {
        if (!user?.companyId) return;
        setLoading(true);
        try {
            const result = await api.getCompany(user.companyId);
            if (result.success) {
                setCompany(result.data);
            }
        } catch (error) {
            console.error('Error fetching company:', error);
            setMessage({ type: 'error', text: t('messages.error') });
        } finally {
            setLoading(false);
        }
    };

    // ...

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!company || !user?.companyId) return;

        setSaving(true);
        setMessage(null);

        try {
            // Only sending editable fields
            const updateData = {
                legalName: company.legalName,
                taxId: company.taxId,
                cnssId: company.cnssId,
                regime: company.regime,
                address: company.address,
                phone: company.phone
            };

            const result = await api.updateCompany(user.companyId, updateData);

            if (result.success) {
                setMessage({ type: 'success', text: t('messages.updateSuccess') });
                setCompany(result.data);
            } else {
                setMessage({ type: 'error', text: result.error?.message || t('messages.error') });
            }
        } catch (error) {
            console.error('Error updating company:', error);
            setMessage({ type: 'error', text: t('messages.error') });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">{t('common.loading')}</div>;
    if (!company) return <div>Company not found</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Building className="icon" />
                        {t('nav.profile')}
                    </h1>
                    <p className="page-subtitle">{t('profile.subtitle')}</p>
                </div>
            </div>

            {message && (
                <div className={`alert alert-${message.type} fade-in`}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">{t('profile.legalName')}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={company.legalName}
                                onChange={(e) => setCompany({ ...company, legalName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('profile.taxId')}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={company.taxId}
                                onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">{t('profile.regime')}</label>
                            <select
                                className="form-select"
                                value={company.regime}
                                onChange={(e) => setCompany({ ...company, regime: e.target.value })}
                            >
                                <option value="ONSHORE">{t('profile.onshore')}</option>
                                <option value="OFFSHORE">{t('profile.offshore')}</option>
                            </select>
                            <small className="form-help">
                                {t('profile.offshoreHint')}
                            </small>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('profile.cnssId')}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={company.cnssId || ''}
                                onChange={(e) => setCompany({ ...company, cnssId: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('profile.address')}</label>
                        <textarea
                            className="form-input"
                            value={company.address || ''}
                            onChange={(e) => setCompany({ ...company, address: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Save size={18} />
                            {saving ? t('common.loading') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

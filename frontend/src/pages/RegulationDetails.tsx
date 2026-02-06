import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, BookOpen, ExternalLink, ShieldCheck, Tag } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import ArticleManager from '../components/ArticleManager';

interface Regulation {
    id: string;
    code: string;
    titleFr: string;
    titleAr?: string;
    category: string;
    authority: string;
    sourceUrl?: string;
    descriptionFr?: string;
    descriptionAr?: string;
}

export default function RegulationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const api = useApi();
    const { user } = useAuth();

    const [regulation, setRegulation] = useState<Regulation | null>(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.role === 'COMPANY_ADMIN' || user?.role === 'PLATFORM_ADMIN';

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            // Assuming getRegulation exists in useApi
            const result = await api.getRegulations();
            if (result.success) {
                const reg = result.data.find((r: any) => r.id === id);
                setRegulation(reg);
            }
            setLoading(false);
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="loading">{t('common.loading')}</div>;
    if (!regulation) return <div className="error">Réglementation introuvable</div>;

    const title = i18n.language === 'ar' && regulation.titleAr ? regulation.titleAr : regulation.titleFr;
    const description = i18n.language === 'ar' && regulation.descriptionAr ? regulation.descriptionAr : regulation.descriptionFr;

    return (
        <div className="page-container">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/regulations')} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ChevronLeft size={16} />
                Retour aux textes
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Side: General Info & Articles */}
                <div>
                    <header style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span className="badge primary">{regulation.code}</span>
                            <span className="badge info">{t(`category.${regulation.category}`)}</span>
                        </div>
                        <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{title}</h1>
                        {description && (
                            <p style={{ color: 'var(--gray-600)', lineHeight: '1.6', fontSize: '1.05rem' }}>
                                {description}
                            </p>
                        )}
                    </header>

                    <ArticleManager regulationId={regulation.id} isAdmin={isAdmin} />
                </div>

                {/* Right Side: Metadata & Quick Actions */}
                <div>
                    <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.75rem' }}>
                            Informations Textuelles
                        </h2>

                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                    Autorité Émettrice
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                    <ShieldCheck size={18} className="text-primary" />
                                    {regulation.authority}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                    Secteur / Thématique
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                    <Tag size={18} className="text-primary" />
                                    {t(`category.${regulation.category}`)}
                                </div>
                            </div>

                            {regulation.sourceUrl && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <a
                                        href={regulation.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        <ExternalLink size={16} />
                                        Consulter le texte officiel
                                    </a>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-100)' }}>
                            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                                <BookOpen size={32} style={{ color: 'var(--gray-300)', marginBottom: '0.75rem' }} />
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                    Ce texte définit les obligations de conformité pour votre entreprise.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

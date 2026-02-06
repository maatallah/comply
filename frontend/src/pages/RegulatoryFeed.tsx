import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Rss,
    ExternalLink,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function RegulatoryFeed() {
    const { t } = useTranslation();
    const api = useApi();

    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchFeed();
    }, [filter]);

    const fetchFeed = async () => {
        setLoading(true);
        // Assuming we add getJortFeed to useApi
        const result = await (api as any).getJortFeed({ status: filter });
        if (result.success) {
            setEntries(result.entries);
        }
        setLoading(false);
    };

    const handleProcess = async (id: string, status: 'RELEVANT' | 'IGNORED') => {
        setMessage(null);
        const result = await (api as any).processJortEntry(id, status);
        if (result.success) {
            setEntries(entries.filter(e => e.id !== id));
            if (status === 'RELEVANT') {
                setMessage({ type: 'success', text: 'Entrée marquée comme pertinente. Alertes envoyées aux entreprises concernées.' });
            }
        }
    };

    return (
        <div className="page-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Rss className="text-primary" size={28} />
                        {t('regulatory.feed') || 'Veille Réglementaire (JORT)'}
                    </h1>
                    <p className="page-subtitle">Suivez les dernières publications officielles et déterminez leur pertinence.</p>
                </div>
            </header>

            {message && (
                <div className={`alert ${message.type}`} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} />
                    {message.text}
                </div>
            )}

            <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} size={18} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Rechercher par titre ou ministère..."
                            style={{ paddingLeft: '2.5rem' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className={`btn ${filter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter('PENDING')}
                        >
                            En attente
                        </button>
                        <button
                            className={`btn ${filter === 'RELEVANT' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter('RELEVANT')}
                        >
                            Pertinents
                        </button>
                        <button
                            className={`btn ${filter === 'IGNORED' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter('IGNORED')}
                        >
                            Ignorés
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary-color)', margin: '0 auto' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Chargement du flux JORT...</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ backgroundColor: '#f3f4f6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <AlertCircle size={32} style={{ color: 'var(--gray-400)' }} />
                    </div>
                    <h3>Aucune publication trouvée</h3>
                    <p style={{ color: 'var(--gray-500)' }}>Il n'y a pas de nouvelles publications JORT correspondant à vos critères.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {entries.map(entry => (
                        <div key={entry.id} className="card" style={{ padding: '1.5rem', borderLeft: filter === 'PENDING' ? '4px solid var(--primary-color)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span className="badge info" style={{ fontSize: '0.75rem' }}>{entry.type || 'Texte'}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={14} />
                                            {new Date(entry.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{entry.titleFr}</h3>
                                    {entry.ministry && (
                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                                            {entry.ministry}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {entry.pdfUrl && (
                                        <a href={entry.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" title="Voir PDF">
                                            <FileText size={16} />
                                            PDF
                                        </a>
                                    )}
                                    <button className="btn btn-secondary btn-sm" title="Voir sur IORT (si stable)">
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>

                            {filter === 'PENDING' && (
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                                    <button
                                        className="btn btn-success btn-sm"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        onClick={() => handleProcess(entry.id, 'RELEVANT')}
                                    >
                                        <CheckCircle2 size={16} />
                                        {t('regulatory.markRelevant')}
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm text-danger"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        onClick={() => handleProcess(entry.id, 'IGNORED')}
                                    >
                                        <XCircle size={16} />
                                        {t('regulatory.ignore')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Check, X, FileText } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface Article {
    id: string;
    number: string;
    contentFr?: string;
    contentAr?: string;
    obligations?: { id: string; titleFr: string }[];
}

interface ArticleManagerProps {
    regulationId: string;
    isAdmin: boolean;
}

export default function ArticleManager({ regulationId, isAdmin }: ArticleManagerProps) {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ number: '', contentFr: '', contentAr: '' });
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        fetchArticles();
    }, [regulationId]);

    const fetchArticles = async () => {
        setLoading(true);
        const result = await (api as any).getArticles(regulationId);
        if (result.success) {
            setArticles(result.data);
        }
        setLoading(false);
    };

    const handleEdit = (article: Article) => {
        setEditingId(article.id);
        setEditForm({
            number: article.number,
            contentFr: article.contentFr || '',
            contentAr: article.contentAr || ''
        });
    };

    const handleSave = async (id: string) => {
        const result = await (api as any).updateArticle(id, editForm);
        if (result.success) {
            setEditingId(null);
            fetchArticles();
        }
    };

    const handleCreate = async () => {
        const result = await (api as any).createArticle({
            ...editForm,
            regulationId
        });
        if (result.success) {
            setShowAdd(false);
            setEditForm({ number: '', contentFr: '', contentAr: '' });
            fetchArticles();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('messages.deleteConfirm'))) {
            const result = await (api as any).deleteArticle(id);
            if (result.success) {
                fetchArticles();
            }
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="article-manager" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} className="text-primary" />
                    {t('articles.title')}
                </h2>
                {isAdmin && !showAdd && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setShowAdd(true); setEditingId(null); setEditForm({ number: '', contentFr: '', contentAr: '' }); }}>
                        <Plus size={16} />
                        {t('articles.add')}
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {showAdd && (
                    <div className="card" style={{ padding: '1rem', border: '1px dashed var(--primary-color)' }}>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">{t('articles.number')}</label>
                                <input
                                    className="form-control text-sm"
                                    value={editForm.number}
                                    onChange={e => setEditForm({ ...editForm, number: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('articles.contentFr')}</label>
                                <textarea
                                    className="form-control text-sm"
                                    rows={3}
                                    value={editForm.contentFr}
                                    onChange={e => setEditForm({ ...editForm, contentFr: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('articles.contentAr')}</label>
                                <textarea
                                    className="form-control text-sm"
                                    rows={3}
                                    style={{ direction: 'rtl' }}
                                    value={editForm.contentAr}
                                    onChange={e => setEditForm({ ...editForm, contentAr: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-primary btn-sm" onClick={handleCreate}>
                                    <Check size={16} /> {t('articles.save')}
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>
                                    <X size={16} /> {t('articles.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {articles.length === 0 && !showAdd && (
                    <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>
                        {t('articles.noData')}
                    </p>
                )}

                {articles.map(article => (
                    <div key={article.id} className="card" style={{ padding: '1rem', transition: 'all 0.2s' }}>
                        {editingId === article.id ? (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input
                                    className="form-control font-bold"
                                    value={editForm.number}
                                    onChange={e => setEditForm({ ...editForm, number: e.target.value })}
                                />
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={editForm.contentFr}
                                    onChange={e => setEditForm({ ...editForm, contentFr: e.target.value })}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleSave(article.id)}>
                                        <Check size={16} /> {t('articles.validate')}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                                        <X size={16} /> {t('articles.cancel')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{article.number}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                            {i18n.language === 'ar' && article.contentAr ? article.contentAr : article.contentFr}
                                        </p>
                                    </div>
                                    {isAdmin && (
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <button className="btn-icon sm" onClick={() => handleEdit(article)}>
                                                <Pencil size={14} />
                                            </button>
                                            <button className="btn-icon sm danger" onClick={() => handleDelete(article.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {article.obligations && article.obligations.length > 0 && (
                                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>{t('articles.linkedObligations')} :</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {article.obligations.map(ob => (
                                                <span key={ob.id} className="badge info" style={{ fontSize: '0.7rem' }}>{ob.titleFr}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

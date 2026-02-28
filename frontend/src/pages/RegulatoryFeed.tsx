import { useState, useEffect, useRef } from 'react';
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
    AlertCircle,
    RefreshCw,
    ChevronDown
} from 'lucide-react';
import { useApi } from '../hooks/useApi';

const CustomMonthSelect = ({ value, onChange, options, stats, disabled, placeholder, isAr }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((o: any) => o.value === value);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', minWidth: '100%', opacity: disabled ? 0.6 : 1 }}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className="form-control"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: disabled ? 'var(--gray-50)' : 'var(--bg-card)',
                    padding: '0.375rem 0.75rem',
                    flexDirection: isAr ? 'row-reverse' : 'row'
                }}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={16} />
            </div>

            {isOpen && !disabled && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    <div
                        onClick={() => { onChange(''); setIsOpen(false); }}
                        style={{
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            textAlign: isAr ? 'right' : 'left',
                            borderBottom: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {placeholder}
                    </div>
                    {options.map((opt: any) => {
                        const count = stats[Number(opt.value)] || 0;
                        return (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexDirection: isAr ? 'row-reverse' : 'row',
                                    backgroundColor: value === opt.value ? 'var(--primary-light)' : 'transparent',
                                    color: value === opt.value ? 'var(--primary-dark)' : 'inherit'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = value === opt.value ? 'var(--primary-light)' : 'var(--bg-card-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value === opt.value ? 'var(--primary-light)' : 'transparent'}
                            >
                                <span>{opt.label}</span>
                                {count > 0 && (
                                    <span style={{
                                        backgroundColor: '#eff6ff', // Light primary
                                        color: 'var(--primary-color)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        borderRadius: '9999px',
                                        minWidth: '24px',
                                        textAlign: 'center'
                                    }}>
                                        {count}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default function RegulatoryFeed() {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [scraping, setScraping] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [noiseLevel, setNoiseLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

    // Years fetched from API
    // const currentYear = new Date().getFullYear();
    // const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
    const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString().padStart(2, '0') }));


    const isAr = i18n.language === 'ar';

    useEffect(() => {
        // Fetch available years
        const fetchYears = async () => {
            try {
                const res = await fetch('http://localhost:3000/jort-feed/years');
                const data = await res.json();
                if (data.success && Array.isArray(data.years)) {
                    // Ensure we have at least current year + past few years if DB is empty
                    const dbYears = data.years.map(String);
                    const currentYear = new Date().getFullYear();
                    const defaultYears = Array.from({ length: 3 }, (_, i) => (currentYear - i).toString());
                    const merged = Array.from(new Set([...dbYears, ...defaultYears])).sort((a, b) => Number(b) - Number(a));
                    setAvailableYears(merged);
                } else {
                    // API error or invalid format, use fallback
                    const currentYear = new Date().getFullYear();
                    setAvailableYears(Array.from({ length: 3 }, (_, i) => (currentYear - i).toString()));
                }
            } catch (err) {
                console.error('Failed to fetch years', err);
                // Fallback
                const currentYear = new Date().getFullYear();
                setAvailableYears(Array.from({ length: 3 }, (_, i) => (currentYear - i).toString()));
            }
        };
        fetchYears();
    }, []);

    const handleScrape = async () => {
        setScraping(true);
        setMessage(null);
        try {
            const res = await fetch('http://localhost:3000/jort-feed/scrape', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setMessage({
                    type: 'success',
                    text: t('regulatory.scrapeSuccess', {
                        new: data.stats?.new || 0,
                        duplicates: data.stats?.duplicates || 0
                    })
                });
                fetchFeed();
            } else {
                setMessage({ type: 'error', text: data.error || t('regulatory.scrapeError') });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: `${t('common.error')}: ${err.message}` });
        }
        setScraping(false);
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchFeed(), 300);
        return () => clearTimeout(debounce);
    }, [filter, search, selectedYear, selectedMonth, noiseLevel]);

    const [total, setTotal] = useState(0);

    const fetchFeed = async () => {
        setLoading(true);
        const params: Record<string, string> = { status: filter, noiseLevel };
        if (search.trim()) params.search = search.trim();
        if (selectedYear) params.year = selectedYear;
        if (selectedMonth) params.month = selectedMonth;

        const result = await (api as any).getJortFeed(params);
        if (result.success) {
            setEntries(result.entries);
            setTotal(result.total || result.entries.length);
        }
        setLoading(false);
    };

    const handleProcess = async (id: string, status: 'RELEVANT' | 'IGNORED') => {
        setMessage(null);
        const result = await (api as any).processJortEntry(id, status);
        if (result.success) {
            setEntries(entries.filter(e => e.id !== id));
            setTotal(prev => Math.max(0, prev - 1));
            if (status === 'RELEVANT') {
                setMessage({ type: 'success', text: t('messages.updateSuccess') });
            }
        }
    };

    const [monthStats, setMonthStats] = useState<Record<number, number>>({});

    useEffect(() => {
        if (!selectedYear) return;

        const fetchStats = async () => {
            try {
                // Build query string
                const params = new URLSearchParams();
                if (filter) params.append('status', filter);
                if (noiseLevel) params.append('noiseLevel', noiseLevel);

                const res = await fetch(`http://localhost:3000/jort-feed/stats/${selectedYear}?${params.toString()}`);
                const data = await res.json();
                if (data.success && Array.isArray(data.stats)) {
                    const statsMap: Record<number, number> = {};
                    data.stats.forEach((s: any) => {
                        statsMap[s.month] = s.count;
                    });
                    setMonthStats(statsMap);
                }
            } catch (err) {
                console.error('Failed to fetch stats', err);
            }
        };
        fetchStats();
    }, [selectedYear, filter, noiseLevel]);

    return (
        <div className="page-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Rss className="text-primary" size={28} />
                        {t('regulatory.feed')}
                    </h1>
                    <p className="page-subtitle">{t('regulatory.feed')}</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleScrape}
                    disabled={scraping}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                    <RefreshCw size={16} className={scraping ? 'animate-spin' : ''} />
                    {scraping ? t('regulatory.scraping') : t('regulatory.scrapeNow')}
                </button>
            </header>

            {message && (
                <div className={`alert ${message.type}`} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} />
                    {message.text}
                </div>
            )}

            {/* Sticky Filter Container */}
            <div style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: '#f1f5f9', paddingBottom: '1rem', paddingTop: '0.25rem', margin: '0 -1rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <div className="card" style={{ marginBottom: '0.5rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                        <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                            <Search style={{ position: 'absolute', [isAr ? 'right' : 'left']: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} size={18} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder={t('regulatory.searchPlaceholder')}
                                style={{ [isAr ? 'paddingRight' : 'paddingLeft']: '2.5rem', textAlign: isAr ? 'right' : 'left' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="clear-search-btn"
                                    style={{
                                        position: 'absolute',
                                        [isAr ? 'left' : 'right']: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '4px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#fee2e2';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                    }}
                                    title={t('common.clear')}
                                >
                                    <XCircle size={16} />
                                </button>
                            )}
                        </div>

                        {/* Date Filters */}
                        {isAr ? (
                            <>
                                <div style={{ minWidth: '90px' }}>
                                    <CustomMonthSelect
                                        value={selectedMonth}
                                        onChange={setSelectedMonth}
                                        options={months}
                                        stats={monthStats}
                                        disabled={!selectedYear}
                                        placeholder={t('common.month') || 'Mois'}
                                        isAr={isAr}
                                    />
                                </div>
                                <div style={{ position: 'relative', minWidth: '100px' }}>
                                    <select
                                        className="form-select"
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            if (!e.target.value) {
                                                setSelectedMonth('');
                                                setMonthStats({});
                                            }
                                        }}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="">{t('common.year') || 'Année'}</option>
                                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ position: 'relative', minWidth: '100px' }}>
                                    <select
                                        className="form-select"
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            if (!e.target.value) {
                                                setSelectedMonth('');
                                                setMonthStats({});
                                            }
                                        }}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="">{t('common.year') || 'Année'}</option>
                                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div style={{ minWidth: '90px' }}>
                                    <CustomMonthSelect
                                        value={selectedMonth}
                                        onChange={setSelectedMonth}
                                        options={months}
                                        stats={monthStats}
                                        disabled={!selectedYear}
                                        placeholder={t('common.month') || 'Mois'}
                                        isAr={isAr}
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isAr ? 'row-reverse' : 'row', alignItems: 'center' }}>
                            <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>
                                {total}
                            </span>
                            <button
                                className={`btn ${filter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilter('PENDING')}
                            >
                                {t('regulatory.pending')}
                            </button>
                            <button
                                className={`btn ${filter === 'RELEVANT' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilter('RELEVANT')}
                            >
                                {t('regulatory.relevant')}
                            </button>
                            <button
                                className={`btn ${filter === 'IGNORED' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilter('IGNORED')}
                            >
                                {t('regulatory.ignored')}
                            </button>

                            {(search || selectedYear || selectedMonth || filter !== 'PENDING') && (
                                <button
                                    className="btn"
                                    onClick={() => {
                                        setSearch('');
                                        setSelectedYear('');
                                        setSelectedMonth('');
                                        setFilter('PENDING');
                                        setMonthStats({});
                                    }}
                                    title={t('common.clear')}
                                    style={{
                                        padding: '0.5rem',
                                        backgroundColor: '#fee2e2',
                                        color: '#ef4444',
                                        border: '1px solid #fca5a5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fecaca';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fee2e2';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <XCircle size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Noise Filter Slider */}
                <div style={{ marginTop: '0', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                            {t('regulatory.noiseFilter.label')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            {t(`regulatory.noiseFilter.tooltips.${noiseLevel.toLowerCase()}`)}
                        </span>
                    </div>

                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="1"
                        value={noiseLevel === 'LOW' ? 1 : noiseLevel === 'HIGH' ? 3 : 2}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setNoiseLevel(val === 1 ? 'LOW' : val === 3 ? 'HIGH' : 'MEDIUM');
                        }}
                        style={{ width: '100%', cursor: 'pointer', accentColor: noiseLevel === 'HIGH' ? '#ef4444' : noiseLevel === 'LOW' ? '#3b82f6' : '#10b981' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => setNoiseLevel('LOW')}>{t('regulatory.noiseFilter.low')}</span>
                        <span style={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => setNoiseLevel('MEDIUM')}>{t('regulatory.noiseFilter.medium')}</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => setNoiseLevel('HIGH')}>{t('regulatory.noiseFilter.high')}</span>
                    </div>
                </div>
            </div>


            {
                loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary-color)', margin: '0 auto' }} />
                        <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>{t('regulatory.loading')}</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ backgroundColor: '#f3f4f6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <AlertCircle size={32} style={{ color: 'var(--gray-400)' }} />
                        </div>
                        <h3>{t('regulatory.noData')}</h3>
                        <p style={{ color: 'var(--gray-500)' }}>{t('regulatory.noDataDesc')}</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {entries.map(entry => {
                            // Determine display content based on language
                            // Fallback to other language if current one is missing
                            let displayTitle = isAr ? (entry.titleAr || entry.titleFr) : (entry.titleFr || entry.titleAr);
                            if (!displayTitle || displayTitle.trim() === '') {
                                displayTitle = t('regulatory.noTitle');
                            }

                            const displayMinistry = isAr ? (entry.ministryAr || entry.ministry) : (entry.ministry || entry.ministryAr);
                            const displayPdfUrl = isAr ? (entry.pdfUrlAr || entry.pdfUrl) : (entry.pdfUrl || entry.pdfUrlAr);

                            return (
                                <div key={entry.id} className="card" style={{ padding: '1.5rem', borderLeft: filter === 'PENDING' ? '4px solid var(--primary-color)' : 'none', direction: isAr ? 'rtl' : 'ltr' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                                        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                                                <span className="badge info" style={{ fontSize: '0.75rem' }}>{entry.type || t('regulatory.defaultType')}</span>
                                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                                                    <Clock size={14} />
                                                    {new Date(entry.date).toLocaleDateString(isAr ? 'ar-TN' : 'fr-FR')}
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{displayTitle}</h3>
                                            {displayMinistry && (
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                                                    {displayMinistry}
                                                </p>
                                            )}

                                            {/* Impact Badges (frontend simulation for immediate feedback) */}
                                            {(entry.titleFr.toLowerCase().includes('travail') || entry.titleFr.toLowerCase().includes('social')) && (
                                                <span className="badge warning" style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <AlertCircle size={12} /> {t('category.SOCIAL')}
                                                </span>
                                            )}
                                            {(entry.titleFr.toLowerCase().includes('finance') || entry.titleFr.toLowerCase().includes('fisc')) && (
                                                <span className="badge warning" style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.5rem' }}>
                                                    <AlertCircle size={12} /> {t('category.FISCAL')}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                                            {displayPdfUrl ? (
                                                <a
                                                    href={displayPdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary btn-sm"
                                                    title={t('regulatory.downloadPdf')}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', borderColor: '#fee2e2', background: '#fef2f2', flexDirection: isAr ? 'row-reverse' : 'row' }}
                                                >
                                                    <FileText size={16} />
                                                    PDF
                                                </a>
                                            ) : entry.recordId ? (
                                                <a
                                                    href={`https://www.pist.tn/record/${entry.recordId}?ln=${isAr ? 'ar' : 'fr'}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary btn-sm"
                                                    title={t('regulatory.viewOnPist')}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexDirection: isAr ? 'row-reverse' : 'row' }}
                                                >
                                                    <ExternalLink size={16} />
                                                    {t('common.viewDetails')}
                                                </a>
                                            ) : (
                                                <span
                                                    className="btn btn-secondary btn-sm disabled"
                                                    title={t('regulatory.linkUnavailable')}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.5, cursor: 'not-allowed', flexDirection: isAr ? 'row-reverse' : 'row' }}
                                                >
                                                    <ExternalLink size={16} />
                                                    {t('common.viewDetails')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {filter === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                                            <button
                                                className="btn btn-success btn-sm"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: isAr ? 'row-reverse' : 'row' }}
                                                onClick={() => handleProcess(entry.id, 'RELEVANT')}
                                            >
                                                <CheckCircle2 size={16} />
                                                {t('regulatory.markRelevant')}
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm text-danger"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: isAr ? 'row-reverse' : 'row' }}
                                                onClick={() => handleProcess(entry.id, 'IGNORED')}
                                            >
                                                <XCircle size={16} />
                                                {t('regulatory.ignore')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            }
        </div >
    );
}

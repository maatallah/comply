import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface LocaleDateInputProps {
    value: string; // ISO format: YYYY-MM-DD
    onChange: (value: string) => void;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
}

const FR_MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const FR_DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const AR_MONTHS = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const AR_DAYS = ['إث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'];

export default function LocaleDateInput({ value, onChange, className = 'form-control', style, placeholder }: LocaleDateInputProps) {
    const { i18n, t } = useTranslation();
    const isAr = i18n.language === 'ar';
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const today = new Date();
    const selected = value ? new Date(value + 'T00:00:00') : null;
    const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

    useEffect(() => {
        if (value) {
            const d = new Date(value + 'T00:00:00');
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
        }
    }, [value]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const months = isAr ? AR_MONTHS : FR_MONTHS;
    const days = isAr ? AR_DAYS : FR_DAYS;

    const formatDisplay = (val: string) => {
        if (!val) return '';
        const d = new Date(val + 'T00:00:00');
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    // Convert Sunday=0 to Monday=0 basis
    const startOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const selectDay = (day: number) => {
        const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(iso);
        setOpen(false);
    };

    const isSelected = (day: number) => {
        if (!selected) return false;
        return selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
    };

    const isToday = (day: number) => {
        return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
    };

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block', ...style }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} onClick={() => setOpen(!open)}>
                <Calendar size={16} style={{
                    position: 'absolute',
                    left: isAr ? 'auto' : '0.6rem',
                    right: isAr ? '0.6rem' : 'auto',
                    color: 'var(--gray-400)',
                    pointerEvents: 'none',
                    zIndex: 1
                }} />
                <input
                    type="text"
                    readOnly
                    className={className}
                    value={formatDisplay(value)}
                    placeholder={placeholder || 'jj/mm/aaaa'}
                    style={{
                        cursor: 'pointer',
                        width: '160px',
                        paddingLeft: isAr ? '0.75rem' : '2rem',
                        paddingRight: isAr ? '2rem' : '0.75rem'
                    }}
                />
            </div>
            {open && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: isAr ? 'auto' : 0,
                    right: isAr ? 0 : 'auto',
                    zIndex: 1000,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    padding: '0.75rem',
                    width: '280px',
                    marginTop: '4px'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <button type="button" onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                            <ChevronLeft size={18} />
                        </button>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            {months[viewMonth]} {viewYear}
                        </span>
                        <button type="button" onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '4px' }}>
                        {days.map(d => (
                            <div key={d} style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                        {Array.from({ length: startOffset }).map((_, i) => (
                            <div key={`e-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const sel = isSelected(day);
                            const tod = isToday(day);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => selectDay(day)}
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: tod && !sel ? '1px solid var(--primary)' : 'none',
                                        borderRadius: '50%',
                                        background: sel ? 'var(--primary)' : 'transparent',
                                        color: sel ? 'white' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: sel || tod ? 600 : 400,
                                        fontSize: '0.85rem',
                                        margin: '0 auto'
                                    }}
                                    onMouseOver={e => { if (!sel) e.currentTarget.style.background = 'var(--gray-100)'; }}
                                    onMouseOut={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <button type="button" onClick={() => { onChange(''); setOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--primary)' }}>
                            {t('common.clear', 'Effacer')}
                        </button>
                        <button type="button" onClick={() => { const now = new Date(); selectDay(now.getDate()); setViewMonth(now.getMonth()); setViewYear(now.getFullYear()); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--primary)' }}>
                            {t('common.today', "Aujourd'hui")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

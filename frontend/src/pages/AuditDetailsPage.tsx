import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Calendar, User, AlertTriangle, FileText,
    ArrowLeft, Play, Clock, Plus, CheckCircle, CheckCircle2,
    Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LocaleDateInput from '../components/LocaleDateInput';

const API_URL = 'http://localhost:3000';

export default function AuditDetailsPage() {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [audit, setAudit] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, checklist, actions
    const [processing, setProcessing] = useState(false);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ scheduledDate: '', auditorName: '' });

    const [checks, setChecks] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [users, setUsers] = useState<any[]>([]);

    const fetchAudit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/audits/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAudit(data.audit);
                setChecks(data.audit.checks || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && token) fetchAudit();
        if (token) fetchUsers();
    }, [id, token]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartAudit = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/audits/${id}/start`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) fetchAudit();
            else alert(data.message || t('common.error'));
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleCompleteAudit = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/audits/${id}/complete`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) fetchAudit();
            else alert(data.message || t('common.error'));
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteAudit = async () => {
        if (!window.confirm(t('common.confirmDelete') || 'Êtes-vous sûr de vouloir supprimer cet audit ?')) return;
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/audits/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                navigate('/audits');
            } else {
                alert(data.message || t('common.error'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateAudit = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/audits/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();
            if (data.success) {
                setIsEditing(false);
                fetchAudit();
            } else {
                alert(data.message || t('common.error'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateCheck = async (checkId: string, status: string, findings?: string) => {
        setChecks(prev => prev.map(c => c.id === checkId ? { ...c, status, findings: findings !== undefined ? findings : c.findings } : c));
        try {
            await fetch(`${API_URL}/checks/${checkId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, findings })
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Checklist state
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [newAction, setNewAction] = useState({
        description: '',
        severity: 'MAJOR',
        assignedTo: '',
        dueDate: ''
    });

    const handleCreateAction = async () => {
        if (!newAction.description) return alert(t('validation.required'));

        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/audits/${id}/actions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newAction)
            });
            const data = await res.json();
            if (data.success) {
                // Refresh audit to get new action list
                fetchAudit();
                setIsActionModalOpen(false);
                setNewAction({ description: '', severity: 'MAJOR', assignedTo: '', dueDate: '' });
            } else {
                alert(data.message || t('common.error'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const renderActions = () => (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="card-title">{t('audit.tabs.actions')} ({audit.correctiveActions?.length || 0})</h2>
                {canManageChecks && (
                    <button className="btn btn-primary" onClick={() => setIsActionModalOpen(true)}>
                        {t('audit.actions.new')}
                    </button>
                )}
            </div>

            {(!audit.correctiveActions || audit.correctiveActions.length === 0) ? (
                <div className="empty-state">{t('audit.actions.noData')}</div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {audit.correctiveActions.map((action: any) => (
                        <div key={action.id} style={{
                            padding: '1rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius)',
                            background: 'var(--bg-card)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span className={`badge ${action.severity === 'CRITICAL' ? 'danger' : action.severity === 'MAJOR' ? 'warning' : 'info'}`}>
                                            {t(`audit.actions.severityValues.${action.severity}`)}
                                        </span>
                                        <span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>
                                            {t(`audit.actions.statusValues.${action.status}`)}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0', fontWeight: 500 }}>{action.description}</p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {action.assignee && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <User size={14} />
                                                {action.assignee.firstName} {action.assignee.lastName}
                                            </div>
                                        )}
                                        {action.dueDate && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Calendar size={14} />
                                                {new Date(action.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-TN' : 'fr-FR')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Simple Modal overlay for creating action */}
            {isActionModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginTop: 0 }}>{t('audit.actions.new')}</h3>

                        <div className="form-group">
                            <label className="form-label">{t('audit.actions.description')}</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                value={newAction.description}
                                onChange={e => setNewAction({ ...newAction, description: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('audit.actions.severity')}</label>
                            <select
                                className="form-select"
                                value={newAction.severity}
                                onChange={e => setNewAction({ ...newAction, severity: e.target.value })}
                            >
                                <option value="MINOR">{t('audit.actions.severityValues.MINOR')}</option>
                                <option value="MAJOR">{t('audit.actions.severityValues.MAJOR')}</option>
                                <option value="CRITICAL">{t('audit.actions.severityValues.CRITICAL')}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('audit.actions.dueDate')}</label>
                            <LocaleDateInput
                                className="form-input"
                                value={newAction.dueDate}
                                onChange={val => setNewAction({ ...newAction, dueDate: val })}
                            />
                        </div>

                        {/* Assignee - For MVP simple text or list if we had users available */}
                        {/* We have audit.auditTeam, so we can list them */}
                        <div className="form-group">
                            <label className="form-label">{t('audit.actions.assignee')}</label>
                            <select
                                className="form-select"
                                value={newAction.assignedTo}
                                onChange={e => setNewAction({ ...newAction, assignedTo: e.target.value })}
                            >
                                <option value="">-- {t('common.select')} --</option>
                                {users.map((u: any) => (
                                    <option key={u.id} value={u.id}>
                                        {u.firstName} {u.lastName} ({t(`user.roles.${u.role}`) || u.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setIsActionModalOpen(false)}>
                                {t('common.cancel')}
                            </button>
                            <button className="btn btn-primary" onClick={handleCreateAction} disabled={processing}>
                                {processing ? '...' : t('audit.actions.create')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (loading) return <div className="loading">{t('common.loading')}</div>;
    if (!audit) return <div className="empty-state">{t('audit.notFound')}</div>;

    const isInternal = audit?.auditType?.scope === 'INTERNAL';
    const isLeadAuditor = user?.id === audit?.leadAuditorId;
    const canManageChecks = (user?.role === 'COMPANY_ADMIN' || user?.role === 'COMPLIANCE_OFFICER' || isLeadAuditor) && audit?.status === 'IN_PROGRESS';
    const canEditDetails = (user?.role === 'COMPANY_ADMIN' || user?.role === 'COMPLIANCE_OFFICER') && audit?.status === 'SCHEDULED';

    const renderOverview = () => {
        if (!audit) return null;

        const handleEditClick = () => {
            setEditForm({
                scheduledDate: audit.scheduledDate ? new Date(audit.scheduledDate).toISOString().split('T')[0] : '',
                auditorName: audit.auditorName || (audit.leadAuditor ? `${audit.leadAuditor.firstName} ${audit.leadAuditor.lastName}` : '')
            });
            setIsEditing(true);
        };

        return (
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="card-title">{t('audit.tabs.overview')}</h2>
                    {canEditDetails && !isEditing && (
                        <button className="btn btn-secondary btn-sm" onClick={handleEditClick}>
                            {t('common.edit', 'Modifier')}
                        </button>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                    <div>
                        <div className="form-label">{t('audit.type')}</div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{i18n.language === 'ar' ? (audit.auditType?.nameAr || audit.auditType?.name) : audit.auditType?.name}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{i18n.language === 'ar' ? (audit.auditType?.descriptionAr || audit.auditType?.description) : audit.auditType?.description}</p>

                        <div className="form-label" style={{ marginTop: '1rem' }}>{t('audit.scope')}</div>
                        <div>{isInternal ? t('audit.scopeValues.INTERNAL') : t('audit.scopeValues.EXTERNAL')}</div>

                        <div className="form-label" style={{ marginTop: '1rem' }}>{t('audit.auditor')}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={18} />
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ padding: '0.25rem 0.5rem' }}
                                    value={editForm.auditorName}
                                    onChange={e => setEditForm(prev => ({ ...prev, auditorName: e.target.value }))}
                                    placeholder={t('audit.auditor', 'Auditeur')}
                                />
                            ) : (
                                audit.auditorName || (audit.leadAuditor ? `${audit.leadAuditor.firstName} ${audit.leadAuditor.lastName}` : 'N/A')
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="form-label">{t('audit.date')}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <Calendar size={18} />
                            {isEditing ? (
                                <LocaleDateInput
                                    className="form-input"
                                    style={{ padding: '0.25rem 0.5rem' }}
                                    value={editForm.scheduledDate}
                                    onChange={val => setEditForm(prev => ({ ...prev, scheduledDate: val }))}
                                />
                            ) : (
                                new Date(audit.scheduledDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-TN' : 'fr-FR')
                            )}
                        </div>

                        <div className="form-label" style={{ marginTop: '1rem' }}>{t('audit.status')}</div>
                        <span className={`badge ${audit.status === 'COMPLETED' ? 'success' : audit.status === 'IN_PROGRESS' ? 'warning' : 'info'}`}>
                            {t(`audit.statusValues.${audit.status}`) || audit.status}
                        </span>

                        {isEditing ? (
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-primary btn-sm" onClick={handleUpdateAudit} disabled={processing}>
                                    {processing ? '...' : t('common.save', 'Enregistrer')}
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)} disabled={processing}>
                                    {t('common.cancel', 'Annuler')}
                                </button>
                            </div>
                        ) : (
                            audit.status === 'SCHEDULED' && (user?.role === 'COMPANY_ADMIN' || user?.role === 'COMPLIANCE_OFFICER' || isLeadAuditor) && (
                                <div style={{ marginTop: '2rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleStartAudit}
                                        disabled={processing}
                                    >
                                        <Play size={18} />
                                        {processing ? t('audit.starting') : t('audit.start')}
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderChecklist = () => (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="card-title">{t('audit.tabs.checklist')} ({checks.length})</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['ALL', 'PENDING', 'PASS', 'FAIL'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {t(`checkStatus.${s}`) || s}
                        </button>
                    ))}
                </div>
            </div>

            {checks.length === 0 ? (
                <div className="empty-state">
                    {audit.status === 'SCHEDULED'
                        ? t('audit.checklistNotStarted', 'L\'audit n\'est pas encore démarré. Les points de contrôle seront générés au démarrage.')
                        : t('audit.checklistEmpty', 'Aucun point de contrôle n\'a été généré pour cet audit.')}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {checks.filter(c => filterStatus === 'ALL' || c.status === filterStatus).map(check => (
                        <div key={check.id} style={{
                            padding: '1rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius)',
                            background: check.status === 'PASS' ? '#f0fdf4' : check.status === 'FAIL' ? '#fef2f2' : 'white'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{check.control.titleFr}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {check.control.descriptionFr}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className={`btn-icon ${check.status === 'PASS' ? 'success' : ''}`}
                                        title={t('audit.conform')}
                                        onClick={() => canManageChecks && handleUpdateCheck(check.id, 'PASS')}
                                        disabled={!canManageChecks}
                                        style={{ color: check.status === 'PASS' ? '#10b981' : '#d1d5db', cursor: canManageChecks ? 'pointer' : 'default', opacity: canManageChecks ? 1 : 0.6 }}
                                    >
                                        <CheckCircle size={24} />
                                    </button>
                                    <button
                                        className={`btn-icon ${check.status === 'FAIL' ? 'danger' : ''}`}
                                        title={t('audit.nonConform')}
                                        onClick={() => canManageChecks && handleUpdateCheck(check.id, 'FAIL')}
                                        disabled={!canManageChecks}
                                        style={{ color: check.status === 'FAIL' ? '#ef4444' : '#d1d5db', cursor: canManageChecks ? 'pointer' : 'default', opacity: canManageChecks ? 1 : 0.6 }}
                                    >
                                        <AlertTriangle size={24} />
                                    </button>
                                </div>
                            </div>
                            {/* Findings Input */}
                            {check.status === 'FAIL' && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    {canManageChecks ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={t('audit.findingsPlaceholder')}
                                            value={check.findings || ''}
                                            onChange={(e) => handleUpdateCheck(check.id, 'FAIL', e.target.value)}
                                            style={{ fontSize: '0.9rem', padding: '0.5rem' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', padding: '0.5rem', color: 'var(--text-secondary)', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                                            {check.findings || t('audit.findingsPlaceholder')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {checks.length === 0 && <div className="empty-state">{t('audit.checklistEmpty')}</div>}
                </div>
            )}
        </div>
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <button onClick={() => navigate('/audits')} className="btn-icon" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} />
                        {t('audit.back')}
                    </button>
                    <h1 className="page-title">{i18n.language === 'ar' ? (audit?.auditType?.nameAr || audit?.auditType?.name) : audit?.auditType?.name}</h1>
                </div>
                {/* Save/Complete/Delete Actions */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {(user?.role === 'COMPANY_ADMIN' || user?.role === 'COMPLIANCE_OFFICER') && (
                        <button
                            className="btn btn-sm"
                            style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                            onClick={handleDeleteAudit}
                            disabled={processing}
                        >
                            {t('common.delete', 'Supprimer')}
                        </button>
                    )}
                    {canManageChecks && (
                        <button
                            className="btn btn-success"
                            onClick={handleCompleteAudit}
                            disabled={processing}
                        >
                            <Save size={18} />
                            {processing ? '...' : t('audit.complete')}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                {['overview', 'checklist', 'actions'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.75rem 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: activeTab === tab ? 600 : 500,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {t(`audit.tabs.${tab}`) || tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'checklist' && renderChecklist()}
            {activeTab === 'actions' && renderActions()}

        </div>
    );
}

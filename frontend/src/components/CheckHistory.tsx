import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { FileText, Eye } from 'lucide-react';

interface CheckHistoryProps {
    controlId: string;
    currentCheckId?: string;
}

export default function CheckHistory({ controlId, currentCheckId }: CheckHistoryProps) {
    const { t } = useTranslation();
    const api = useApi();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const result = await api.getChecks({ controlId, limit: '5' });
            if (result.success && result.data) {
                // Filter out the current check being edited if it exists
                const filtered = result.data.filter((c: any) => c.id !== currentCheckId);
                setHistory(filtered);
            }
            setLoading(false);
        };
        if (controlId) {
            fetchHistory();
        }
    }, [controlId, currentCheckId]);

    if (loading) return <div className="text-center py-4 text-gray-500 text-sm">Chargement de l'historique...</div>;
    if (history.length === 0) return null;

    return (
        <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Historique des vérifications</h3>
            <div className="space-y-4">
                {history.map((check) => (
                    <div key={check.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className={`badge ${check.status === 'PASS' ? 'success' : check.status === 'FAIL' ? 'danger' : 'warning'}`}>
                                    {t(`checkStatus.${check.status}`)}
                                </span>
                                <span className="text-gray-500 text-sm ml-3">
                                    {new Date(check.checkDate).toLocaleDateString()}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400">
                                {check.performedBy?.firstName} {check.performedBy?.lastName}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Findings & Actions */}
                            <div>
                                {check.findings && (
                                    <div className="mb-2">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Constats</div>
                                        <p className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-100 shadow-sm">
                                            {check.findings}
                                        </p>
                                    </div>
                                )}

                                {(check.actions?.length > 0 || check.correctiveActions) && (
                                    <div>
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Actions</div>
                                        {check.actions?.length > 0 ? (
                                            <ul className="list-disc list-inside text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm">
                                                {check.actions.map((action: any) => (
                                                    <li key={action.id} className={action.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}>
                                                        {action.description}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm">
                                                {check.correctiveActions}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Evidence */}
                            {check.evidence?.length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Preuves</div>
                                    <div className="grid gap-2">
                                        {check.evidence.map((ev: any) => (
                                            <div key={ev.id} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded shadow-sm text-sm">
                                                {ev.fileType?.startsWith('image/') ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/evidence/file/${ev.id}`}
                                                        alt="Evidence"
                                                        className="w-8 h-8 object-cover rounded cursor-pointer"
                                                        onClick={async () => {
                                                            const blob = await api.getEvidenceFile(ev.id);
                                                            if (blob) window.open(window.URL.createObjectURL(blob), '_blank');
                                                        }}
                                                    />
                                                ) : (
                                                    <FileText size={20} className="text-blue-500" />
                                                )}
                                                <span
                                                    className="truncate flex-1 cursor-pointer hover:underline text-blue-600"
                                                    onClick={async () => {
                                                        const blob = await api.getEvidenceFile(ev.id);
                                                        if (blob) window.open(window.URL.createObjectURL(blob), '_blank');
                                                    }}
                                                >
                                                    {ev.fileName}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

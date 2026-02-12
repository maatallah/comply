import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDanger?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    isDanger = false
}: ConfirmModalProps) {
    const { t } = useTranslation();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title || t('common.confirm') || 'Confirmation'}
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    {isDanger && (
                        <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                    )}
                    <div>
                        <p className="text-gray-700 text-base">
                            {message || t('messages.deleteConfirm') || 'Êtes-vous sûr de vouloir continuer ?'}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        {cancelLabel || t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
                        onClick={handleConfirm}
                    >
                        {confirmLabel || t('common.confirm')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

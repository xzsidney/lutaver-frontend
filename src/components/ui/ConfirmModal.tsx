import React from 'react';
import { Modal } from './Modal';
// import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    isDanger?: boolean;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    isDanger = false,
    isLoading = false
}: ConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <button
                        className="btn btn-ghost" // From AdminDashboard.css
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={`btn ${isDanger ? 'btn-danger' : 'btn-primary-br'}`} // From AdminDashboard.css or standard
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={isDanger ? { backgroundColor: '#dc3545', color: 'white', border: 'none' } : {}}
                    >
                        {isLoading ? 'Processando...' : confirmLabel}
                    </button>
                </>
            }
        >
            <p className="mb-0 text-muted">{message}</p>
        </Modal>
    );
}

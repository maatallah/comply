import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import EXIF from 'exif-js';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, Check, Loader2, MapPin, Clock, FileText, Trash2, X } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface EvidenceUploadProps {
    controlId: string;
    onSuccess: (evidence: any) => void;
}

export default function EvidenceUpload({ controlId, onSuccess }: EvidenceUploadProps) {
    const { t } = useTranslation();
    const api = useApi();

    const [mode, setMode] = useState<'IDLE' | 'CAMERA' | 'PREVIEW'>('IDLE');
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCapture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setPreview(imageSrc);

            // Convert base64 to file for upload
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setFile(capturedFile);
                    extractMetadata(capturedFile);
                });
            setMode('PREVIEW');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);

            if (selectedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(selectedFile));
                extractMetadata(selectedFile);
            } else {
                setPreview(null);
                setMetadata(null);
            }
            setMode('PREVIEW');
        }
    };

    const extractMetadata = (file: File) => {
        if (file.type.startsWith('image/')) {
            EXIF.getData(file as any, function (this: any) {
                const allMetadata = EXIF.getAllTags(this);
                const gps = {
                    lat: EXIF.getTag(this, "GPSLatitude"),
                    lon: EXIF.getTag(this, "GPSLongitude"),
                    ref: EXIF.getTag(this, "GPSLatitudeRef")
                };

                // Simplified metadata for the DB
                const simplified = {
                    make: allMetadata.Make,
                    model: allMetadata.Model,
                    dateTime: allMetadata.DateTime,
                    software: allMetadata.Software,
                    gps: gps.lat ? gps : null
                };
                setMetadata(simplified);
            });
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('controlId', controlId);
            formData.append('description', description);
            formData.append('metadata', JSON.stringify(metadata || {}));

            const result = await api.uploadEvidence(formData);

            if (result.success) {
                onSuccess(result.data);
                resetAll();
            } else {
                setError(result.error?.message || t('common.error') || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const resetAll = () => {
        setMode('IDLE');
        setPreview(null);
        setFile(null);
        setDescription('');
        setMetadata(null);
        setError(null);
        setLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="evidence-upload-container" style={{ border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)', padding: '1rem', backgroundColor: '#f9fafb' }}>
            {error && <div className="alert error" style={{ marginBottom: '1rem' }}>{error}</div>}

            {mode === 'IDLE' && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setMode('CAMERA')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', minWidth: '100px' }}>
                        <Camera size={24} />
                        <span>{t('evidence.takePhoto')}</span>
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', minWidth: '100px' }}>
                        <Upload size={24} />
                        <span>{t('evidence.uploadFile')}</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,application/pdf" />
                </div>
            )}

            {mode === 'CAMERA' && (
                <div style={{ textAlign: 'center' }}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: 'environment' }}
                        style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: '1rem' }}
                    />
                    <div className="flex gap-2 justify-center">
                        <button type="button" className="btn btn-secondary" onClick={() => setMode('IDLE')}>{t('common.cancel')}</button>
                        <button type="button" className="btn btn-primary" onClick={handleCapture}>
                            <Camera size={18} style={{ marginRight: '0.5rem' }} />
                            {t('evidence.capture')}
                        </button>
                    </div>
                </div>
            )}

            {mode === 'PREVIEW' && file && (
                <div className="preview-card" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1rem' }}>

                    {/* File Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                            {file.type.startsWith('image/') && preview ? (
                                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <FileText size={24} className="text-primary" />
                            )}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div className="truncate" style={{ fontWeight: 600, fontSize: '0.9rem' }} title={file.name}>
                                {file.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                                {(file.size / 1024).toFixed(1)} KB
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-icon"
                            onClick={resetAll}
                            disabled={loading}
                            title={t('common.cancel')}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Metadata Badges */}
                    {metadata && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            {metadata.gps && (
                                <span className="badge success" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <MapPin size={10} /> GPS Verified
                                </span>
                            )}
                            {metadata.dateTime && (
                                <span className="badge info" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <Clock size={10} /> {metadata.dateTime}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Description Input */}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>{t('evidence.description')}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('evidence.descriptionPlaceholder')}
                            dir="auto"
                            disabled={loading}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={resetAll} disabled={loading}>
                            {t('common.cancel')}
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} style={{ marginRight: '0.5rem' }} />}
                            {t('common.add') || 'Ajouter'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

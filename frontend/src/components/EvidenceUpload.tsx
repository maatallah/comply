import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import EXIF from 'exif-js';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, Check, Loader2, MapPin, Clock } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface EvidenceUploadProps {
    controlId: string;
    onSuccess: (evidence: any) => void;
}

export default function EvidenceUpload({ controlId, onSuccess }: EvidenceUploadProps) {
    const { t } = useTranslation();
    const api = useApi();

    const [mode, setMode] = useState<'CHOICE' | 'CAMERA' | 'UPLOAD'>('CHOICE');
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
            setMode('UPLOAD');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            extractMetadata(selectedFile);
            setMode('UPLOAD');
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

        const formData = new FormData();
        formData.append('file', file);
        formData.append('controlId', controlId);
        formData.append('description', description);
        formData.append('metadata', JSON.stringify(metadata || {}));

        const result = await api.uploadEvidence(formData);

        if (result.success) {
            onSuccess(result.data);
            reset();
        } else {
            setError(result.error?.message || 'Upload failed');
        }
        setLoading(false);
    };

    const reset = () => {
        setMode('CHOICE');
        setPreview(null);
        setFile(null);
        setDescription('');
        setMetadata(null);
        setError(null);
    };

    return (
        <div className="evidence-upload-container" style={{ border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)', padding: '1rem', backgroundColor: '#f9fafb' }}>
            {error && <div className="alert error" style={{ marginBottom: '1rem' }}>{error}</div>}

            {mode === 'CHOICE' && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setMode('CAMERA')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', minWidth: '120px' }}>
                        <Camera size={32} />
                        <span>{t('evidence.takePhoto')}</span>
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', minWidth: '120px' }}>
                        <Upload size={32} />
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
                        <button type="button" className="btn btn-secondary" onClick={() => setMode('CHOICE')}>{t('common.cancel')}</button>
                        <button type="button" className="btn btn-primary" onClick={handleCapture}>
                            <Camera size={18} style={{ marginRight: '0.5rem' }} />
                            {t('evidence.capture')}
                        </button>
                    </div>
                </div>
            )}

            {mode === 'UPLOAD' && (
                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--gray-200)', backgroundColor: '#fff' }}>
                            {file?.type.includes('pdf') ? (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', color: '#b91c1c' }}>PDF</div>
                            ) : (
                                <img src={preview!} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{file?.name}</div>
                            {metadata && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('evidence.description')}</label>
                        <textarea
                            className="form-control"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('evidence.descriptionPlaceholder')}
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button type="button" className="btn btn-secondary" onClick={reset} disabled={loading}>{t('common.cancel')}</button>
                        <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} style={{ marginRight: '0.5rem' }} />}
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

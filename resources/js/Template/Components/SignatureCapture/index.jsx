import React, { useRef, useState, useEffect } from 'react';
import { Card, CardBody } from 'reactstrap';

const SignatureCapture = ({ onSave, signatureData, label = 'Firma' }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signature, setSignature] = useState(signatureData || null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Load existing signature if provided
        if (signatureData) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };
            img.src = signatureData;
        }
    }, [signatureData]);

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        
        const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        
        const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        saveSignature();
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature(null);
        if (onSave) {
            onSave(null);
        }
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL('image/png');
        setSignature(dataURL);
        if (onSave) {
            onSave(dataURL);
        }
    };

    return (
        <Card>
            <CardBody>
                <label className="form-label fw-bold">{label}</label>
                <div className="border rounded p-2 bg-light" style={{ position: 'relative' }}>
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        style={{
                            width: '100%',
                            height: '200px',
                            cursor: 'crosshair',
                            touchAction: 'none',
                        }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>
                <div className="mt-2 d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={clearSignature}
                    >
                        Limpiar
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={saveSignature}
                    >
                        Guardar Firma
                    </button>
                </div>
            </CardBody>
        </Card>
    );
};

export default SignatureCapture;


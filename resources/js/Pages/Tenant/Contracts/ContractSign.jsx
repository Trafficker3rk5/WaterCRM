import React, { Fragment, useState, useEffect } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import SignatureCapture from '@/Template/Components/SignatureCapture';
import { Card, CardBody, CardFooter, Row, Col, Alert } from 'reactstrap';
import { FileText, Download, Check } from 'react-feather';

export default function ContractSign({ auth, title, cid, budget, contract, signature, availableFields }) {
    const [installerSignature, setInstallerSignature] = useState(signature?.installer_signature || null);
    const [clientSignature, setClientSignature] = useState(signature?.client_signature || null);

    const { data, setData, post, processing, errors } = useForm({
        contract_id: contract.id,
        installer_signature: installerSignature,
        client_signature: clientSignature,
    });

    useEffect(() => {
        setData(data => ({ ...data, installer_signature: installerSignature, client_signature: clientSignature }));
    }, [installerSignature, clientSignature]);

    const handleSaveSignatures = () => {
        post(route('contracts.sign', [cid, budget.id]), {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    // Replace fields in contract content
    const getContractContent = () => {
        let content = contract.content || '';
        const fieldData = {
            'client.company_name': budget.client?.company_name || '',
            'client.contact_name': budget.client?.contact_name || '',
            'client.email': budget.client?.email || '',
            'client.phone': budget.client?.phone || '',
            'budget.id': budget.id,
            'budget.created_at': new Date(budget.created_at).toLocaleDateString('es-ES'),
            'budget.products_txt': budget.products_txt || '',
            'date.today': new Date().toLocaleDateString('es-ES'),
        };

        Object.entries(fieldData).forEach(([key, value]) => {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        return content;
    };

    const isFullySigned = signature?.isFullySigned || false;
    const installerSigned = !!signature?.installer_signature;
    const clientSigned = !!signature?.client_signature;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />

                {contract.type === 'text' && (
                    <Card className="mb-4">
                        <CardBody>
                            <div className="contract-preview" style={{ 
                                padding: '20px', 
                                border: '1px solid #ddd', 
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                minHeight: '400px',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'serif',
                                lineHeight: '1.6'
                            }}>
                                {getContractContent()}
                            </div>
                        </CardBody>
                    </Card>
                )}

                {contract.type === 'pdf' && (
                    <Card className="mb-4">
                        <CardBody>
                            <Alert color="info">
                                <FileText className="me-2" size={20} />
                                Contrato PDF: <a href={contract.pdf_url} target="_blank" className="alert-link">Ver PDF</a>
                            </Alert>
                        </CardBody>
                    </Card>
                )}

                <Row>
                    <Col md="6">
                        <SignatureCapture
                            label="Firma del Instalador"
                            onSave={setInstallerSignature}
                            signatureData={signature?.installer_signature}
                        />
                        {installerSigned && (
                            <Alert color="success" className="mt-2">
                                <Check size={16} className="me-2" />
                                Firma del instalador guardada
                            </Alert>
                        )}
                    </Col>
                    <Col md="6">
                        <SignatureCapture
                            label="Firma del Cliente"
                            onSave={setClientSignature}
                            signatureData={signature?.client_signature}
                        />
                        {clientSigned && (
                            <Alert color="success" className="mt-2">
                                <Check size={16} className="me-2" />
                                Firma del cliente guardada
                            </Alert>
                        )}
                    </Col>
                </Row>

                <Card className="mt-4">
                    <CardFooter className="text-end">
                        <Btn
                            attrBtn={{
                                color: 'primary save-btn',
                                onClick: handleSaveSignatures,
                                disabled: processing || (!installerSignature && !clientSignature)
                            }}
                        >
                            Guardar Firmas
                        </Btn>
                        {isFullySigned && signature?.pdf_path && (
                            <a
                                href={route('contracts.download', [cid, budget.id, signature.id])}
                                className="btn btn-success ms-2"
                                target="_blank"
                            >
                                <Download size={16} className="me-2" />
                                Descargar Contrato Firmado
                            </a>
                        )}
                        <Btn
                            attrBtn={{
                                color: 'secondary cancel-btn ms-2',
                                onClick: () => router.visit(route('budgets.index', cid))
                            }}
                        >
                            Volver
                        </Btn>
                    </CardFooter>
                </Card>
            </Fragment>
        </AuthenticatedLayout>
    )
}


import React, { Fragment, useState, useEffect, useContext, useMemo } from "react";
import { Breadcrumbs } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from "axios";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import MainDataContext from '@/Template/_helper/MainData';
import Icon from "@/Template/CommonElements/Icon";
import NotesModal from "@/Template/Components/NotesModal";
import Email from "@/Template/CommonElements/Email";
import Phone from "@/Template/CommonElements/Phone";
import TrafficLights from "@/Template/Components/TrafficLights";
import FilterTable from "@/Template/Components/FilterTable";
import Address from "@/Template/Components/Address";
import { useResponsiveColumns } from "@/Template/Utils/useResponsiveColumns";

export default function ClientList({ auth, title, isClient, filters, filtered}) {
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);
    const [tooltip, setTooltip] = useState(false);
    const toggle = () => setTooltip(!tooltip);

    const [clientId, setClientId] = useState(0);
    const [notesModal, setNotesModal] = useState(false);
    const toggleNotesModal = () => setNotesModal(!notesModal);
    
    // Detect screen size for responsive column rendering
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1500);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const getClients = async (d) => {
        const response = await axios.post(route(isClient ? 'clients.list' : 'contacts.list'), d);
        setDataList(response.data);
    }

    useEffect(() => {
        getClients(filtered);
    }, [deleteCounter]);

    // Memoize columns to prevent unnecessary re-renders
    const allTableColumns = useMemo(() => [
        {
            name: 'Referencia',
            selector: row => row['external_id'],
            sortable: true,
            center: false
        },
        {
            name: 'Nombre',
            selector: (row) => {
                return (
                    <div className={row['expired'] == 1 ? 'text-warning' : (row['expired'] == 2 ? 'text-danger' : '')}>
                        <div>{row['company_name']}</div>
                        <div><small>{row['business_name']}</small></div>
                    </div>
                )
            },
            sortable: true,
            center: false,
        },
        {
            name: 'Actividad',
            selector: (row) => row['activity']?.name,
            sortable: true,
            center: false,
        },
        {
            name: 'Dirección',
            selector: (row) => <Address address={row['address_complete'] ?? {}} />,
            sortable: true,
            center: false
        },
        {
            name: 'Email / Teléfono',
            selector: row => {
                const content = (
                    <>
                        {row['email'] && <div style={{ marginBottom: isMobile || isTablet ? '2px' : '4px' }}><Email email={row['email']} /></div>}
                        {row['phone'] && <div><Phone phone={row['phone']} /></div>}
                    </>
                );
                if (isMobile || isTablet) {
                    return <div style={{ padding: '2px 0', margin: 0 }}>{content}</div>;
                }
                return content;
            },
            sortable: true,
            center: false,
            maxWidth: isMobile || isTablet ? "120px" : undefined
        },
        {
            name: 'Estado',
            selector: (row) => {
                return (
                    <div style={{ paddingRight: isMobile || isTablet ? '2px' : '8px' }}>
                        <div><div className={`badge bg-success`}>{row['status']?.name}</div></div>
                        <div className={`badge badge-primary`}>Hace {row['last_change']}</div> 
                    </div>
                )
            },
            sortable: true,
            center: false,
            maxWidth: isMobile || isTablet ? "100px" : "130px"
        },
        {
            name: 'A.',
            selector: (row) => {
                const content = <TrafficLights data={row['tasksLights']} url={route('tasks', {'cid' : row['id'], 'back' : isClient ? 'clients' : 'contacts'})} />;
                if (isMobile || isTablet) {
                    return <div className="d-flex flex-column align-items-center" style={{ padding: '4px 0', margin: 0 }}>{content}</div>;
                }
                return content;
            },
            sortable: false,
            center: true,
            maxWidth: isMobile || isTablet ? "50px" : "100px",
            width: isMobile || isTablet ? "50px" : undefined
        },
        {
            name: 'Pr.',
            selector: (row) => {
                const content = <TrafficLights data={row['budgetsLigths']} url={route('budgets.index', row['id']) + '?'}/>;
                if (isMobile || isTablet) {
                    return <div className="d-flex flex-column align-items-center" style={{ padding: '4px 0', margin: 0 }}>{content}</div>;
                }
                return content;
            },
            sortable: false,
            center: true,
            maxWidth: isMobile || isTablet ? "50px" : "100px",
            width: isMobile || isTablet ? "50px" : undefined
        },
        {
            name: 'Acciones',
            selector: (row) => {
                const actionsContent = (
                    <>
                        <Icon icon="Eye" id={'Eye-' + row['id']} tooltip="Ver" onClick={() => router.visit(route(isClient ? 'clients.show' : 'contacts.show', row['id']))}  className="me-1"/>
                        
                        {!isClient &&
                        <Icon 
                            icon="User" 
                            id={'usr-' + row['id']} 
                            tooltip="Convertir en Cliente" 
                            onClick={() => {
                                router.post(route('contacts.convert', row['id']), {
                                    onSuccess : () => {
                                        getClients()
                                    }
                                });
                            }}
                            className="me-1"
                        />
                        }
                        <Icon icon="MessageSquare" id={'msg-' + row['id']} tooltip="Comentarios" onClick={() => {toggleNotesModal(); setClientId(row['id'])}} className="me-1"/>
                        <Icon icon="FileText" id={'ft-' + row['id']} tooltip="Propuestas" onClick={() => router.visit(route('budgets.index', row['id']))}  className="me-1"/>
                        <Edit onClick={() => router.visit(route(isClient ? 'clients.edit' : 'contacts.edit', row['id']))} id={'edit-' + row['id']}/>
                        <Trash onClick={() => handleDelete(route(isClient ? 'clients.destroy' : 'contacts.destroy', row['id']))} id={'delete-' + row['id']}/>
                    </>
                );
                
                // On mobile/tablet, show actions vertically like A. and Pr. columns
                if (isMobile || isTablet) {
                    return (
                        <div className="d-flex flex-column align-items-center" style={{ padding: '4px 0', margin: 0, gap: '2px' }}>
                            <Icon icon="Eye" id={'Eye-' + row['id']} tooltip="Ver" onClick={() => router.visit(route(isClient ? 'clients.show' : 'contacts.show', row['id']))} size={16} />
                            {!isClient && (
                                <Icon 
                                    icon="User" 
                                    id={'usr-' + row['id']} 
                                    tooltip="Convertir en Cliente" 
                                    onClick={() => {
                                        router.post(route('contacts.convert', row['id']), {
                                            onSuccess: () => getClients(filtered)
                                        });
                                    }}
                                    size={16}
                                />
                            )}
                            <Icon icon="MessageSquare" id={'msg-' + row['id']} tooltip="Comentarios" onClick={() => {toggleNotesModal(); setClientId(row['id'])}} size={16} />
                            <Icon icon="FileText" id={'ft-' + row['id']} tooltip="Propuestas" onClick={() => router.visit(route('budgets.index', row['id']))} size={16} />
                            <Edit onClick={() => router.visit(route(isClient ? 'clients.edit' : 'contacts.edit', row['id']))} id={'edit-' + row['id']} size={16} />
                            <Trash onClick={() => handleDelete(route(isClient ? 'clients.destroy' : 'contacts.destroy', row['id']))} id={'delete-' + row['id']} size={16} />
                        </div>
                    );
                }
                
                // Desktop: show all icons horizontally
                return actionsContent;
            },
            sortable: false,
            center: true,
            maxWidth: isMobile || isTablet ? "60px" : "150px",
            width: isMobile || isTablet ? "60px" : undefined
        },
    ], [isClient, handleDelete, toggleNotesModal, setClientId, getClients, isMobile, isTablet]); // Dependencies for columns that use these values

    // Memoize responsive column options to prevent unnecessary re-renders
    const responsiveOptions = useMemo(() => ({
        hideOnTablet: ['Actividad', 'Referencia'],
        hideOnMobile: ['Actividad', 'Referencia', 'Dirección', 'Nombre'], // Hide more columns on mobile for better fit
    }), []);

    // Use responsive columns hook to hide 'Actividad' and 'Referencia' on tablets
    const tableColumns = useResponsiveColumns(allTableColumns, responsiveOptions);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />

                <FilterTable
                    dataList={dataList}
                    tableColumns={tableColumns}
                    filters={filters}
                    getList={(d) => getClients(d)}
                /> 

                <AddBtn onClick={() => router.visit(route(isClient ? 'clients.create' : 'contacts.create'))} />

                <NotesModal
                    type="1"
                    id={clientId}
                    modal={notesModal}
                    onClose={toggleNotesModal}
                />
            </Fragment>
        </AuthenticatedLayout>
    )
}
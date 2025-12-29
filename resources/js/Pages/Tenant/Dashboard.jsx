import DashboardCard from '@/Template/Components/DashboardCard';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Fragment, useContext, useEffect, useState } from 'react';
import { Card, Row } from 'react-bootstrap';
import Select from '@/Template/CommonElements/Select';
import axios from 'axios';
import { CardBody, Col } from 'reactstrap';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import { Btn } from "../../Template/AbstractElements";
import MainDataContext from '@/Template/_helper/MainData';
import CountUp from 'react-countup';
import DashboardChart from '@/Template/Components/DashboardChart';
import Switch from '@/Template/CommonElements/Switch';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux'

export default function Dashboard({ auth, users }) {
    const actualUser = useSelector((state) => state.auth.value);
    const { formatPrice } = useContext(MainDataContext);
    const [selectedOptionUs, setSelectedOptionUs] = useState(null);
    const [stats, setStats] = useState([]);
    const [filterStats, setFilterStats] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [chartLabels, setChartLabels] = useState([]);


    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        uid: auth.user.id,
        sd: '',
        ed: '',
        simulate: true
    });

    const handleChange = (e) => {
        setData(data => ({ ...data, [e.target.name]: e.target.value }));
    }

    const setSelected = (selected, evt) => {
        setSelectedOptionUs(selected);
        setData(data => ({ ...data, [evt.name]: selected.value }))
    }

    const handleChangeSwitch = (key) => {
        setData(key, !data[key]);
    }

    const filter = async () => {
        const response = await axios.post(route('dashboard.stats'), data);
        if (response.data.error) {
            toast.error(response.data.error);
        } else {
            setStats(response.data.stats);
            setChartLabels(response.data.chartLabels);
            setChartData(response.data.chartData);
            setFilterStats(response.data.filterStats);
        }
    }

    useEffect(() => {
        filter();
    }, []);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <Fragment>
                {[0, 1, 2, 4].includes(actualUser.rol_id) &&
                    <>
                        <Card className='mt-2'>
                            <CardBody className='pt-2'>
                                <Row className='mt-2'>
                                    {actualUser.rol_id != 4 &&
                                        <Col sm="6" md="4" lg="2" className="mb-2">
                                            <Select
                                                key={'users'}
                                                label={{ label: 'Usuario' }}
                                                input={{
                                                    placeholder: 'Usuario',
                                                    onChange: (e) => setData(data => ({ ...data, ['uid']: e ? e.value : null })),
                                                    name: 'uid',
                                                    options: users,
                                                    defaultValue: users.filter(option => option.value == data['uid'])[0],
                                                    isClearable: true,
                                                    // Try these props to control dropdown behavior
                                                    menuPlacement: "auto",
                                                    menuShouldBlockScroll: true,
                                                }}
                                            />
                                        </Col>
                                    }
                                    <Col sm="6" md="4" lg="2" className="mb-2">
                                        <FloatingInput
                                            label={{ label: 'Desde' }}
                                            input={{
                                                placeholder: 'Desde',
                                                onChange: handleChange,
                                                name: 'sd',
                                                value: data.sd,
                                                type: 'date'
                                            }}
                                            errors={errors.sd}
                                        />
                                    </Col>
                                    <Col sm="6" md="4" lg="2" className="mb-2">
                                        <FloatingInput
                                            label={{ label: 'Hasta' }}
                                            input={{
                                                placeholder: 'Hasta',
                                                onChange: handleChange,
                                                name: 'ed',
                                                value: data.ed,
                                                type: 'date'
                                            }}
                                            errors={errors.ed}
                                        />
                                    </Col>
                                    <Col sm="6" md="4" lg="2" className="mb-2">
                                        <Switch
                                            label={'Simular Datos'}
                                            input={{ onChange: () => handleChangeSwitch('simulate'), name: 'simulate', checked: data.simulate }}
                                        />
                                    </Col>
                                    <Col sm="6" md="4" lg="2" className="mb-2">
                                        <Btn attrBtn={{ color: 'primary save-btn mt-4', onClick: filter, disabled: processing }}>Filtrar</Btn>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                        <Row>
                            <div className="dashboard-sec box-col-12 col-xl-12 xl-100">
                                <div className="earning-card card">
                                    <div className="p-0 card-body">
                                        <div className="m-0 row">
                                            <div className="earning-content p-0 col-xl-3">
                                                <div className="m-0 chart-left row">
                                                    <div className="p-0 left_side_earning col-xl-12">
                                                        <h5>Propuestas</h5>
                                                        <p className="font-roboto">Propuestas desde {filterStats.sd} a {filterStats.ed}</p>
                                                    </div>
                                                    <div className="p-0 left_side_earning col-xl-12">
                                                        <h5>{filterStats.total}</h5>
                                                        <p className="font-roboto">Total</p>
                                                    </div>
                                                    <div className="p-0 left_side_earning col-xl-12">
                                                        <h5>{filterStats.accepted}</h5>
                                                        <p className="font-roboto">Aceptados</p>
                                                    </div>
                                                    <div className="p-0 left_side_earning col-xl-12">
                                                        <h5>{filterStats.rejected}</h5>
                                                        <p className="font-roboto">Rechazados</p>
                                                    </div>
                                                    <div className="p-0 left_side_earning col-xl-12">
                                                        <h5>{filterStats.convert}%</h5>
                                                        <p className="font-roboto">Conversion</p>
                                                    </div>
                                                    <div className="p-0 left_side_earning col-xl-12">
                                                        <h5>{formatPrice(filterStats.billed)}</h5>
                                                        <p className="font-roboto">Facturado</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-0 col-xl-9">
                                                <div className="m-0 earning-sec">
                                                    <div className="earning-sec-box mt-4">
                                                        <DashboardChart labels={chartLabels} data={chartData} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Row>
                    </>
                }

                <Row className='mt-2'>
                    <DashboardCard title="Productos Vendidos" number={stats.products} svg="new-order" />
                    <DashboardCard title="Clientes" number={stats.clients} svg="customers" />
                    <DashboardCard title="Tareas" number={stats.tasks} svg="rate" />
                    <DashboardCard title="Facturado" number={stats.billed} svg="doller-return" /> { /* profit */}

                    <DashboardCard title="Propuestas" number={stats.budgetsTotal} svg="bag" />
                    <DashboardCard title="Propuestas Aceptadas" number={stats.budgetsOk} svg="orders" />
                    <DashboardCard title="Propuestas Rechazadas" number={stats.budgetsRej} svg="halfcircle" />
                    <DashboardCard title="Conversión" number={stats.budgetsPerc} svg="profit" />
                </Row>


            </Fragment>
        </AuthenticatedLayout>
    );
}
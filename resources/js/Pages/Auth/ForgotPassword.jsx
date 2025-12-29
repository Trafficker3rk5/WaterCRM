import GuestLayout from '@/Template/Layouts/GuestLayout';
import InputError from '@/Template/Components/InputError';
import PrimaryButton from '@/Template/Components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import { Btn, H4, P } from '../../Template/AbstractElements';
import wass from '../../../assets/images/logo/waas.png';
import { Fragment } from 'react';

export default function ForgotPassword({ status, logo }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout logo={logo == '' ? wass : logo}>
            <Head title="Forgot Password" />
            <Fragment>
                <Form className='theme-form'>
                    <H4>Recupero de Clave</H4>

                    <P>Ingrese su email para recuperar su clave.</P>

                    {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                    <Input
                        className='form-control'
                        type='email'
                        required
                        onChange={(e) => setData('email', e.target.value)}
                        name="email"
                        value={data.email}
                    />
                    <InputError message={errors.email} className="mt-2" />

                    <div className="d-flex items-center justify-content-between mt-4">
                        <a className='' href={route('login')}>Volver</a>
                        <Btn attrBtn={{ color: 'success', className: 'mt-2', disabled: processing, onClick: (e) => submit(e), loading: 'Recuperando', type: 'submit' }}>Recuperar</Btn>
                    </div>
                </Form>
            </Fragment>
        </GuestLayout>
    );
}

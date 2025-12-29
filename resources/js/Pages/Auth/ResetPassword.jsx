import { Fragment, useEffect } from 'react';
import GuestLayout from '@/Template/Layouts/GuestLayout';
import InputError from '@/Template/Components/InputError';
import InputLabel from '@/Template/Components/InputLabel';
import PrimaryButton from '@/Template/Components/PrimaryButton';
import TextInput from '@/Template/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { Btn, H4, P } from '../../Template/AbstractElements';
import wass from '../../../assets/images/logo/waas.png';
import { Label, Form, Input } from 'reactstrap';

export default function ResetPassword({ token, email, logo }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'));
    };

    return (
        <GuestLayout logo={logo == '' ? wass : logo}>
            <Head title="Reset Password" />

            <Fragment>
                <Form className='theme-form'>
                    <H4>Recupero de Clave</H4>
                    <P>Por favor ingrese su nueva clave</P>

                    <div className="mt-4">
                        <Label className='col-form-label'>Email</Label>
                        <div className='position-relative'>
                            <Input
                                className='form-control'
                                type={'text'}
                                onChange={(e) => setData('email', e.target.value)}
                                name="email"
                                value={data.email}
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Label className='col-form-label'>Password</Label>
                        <div className='position-relative'>
                            <Input
                                className='form-control'
                                type={'password'}
                                onChange={(e) => setData('password', e.target.value)}
                                name="password"
                                value={data.password}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Label className='col-form-label'>Confirmar Password</Label>
                        <div className='position-relative'>
                            <Input
                                className='form-control'
                                type={'password'}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <Btn attrBtn={{ color: 'success', className: 'mt-2', disabled: processing, onClick: (e) => submit(e), loading: 'Recuperando', type: 'submit' }}>Confirmar</Btn>
                    </div>
                </Form>
            </Fragment>
        </GuestLayout>
    );
}

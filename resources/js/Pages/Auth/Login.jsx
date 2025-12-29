import GuestLayout from '@/Template/Layouts/GuestLayout';
import { useForm } from '@inertiajs/react';
import InputError from '@/Template/Components/InputError';

import React, { Fragment, useState, useEffect } from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import { Btn, H4, P } from '../../Template/AbstractElements';
import wass from '../../../assets/images/logo/waas.png';

export default function Login({ status, canResetPassword, prefix, logo }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const loading = useState(false)[0];
    const [togglePassword, setTogglePassword] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const loginAuth = async (e) => {
        e.preventDefault();
        post(route(prefix + 'login'));
    };

    return (
        <GuestLayout logo={!logo || logo === '' ? wass : logo}>
            <Fragment>
                <Form className='theme-form'>
                    <H4>Entrar a WaaS</H4>
                    <P>Ingresa tu email y contraseña para continuar</P>
                    <FormGroup>
                        <Label className='col-form-label'>Email</Label>
                        <Input
                            className='form-control'
                            type='email'
                            required
                            onChange={(e) => setData('email', e.target.value)}
                            name="email"
                            value={data.email}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </FormGroup>
                    <FormGroup className='position-relative'>
                        <Label className='col-form-label'>Clave</Label>
                        <div className='position-relative'>
                            <Input
                                className='form-control'
                                type={togglePassword ? 'text' : 'password'}
                                onChange={(e) => setData('password', e.target.value)}
                                name="password"
                                value={data.password}
                                required
                            />
                            <div className='show-hide' onClick={() => setTogglePassword(!togglePassword)}>
                                <span className={togglePassword ? '' : 'show'}></span>
                            </div>
                        </div>
                    </FormGroup>
                    <div className='position-relative form-group mb-0'>
                        <div className='checkbox'>
                            <Input
                                id='checkbox1'
                                type='checkbox'
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <Label className='text-muted' for='checkbox1'>Recordar</Label>
                        </div>
                        <a className='link' href={route('password.request')}>Recuperar Clave</a>
                        <Btn attrBtn={{ color: 'primary', className: 'd-block w-100 mt-2', disabled: processing, onClick: (e) => loginAuth(e), loading: 'Ingresando', type: 'submit' }}>Ingresar</Btn>
                    </div>
                </Form>
            </Fragment>
        </GuestLayout>
    );
}

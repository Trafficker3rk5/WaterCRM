import React, { useState } from 'react';
import Context from './index';
import SweetAlert from 'sweetalert2';
import { router } from '@inertiajs/react';

const MainDataProvider = (props) => {
    const [deleteCounter, setDeleteCounter] = useState(0);

    const handleDelete = (route, title, success) => { 
        if (title == '' || title === undefined) title = 'Desea eliminar este registro?'
        if (success == '' || success === undefined) success = 'Registro eliminado correctamente'
        SweetAlert.fire({
            title: title,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then(async (result) => {
            if (result.value) {
                await router.delete(route);
                SweetAlert.fire(
                    'Eliminado!',
                    success,
                    'success'
                );
                setDeleteCounter(deleteCounter + 1);
            }
        });
    };

    const formatPrice = (price) => {
        price = parseFloat(price) || 0;
        return price ? price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + '€' : 0;
    }

    const generateRandomString = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    return (
        <Context.Provider
        value={{
            ...props,
            handleDelete,
            deleteCounter,
            setDeleteCounter,
            formatPrice,
            generateRandomString
        }}
        >
        {props.children}
        </Context.Provider>
    );
};

export default MainDataProvider;

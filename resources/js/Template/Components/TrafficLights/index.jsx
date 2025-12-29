import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const TrafficLights = (props) => {
    return (
        <>
            
            <span onClick={() => router.visit(props.url + '&st=' + 0)} className={`badge bg-warning`}>{props.data?.pendings}</span>
            <span onClick={() => router.visit(props.url + '&st=' + 1)} className={`badge bg-success`}>{props.data?.approved}</span>
            <span onClick={() => router.visit(props.url + '&st=' + 2)} className={`badge bg-danger`}>{props.data?.rejected}</span>
        </>
    );
};

export default TrafficLights;
import React, { useState, useEffect } from 'react';
import SvgIcon from '../Common/Component/SvgIcon';
import CountUp from 'react-countup';
import Chart from 'react-apexcharts';

const DashboardChart = (props) => {

    const LiveProductChart = {
        options: {
            chart: {
                height: 420,
                type: 'area',
                toolbar: {
                    show: false,
                },
            },
            stroke: {
                curve: 'smooth'
            },
            fill: {
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.4,
                    inverseColors: false,
                    opacityFrom: 0.9,
                    opacityTo: 0.4,
                    stops: [0, 100],
                },
            },
            dataLabels: {
                enabled: false,
            },
            grid: {
                borderColor: 'rgba(196,196,196, 0.3)',
                padding: {
                    top: 0,
                    right: -120,
                    bottom: 10,
                },
            },
            labels: props.labels,
            markers: {
                size: 0,
            },
            xaxis: {
                axisTicks: {
                    show: false,
                },
                axisBorder: {
                    color: 'rgba(196,196,196, 0.3)',
                },
            },
            tooltip: {
                shared: true,
                intersect: false
            },
        },
    };

    return (
        <Chart options={LiveProductChart.options} series={props.data} type='area' height={420} />
    );
};

export default DashboardChart;
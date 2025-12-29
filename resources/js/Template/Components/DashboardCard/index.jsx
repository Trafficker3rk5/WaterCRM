import React, { useState, useEffect } from 'react';
import SvgIcon from '../Common/Component/SvgIcon';
import CountUp from 'react-countup';

const DashboardCard = (props) => {
    return (
        <div className="col-sm-6 col-lg-6 col-xl-3">
            <div className="o-hidden card">
                <div className="bg-primary b-r-4 card-body">
                    <div className="media static-top-widget">
                        <div className="align-self-center text-center">
                            <SvgIcon style={{ width: '24px', height: '24px' }}iconId={props.svg} />    
                        </div>
                        <div className="media-body">
                            <span className="m-0">{props.title}</span>
                            <h4 className='mb-0'><span className="counter"><CountUp end={props.number ?? 0} /></span></h4>
                            <SvgIcon className="icon-bg" iconId={props.svg} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
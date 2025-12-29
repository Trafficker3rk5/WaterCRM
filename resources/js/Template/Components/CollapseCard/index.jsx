import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import Icon from '@/Template/CommonElements/Icon';


const CollapseCard = (props) => {
    const [collapse, setCollapse] = useState(props.collapsed || false);
    const toggle = () => setCollapse(!collapse);

    useEffect(() => {

    }, []);

    return (
        <Card>
            <CardHeader className="my-0 pt-3 pb-0">
                <div className="header-top">
                    <h6>{ props.title }</h6>
                    <div className="card-header-right-icon">
                        <Icon icon={collapse ? 'ChevronUp' : 'ChevronDown'} onClick={toggle} />
                    </div>
                </div>
            </CardHeader>
            {collapse &&
            <CardBody className="pt-2">{props.children}</CardBody>
            }
        </Card>
    );
};

export default CollapseCard;
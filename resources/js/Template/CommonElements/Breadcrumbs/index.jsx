import React, { Fragment } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom'
import H3 from '../Headings/H3Element';
import SvgIcon from '../../Components/Common/Component/SvgIcon';

const Breadcrumbs = (props) => {
  const layoutURL= 'compact-wrapper';
  return (
    <Fragment>
      <Container fluid={true} className='shadow-sm'>
        <div className='page-title'>
          <Row>
            <Col xs='6'>
              <H3>{props.mainTitle}</H3>
            </Col>
            <Col xs='6' className='d-none d-md-block'>
              <ol className='breadcrumb'>
                <li className='breadcrumb-item'>
                  <Link to={route('dashboard')}>
                    <SvgIcon iconId='stroke-home' />
                  </Link>
                </li>
                {props.parent ? <li className='breadcrumb-item'>{props.parent}</li> : ''}
                {props.subParent ? <li className='breadcrumb-item'>{props.subParent}</li> : ''}
                <li className='breadcrumb-item active'>{props.title}</li>
              </ol>
            </Col>
          </Row>
        </div>
      </Container>
    </Fragment>
  );
};

export default Breadcrumbs;

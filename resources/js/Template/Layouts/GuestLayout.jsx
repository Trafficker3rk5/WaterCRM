import ApplicationLogo from '@/Template/Components/ApplicationLogo';
import { Container, Row, Col } from 'reactstrap';

export default function Guest({ children, logo }) {
    return (
        <Container fluid={true} className='p-0 login-page'>
            <Row>
                <Col xs='12'>
                    <div className='login-card'>
                        <Row className="login-main login-tab">
                            <Col xs='12' className='text-center py-4'>
                                <ApplicationLogo className="img-fluid for-light " src={logo} />
                            </Col>
                            <Col xs='12'>{children}</Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

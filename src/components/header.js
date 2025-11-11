import React from 'react';
import { Card, Container } from 'react-bootstrap';
import PrimaryButton from './primaryButton';

function Header({ user, logout = () => { } }) {

    return (
        <header>
            <Container fluid className='pt-4'>
                <Card className='rounded-1 bg_fr border-0'>
                    <Card.Body className='d-flex justify-content-end align-items-center gap-2'>
                        <p className='mb-0 fw-semibold text_light fs-6'>{user.email}</p>
                        <PrimaryButton onClick={logout} title='LogOut' />
                    </Card.Body>
                </Card>
            </Container>
        </header>
    );
}

export default Header;
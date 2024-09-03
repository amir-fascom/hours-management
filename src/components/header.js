import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

function Header({ user, logout = () => { } }) {

    return (
        <header>
            <Container fluid className='pt-4'>
                <Card>
                    <Card.Body className='d-flex justify-content-end align-items-center gap-2'>
                        <p className='mb-0 fw-semibold fs-6'>{user.email}</p>
                        <button className='btn border-secondary fw-semibold' onClick={logout}>LogOut</button>
                    </Card.Body>
                </Card>
            </Container>
        </header>
    );
}

export default Header;
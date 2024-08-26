import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';

function HoursInput({ title, ...props }) {
    return (
        <>
            <InputGroup>
                <InputGroup.Text id="basic-addon1" className='bg-secondary text-light'>{title}</InputGroup.Text>
                <Form.Control
                    type='time'
                    required
                    name='time'
                    {...props}
                />
            </InputGroup>
        </>
    );
}

export default HoursInput;
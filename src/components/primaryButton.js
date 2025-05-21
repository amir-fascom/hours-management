import React from 'react';
import { Spinner } from 'react-bootstrap';

function PrimaryButton({ isLoading = false, title = '', sx = '', ...props }) {
    return (
        <button className={`bg_primary text_light hover border-0 px-4 py-1 rounded-1 d-flex align-items-center justify-content-center gap-2 fw-semibold ${sx}`} {...props}>{isLoading ?
            <Spinner size="sm" animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner> :
            <></>
        }{title}</button>
    );
}

export default PrimaryButton;
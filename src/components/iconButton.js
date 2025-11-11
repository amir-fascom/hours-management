import React from 'react';

function IconButton({ icon, sm = false, lg = false, sx = '', ...props }) {
    return (
        <button
            type='button'
            style={{ width: lg ? '40px' : sm ? '25px' : '30px', height: lg ? '40px' : sm ? '25px' : '30px' }}
            className={`rounded-circle bg_primary d-flex text_light align-items-center justify-content-center ${sx}`}
            {...props}
        >
            {icon}
        </button>
    );
}

export default IconButton;
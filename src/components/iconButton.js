import React from 'react';

function IconButton({ icon, ...props }) {
    return (
        <button
            type='button'
            style={{ width: '30px', height: '30px' }}
            className='rounded-circle d-flex align-items-center justify-content-center'
            {...props}
        >
            {icon}
        </button>
    );
}

export default IconButton;
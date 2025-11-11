import { Fragment, useContext, useState } from 'react';
import { IoIosColorPalette, IoMdCheckmark } from "react-icons/io";
import { Modal } from 'react-bootstrap';
import { themeVariations } from '../helpers/constants';
import { THEME } from '../reducer';
import { AppContext } from '../context';
import IconButton from './iconButton';

const data = [
    {
        theme: '',
        label: 'Default',
        color1: '#FFFFFF',
        color2: '#CCCCCC',
        color3: '#333333'
    },
    {
        theme: themeVariations.v1,
        label: 'Variation 1',
        color1: '#F2542D',
        color2: '#071E22',
        color3: '#ffffff'
    },
    {
        theme: themeVariations.v2,
        label: 'Variation 2',
        color1: '#071E22',
        color2: '#264653',
        color3: '#ffffff'
    },
    {
        theme: themeVariations.v3,
        label: 'Variation 3',
        color1: '#111',
        color2: '#212529',
        color3: '#ffffff'
    },
    {
        theme: themeVariations.v4,
        label: 'Variation 4',
        color1: '#3B373B',
        color2: '#656E77',
        color3: '#ffffff'
    },
    {
        theme: themeVariations.v5,
        label: 'Variation 5',
        color1: '#333446',
        color2: '#7F8CAA',
        color3: '#ffffff'
    },
    {
        theme: themeVariations.v6,
        label: 'Variation 6',
        color1: '#547792',
        color2: '#213448',
        color3: '#ffffff'
    },
]

function ThemeSelector() {
    const { state, dispatch } = useContext(AppContext);
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false)

    return (
        <>
            <div>
                <IconButton lg onClick={() => setOpen(true)} icon={<IoIosColorPalette size={25} />} sx='border-0 bg_fr position-fixed bottom-0 end-0 me-2 mb-3' />
            </div>
            <Modal show={open} onHide={handleClose}>
                <Modal.Body className='bg_fr'>
                    {data.map((item, index) => {
                        return (
                            <Fragment key={index}>
                                <ColorGroup {...item} active={state.theme} dispatch={dispatch} handleClose={handleClose} />
                                {data.length - 1 === index ? null : <br />}
                            </Fragment>
                        )
                    })
                    }
                </Modal.Body>
            </Modal>
        </>
    );
}

const ColorGroup = ({ theme, active, label, color1, color2, color3, dispatch, handleClose }) => {
    const isDefault = active === ''
    return (
        <div onClick={() => {
            dispatch({
                type: THEME,
                payload: { theme }
            })
            handleClose()
        }}
            style={{ cursor: 'pointer' }}
        >
            <p className='text_light'>
                {label} {theme === active ? <IoMdCheckmark size={16} /> : null}
            </p>
            <div className='d-flex w-100' style={{ border: isDefault ? '1px solid #333' : '1px solid #fff' }}>
                <div style={{ backgroundColor: color1, width: "100%", height: "50px" }} className='w-100'></div>
                <div style={{ backgroundColor: color2, width: "100%", height: "50px" }} className='w-100'></div>
                <div style={{ backgroundColor: color3, width: "100%", height: "50px" }} className='w-100'></div>
            </div>
        </div>
    )
}

export default ThemeSelector;

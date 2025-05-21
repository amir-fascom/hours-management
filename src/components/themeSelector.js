import { useContext, useState } from 'react';
import { IoIosColorPalette } from "react-icons/io";
import { Form, Modal } from 'react-bootstrap';
import { themeVariations } from '../helpers/constants';
import { THEME } from '../reducer';
import { AppContext } from '../context';
import IconButton from './iconButton';

function ThemeSelector() {
    const { state, dispatch } = useContext(AppContext);
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false)

    return (
        <>
            <div>
                <IconButton onClick={() => setOpen(true)} icon={<IoIosColorPalette />} sx='border-0 bg_fr position-fixed bottom-0 end-0 me-2 mb-3' />
            </div>
            <Modal show={open} onHide={handleClose}>
                <Modal.Body className='bg_fr'>
                    <ColorGroup theme={themeVariations.v1} label='Variation 1' active={state.theme} color1='#071E22' color2='#F2542D' color3='#ffffff' dispatch={dispatch} />
                    <br />
                    <ColorGroup theme={themeVariations.v2} label='Variation 2' active={state.theme} color1='#264653' color2='#071E22' color3='#ffffff' dispatch={dispatch} />
                    <br />
                    <ColorGroup theme={themeVariations.v3} label='Variation 3' active={state.theme} color1='#212529' color2='#1c1c1c' color3='#ffffff' dispatch={dispatch} />
                </Modal.Body>
            </Modal>
        </>
    );
}

const ColorGroup = ({ theme, active, label, color1, color2, color3, dispatch }) => {
    return (
        <div>
            <Form.Check
                inline
                label={label}
                name={theme}
                type='radio'
                id={theme}
                checked={theme === active}
                className='text_light'
                onChange={() =>
                    dispatch({
                        type: THEME,
                        payload: { theme }
                    })
                }
            />
            <div className='d-flex w-100' style={{ border: '1px solid #fff' }}>
                <div style={{ backgroundColor: color1, width: "100%", height: "50px" }} className='w-100'></div>
                <div style={{ backgroundColor: color2, width: "100%", height: "50px" }} className='w-100'></div>
                <div style={{ backgroundColor: color3, width: "100%", height: "50px" }} className='w-100'></div>
            </div>
        </div>
    )
}

export default ThemeSelector;

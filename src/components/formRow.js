import { Card, Col, Row } from 'react-bootstrap';
import HoursInput from './hoursInput';
import { FaMinus } from 'react-icons/fa';
import { INPUT_CHANGE, REMOVE_ROW, TIME_IN, TIME_OUT } from '../reducer';
import IconButton from './iconButton';

function FormRow({ rowData, dispatch, itemNumber }) {
    
    const handleChange = (e) => {
        const { value, name } = e.target;
        dispatch({
            type: INPUT_CHANGE,
            payload: {
                value: value, id: rowData.id, input: name
            }
        })
    }

    return (
        <Row>
            <Col xs={12}>
                <Card className='mb-3'>
                    <Card.Body>
                        <div className='d-flex align-items-center justify-content-between gap-3 mb-3'>
                            <h5>Day {itemNumber + 1}</h5>
                            <IconButton
                                onClick={() => dispatch({ type: REMOVE_ROW, payload: rowData.id })}
                                icon={<FaMinus />}
                            />
                        </div>
                        <div className='d-flex align-items-center justify-content-center gap-3'>
                            <HoursInput title='Time In' value={rowData.timeIn} name={TIME_IN} onChange={handleChange} />
                            <HoursInput title='Time Out' value={rowData.timeOut} name={TIME_OUT} onChange={handleChange} />
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row >
    );
}

export default FormRow;

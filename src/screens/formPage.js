import { useContext, useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { FormContext } from '../context';
import { FormRow, IconButton } from '../components';
import { ADD_ROW } from '../reducer';
import { Utils } from '../utils';

function FormPage() {
    const { state, dispatch } = useContext(FormContext);
    const [report, setReport] = useState([]);
    const [reportSubmitted, setReportSubmitted] = useState(false);

    useEffect(() => {
        if (!state.formRows.length) {
            dispatch({ type: ADD_ROW })
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const _report = []
        state.formRows.forEach(day => {
            const diff = getTimeDifference(day.timeIn, day.timeOut)
            _report.push({
                id: Utils.generateId(),
                totalHours: diff
            })
        });
        console.log("🚀 ~ handleSubmit ~ _report:", _report)
        setReport(_report)
        setReportSubmitted(true)
    }

    function getTimeDifference(time1, time2) {
        // Convert time1 and time2 to Date objects for easier comparison
        const [hours1, minutes1] = time1.split(':').map(Number);
        const [hours2, minutes2] = time2.split(':').map(Number);

        // Create Date objects for both times (same date is used as we only care about time difference)
        const date1 = new Date(0, 0, 0, hours1, minutes1);
        const date2 = new Date(0, 0, 0, hours2, minutes2);

        // Calculate the difference in milliseconds
        const diffInMs = date2 - date1;

        // Convert difference to hours and minutes
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffInHours} hours and ${diffInMinutes} minutes`;
    }

    return (
        <Container fluid className='py-4'>
            {!reportSubmitted ? <Form onSubmit={handleSubmit}>
                <Row>
                    <Col xs={12}>
                        <h4 className='mb-4'>Hours Counter</h4>
                    </Col>
                </Row>
                {state.formRows.map((item, index) => <FormRow key={item.id} rowData={item} dispatch={dispatch} itemNumber={index} />)}
                <Row className='justify-content-end align-items-end'>
                    <Col>
                        <div className='d-flex justify-content-end align-items-end'>
                            <IconButton onClick={() => dispatch({ type: ADD_ROW })} icon={<FaPlus />} />
                        </div>
                    </Col>
                </Row>
                <Button type='submit'>Submit</Button>
            </Form> :
                <Row>
                    <Col>
                        <Card>
                            <Card.Body>
                                {report.map((item, index) => {
                                    return <div key={index}>
                                        <h5>Day {index + 1} : Total hours : {item.totalHours}</h5>
                                    </div>
                                })}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            }
        </Container>
    );
}

export default FormPage;

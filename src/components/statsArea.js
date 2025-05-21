import { Card, Col, Row } from "react-bootstrap";
import { calculateTotalHours } from "../helpers";

const StatsArea = ({ events, monthKey }) => {
    const { totalHours, totalShortHours, totalExtraHours, penaltyHours, netShortHours } = calculateTotalHours(events, monthKey);
    return (
        <Row className='mb-2'>
            <Col xs={12} sm={6} md={3} className='mb-2'>
                <MyCard title='Total Hours' value={`${totalHours.hours} hours ${totalHours.minutes} minutes`} />
            </Col>
            <Col xs={12} sm={6} md={3} className='mb-2'>
                <MyCard title='Total Short Hours' value={`${totalShortHours} hours`} />
            </Col>
            <Col xs={12} sm={6} md={3} className='mb-2'>
                <MyCard title='Penalty Hours' value={`${penaltyHours} hours`} />
            </Col>
            <Col xs={12} sm={6} md={3} className='mb-2'>
                <MyCard title='Total Extra Hours' value={`${totalExtraHours} hours`} />
            </Col>
            {netShortHours > 0?<Col xs={12} sm={12} md={12} className='mb-2'>
                <MyCard title='Net Short Hours (3 hours adj included)' value={`${netShortHours} hours`} />
            </Col>:null}
        </Row>
    );
}

export default StatsArea;

const MyCard = ({ title, value }) => {
    return (
        <Card className='rounded-1 bg_fr border-0 text_light'>
            <Card.Body className='text-center' >
                <h5 className='border-bottom border-light pb-2'>{title}</h5>
                <h5>{value}</h5>
            </Card.Body>
        </Card>
    )
}
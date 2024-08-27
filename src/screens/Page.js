import React, { useContext, useEffect, useState } from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';
import { AppContext } from '../context';
import moment from 'moment';
import { IconButton } from '../components';
import { FaPen } from 'react-icons/fa';
import { MdClose, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { Utils } from '../utils';
import { CLEAR_EVENT, HANDLE_EVENT } from '../reducer';

function Page() {
    const { state, dispatch } = useContext(AppContext);
    const [currentMonth, setCurrentMonth] = useState(moment().date() >= 26 ? moment() : moment().subtract(1, 'month')); // Custom month logic
    const monthKey = currentMonth.clone().add(1, 'month').format('MMMM-YYYY')
    const [calendar, setCalendar] = React.useState([]);
    const { events } = state

    useEffect(() => {
        generateCalendar(currentMonth);
    }, [currentMonth]);

    const generateCalendar = (month) => {
        const startOfMonth = month.clone().date(26);
        const endOfMonth = month.clone().add(1, 'month').date(25);

        let startDate = startOfMonth.clone().startOf('week');
        let endDate = endOfMonth.clone().endOf('week');

        let day = startDate.clone();
        let calendarDays = [];

        // Generate weeks
        while (day.isBefore(endDate, 'day')) {
            const week = Array(7).fill(null).map(() => {
                const dayClone = day.clone();
                const isInactive = dayClone.isBefore(startOfMonth, 'day') || dayClone.isAfter(endOfMonth, 'day');
                day.add(1, 'day');
                return { date: dayClone, isInactive };
            });
            calendarDays.push(week);
        }

        setCalendar(calendarDays);
    };


    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => prevMonth.clone().subtract(1, 'month'));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => prevMonth.clone().add(1, 'month'));
    };

    const handleTimeChange = (date, timeType, value) => {
        // Update the event in the state
        const updatedEvent = { ...events?.[monthKey]?.[date], [timeType]: value };

        if (updatedEvent.inTime && updatedEvent.outTime) {
            const { hours, minutes } = getTimeDifference(updatedEvent.inTime, updatedEvent.outTime);

            updatedEvent.totalTime = {
                hours,
                minutes
            };
            // Determine if the hours should be counted as short or extra
            if (hours < 9) {
                updatedEvent.shortHours = 9 - hours;
                updatedEvent.extraHours = 0;
            } else if (hours > 9) {
                updatedEvent.shortHours = 0;
                updatedEvent.extraHours = hours - 9;
            } else {
                updatedEvent.shortHours = 0;
                updatedEvent.extraHours = 0;
            }
        } else {
            updatedEvent.shortHours = 0;
            updatedEvent.extraHours = 0;
        }

        dispatch({
            type: HANDLE_EVENT,
            payload: {
                month: monthKey,
                date,
                event: updatedEvent,
            }
        });
    };

    // New function to clear the event
    const clearEvent = (date) => {
        dispatch({
            type: CLEAR_EVENT,
            payload: { month: monthKey, date }
        });
    };


    const getTimeDifference = (time1, time2) => {
        const [hours1, minutes1] = time1.split(':').map(Number);
        const [hours2, minutes2] = time2.split(':').map(Number);

        const date1 = new Date(0, 0, 0, hours1, minutes1);
        const date2 = new Date(0, 0, 0, hours2, minutes2);

        const diffInMs = date2 - date1;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

        return { hours: diffInHours, minutes: diffInMinutes };
    };

    const calculateTotalHours = () => {
        let totalHours = { hours: 0, minutes: 0 };
        let totalShortHours = 0;
        let totalExtraHours = 0;
        let adjustmentHours = 3;

        Object.values(events?.[monthKey] || {}).forEach(event => {
            if (event.inTime && event.outTime) {
                const { hours, minutes } = event?.totalTime || {};

                // Aggregate total hours
                totalHours.hours += hours;
                totalHours.minutes += minutes;

                // Adjust minutes if they exceed 60
                if (totalHours.minutes >= 60) {
                    totalHours.hours += Math.floor(totalHours.minutes / 60);
                    totalHours.minutes = totalHours.minutes % 60;
                }

                // Sum up short and extra hours
                totalShortHours += event.shortHours || 0;
                totalExtraHours += event.extraHours || 0;
            }
        });

        totalShortHours = totalShortHours > 0 ? (totalShortHours <= 3 ? 3 - totalShortHours : totalShortHours - 3) : 0

        adjustmentHours = totalShortHours > totalExtraHours ? (totalShortHours - totalExtraHours <= 3 ? (3 - (totalShortHours - totalExtraHours) || 3) : 0) : 3

        return { totalHours, totalShortHours, totalExtraHours, adjustmentHours };
    };

    const { totalHours, totalShortHours, totalExtraHours, adjustmentHours } = calculateTotalHours();

    return (
        <Container fluid className='py-4'>
            {/* stats */}
            <Row className='mb-4'>
                <Col xs={12} sm={6} md={3}>
                    <MyCard title='Total Hours' value={`${totalHours.hours} hours ${totalHours.minutes} minutes`} />
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <MyCard title='Total Short Hours' value={`${totalShortHours} hours`} />
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <MyCard title='Total Extra Hours' value={`${totalExtraHours} hours`} />
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <MyCard title='Adjustment Hours' value={`${adjustmentHours} hours`} />
                </Col>
            </Row>
            <Row className='mb-4'>
                <Col>
                    <Card>
                        <Card.Body>
                            <div className='d-flex align-items-center justify-content-center gap-3'>
                                <MyItem title='Day complete' color='bg-success' />
                                <MyItem title='Day short' color='bg-danger' />
                                <MyItem title='Day complete with extra hour' color='bg-info' />
                                <MyItem title='Day incomplete' color='bg-warning' />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* month */}
            <Row className='mb-4'>
                <Col>
                    <Card>
                        <Card.Body>
                            <div className='d-flex align-items-center justify-content-center gap-2'>
                                <IconButton onClick={goToPreviousMonth} title='Previous Month' icon={<MdKeyboardArrowLeft />} sx='border-0' />
                                <h5 className='text-center mb-0 fw-bold fs-4'>
                                    {currentMonth.clone().add(1, 'month').format('MMMM YYYY')}</h5>
                                <IconButton onClick={goToNextMonth} title='Next Month' icon={<MdKeyboardArrowRight />} sx='border-0' />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* calender */}
            <Row className='mb-4'>
                <Col>
                    <Table striped bordered>
                        <thead>
                            <tr>
                                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                                    <th key={day} className='my_grid_item' style={{ width: window.innerWidth / 7 }}>
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {calendar.map((week, i) => (
                                <tr key={i}>
                                    {week.map((day, idx) => (
                                        <TdComponent day={day} key={idx} monthKey={monthKey} events={events} handleTimeChange={handleTimeChange} isSunday={idx === 0} clearEvent={clearEvent} />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}

export default Page;


const MyItem = ({ title, color }) => {
    return (
        <div className='d-flex align-items-center justify-content-center gap-1'>
            <span className={`${color} d-inline-block rounded`} style={{ width: 25, height: 10 }}></span>
            <span className='fw-bold' style={{ fontSize: "12px" }}>{title}</span>
        </div>
    )
}

const MyCard = ({ title, value }) => {
    return (
        <Card>
            <Card.Body className='text-center'>
                <h5 className='border-bottom border-secondary pb-2'>{title}</h5>
                <h5>{value}</h5>
            </Card.Body>
        </Card>
    )
}

const TdComponent = ({ monthKey, day, events, handleTimeChange, isSunday, clearEvent }) => {
    const [isEditable, setIsEditable] = useState(false);
    const inputId1 = Utils.generateId();
    const inputId2 = Utils.generateId();

    const today = moment(); // Get today's date
    const { date, isInactive } = day;

    const isFutureDay = date.isAfter(today, 'day'); // Check if the day is in the future
    const { inTime, outTime, shortHours, extraHours, totalTime } = events?.[monthKey]?.[date.format('YYYY-MM-DD')] || {}

    const tdColor = shortHours ? 'bg-danger text-light' : extraHours ? 'bg-info  text-light' : (inTime && outTime) ? 'bg-success  text-light' : (inTime && !outTime) ? 'bg-warning text-light' : ''

    const isDisabled = isSunday || isFutureDay || isInactive

    return (
        <td className={tdColor}>
            <div>
                <div className='d-flex align-items-center justify-content-between gap-1'>
                    <p className='mb-0 fw-bold'>{date.format('D')}</p>
                    {!isDisabled ? (
                        <IconButton
                            sx='border-0'
                            sm
                            onClick={() => setIsEditable(!isEditable)}
                            icon={isEditable ? <MdClose style={{ fontSize: '14px' }} /> : <FaPen style={{ fontSize: '12px' }} />}
                        />
                    ) : null}
                </div>

                {isDisabled ? (
                    <></>
                ) : !isEditable ? (
                    <>
                        <p className='mb-1'>In : {inTime || '--:--'}</p>
                        <p className='mb-0'>Out : {outTime || '--:--'}</p>
                        {shortHours ?
                            <p className='mb-0'>Short : {shortHours}</p> : <></>
                        }
                        {extraHours ?
                            <p className='mb-0'>Extra : {extraHours}</p> : <></>
                        }
                        {Object.keys(totalTime || {}).length ?
                            <p className='mb-0'>Total Time : {totalTime.hours + ' Hours ' + totalTime.minutes + ' Minutes'}</p> : <></>
                        }
                    </>
                ) : (
                    <>
                        <div className='mb-1'>
                            <label className='w-25' htmlFor={inputId1}>In</label>:&nbsp;
                            <input
                                id={inputId1}
                                type="time"
                                className='border-0 rounded-1 px-2'
                                value={inTime || ''}
                                onChange={(e) => handleTimeChange(date.format('YYYY-MM-DD'), 'inTime', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className='w-25' htmlFor={inputId2}>Out</label>:&nbsp;
                            <input
                                id={inputId2}
                                type="time"
                                value={outTime || ''}
                                className='border-0 rounded-1 px-2'
                                onChange={(e) => handleTimeChange(date.format('YYYY-MM-DD'), 'outTime', e.target.value)}
                            />
                        </div>
                        <div>
                            <button
                                type="button"
                                className='mt-3 ms-auto d-block px-2 py-1 border-0 rounded-1'
                                onClick={() => clearEvent(date.format('YYYY-MM-DD'))}
                            >Clear Event</button>
                        </div>
                    </>
                )}
            </div>
        </td>
    );
};

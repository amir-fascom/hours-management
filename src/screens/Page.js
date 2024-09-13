import React, { useContext, useEffect, useRef, useState } from 'react';
import { Badge, Card, Col, Container, Row, Table } from 'react-bootstrap';
import { AppContext } from '../context';
import moment from 'moment';
import { IconButton, PrimaryButton } from '../components';
import { FaPen } from 'react-icons/fa';
import { MdClose, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { Utils } from '../utils';
import { CLEAR_EVENT, HANDLE_EVENT, INITIALIZE_EVENTS, MARK_ABSENT } from '../reducer';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../fire';

function Page() {
    const { state, dispatch } = useContext(AppContext);
    const _cm = moment().date() >= 26 ? moment().subtract(1, 'month').format("MMMM-YYYY") : moment().format("MMMM-YYYY");
    const [currentMonth, setCurrentMonth] = useState(moment().date() >= 26 ? moment().subtract(1, 'month') : moment());
    const monthKey = currentMonth.clone().format('MMMM-YYYY')
    const [calendar, setCalendar] = React.useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { events, user } = state
    const ref = useRef(null)

    useEffect(() => {
        generateCalendar(currentMonth);
    }, [currentMonth]);

    useEffect(() => {
        if (ref.current === 'fetchPrevMonthData') {
            fetchData(monthKey);
        }
        ref.current = null
    }, [monthKey]);

    const fetchData = async (month) => {
        try {
            // Get a reference to the collection
            const docRef = doc(db, user.uid, month);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                dispatch({
                    type: INITIALIZE_EVENTS,
                    payload: { [month]: data }
                });
            } else {
                console.log('No such document!');
            }
        } catch (e) {
            console.error("Error getting document: ", e);
            window.alert("Unable to get Events.\nUnexpected Error occurred.")
        }
    };

    const generateCalendar = (month) => {
        const startOfMonth = month.clone().subtract(1, 'month').date(26);
        const endOfMonth = month.clone().date(25);

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
        ref.current = 'fetchPrevMonthData'
        setCurrentMonth(prevMonth => prevMonth.clone().subtract(1, 'month'));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => prevMonth.clone().add(1, 'month'));
    };

    const handleTimeChange = (date, timeType, value) => {
        // Update the event in the state
        const updatedEvent = { ...events?.[monthKey]?.[date], [timeType]: value };
        if (updatedEvent.inTime) {
            const [hours, minutes] = updatedEvent.inTime.split(':').map(Number);
            if (hours >= 11 && minutes > 0) {
                updatedEvent.penalty = 1;
            } else {
                updatedEvent.penalty = 0;
            }
        }
        if (updatedEvent.inTime && updatedEvent.outTime) {
            const { hours, minutes } = getTimeDifference(updatedEvent.inTime, updatedEvent.outTime);
            const _hour = minutes < 60 && minutes >= 50 ? hours + 1 : hours

            updatedEvent.totalTime = {
                hours,
                minutes
            };
            // Determine if the hours should be counted as short or extra
            if (_hour < 9) {
                updatedEvent.shortHours = 9 - _hour;
                updatedEvent.extraHours = 0;
            } else if (_hour > 9) {
                updatedEvent.shortHours = 0;
                updatedEvent.extraHours = _hour - 9;
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

    const markAbsent = (date) => {
        const { absent = 0 } = events?.[monthKey]?.[date] || {}
        dispatch({
            type: MARK_ABSENT,
            payload: {
                month: monthKey,
                date,
                event: {
                    absent: absent ? 0 : 1
                }
            }
        });
    }

    const markHoliday = (date) => {
        const { publicHoliday = 0 } = events?.[monthKey]?.[date] || {}
        dispatch({
            type: MARK_ABSENT,
            payload: {
                month: monthKey,
                date,
                event: {
                    publicHoliday: publicHoliday ? 0 : 1
                }
            }
        });
    }
    const handleReason = (date, text) => {
        const event = events?.[monthKey]?.[date] || {}
        dispatch({
            type: MARK_ABSENT,
            payload: {
                month: monthKey,
                date,
                event: {
                    ...event,
                    reason: text
                }
            }
        });
    }

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
        let penaltyHours = 0;
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
                penaltyHours += event.penalty || 0;
            }
        });

        return { totalHours, totalShortHours, totalExtraHours, adjustmentHours, penaltyHours };
    };

    const saveEventToDB = async () => {
        setIsLoading(true)
        try {
            await setDoc(doc(db, user.uid, monthKey), events[monthKey]);
            alert("Events successfully saved to Firestore!");
        } catch (error) {
            console.error("Error saving event to Firestore:", error);
            alert("Error saving events to Firestore.");
        } finally {
            setIsLoading(false)
        }
    };

    const { totalHours, totalShortHours, totalExtraHours, adjustmentHours, penaltyHours } = calculateTotalHours();

    return (
        <Container fluid className='py-4'>
            {/* stats */}
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
                {/* <Col xs={12} sm={6} md={3} className='mb-2'>
                    <MyCard title='Adjustment Hours' value={`${adjustmentHours} hours`} />
                </Col> */}
            </Row>
            <Row className='mb-4 d-none d-md-flex'>
                <Col>
                    <Card>
                        <Card.Body>
                            <div className='d-flex align-items-center justify-content-center gap-3'>
                                <MyItem title='Day complete' color='success' />
                                <MyItem title='Day complete with extra hour' color='info' />
                                <MyItem title='Day incomplete' color='warning' />
                                <MyItem title='Day short' color='danger' />
                                <MyItem title='Day Off || Public Holiday' color='secondary' />
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
                                    {currentMonth.clone().format('MMMM YYYY')}</h5>
                                {_cm === monthKey ? <></> : <IconButton onClick={goToNextMonth} title='Next Month' icon={<MdKeyboardArrowRight />} sx='border-0' />}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* calender */}
            <Row className='mb-4'>
                <Col>
                    <Table striped bordered responsive style={{ minWidth: '1200px' }}>
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
                                        <TdComponent day={day} key={idx} disableEditing={_cm !== monthKey} monthKey={monthKey} events={events} handleTimeChange={handleTimeChange} isSunday={idx === 0} clearEvent={clearEvent} markAbsent={markAbsent} markHoliday={markHoliday} handleReason={handleReason} />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            <PrimaryButton title='Save Event' isLoading={isLoading} sx='ms-auto d-block' onClick={saveEventToDB} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Page;


const MyItem = ({ title, color }) => {
    return <Badge bg={color}>
        {title}
    </Badge>
}

const MyCard = ({ title, value }) => {
    return (
        <Card>
            <Card.Body className='text-center' >
                <h5 className='border-bottom border-secondary pb-2'>{title}</h5>
                <h5>{value}</h5>
            </Card.Body>
        </Card>
    )
}

const TdComponent = ({ monthKey, day, events, handleTimeChange, markAbsent, markHoliday, handleReason, isSunday, clearEvent, disableEditing }) => {
    const [isEditable, setIsEditable] = useState(false);

    const today = moment();
    const { date, isInactive } = day;

    const isFutureDay = date.isAfter(today, 'day');
    const { inTime, outTime, shortHours, extraHours, penalty, totalTime, absent, reason, publicHoliday } = events?.[monthKey]?.[date.format('YYYY-MM-DD')] || {}
    console.log("🚀 ~ TdComponent ~ penalty:", penalty)

    const tdColor = shortHours ? 'bg-danger text-light' : extraHours ? 'bg-info  text-light' : (inTime && outTime) ? 'bg-success  text-light' : (inTime && !outTime) ? 'bg-warning text-light' : (absent || publicHoliday) ? 'bg-secondary text-light' : ''

    const isDisabled = isSunday || isFutureDay || isInactive || disableEditing

    return (
        <td className={tdColor}>
            <div>
                <div className='d-flex align-items-center justify-content-between gap-1'>
                    <p className='mb-0 fw-bold'>{date.format('D')}</p>
                    <ConditionalTag condition={!isDisabled}>
                        <IconButton
                            sx='border-0'
                            sm
                            onClick={() => setIsEditable(!isEditable)}
                            icon={isEditable ? <MdClose style={{ fontSize: '14px' }} /> : <FaPen style={{ fontSize: '12px' }} />}
                        />
                    </ConditionalTag>
                </div>
                <ConditionalTag condition={!isDisabled}>
                    <ConditionalTag condition={!isEditable}>
                        <ConditionalTag condition={!absent && !publicHoliday}>
                            <p className='mb-0'>In : {inTime || '--:--'}</p>
                            <p className='mb-0'>Out : {outTime || '--:--'}</p>
                        </ConditionalTag>
                        <ConditionalTag condition={shortHours}>
                            <p className='mb-0'>Short : {shortHours}</p>
                        </ConditionalTag>                        
                        <ConditionalTag condition={extraHours}>
                            <p className='mb-0'>Extra : {extraHours}</p>
                        </ConditionalTag>
                        <ConditionalTag condition={absent}>
                            <p className='mb-0'>Absent : {absent}</p>
                        </ConditionalTag>
                        <ConditionalTag condition={publicHoliday}>
                            <p className='mb-0'>Public Holiday : {publicHoliday}</p>
                        </ConditionalTag>
                        <ConditionalTag condition={reason}>
                            <p className='mb-0'>{reason}</p>
                        </ConditionalTag>
                        <ConditionalTag condition={Object.keys(totalTime || {}).length}>
                            <p className='mb-0'>Total Time : {totalTime?.hours + ' Hours ' + totalTime?.minutes + ' Minutes'}</p>
                        </ConditionalTag>
                        <ConditionalTag condition={penalty}>
                            <p className='mb-0 bg-light text-danger text-center mt-2'>Penalty : {penalty} hour</p>
                        </ConditionalTag>
                    </ConditionalTag>
                    <ConditionalTag condition={isEditable}>
                        <ConditionalTag condition={!absent && !publicHoliday}>
                            <InputField
                                label='In'
                                value={inTime || ''}
                                onChange={(e) => handleTimeChange(date.format('YYYY-MM-DD'), 'inTime', e.target.value)}
                            />
                            <InputField
                                label='Out'
                                value={outTime || ''}
                                onChange={(e) => handleTimeChange(date.format('YYYY-MM-DD'), 'outTime', e.target.value)}
                            />
                        </ConditionalTag>
                        <CheckBox
                            label='Absent'
                            checked={absent || 0}
                            onChange={(e) => markAbsent(date.format('YYYY-MM-DD'))}
                        />
                        <CheckBox
                            label='Public Holiday'
                            checked={publicHoliday || 0}
                            onChange={(e) => markHoliday(date.format('YYYY-MM-DD'))}
                        />
                        <ConditionalTag condition={absent || publicHoliday}>
                            <TextArea
                                label="Reason"
                                value={reason || ''}
                                onChange={(e) => handleReason(date.format('YYYY-MM-DD'), e.target.value)}
                            />
                        </ConditionalTag>
                        <div className='mt-2 d-flex gap-1 justify-content-end align-items-end'>
                            <button
                                type="button"
                                className='d-block px-2 py-1 border-0 rounded-1'
                                onClick={() => clearEvent(date.format('YYYY-MM-DD'))}
                            >Clear Event</button>
                        </div>
                    </ConditionalTag>
                </ConditionalTag>
            </div>
        </td >
    );
};


const ConditionalTag = ({ condition, children }) => {
    return condition ? children : <></>
}

const InputField = ({ label, ...props }) => {
    const inputId = Utils.generateId()
    return <div className='mb-1'>
        <label className='w-25' htmlFor={inputId}>{label}</label>:&nbsp;
        <input
            type="time"
            id={inputId}
            className='border-0 rounded-1 px-2'
            {...props}
        />
    </div>
}

const CheckBox = ({ label, ...props }) => {
    const checkboxId = Utils.generateId()
    return <div className='mb-1'>
        <label className='w-25' htmlFor={checkboxId}>{label}</label>:&nbsp;
        <input
            id={checkboxId}
            type="checkbox"
            {...props}
        />
    </div>
}

const TextArea = ({ label, ...props }) => {
    const textId3 = Utils.generateId()
    return <div className='mb-1' >
        <label className='w-25' style={{ verticalAlign: "top" }} htmlFor={textId3}>{label}</label><span style={{ verticalAlign: "top" }}>:</span>&nbsp;
        <textarea
            id={textId3}
            className='border-0 rounded-1 px-2'
            {...props}
        />
    </div>
}
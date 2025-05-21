import React, { useContext, useEffect, useRef, useState } from 'react';
import { Badge, Card, Col, Container, Row, Table } from 'react-bootstrap';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { IconButton, PrimaryButton, StatsArea, TdComponent } from '../components';
import { CLEAR_EVENT, HANDLE_EVENT, INITIALIZE_EVENTS, MARK_ABSENT } from '../reducer';
import { db } from '../fire';
import { generateCalendar, getCurrentMonth, handleEventChange } from '../helpers';
import { AppContext } from '../context';
import { ToastContext } from '../context/toastContext';

function Page() {
    const { state, dispatch } = useContext(AppContext);
    const { addToast } = useContext(ToastContext);
    const { currentMonth: cm } = getCurrentMonth()
    const _cm = cm.clone().format('MMMM-YYYY')
    const [currentMonth, setCurrentMonth] = useState(cm);
    const monthKey = currentMonth.clone().format('MMMM-YYYY')
    const [calendar, setCalendar] = React.useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEventLoading, setIsEventLoading] = useState(false);
    const { events, user } = state
    const ref = useRef(null)

    useEffect(() => {
        generateCalendar(currentMonth, setCalendar);
    }, [currentMonth]);

    useEffect(() => {
        if (ref.current === 'pageLoaded' && !events?.[monthKey]) {
            fetchData(monthKey);
        }
        ref.current = 'pageLoaded'
    }, [monthKey]);

    const fetchData = async (month) => {
        try {
            // Get a reference to the collection
            setIsEventLoading(true)
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
            addToast({
                type: 'error',
                message: 'Unable to get Events. Unexpected Error occurred.',
                duration: 3000,
            });
        } finally {
            setIsEventLoading(false)
        }
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => prevMonth.clone().subtract(1, 'month'));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => prevMonth.clone().add(1, 'month'));
    };

    const handleTimeChange = (date, timeType, value) => {
        const event = handleEventChange({ date, timeType, value, monthKey, events })
        dispatch({
            type: HANDLE_EVENT,
            payload: {
                month: monthKey,
                date,
                event,
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

    const handleNote = (date, text) => {
        const event = events?.[monthKey]?.[date] || {}
        dispatch({
            type: HANDLE_EVENT,
            payload: {
                month: monthKey,
                date,
                event: {
                    ...event,
                    note: text
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

    const saveEventToDB = async () => {
        setIsLoading(true)
        try {
            await setDoc(doc(db, user.uid, monthKey), events[monthKey]);
            addToast({
                type: 'message',
                message: 'Events successfully saved to Firestore!',
                duration: 3000,
            });
        } catch (error) {
            console.error("Error saving event to Firestore:", error);
            addToast({
                type: 'error',
                message: 'Error saving events to Firestore.',
                duration: 3000,
            });
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <Container fluid className='py-4'>
            {/* stats */}
            <StatsArea events={events} theme={state.theme} monthKey={monthKey} />
            <Row className='mb-4 d-none d-md-flex'>
                <Col>
                    <Card className='rounded-1 bg_fr border-0'>
                        <Card.Body>
                            <div className='d-flex align-items-center justify-content-center gap-3'>
                                <Badge bg='success'>
                                    Day complete
                                </Badge>
                                <Badge bg='info'>
                                    Day complete with extra hour
                                </Badge>
                                <Badge bg='warning'>
                                    Day incomplete
                                </Badge>
                                <Badge bg='danger'>
                                    Day short
                                </Badge>
                                <Badge bg='secondary'>
                                    Absent OR Public Holiday
                                </Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* month */}
            <Row className='mb-4'>
                <Col>
                    <Card className='rounded-1 bg_fr border-0 text_light'>
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
                    <Table hover borderless responsive style={{ minWidth: '1200px' }}>
                        <thead>
                            <tr>
                                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                                    <th key={day} className='bg_fr text_light' style={{ width: window.innerWidth / 7 }}>
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {calendar.map((week, i) => (
                                <tr key={i}>
                                    {week.map((day, idx) => (
                                        <TdComponent
                                            day={day}
                                            key={idx}
                                            hideEditButton={_cm !== monthKey}
                                            monthKey={monthKey}
                                            events={events}
                                            theme={state.theme}
                                            handleTimeChange={handleTimeChange}
                                            isSunday={idx === 0}
                                            clearEvent={clearEvent}
                                            markAbsent={markAbsent}
                                            markHoliday={markHoliday}
                                            handleReason={handleReason}
                                            handleNote={handleNote}
                                            isLoading={isEventLoading}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card className='rounded-1 border-0 bg_fr'>
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
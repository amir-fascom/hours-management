import { useState } from "react";
import ConditionalTag from "./conditionalTag";
import IconButton from "./iconButton";
import InputField from "./inputField";
import TextArea from "./textArea";
import moment from "moment";
import { FaPen } from 'react-icons/fa';
import { MdClose } from "react-icons/md";
import CheckBox from "./checkBox";
import { Placeholder } from "react-bootstrap";

const TdComponent = ({
    monthKey,
    day,
    events,
    handleTimeChange,
    markAbsent,
    markHoliday,
    handleReason,
    handleNote,
    theme,
    isSunday,
    clearEvent,
    hideEditButton,
    isLoading }) => {
    const [isEditable, setIsEditable] = useState(false);

    const today = moment();
    const { date, isInactive } = day;

    const isFutureDay = date.isAfter(today, 'day');
    const { inTime, outTime, shortHours, extraHours, penalty, totalTime, absent, reason, note, publicHoliday } = events?.[monthKey]?.[date.format('YYYY-MM-DD')] || {}

    const tdColor = shortHours ? 'bg-danger' : extraHours ? 'bg-info ' : (inTime && outTime) ? 'bg-success ' : (inTime && !outTime) ? 'bg-warning' : (absent || publicHoliday) ? 'bg-secondary' : 'bg_fr'

    const isDisabled = isSunday || isFutureDay || isInactive

    return (
        <td className={`${!!theme ? 'text_light' : 'text-light'} ${tdColor}`}>
            <div>
                <div className='d-flex align-items-center justify-content-between gap-1'>
                    <p className={`mb-0 fw-bold ${theme==='' && tdColor === 'bg_fr' ? 'text-dark' : ''}`}>{date.format('D')}</p>
                    <ConditionalTag condition={!isDisabled && !hideEditButton}>
                        <IconButton
                            sx='border-0'
                            sm
                            onClick={() => setIsEditable(!isEditable)}
                            icon={isEditable ? <MdClose style={{ fontSize: '14px' }} /> : <FaPen style={{ fontSize: '12px' }} />}
                        />
                    </ConditionalTag>
                </div>
                {isLoading ?
                    <>
                        <Placeholder xs={12} />
                        <Placeholder xs={12} />
                        <Placeholder xs={12} />
                        <Placeholder xs={12} />
                    </> :
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
                                <p className='mb-0'>Reason : {reason}</p>
                            </ConditionalTag>
                            <ConditionalTag condition={note}>
                                <p className='mb-0'>Note : {note}</p>
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
                                <TextArea
                                    label="Note"
                                    value={note || ''}
                                    onChange={(e) => handleNote(date.format('YYYY-MM-DD'), e.target.value)}
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
                    </ConditionalTag>}
            </div>
        </td >
    );
};

export default TdComponent
import { Utils } from "../utils";

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

export default InputField;
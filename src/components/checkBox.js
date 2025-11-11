import { Utils } from "../utils";

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

export default CheckBox;
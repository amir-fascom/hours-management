import { Utils } from "../utils"

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

export default TextArea;
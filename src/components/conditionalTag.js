const ConditionalTag = ({ condition, children }) => {
    return condition ? children : <></>
}

export default ConditionalTag
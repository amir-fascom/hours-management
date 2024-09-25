import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import PrimaryButton from "./primaryButton";
import { useContext, useState } from "react";
import { ToastContext } from "../context/toastContext";
import { Container, Form } from "react-bootstrap";
import { LOGIN } from "../reducer";

const AuthContainer = ({ auth, dispatch }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useContext(ToastContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true)
        if (isLogin) {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    dispatch({ type: LOGIN, payload: user })
                })
                .catch((error) => {
                    addToast({
                        type: 'error',
                        message: error.message,
                        duration: 3000,
                    });
                    setIsLoading(false)
                });
        } else {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    dispatch({ type: LOGIN, payload: user })
                })
                .catch((error) => {
                    addToast({
                        type: 'error',
                        message: error.message,
                        duration: 3000,
                    });
                    setIsLoading(false)
                });
        }
    }

    return (
        <Container fluid style={{ minHeight: '100vh' }}>
            <Form onSubmit={handleSubmit} className='mx-auto px-2 py-4 bg-light shadow mt-2' style={{ maxWidth: '550px' }}>
                <p className='fs-5 fw-semibold text-center mb-4'>Hours Management System</p>
                <div className='d-flex align-items-center justify-content-center mb-3 gap-2'>
                    <Form.Check
                        inline
                        label="Login"
                        name="group1"
                        type='radio'
                        id='login'
                        checked={isLogin}
                        onChange={() => setIsLogin(true)}
                    />
                    <Form.Check
                        inline
                        label="Register"
                        name="group1"
                        type='radio'
                        id='register'
                        checked={!isLogin}
                        onChange={() => setIsLogin(false)}
                    />
                </div>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Control type="email" required placeholder="Enter email" className='border-secondary rounded-0' value={email} onChange={e => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Control type="password" required placeholder="Password" className='border-secondary rounded-0' value={password} onChange={e => setPassword(e.target.value)} />
                </Form.Group>
                <div className='d-flex align-items-end justify-content-end'>
                    <PrimaryButton isLoading={isLoading} type='submit' title={isLogin ? 'Login' : 'Register'} />
                </div>
            </Form>
        </Container>
    )
}

export default AuthContainer;
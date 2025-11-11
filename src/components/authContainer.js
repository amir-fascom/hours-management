import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import PrimaryButton from "./primaryButton";
import { useContext, useState } from "react";
import { ToastContext } from "../context/toastContext";
import { Form, Stack } from "react-bootstrap";
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
        <Stack className="align-item-center p-2 justify-content-center" style={{ minHeight: '100vh' }}>
            <Form onSubmit={handleSubmit} className='mx-auto bg_fr px-4 py-5 rounded-1' style={{ width: "100%", maxWidth: '600px' }}>
                <p className='fs-3 fw-semibold text_light text-center mb-4'>Hours Management System</p>
                <div className='d-flex align-items-center justify-content-center mb-3 gap-2'>
                    <Form.Check
                        inline
                        label="Login"
                        name="group1"
                        type='radio'
                        id='login'
                        className="text_light"
                        checked={isLogin}
                        onChange={() => setIsLogin(true)}
                    />
                    <Form.Check
                        inline
                        label="Register"
                        name="group1"
                        type='radio'
                        id='register'
                        className="text_light"
                        checked={!isLogin}
                        onChange={() => setIsLogin(false)}
                    />
                </div>
                <Form.Group className="mb-2" controlId="formBasicEmail">
                    <Form.Control type="email" required placeholder="Enter email" className='border-secondary rounded-1' value={email} onChange={e => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Control type="password" required placeholder="Password" className='border-secondary rounded-1' value={password} onChange={e => setPassword(e.target.value)} />
                </Form.Group>
                <div className='d-flex align-items-center justify-content-center'>
                    <PrimaryButton isLoading={isLoading} sx='w-25' type='submit' title={isLogin ? 'Login' : 'Register'} />
                </div>
            </Form>
        </Stack >
    )
}

export default AuthContainer;
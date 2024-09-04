import React, { useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import moment from 'moment';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { db } from '../fire';
import { Header, PrimaryButton } from '../components';
import { AppContext } from '../context';
import { INITIALIZE_EVENTS, LOGIN, LOGIN_OUT } from '../reducer';

function Layout({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const { state, dispatch } = useContext(AppContext);
    const { isLogged, user } = state
    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch({ type: LOGIN, payload: user })
            } else {
                setIsLoading(false)
            }
        })
    }, []);

    useEffect(() => {
        if (isLogged) {
            fetchData();
        }
    }, [isLogged]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Get a reference to the collection
            const currentMonth = moment().date() >= 26 ? moment() : moment().subtract(1, 'month')
            const monthKey = currentMonth.clone().add(1, 'month').format('MMMM-YYYY')
            const docRef = doc(db, user.uid, monthKey);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                dispatch({
                    type: INITIALIZE_EVENTS,
                    payload: { [monthKey]: data }
                });
            } else {
                console.log('No such document!');
            }
        } catch (e) {
            console.error("Error getting document: ", e);
            window.alert("Unable to get Events.\nUnexpected Error occurred.")
        }
        finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            dispatch({ type: LOGIN_OUT })
        }).catch((error) => {
            // An error happened.
            window.alert("Unexpected Error occurred.")
        });
    }

    if (isLoading) {
        return (
            <div className='loader_container'>
                <div className='loader'></div>
            </div>
        );
    }

    return (
        <>
            <Header logout={logout} user={user} />
            {isLogged ? children : <AuthContainer auth={auth} dispatch={dispatch} />}
        </>
    );
}

export default Layout;

const AuthContainer = ({ auth, dispatch }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

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
                    const errorMessage = error.message;
                    window.alert(errorMessage)
                    setIsLoading(false)
                });
        } else {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    dispatch({ type: LOGIN, payload: user })
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    window.alert(errorMessage)
                    setIsLoading(false)
                });
        }
    }

    return (
        <Container fluid className='mt-5'>
            <Row>
                <Col>
                    <Card>
                        <Card.Body className='py-5'>
                            <Form onSubmit={handleSubmit} className='mx-auto' style={{ maxWidth: '550px' }}>
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
                                    <Form.Control type="email" required placeholder="Enter email" className='border-secondary' value={email} onChange={e => setEmail(e.target.value)} />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Control type="password" required placeholder="Password" className='border-secondary' value={password} onChange={e => setPassword(e.target.value)} />
                                </Form.Group>
                                <div className='d-flex align-items-end justify-content-end'>
                                    <PrimaryButton isLoading={isLoading} type='submit' title={isLogin ? 'Login' : 'Register'} />
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
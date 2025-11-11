import React, { useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from '../fire';
import { AuthContainer, Header } from '../components';
import { AppContext } from '../context';
import { INITIALIZE_EVENTS, LOGIN, LOGIN_OUT } from '../reducer';
import { getCurrentMonth } from '../helpers';
import { ToastContext } from '../context/toastContext';

function Layout({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const { state, dispatch } = useContext(AppContext);
    const { isLogged, user } = state
    const auth = getAuth();
    const { addToast } = useContext(ToastContext);

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
            const { monthKey } = getCurrentMonth()
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
            addToast({
                type: 'error',
                message: 'Unable to get Events. Unexpected Error occurred.',
                duration: 3000,
            });
        }
        finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        signOut(auth).then(() => {
            dispatch({ type: LOGIN_OUT })
        }).catch((error) => {
            console.error("🚀 ~ signOut ~ error:", error)
            addToast({
                type: 'error',
                message: 'Unexpected Error occurred.',
                duration: 3000,
            });
        });
    }

    if (isLoading) {
        return (
            <div className='loader_container'>
                <div className='loader'></div>
            </div>
        );
    }

    if (!isLogged) {
        return <AuthContainer auth={auth} dispatch={dispatch} />
    }

    return (
        <>
            <Header logout={logout} user={user} />
            {children}
        </>
    );
}

export default Layout;

import React from 'react';
import moment from "moment";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../fire';

const useEventApi = async () => {
    const [data, setData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    console.log("🚀 ~ useEventApi ~ isLoading:", isLoading)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('====================================');
                console.log("fetching Data");
                console.log('====================================');
                const currentMonth = moment().date() >= 26 ? moment() : moment().subtract(1, 'month')
                const monthKey = currentMonth.clone().add(1, 'month').format('MMMM-YYYY')
                const docRef = doc(db, 'events_new', monthKey);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setData({ [monthKey]: data });
                } else {
                    console.log('No such document!');
                }
            } catch (e) {
                console.error("Error adding document: ", e);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return { events: data, eventsLoading: isLoading }
}

export default useEventApi;
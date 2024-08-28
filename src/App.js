import { useEffect, useState } from 'react';
import { db } from './fire';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Page from './screens/Page';
import { AppStateProvider } from './context';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import moment from 'moment';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get a reference to the collection
        const currentMonth = moment().date() >= 26 ? moment() : moment().subtract(1, 'month')
        const monthKey = currentMonth.clone().add(1, 'month').format('MMMM-YYYY')
        const docRef = doc(db, 'events', monthKey);
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

  if (isLoading) {
    return (
      <div className='loader_container'>
        <div className='loader'></div>
      </div>
    );
  }

  return (
    <AppStateProvider data={data}>
      <Page />
    </AppStateProvider>
  );
}

export default App;

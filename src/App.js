import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Page from './screens/Page';
import Layout from './layout';
import { Toast } from './components';

function App() {
  return (
    <>
      <Layout>
        <Page />
      </Layout>
      <Toast />
    </>
  );
}

export default App;

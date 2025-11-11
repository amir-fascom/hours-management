import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Page from './screens/Page';
import Layout from './layout';
import { ThemeSelector, Toast } from './components';

function App() {
  return (
    <>
      <Layout>
        <Page />
      </Layout>
      <Toast />
      <ThemeSelector />
    </>
  );
}

export default App;

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Page from './screens/Page';
import { AppStateProvider } from './context';

function App() {
  return (
    <AppStateProvider>
      <Page />
    </AppStateProvider>
  );
}

export default App;

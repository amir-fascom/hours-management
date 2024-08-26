import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import FormPage from './screens/formPage';
import { FormStateProvider } from './context';

function App() {
  return (
    <FormStateProvider>
      <FormPage />
    </FormStateProvider>
  );
}

export default App;

import { CssBaseline } from '@mui/material';
// Router Provider
import MERNRouter from './routes/Router';

// Redux Provider
import { Provider } from 'react-redux';
import store from './store';
// Tostify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Clerk Authentication
import ClerkAuthProvider from './components/auth/ClerkAuthProvider';

function App() {
  return (
    <Provider store={store}>
      <ToastContainer />
      <CssBaseline />
      <ClerkAuthProvider>
        <MERNRouter />
      </ClerkAuthProvider>
    </Provider>
  );
}

export default App;

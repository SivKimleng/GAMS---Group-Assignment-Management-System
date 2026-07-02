import React from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { getUsers } from './services/api.js';

function App() {
  React.useEffect(() => {
    getUsers()
      .then((users) => {
        console.log('Backend /api/users connection test:', users);
      })
      .catch((error) => {
        console.error('Backend /api/users connection test failed:', error);
      });
  }, []);

  return <AppRoutes />;
}

export default App;

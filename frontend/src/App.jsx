import React from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { getHealth } from './services/api.js';

function App() {
  React.useEffect(() => {
    getHealth()
      .then((health) => {
        console.log('Backend /api/health connection test:', health);
      })
      .catch((error) => {
        console.error('Backend /api/health connection test failed:', error);
      });
  }, []);

  return <AppRoutes />;
}

export default App;

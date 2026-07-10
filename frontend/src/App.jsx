import React from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { getHealth } from './services/api.js';
import { cleanupDemoGroupStorage } from './utils/dataMappers.js';

function App() {
  React.useEffect(() => {
    cleanupDemoGroupStorage();

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

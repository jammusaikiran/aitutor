import React, { useEffect } from 'react';

const HomePage = () => {
  useEffect(() => {
    document.title = 'SMART LEARNING';
  }, []);

  return <div>Welcome to SMART LEARNING!</div>;
};

export default HomePage;

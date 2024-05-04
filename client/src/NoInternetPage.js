import React from 'react';
import noInternetImage from './nointernet.png'; // Import the image file

const NoInternetPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f0f0' }}>
      <div style={{ textAlign: 'center' }}>
        <img src={noInternetImage} alt="No Internet" style={{ width: '200px', marginBottom: '20px' }} />
        <h1>No Internet Connection</h1>
        <p>Please check your network settings and try again.</p>
      </div>
    </div>
  );
};

export default NoInternetPage;

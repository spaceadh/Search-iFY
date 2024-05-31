import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom'; // Import Routes
import Lottie from 'react-lottie';
// import SharedOpinion from './SharedOpinion';
// import Opinions from './Opinions';
import PromptPage from './PromptPage';
import NoInternetPage from './NoInternetPage'; 
import './App.css';
import loadinganimation1 from './handloadinganimation.json';
import loadinganimation2 from './personloadinganimation.json';
import loadinganimation3 from './robotloadinganimation.json';

const loadingAnimations = [loadinganimation1, loadinganimation2, loadinganimation3];

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAnimationIndex, setLoadingAnimationIndex] = useState(0);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loadingAnimations.length);
    setLoadingAnimationIndex(randomIndex);
  }, []);

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

     // // Check if it's not a mobile device and show warning page
     const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
     if (!isMobile) {
       setShowMobileWarning(true);
      //  setLoadingOpinions(false);
     }

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  if (showMobileWarning) {
    return (
      <div className="mobile-warning-container">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimations[loadingAnimationIndex],
          }}
          height={400}
          width={400}
        />
        <p>Heh, The creator decided to be petty and the application can only be used in a Mobile Device.</p>
      </div>
    );
  }

  return (
    <Router>
      {!isOnline && <NoInternetPage />}
      <Routes> {/* Use Routes instead of Route */}
        {/* <Route exact path="/" element={<Opinions />} />  */}
        {/* <Route path="/opinions/:id" element={<SharedOpinion />} />  */}
        <Route path="*" element={<Navigate to="/" />} /> 
        <Route exact path="/" element={<PromptPage />}/>
      </Routes>
    </Router>
  );
};

export default App;
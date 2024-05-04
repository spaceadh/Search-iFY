import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { get, ref, update, off } from 'firebase/database';
import { database } from './firebase';
import { Container, Card, CardContent, Button } from '@mui/material';
import { Twemoji } from 'react-emoji-render';
import 'react-toastify/dist/ReactToastify.css';
import Lottie from 'react-lottie';
import animationData from './cryinganimation.json'; // Import your Lottie animation JSON file
import loadinganimation1 from './handloadinganimation.json';
import loadinganimation2 from './personloadinganimation.json';
import loadinganimation3 from './robotloadinganimation.json';
import './App.css';

const loadingAnimations = [loadinganimation1, loadinganimation2, loadinganimation3];

function SharedOpinion() {
  const { id } = useParams(); 
  // console.log(id);
  const navigate = useNavigate();
  const [opinion, setOpinion] = useState(null);
  const [loadingAnimationIndex, setLoadingAnimationIndex] = useState(0); // State to store the index of the chosen loading 

  const [loadingOpinion, setLoadingOpinion] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [likedOpinionId, setLikedOpinionId] = useState(null);
  const [isDisLiking, setIsDisLiking] = useState(false);
  const [isDislikedOpinionId, setDislikedOpinionId] = useState(null);
  const [isLit, setIsLit] = useState(false);
  const [isLitOpinionId, setLitOpinionId] = useState(null);
  const [showMobileWarning, setShowMobileWarning] = useState(false); 
  const [isSkeleton, setIsSkeleton] = useState(false);
  const [isSkeletonId, setisSkeletonId] = useState(null);
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loadingAnimations.length);
    setLoadingAnimationIndex(randomIndex);
  }, []);

  useEffect(() => {
    const opinionRef = ref(database, 'opinions/' + id);
    const fetchData = async () => {
      try {
        const snapshot = await get(opinionRef);
        const opinionData = snapshot.val();
        if (opinionData) {
          const formattedOpinion = {
            id,
            text: opinionData.text,
            likes: opinionData.likes || 0,
            dislikes: opinionData.dislikes || 0,
            lit: opinionData.lit || 0,
            skeleton: opinionData.skeleton || 0,
            timestamp: opinionData.timestamp,
          };
          setOpinion(formattedOpinion);
        } else {
          // Navigate to root route if the specified ref does not exist
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching opinion:', error);
      } finally {
        setLoadingOpinion(false);
      }
    };    
    fetchData();

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      setShowMobileWarning(true);
      setLoadingOpinion(false);
    }
    return () => {
      off(opinionRef);
    };
  }, [navigate, id]); // Include navigate and id in the dependency array

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  
  const handleLike = async (id) => {
    try {
      setIsLiking(true);
      setLikedOpinionId(id);
      const opinionRef = ref(database, `opinions/${id}`);
      const snapshot = await get(opinionRef);
      const opinionData = snapshot.val();
      if (opinionData && typeof opinionData.likes === 'number') {
        await update(opinionRef, { likes: opinionData.likes + 1 }, { merge: true });
        setOpinion(prevOpinion => ({ ...prevOpinion, likes: prevOpinion.likes + 1 }));
      }
    } catch (error) {
      console.error('Error liking opinion:', error);
    } finally {
      setIsLiking(false);
      setLikedOpinionId(null);
    }
  };  
  
  const handleDislike = async (id) => {
    try {
      setIsDisLiking(true);
      setDislikedOpinionId(id);
      const opinionRef = ref(database, `opinions/${id}`);
      const snapshot = await get(opinionRef);
      const opinionData = snapshot.val();
      if (opinionData && typeof opinionData.dislikes === 'number') {
        await update(opinionRef, { dislikes: opinionData.dislikes + 1 }, { merge: true });
        setOpinion(prevOpinion => ({ ...prevOpinion, dislikes: prevOpinion.dislikes + 1 }));
      }
    } catch (error) {
      console.error('Error disliking opinion:', error);
    } finally {
      setIsDisLiking(false);
      setDislikedOpinionId(null);
    }
  };  
  
  const handleLit = async (id) => {
    try {
      setIsLit(true);
      setLitOpinionId(id);
      const opinionRef = ref(database, `opinions/${id}`);
      const snapshot = await get(opinionRef);
      const opinionData = snapshot.val();
      if (opinionData && typeof opinionData.lit === 'number') {
        await update(opinionRef, { lit: opinionData.lit + 1 }, { merge: true });
        setOpinion(prevOpinion => ({ ...prevOpinion, lit: prevOpinion.lit + 1 }));
      }
    } catch (error) {
      console.error('Error disliking opinion:', error);
    } finally {
      setIsLit(false);
      setLitOpinionId(null);
    }
  };  

  const handleSkeleton = async (id) => {
    try {
      setIsSkeleton(true);
      setisSkeletonId(id);
      const opinionRef = ref(database, `opinions/${id}`);
      const snapshot = await get(opinionRef);
      const opinionData = snapshot.val();
      if (opinionData && typeof opinionData.skeleton === 'number') {
        await update(opinionRef, { skeleton: opinionData.skeleton + 1 }, { merge: true });
        if (opinionData && typeof opinionData.skeleton === 'number') {
          await update(opinionRef, { skeleton: opinionData.skeleton + 1 }, { merge: true });
          setOpinion(prevOpinion => ({ ...prevOpinion, skeleton: prevOpinion.skeleton + 1 }));
        }
      }
    } catch (error) {
      console.error('Error disliking opinion:', error);
    } finally {
      setIsSkeleton(false);
      setisSkeletonId(null);
    }
  }; 
  if (showMobileWarning) {
    return (
      <div className="mobile-warning-container">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: animationData,
          }}
          height={400}
          width={400}
        />
        <p>Heh, The creator decided to be petty and the application can only be used in a Mobile Device.</p>
      </div>
    );
  }

  if (loadingOpinion) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimations[loadingAnimationIndex],
            }}
            height={200}
            width={200}
          />
          <p>Awaking the Universal Beliefs Hub gatekeeper ... Bro was just chilling 😪 </p>
        </div>
      </div>      
    );
  }

  if (!opinion) {
    navigate('/');
  }

  return (
    <div className="app-container">
      <h1 className="app-title opinion-tracker">Unpopular beliefs,</h1>
      <p className="app-title beliefs-hub">home of universally accepted opinions, dad jokes, dark humor, and more ... </p>
      <div className="content-container">
      <Container maxWidth="md">
          <Card variant="outlined" sx={{ my: 2, borderRadius: 4 }}>
            <CardContent>
              <p>{opinion.text}</p>
              <div className="emoji-counts">
                <span>&#128077; {opinion.likes}</span>
                <span> &#128078; {opinion.dislikes}</span>
                <span> &#128293; {opinion.lit}</span>
                <span> &#128128; {opinion.skeleton}</span>
              </div>
              <p className="timestamp">{formatTimestamp(opinion.timestamp)}</p>
              <div className="buttons">
                <Button
                  onClick={() => handleLike(opinion.id)}
                  variant="outlined"
                  className="opinion-button"
                >
                  {isLiking && likedOpinionId === opinion.id ? (
                    <Twemoji text="❤️" />
                  ) : (
                    <span>&#128077;</span> 
                  )}
                </Button>

                <Button
                  onClick={() => handleDislike(opinion.id)}
                  variant="outlined"
                  className="opinion-button"
                >
                  {isDisLiking && isDislikedOpinionId === opinion.id ? (
                    <Twemoji text="👎" />
                  ) : (
                    <span>&#128078;</span> 
                  )}
                </Button>

                <Button
                  onClick={() => handleLit(opinion.id)}
                  variant="outlined"
                  className="opinion-button"
                >
                  {isLit && isLitOpinionId === opinion.id ? (
                    <Twemoji text="🔥" />
                  ) : (
                    <span>&#128293;</span>
                  )}
                </Button>

                <Button
                  onClick={() => handleSkeleton(opinion.id)}
                  variant="outlined"
                  className="opinion-button"
                >
                  {isSkeleton && isSkeletonId === opinion.id ? (
                    <Twemoji text="💀" />
                  ) : (
                    <span>&#128128;</span> 
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>     
      </Container>
      </div>
    </div>
  );
}

export default SharedOpinion;
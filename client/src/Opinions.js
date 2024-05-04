import React, { useState, useEffect } from 'react';
import { get, ref, push, set, update, off } from 'firebase/database';
import { database } from './firebase';
import { Container, Card, CardContent, Button, Popover, TextField, CircularProgress,Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send'; // Import SendIcon from Material-UI
import { Twemoji } from 'react-emoji-render';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Lottie from 'react-lottie';
import animationData from './cryinganimation.json'; // Import your Lottie animation JSON file
import loadinganimation1 from './handloadinganimation.json';
import loadinganimation2 from './personloadinganimation.json';
import loadinganimation3 from './robotloadinganimation.json';
// import SharedOpinion from './SharedOpinion'; // Import the component for shared opinion
import './App.css';

const loadingAnimations = [loadinganimation1, loadinganimation2, loadinganimation3];

// Define a quicksort function for sorting opinions based on metrics
const quickSortOpinions = (opinions) => {
  if (opinions.length <= 1) {
    return opinions;
  }

  const pivot = opinions[opinions.length - 1]; // Choose a pivot (e.g., last opinion)
  const left = [];
  const right = [];

  for (let i = 0; i < opinions.length - 1; i++) {
    const opinion = opinions[i];
    const metricA = opinion.likes + opinion.lit + opinion.skeleton - opinion.dislikes; // Calculate metric as sum minus dislikes
    const pivotMetric = pivot.likes + pivot.lit + pivot.skeleton - pivot.dislikes; // Calculate pivot metric as sum minus dislikes
    
    if (metricA < pivotMetric) {
      left.push(opinion);
    } else {
      right.push(opinion);
    }
  }

  return [...quickSortOpinions(left), pivot, ...quickSortOpinions(right)];
};

function Opinions() {
  const [updatedOpinions, setUpdatedOpinions] = useState([]);
  const [needsSorting, setNeedsSorting] = useState(true);
  const [opinions, setOpinions] = useState([]);
  const [newOpinion, setNewOpinion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false); // State to control showing mobile warning
  const [loadingAnimationIndex, setLoadingAnimationIndex] = useState(0); // State to store the index of the chosen loading 

  const [loadingOpinions, setLoadingOpinions] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [likedOpinionId, setLikedOpinionId] = useState(null);
  const [isDisLiking, setIsDisLiking] = useState(false);
  const [isDislikedOpinionId, setDislikedOpinionId] = useState(null);
  const [isLit, setIsLit] = useState(false);
  const [isLitOpinionId, setLitOpinionId] = useState(null);

  const [isSkeleton, setIsSkeleton] = useState(false);
  const [isSkeletonId, setisSkeletonId] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loadingAnimations.length);
    setLoadingAnimationIndex(randomIndex);
  }, []);

  useEffect(() => {
    const opinionsRef = ref(database, 'opinions');
    const fetchData = async () => {
      try {
        const snapshot = await get(opinionsRef);
        const opinionsData = snapshot.val();
        if (opinionsData) {
          const opinionsArray = Object.entries(opinionsData).map(([key, value]) => ({
            id: key,
            text: value.text,
            likes: value.likes || 0,
            dislikes: value.dislikes || 0,
            lit: value.lit || 0,
            skeleton: value.skeleton || 0,
            timestamp: value.timestamp,
          }));
          setOpinions(opinionsArray);
          setUpdatedOpinions(opinionsArray);// Create a copy for opinions1
        } else {
          setOpinions([]);
          setUpdatedOpinions([]);
        }
      } catch (error) {
        console.error('Error fetching opinions:', error);
      } finally {
        setLoadingOpinions(false); // Set loading state to false after fetching
      }
    };    
    fetchData();

    // // Check if it's not a mobile device and show warning page
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      setShowMobileWarning(true);
      setLoadingOpinions(false);
    }

    return () => {
      off(opinionsRef);
    };
  }, []);

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
        const updated = opinions.map(opinion =>
          opinion.id === id ? { ...opinion, likes: opinion.likes + 1 } : opinion
        );
        setOpinions(updated);
        setUpdatedOpinions(updated);
        setNeedsSorting(false); // Set flag to false since opinions array is already sorted
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
        const updated = opinions.map(opinion =>
          opinion.id === id ? { ...opinion, dislikes: opinion.dislikes + 1 } : opinion
        );
        setOpinions(updated);
        setUpdatedOpinions(updated);
        setNeedsSorting(false); 
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
        const updated = opinions.map(opinion =>
          opinion.id === id ? { ...opinion, lit: opinion.lit + 1 } : opinion
        );
        setOpinions(updated);
        setUpdatedOpinions(updated);
        setNeedsSorting(false); 
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
        const updated = opinions.map(opinion =>
          opinion.id === id ? { ...opinion, skeleton: opinion.skeleton + 1 } : opinion
        );
        setOpinions(updated);
        setUpdatedOpinions(updated);
        setNeedsSorting(false); 
      }
    } catch (error) {
      console.error('Error disliking opinion:', error);
    } finally {
      setIsSkeleton(false);
      setisSkeletonId(null);
    }
  }; 
  
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setPopoverOpen(true);
  };
  
  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverOpen(false);
  }; 

  // const handleShare = (id) => {
  //   const shareUrl = `${window.location.origin}/opinions/${id}`; // Replace '/opinions/' with your actual route
  //   navigator.share({ title: 'Share this opinion', text: 'Check out this opinion!', url: shareUrl })
  //     .then(() => console.log('Shared successfully'))
  //     .catch((error) => console.error('Error sharing:', error));
  // }; 
  const handleShare = (id) => {
    const shareUrl = `${window.location.origin}/opinions/${id}`; // Replace '/opinions/' with your actual route
  
    if (navigator.share) {
      navigator
        .share({ title: 'Share this opinion', text: 'Share this opinion to your fellow chums ☺️', url: shareUrl })
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      // Provide a fallback method for desktop users (e.g., copy to clipboard)
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.value = shareUrl;
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
  
      toast.success('Link copied to clipboard. You can manually share it.');
    }
  };
  
  useEffect(() => {
    if (needsSorting) {
      const sortedOpinions = quickSortOpinions(updatedOpinions);
      const reversedSortedOpinions = sortedOpinions.reverse();
      setUpdatedOpinions(reversedSortedOpinions);
    }
  }, [updatedOpinions, needsSorting]);

  const handleAddOpinion = async () => {
    try {
      if (!newOpinion.trim()) {
        toast.error('Cannot send empty opinion');
        return;
      }
  
      setIsLoading(true);
      const newOpinionRef = push(ref(database, 'opinions'));
      const newOpinionData = {
        text: newOpinion.trim(),
        likes: 0,
        dislikes: 0,
        lit: 0,
        skeleton: 0,
        timestamp: new Date().toISOString(),
      };
      await set(newOpinionRef, newOpinionData);
  
      const opinionsRef = ref(database, 'opinions');
      const snapshot = await get(opinionsRef);
      const opinionsData = snapshot.val();
      if (opinionsData) {
        const opinionsArray = Object.entries(opinionsData).map(([key, value]) => ({
          id: key,
          text: value.text,
          likes: value.likes || 0,
          dislikes: value.dislikes || 0,
          lit: value.lit || 0,
          skeleton: value.skeleton || 0,
          timestamp: value.timestamp,
        }));
        setOpinions(opinionsArray);
        setUpdatedOpinions(opinionsArray);
      } else {
        setOpinions([]);
        setUpdatedOpinions([]);
      }
  
      setNewOpinion('');
      setIsLoading(false);
      handlePopoverClose();
    } catch (error) {
      console.error('Error sending opinion:', error);
      setIsLoading(false);
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

  return (
    <div className="app-container">
      <h1 className="app-title opinion-tracker">Unpopular beliefs,</h1>
      <p className="app-title beliefs-hub">home of universally accepted opinions, dad jokes, dark humor, and more ... </p>
      <div className="content-container">
      <Container maxWidth="md">
      {loadingOpinions ? (
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
      ) : (
        // opinions.map((opinion) => (
          updatedOpinions.map((opinion) => (  
          <Card key={opinion.id} variant="outlined" sx={{ my: 2, borderRadius: 4 }}>
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
                <Button
                  onClick={() => handleShare(opinion.id)}
                  variant="outlined"
                  className="opinion-button"
                >
                  Share
                </Button>

                <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
                  <DialogTitle>Share this opinion</DialogTitle>
                  <DialogContent>
                    <p>Copy and share the link:</p>
                    <input type="text" value={`${window.location.origin}/opinions/${opinion.id}`} readOnly />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setShareDialogOpen(false)} color="primary">
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center', // Align horizontally to the center
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center', // Align horizontally to the center
        }}
      >
        <div className="popover-content">
          <TextField
            label="Enter your opinion here"
            multiline
            rows={1} 
            variant="outlined"
            value={newOpinion}
            onChange={(e) => setNewOpinion(e.target.value)}
            // fullWidth 
            sx={{ marginBottom: '8px', height: '36px',marginRight: '4px' }} 
          />
          <Button
             variant="contained"
             color="primary"
             onClick={handleAddOpinion}
             disabled={isLoading}
             endIcon={<SendIcon />}
             sx={{ height: '36px', marginLeft: '4px' }} 
          >
            {isLoading ? <CircularProgress size={24} /> : ''} {/* Change text to 'Send' */}
          </Button>
        </div>
      </Popover>
      <Button
        variant="contained"
        color="primary"
        className="add-button"
        startIcon={<AddIcon />}
        onClick={handlePopoverOpen}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 9999,
          display: popoverOpen ? 'none' : 'inline-block', // Hide the button when popoverOpen is true
          '& .MuiSvgIcon-root': {
            fontSize: '2.5rem',
          },
        }}
      />
      </Container>
      </div>
    </div>
  );
}

export default Opinions;
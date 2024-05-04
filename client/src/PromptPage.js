import React, { useState } from 'react';
import { Button, FormControl,Container, InputLabel, MenuItem, Select,Avatar,CircularProgress, TextField,Card,CardContent,Grid,Typography } from '@mui/material';
// import { LoadingButton } from '@mui/lab';
import { CloudUpload } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

import { storage } from './firebase'; // Assuming you have Firebase configured properly
import { styled } from '@mui/material/styles';
import { geminiai } from './apis/bot';

const StyledContainer = styled(Container)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: '#f0f0f0',
});

const StyledContent = styled('div')({
  width: '90%', // Adjust the width as needed
  maxWidth: '800px', // Maximum width for larger screens
  margin: 'auto',
  background: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

const StyledCard = styled(Card)({
  margin: '1rem 0',
});

const StyledForm = styled('form')({
  width: '50%',
  background: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

const StyledButton = styled(Button)({
  marginTop: '1rem',
});

const StyledUploadButton = styled(Button)({
  marginTop: '1rem',
  borderRadius: '8px',
  background: '#1976d2',
  color: 'white',
  '&:hover': {
    background: '#135ba1',
  },
});

const StyledLoadingButton = styled(Button)({
  marginTop: '1rem',
  borderRadius: '8px',
  background: '#1976d2',
  color: 'white',
  '&:hover': {
    background: '#135ba1',
  },
});

function formatResponse(response) {

  const newformattedResponse = response.result;
  // Check if the response is a string
  if (typeof newformattedResponse !== 'string') {
    // Determine the type of response and return appropriate message
    if (Array.isArray(newformattedResponse)) {
      console.error('Error: Response is an array. Expected string.');
      return 'Error: Response is an array. Expected string.';
    } else if (newformattedResponse && typeof newformattedResponse === 'object') {
      console.log(newformattedResponse);
      console.error('Error: Response is an object. Expected string.');
      return 'Error: Response is an object. Expected string.';
    } else {
      console.error('Error: Response is not a string, array, or object.');
      return 'Error: Response is not a string, array, or object.';
    }
  }

  // Split the response into lines
  const lines = newformattedResponse.split('\n');

  // Remove asterisks (*) at the beginning of each line and format into bullet points
  const formattedLines = lines.map(line => {
    // Remove leading asterisk (*) and any whitespace
    const trimmedLine = line.replace(/^\s*\*\s*/, '');

    // Add bullet point to the trimmed line
    return `- ${trimmedLine}`;
  });

  // Join the formatted lines into a single string
  const formattedResponse = formattedLines.join('\n');

  return formattedResponse;
}

const PromptPage = () => {
  const methods = useForm();
  const [modelType, setModelType] = useState('');
  const [uploadType, setUploadType] = useState('');
  // const [imageFile, setImageFile] = useState(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [isUploading, setUploading] = useState(false); 
  const [hasUploaded, setHasUploaded] = useState(false);
  const [response, setResponse] = useState(null); 
  const [isProcessing,setIsProcessing] = useState(false);

  const handlemodelTypeChange = (event) => {
    setModelType(event.target.value);
  };
  const handleUploadTypeChange = (event) => {
    setUploadType(event.target.value);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    // Ensure the file is an image file
    if (file.type.startsWith('image/')) {
      setUploading(true);

      // toast.info('Uploading image. Please wait...', {
      //   position: toast.POSITION.TOP_CENTER,
      //   autoClose: 5000, // Close the toast after 5 seconds
      // });
  
      try {
        console.log("Handling image upload...");
        
        const imageRef = storageRef(storage, `question`);
        
        // Upload the image file directly without any conversion
        uploadBytes(imageRef, file)
          .then((snapshot) => {
            getDownloadURL(snapshot.ref)
              .then((url) => {
                setUploadUrl(url);
                setHasUploaded(true);
                toast.success("Image uploaded successfully!");
                // console.log("Image uploaded successfully:", url);
              })
              .catch((error) => {
                console.error('Failed to get download URL:', error);
                toast.error('Failed to get download URL. Please try again later.');
              });
          })
          .catch((error) => {
            console.error('Failed to upload image:', error);
            toast.error('Failed to upload image. Please try again later.');
          });
      } catch (error) {
        console.error('Failed to handle image upload:', error);
        toast.error('Failed to handle image upload. Please try again later.');
      } finally {
        setUploading(false);
      }
    } else {
      // Handle the case where the selected file is not an image
      toast.error('Please select an image file.');
    }
  };

  const handleFormSubmit = async (data) => {
    // Set isProcessing to true to disable the button and show loader
    setIsProcessing(true);

    // toast.info('Awaking Bella...', {
    //   position: toast.POSITION.TOP_CENTER,
    //   autoClose: 5000, // Close the toast after 5 seconds
    // });
    
    let responseData;
    let formattedResponse;
    // console.log(data);
    try {
      const formData = {
        ...data,
        modelType: modelType,
        uploadType: uploadType,
      };
      console.log('Form data:', formData);  
  
      if (formData.modelType === 'text_and_image') {
        if(formData.uploadType === 'url') {
          const imageParts = {
            imageParts: [formData.url] // Assuming formData.url is the image URL
          };
          const formDataWithImage = { ...formData, ...imageParts };
          console.log('Form data t+U:', formDataWithImage);
          responseData = await geminiai(formDataWithImage);
          console.log(responseData);
          formattedResponse = formatResponse(responseData.data); 
          setResponse(formattedResponse);
          console.log(response);
        } else {
          if (uploadUrl) {
            // Include the uploaded image URL in the form data
            const imageParts = {
              imageParts: [uploadUrl]
            };
            const formDataWithImage = { ...formData, ...imageParts };
            console.log('Form data with image t+I:', formDataWithImage);
  
            responseData = await geminiai(formDataWithImage);
            console.log(responseData);
            formattedResponse = formatResponse(responseData.data); 
            setResponse(formattedResponse);
            console.log(response);
          } 
        }
      } else {
        console.log('Form data:', formData);
        responseData = await geminiai(formData);
        console.log(responseData);
        formattedResponse = formatResponse(responseData.data); 
        setResponse(formattedResponse);
        console.log(response);
      }
      setResponse(formattedResponse);
    } catch (error) {
      console.error('Error while submitting form:', error);
      // Handle error state if needed
      toast.error('Failed to submit form. Please try again later.');
      setModelType(''); // Reset modelType
      setUploadUrl(''); // Reset uploadUrl
      setUploading(false); // Reset uploading state
      setHasUploaded(false); // Reset hasUploaded state
      methods.reset(); // Reset react-hook-form fields
    } finally {
      // Reset all states back to normal
      setIsProcessing(false);
    }
  };      
  
  return (
    <Container>
      {/* <StyledContent> */}
       {/* {response && <div>{response}</div>} */}
       {response ? (
          <div>
          <Typography variant="h6" sx={{ marginBottom: 4 }} component="h6" fontFamily="'Wolf Brothers', sans-serif">
                SEARCH-iFY
          </Typography>
            <StyledCard>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {response}
                </Typography>
              </CardContent>
            </StyledCard>
          </div>
    ) : ( 
      <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
      <Grid container spacing={2} marginTop={2}>
          <Typography variant="h6" sx={{ marginBottom: 2 }} component="h6" fontFamily="'Wolf Brothers', sans-serif">
                SEARCH-iFY
          </Typography>
          {modelType === '' && !response && (
            <FormControl fullWidth >
              <Typography variant="h6" sx={{ marginBottom: 5 }} component="h6">
                Modern-day AI, suited to for text only and text+image search
              </Typography>
              <InputLabel sx={{ marginTop: 10 }}>Select Prompt Type</InputLabel>
              <Select {...methods.register('modelType')} value={modelType} sx={{ marginBottom: 2 }} onChange={handlemodelTypeChange}>
                <MenuItem value="text_only">Text Only</MenuItem>
                <MenuItem value="text_and_image">Text & Image</MenuItem>
              </Select>
            </FormControl>
          )} 
           {modelType === 'text_only' && (
            <div>
                <Button onClick={() => setModelType('')} variant="contained" sx={{ marginBottom: 2 }} style={{ borderRadius: '50%', minWidth: 0 }}>
                  <ArrowBackIcon />
                </Button>
                <TextField
                  fullWidth
                  label="Enter Prompt"
                  {...methods.register('prompt', { required: true })}
                  style={{ marginTop: '1rem' }}
                />
                <StyledLoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '1rem' }}
                  disabled={!methods.formState.isValid && isProcessing}
                >
                Submit
              </StyledLoadingButton>
            </div>
          )}
          {modelType === 'text_and_image' && (
            <FormControl fullWidth >
              {uploadType === '' && (
                <FormControl fullWidth>
                  <Button onClick={() => setModelType('')} variant="contained" sx={{ marginBottom: 10 }} style={{ borderRadius: '50%', minWidth: 0 }}>
                    <ArrowBackIcon />
                  </Button>
                  <InputLabel sx={{ marginTop: 10 }}>Select Image upload Type : </InputLabel>
                  <Select {...methods.register('uploadType')} value={uploadType} onChange={handleUploadTypeChange}>
                    <MenuItem value="url">By Url</MenuItem>
                    <MenuItem value="upload">By Image Upload</MenuItem>
                  </Select>
                </FormControl>
              )} 
              {uploadType === 'url' && (
                <div>
                    <Button onClick={() => setUploadType('')} variant="contained" sx={{ marginBottom: 2 }} style={{ borderRadius: '50%', minWidth: 0 }}>
                      <ArrowBackIcon />
                    </Button>
                    <TextField
                        fullWidth
                        label="Enter Image Url"
                        {...methods.register('url', { required: true })}
                        style={{ marginTop: '3px',marginBottom: '3px'}}
                    />
                    <TextField
                        fullWidth
                        label="Enter Prompt"
                        {...methods.register('prompt', { required: true })}
                        style={{ marginTop: '3px' }}
                    />
                    {!isProcessing && (
                      <StyledButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        style={{ marginTop: '1rem' }}
                        disabled={!methods.formState.isValid && isProcessing}
                      >
                      Submit
                    </StyledButton>
                    )}
                </div>
              )}
              {uploadType === 'upload' && (
                <FormControl fullWidth >
                  <Button onClick={() => setUploadType('')} variant="contained" sx={{ marginBottom: 2 }} style={{ borderRadius: '50%', minWidth: 0 }}>
                      <ArrowBackIcon />
                  </Button>
                  <Typography sx={{ marginBottom: 2 }} component="h6" variant='h6' > 
                    Click upload button to upload image from Device
                  </Typography>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png"
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    id="imageInput" />

                  {isUploading && 
                    <Typography sx={{ marginBottom: 2, marginTop: 2  }} component="h6" variant='h6' > 
                      Uploading ...
                    </Typography>
                  }
                  
                  {!isUploading && !uploadUrl && modelType === 'text_and_image' && !hasUploaded &&
                    <label htmlFor="imageInput">
                      <StyledUploadButton variant="contained" component="span" startIcon={<CloudUpload />} style={{ marginTop: '1rem' }}>
                        Upload Image
                      </StyledUploadButton>
                    </label>
                  }
                                    
                  {uploadUrl && 
                    <Avatar src={uploadUrl} alt="photoURL" sx={{ width: 100, height: 100, margin: '0 auto', marginBottom:'3px' }} />
                  }
                  {uploadUrl && hasUploaded &&
                    <div>
                        <TextField
                            fullWidth
                            label="Enter Prompt"
                            {...methods.register('prompt', { required: true })}
                            style={{ marginTop: '3px' }}
                        />
                        {isProcessing && (
                          <Typography sx={{ marginBottom: 2, marginTop: 2  }} component="h6" variant='h6' > 
                            Processing request ...
                          </Typography>
                        )}
                        {!isProcessing && (
                          <StyledButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ marginTop: '1rem' }}
                            disabled={!methods.formState.isValid && isProcessing}
                          >
                          Submit
                        </StyledButton>
                        )}
                    </div>
                  }
              </FormControl>
            )}
            </FormControl>
          )}
          </Grid>
        </form>
      </FormProvider>
      )}
     {/* </StyledContent> */}
    </Container>
  );
};

export default PromptPage;
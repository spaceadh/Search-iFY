import React, { useState } from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select,Avatar,CircularProgress, TextField,Card,CardContent,Typography } from '@mui/material';
// import { LoadingButton } from '@mui/lab';
import { CloudUpload } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

import { storage } from './firebase'; // Assuming you have Firebase configured properly
import { styled } from '@mui/material/styles';
import { geminiai } from './apis/bot';

const StyledContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: '#f0f0f0',
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

const PromptPage = () => {
  const methods = useForm();
  const [modelType, setModelType] = useState('');
  const [uploadType, setUploadType] = useState('');
  // const [imageFile, setImageFile] = useState(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [isUploading, setUploading] = useState(false); 
  const [hasUploaded, setHasUploaded] = useState(false);
  const [response, setResponse] = useState(null); 
  const [isProcessing,setIsProcessing] = useState(null);

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
  
    try {
      if (data.modelType === 'text_and_image') {
        if(data.uploadType === 'url'){
          console.log('Form data:', data);
          const responseData = await geminiai(data);
          console.log(responseData);
          setResponse(responseData.data.result);
        }else{
          if (uploadUrl) {
            // Include the uploaded image URL in the form data
            const formDataWithImage = { ...data, imageUrl: uploadUrl };
            console.log('Form data with image:', formDataWithImage);
      
            const responseData = await geminiai(formDataWithImage);
            console.log(responseData);
            setResponse(responseData.data.result);
          } 
        }
      } else {
        // Handle the case where the prompt type is not 'text_and_image'
        console.log('Form data:', data);
        const responseData = await geminiai(data);
        console.log(responseData);
        setResponse(responseData.data.result);
      }
    } catch (error) {
      console.error('Error while submitting form:', error);
      // Handle error state if needed
      toast.error('Failed to submit form. Please try again later.');
    } finally {
      // Reset all states back to normal
      setIsProcessing(false);
      setModelType(''); // Reset modelType
      // setImageFile(null); // Reset imageFile
      setUploadUrl(''); // Reset uploadUrl
      setUploading(false); // Reset uploading state
      setHasUploaded(false); // Reset hasUploaded state
      methods.reset(); // Reset react-hook-form fields
    }
  };  

  return (
    <StyledContainer>
       {response && <div>{response}</div>}
       {response ? (
      <div>
        <div>{response}</div>
        {/* Display response in a card */}
        <Card>
          <CardContent>
            {/* Customize the card content based on your response data */}
            {/* For example, if response data has a title and description */}
            <Typography variant="h5" component="h2">
              {responseData.title}
            </Typography>
            <Typography variant="body2" component="p">
              {responseData.description}
            </Typography>
          </CardContent>
        </Card>
      </div>
    ) : ( 
      <FormProvider {...methods}>
      <StyledForm onSubmit={methods.handleSubmit(handleFormSubmit)}>
          {modelType === '' && (
            <FormControl fullWidth>
              <InputLabel>Select Prompt Type</InputLabel>
              <Select {...methods.register('modelType')} value={modelType} onChange={handlemodelTypeChange}>
                <MenuItem value="text_only">Text Only</MenuItem>
                <MenuItem value="text_and_image">Text & Image</MenuItem>
              </Select>
            </FormControl>
          )} 
          {modelType === 'text_and_image' && (
            <div>
              {uploadType === '' && (
                <FormControl fullWidth>
                  <InputLabel>Select Image upload Type : </InputLabel>
                  <Select {...methods.register('uploadType')} value={uploadType} onChange={handleUploadTypeChange}>
                    <MenuItem value="url">By Url</MenuItem>
                    <MenuItem value="upload">By Image Upload</MenuItem>
                  </Select>
                </FormControl>
              )} 
              {uploadType === 'url' && (
                <div>
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
                    <StyledButton
                      type="submit"
                      variant="contained"
                      color="primary"
                      style={{ marginTop: '1rem' }}
                      disabled={!methods.formState.isValid && isProcessing}
                    >
                    Submit
                  </StyledButton>
                </div>
              )}
              {uploadType === 'upload' && (
                <div>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png"
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    id="imageInput" />
                  
                  {!uploadUrl && modelType === 'text_and_image' && !isUploading && !hasUploaded &&
                    <label htmlFor="imageInput">
                      <StyledUploadButton variant="contained" component="span" startIcon={<CloudUpload />} style={{ marginTop: '1rem' }}>
                        Upload Image
                      </StyledUploadButton>
                    </label>
                  }
                  {isUploading && <CircularProgress style={{ marginTop: '1rem' }} />}
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
                        <StyledButton
                          type="submit"
                          variant="contained"
                          color="primary"
                          style={{ marginTop: '1rem' }}
                          disabled={!methods.formState.isValid && isProcessing}
                        >
                        Submit
                      </StyledButton>
                    </div>
                  }
              </div>
            )}
            </div>
          )}

          {modelType === 'text_only' && (
            <div>
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
        </StyledForm>
      </FormProvider>
      )}
    </StyledContainer>
  );
};

export default PromptPage;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Camera, 
  Image as ImageIcon, 
  FileText,
  Save,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
// import { useTheme } from '../../contexts/ThemeContext';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0.75rem;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1rem;
  }
`;

const ModalContainer = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.xl};
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  max-height: 85dvh;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;
`;

const ModalHeader = styled.div`
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1.5rem 2rem 1rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  word-break: break-word;
  min-width: 0;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.xl};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }
`;

const ModalContent = styled.div`
  padding: 1rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.sm};
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.sm};
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ImagePreview = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const ImagePreviewItem = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: scale(1.02);
  }
`;

const ImagePreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textMuted};
  text-align: center;
  padding: 1rem;
`;

const ImageUploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};
  border-radius: ${props => props.theme.borderRadius.lg};
  
  ${ImagePreviewItem}:hover & {
    opacity: 1;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;


const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  ${props => props.primary ? `
    background: ${props.theme.colors.primary};
    color: ${props.theme.colors.textInverse};
    
    &:hover {
      background: ${props.theme.colors.primaryHover};
    }
    
    &:disabled {
      background: ${props.theme.colors.textMuted};
      cursor: not-allowed;
    }
  ` : `
    background: ${props.theme.colors.background};
    color: ${props.theme.colors.text};
    border: 1px solid ${props.theme.colors.border};
    
    &:hover {
      background: ${props.theme.colors.surfaceHover};
    }
  `}
`;

const ProfileCompletionModal = ({ 
  isOpen, 
  onClose, 
  userData, 
  onComplete 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    profilePicture: null,
    bannerImage: null,
    location: '',
    website: '',
    twitter: '',
    linkedin: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);

  // Initialize form data with user data from OAuth
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        profilePicture: userData.picture || null
      }));
      
      if (userData.picture) {
        setProfileImagePreview(userData.picture);
      }
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      try {
        // Show loading state
        toast.loading(`Uploading ${type === 'profile' ? 'profile picture' : 'banner image'}...`);

        // Get user ID
        const userId = userData?.user_id || userData?.id;
        if (!userId) {
          throw new Error('User ID not found');
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('userId', userId);

        // Upload to R2 storage
        const apiUrl = 'https://blockchainvibe-api.nico-chikuji.workers.dev';
        const response = await fetch(`${apiUrl}/api/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const result = await response.json();
        
        // Update form data with the public URL
        if (type === 'profile') {
          setFormData(prev => ({ ...prev, profilePicture: result.url }));
          setProfileImagePreview(result.url);
        } else {
          setFormData(prev => ({ ...prev, bannerImage: result.url }));
          setBannerImagePreview(result.url);
        }

        toast.dismiss();
        toast.success(`${type === 'profile' ? 'Profile picture' : 'Banner image'} uploaded successfully!`);
      } catch (error) {
        toast.dismiss();
        console.error('Image upload error:', error);
        toast.error(`Failed to upload image: ${error.message}`);
      }
    }
  };

  const handleImageClick = (type) => {
    const input = document.getElementById(`${type}-file-input`);
    if (input) {
      input.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the parent's onComplete handler which will handle the API call
      onComplete(formData);
      onClose();
    } catch (error) {
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                <CheckCircle size={24} />
                Complete Your Profile
              </ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalContent>
              <Form onSubmit={handleSubmit}>
                <FormSection>
                  <SectionTitle>
                    <User size={20} />
                    Basic Information
                  </SectionTitle>
                  
                  <FormGroup>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="bio">Bio</Label>
                    <TextArea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                    />
                  </FormGroup>
                </FormSection>

                <FormSection>
                  <SectionTitle>
                    <Camera size={20} />
                    Profile Images
                  </SectionTitle>
                  
                  <ImageUploadContainer>
                    <FormGroup>
                      <Label>Profile Picture</Label>
                      <ImagePreview>
                        <ImagePreviewItem onClick={() => handleImageClick('profile')}>
                          {profileImagePreview ? (
                            <ImagePreviewImg src={profileImagePreview} alt="Profile preview" />
                          ) : (
                            <ImagePlaceholder>
                              <User size={32} />
                              <span style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                Click to upload
                              </span>
                            </ImagePlaceholder>
                          )}
                          <ImageUploadOverlay>
                            <Camera size={24} />
                            <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              Click to upload
                            </span>
                          </ImageUploadOverlay>
                          <HiddenFileInput
                            id="profile-file-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'profile')}
                          />
                        </ImagePreviewItem>
                      </ImagePreview>
                    </FormGroup>

                    <FormGroup>
                      <Label>Banner Image</Label>
                      <ImagePreview>
                        <ImagePreviewItem 
                          style={{ width: '200px', height: '80px' }}
                          onClick={() => handleImageClick('banner')}
                        >
                          {bannerImagePreview ? (
                            <ImagePreviewImg src={bannerImagePreview} alt="Banner preview" />
                          ) : (
                            <ImagePlaceholder>
                              <ImageIcon size={24} />
                              <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                Click to upload
                              </span>
                            </ImagePlaceholder>
                          )}
                          <ImageUploadOverlay>
                            <ImageIcon size={20} />
                            <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                              Click to upload
                            </span>
                          </ImageUploadOverlay>
                          <HiddenFileInput
                            id="banner-file-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'banner')}
                          />
                        </ImagePreviewItem>
                      </ImagePreview>
                    </FormGroup>
                  </ImageUploadContainer>
                </FormSection>

                <FormSection>
                  <SectionTitle>
                    <FileText size={20} />
                    Additional Information
                  </SectionTitle>
                  
                  <FormGroup>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="twitter">Twitter Handle</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      type="text"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="@yourusername"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </FormGroup>
                </FormSection>

                <ButtonGroup>
                  <Button type="button" onClick={handleSkip}>
                    Skip for Now
                  </Button>
                  <Button 
                    type="submit" 
                    primary 
                    disabled={isSubmitting || !formData.name || !formData.email}
                  >
                    <Save size={18} />
                    {isSubmitting ? 'Saving...' : 'Complete Profile'}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ProfileCompletionModal;

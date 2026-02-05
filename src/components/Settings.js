import React, { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Camera,
  Crown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../hooks/useUser';
import { subscriptionEnabled } from '../config/features';
import ProfileCompletionModal from './Auth/ProfileCompletionModal';
import { SubscriptionSettings } from './Subscription';

const HiddenFileInput = styled.input`
  display: none;
`;

const SettingsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const SettingsHeader = styled.div`
  margin-bottom: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    margin-bottom: 3rem;
  }
`;

const SettingsTitle = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  background: ${props => props.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  word-break: break-word;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['3xl']};
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize['4xl']};
    margin-bottom: 1rem;
  }
`;

const SettingsSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.sm};
  margin-bottom: 1rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize.lg};
    margin-bottom: 2rem;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
  }
`;

const SettingsSidebar = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1rem;
  height: fit-content;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
`;

const SidebarTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const SidebarItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.base};
  text-align: left;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-bottom: 0.5rem;
  
  &:hover {
    background: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text};
  }
  
  &.active {
    background: ${props => props.theme.colors.primary}20;
    color: ${props => props.theme.colors.primary};
  }
`;

const SettingsContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1rem;
  min-width: 0;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: ${props => props.theme.fontSize.base};
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.base};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ImageUploadContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ImagePreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : props.theme.gradients.primary};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textInverse};
  font-size: 1.5rem;
  font-weight: ${props => props.theme.fontWeight.bold};
  border: 2px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ImageUploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.hover};
    border-color: ${props => props.theme.colors.primary};
  }
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.base};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Settings = () => {
  const { currentTheme, toggleTheme } = useTheme();
  const { userProfile } = useUser();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('profile');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const profileInputRef = React.useRef(null);
  const bannerInputRef = React.useRef(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: ''
  });

  const [preferences, setPreferences] = useState({
    topics: ['DeFi', 'NFTs', 'Layer 2', 'Web3'],
    sources: ['CoinDesk', 'Decrypt', 'The Block'],
    frequency: 'daily',
    notifications: true,
    darkMode: currentTheme === 'dark'
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        twitter: userProfile.twitter || '',
        linkedin: userProfile.linkedin || ''
      });
    }
  }, [userProfile]);

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (category, key, value) => {
    if (category === 'topics' || category === 'sources') {
      setPreferences(prev => ({
        ...prev,
        [category]: prev[category].includes(value) 
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save profile data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await fetch('https://blockchainvibe-api.nico-chikuji.workers.dev/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          userId,
          profileData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      // Update local storage
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Settings saved successfully!');
      // Refresh cached user profile
      queryClient.invalidateQueries(['user','profile']);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (type) => {
    // Open native file picker instead of completion modal
    if (type === 'profile') {
      profileInputRef.current?.click();
    } else if (type === 'banner') {
      bannerInputRef.current?.click();
    }
  };

  const uploadImage = async (type, file) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.user_id || user?.id;
      if (!userId) {
        throw new Error('User ID not found. Please sign in again.');
      }
      const form = new FormData();
      form.append('file', file);
      form.append('type', type === 'banner' ? 'banner' : 'profile');
      form.append('userId', userId);
      const res = await fetch('https://blockchainvibe-api.nico-chikuji.workers.dev/api/upload', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Upload failed');
      }
      const data = await res.json();
      // Update local state/preview
      if (type === 'banner') {
        setProfileData(prev => ({ ...prev, banner_image: data.url }));
      } else {
        setProfileData(prev => ({ ...prev, profile_picture: data.url }));
      }
      // Update localStorage user as well
      const current = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...current, ...(type === 'banner' ? { banner_image: data.url } : { profile_picture: data.url }) };
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Image updated');
      // Refresh cached user profile
      queryClient.invalidateQueries(['user','profile']);
    } catch (e) {
      toast.error(e.message || 'Failed to upload image');
    }
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    ...(subscriptionEnabled ? [{ id: 'subscription', label: 'Subscription', icon: <Crown size={18} /> }] : [])
  ];

  return (
    <SettingsContainer>
      <SettingsHeader>
        <SettingsTitle>
          <SettingsIcon size={32} />
          Settings
        </SettingsTitle>
        <SettingsSubtitle>
          Manage your account settings and preferences
        </SettingsSubtitle>
      </SettingsHeader>

      <SettingsGrid>
        <SettingsSidebar>
          <SidebarTitle>Settings</SidebarTitle>
          {sidebarItems.map(item => (
            <SidebarItem
              key={item.id}
              className={activeSection === item.id ? 'active' : ''}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              {item.label}
            </SidebarItem>
          ))}
        </SettingsSidebar>

        <SettingsContent>
          {activeSection === 'profile' && (
            <>
              <SectionTitle>
                <User size={24} />
                Profile Information
              </SectionTitle>
              
              <FormGroup>
                <Label>Profile Picture</Label>
                <ImageUploadContainer>
                  <ImagePreview imageUrl={userProfile?.profile_picture}>
                    {!userProfile?.profile_picture && profileData.name?.charAt(0)?.toUpperCase()}
                  </ImagePreview>
                  <ImageUploadButton onClick={() => handleImageUpload('profile')}>
                    <Camera size={16} />
                    Change Photo
                  </ImageUploadButton>
                  <HiddenFileInput
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage('profile', file);
                    }}
                  />
                </ImageUploadContainer>
              </FormGroup>

              <FormGroup>
                <Label>Banner Image</Label>
                <ImageUploadContainer>
                  <ImagePreview imageUrl={userProfile?.banner_image} style={{ borderRadius: '8px' }}>
                    {!userProfile?.banner_image && 'Banner'}
                  </ImagePreview>
                  <ImageUploadButton onClick={() => handleImageUpload('banner')}>
                    <Camera size={16} />
                    Change Banner
                  </ImageUploadButton>
                  <HiddenFileInput
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage('banner', file);
                    }}
                  />
                </ImageUploadContainer>
              </FormGroup>

              <FormGroup>
                <Label>Name</Label>
                <Input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Bio</Label>
                <TextArea
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Location</Label>
                <Input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                  placeholder="City, Country"
                />
              </FormGroup>

              <FormGroup>
                <Label>Website</Label>
                <Input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => handleProfileChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </FormGroup>

              <FormGroup>
                <Label>Twitter</Label>
                <Input
                  type="text"
                  value={profileData.twitter}
                  onChange={(e) => handleProfileChange('twitter', e.target.value)}
                  placeholder="@username"
                />
              </FormGroup>

              <FormGroup>
                <Label>LinkedIn</Label>
                <Input
                  type="text"
                  value={profileData.linkedin}
                  onChange={(e) => handleProfileChange('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/username"
                />
              </FormGroup>
            </>
          )}

          {activeSection === 'preferences' && (
            <>
              <SectionTitle>
                <SettingsIcon size={24} />
                News Preferences
              </SectionTitle>
              
              <FormGroup>
                <Label>Topics of Interest</Label>
                <CheckboxGroup>
                  {['DeFi', 'NFTs', 'Layer 2', 'Web3', 'Gaming', 'CBDC', 'Regulation', 'Mining'].map(topic => (
                    <CheckboxItem key={topic}>
                      <input
                        id={`topic-${topic.replace(/\s+/g, '-')}`}
                        name="topics"
                        type="checkbox"
                        value={topic}
                        checked={preferences.topics.includes(topic)}
                        onChange={() => handlePreferenceChange('topics', 'topics', topic)}
                      />
                      {topic}
                    </CheckboxItem>
                  ))}
                </CheckboxGroup>
              </FormGroup>

              <FormGroup>
                <Label>Preferred Sources</Label>
                <CheckboxGroup>
                  {['CoinDesk', 'Decrypt', 'The Block', 'CoinTelegraph', 'CryptoSlate'].map(source => (
                    <CheckboxItem key={source}>
                      <input
                        id={`source-${source.replace(/\s+/g, '-')}`}
                        name="sources"
                        type="checkbox"
                        value={source}
                        checked={preferences.sources.includes(source)}
                        onChange={() => handlePreferenceChange('sources', 'sources', source)}
                      />
                      {source}
                    </CheckboxItem>
                  ))}
                </CheckboxGroup>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="preferences-frequency">Update Frequency</Label>
                <Select
                  id="preferences-frequency"
                  name="frequency"
                  value={preferences.frequency}
                  onChange={(e) => handlePreferenceChange('preferences', 'frequency', e.target.value)}
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </Select>
              </FormGroup>
            </>
          )}

          {activeSection === 'notifications' && (
            <>
              <SectionTitle>
                <Bell size={24} />
                Notification Settings
              </SectionTitle>
              
              <FormGroup>
                <CheckboxItem>
                  <input
                    id="notifications-enabled"
                    name="notifications"
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => handlePreferenceChange('preferences', 'notifications', e.target.checked)}
                  />
                  <label htmlFor="notifications-enabled">Enable push notifications</label>
                </CheckboxItem>
              </FormGroup>
            </>
          )}

          {activeSection === 'appearance' && (
            <>
              <SectionTitle>
                <Palette size={24} />
                Appearance
              </SectionTitle>
              
              <FormGroup>
                <CheckboxItem>
                  <input
                    id="dark-mode"
                    name="darkMode"
                    type="checkbox"
                    checked={preferences.darkMode}
                    onChange={(e) => {
                      handlePreferenceChange('preferences', 'darkMode', e.target.checked);
                      if (e.target.checked !== (currentTheme === 'dark')) {
                        toggleTheme();
                      }
                    }}
                  />
                  <label htmlFor="dark-mode">Dark mode</label>
                </CheckboxItem>
              </FormGroup>
            </>
          )}

          {activeSection === 'subscription' && subscriptionEnabled && (
            <>
              <SectionTitle>
                <Crown size={24} />
                Subscription
              </SectionTitle>
              <SubscriptionSettings />
            </>
          )}

          <SaveButton onClick={handleSave} disabled={isSaving}>
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </SettingsContent>
      </SettingsGrid>

      {showProfileModal && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onComplete={(data) => {
            setProfileData(prev => ({
              ...prev,
              ...data
            }));
            setShowProfileModal(false);
            toast.success('Profile updated successfully!');
          }}
          userData={profileData}
        />
      )}
    </SettingsContainer>
  );
};

export default Settings;
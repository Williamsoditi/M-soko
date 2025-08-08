import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Box, Typography } from '@mui/material';
import ProfileView from '../components/user/ProfileView';
import ProfileEdit from '../components/user/ProfileEdit';

const ProfilePage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    if (!user || !token) return;
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/profile/view/', {
        headers: { Authorization: `Token ${token}` },
      });
      setProfile(response.data);
      setMessage('');
    } catch (err) {
      setMessage('Failed to fetch profile. Please log in again.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, token, logout]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:8000/api/profile/edit/', profile, {
        headers: { Authorization: `Token ${token}` },
      });
      setMessage('Profile updated successfully!');
      setIsEditing(false); // Switch back to view mode
    } catch (err) {
      setMessage('Failed to update profile. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <Typography>Loading profile...</Typography>;
  }

  if (!profile) {
    return <Typography>{message}</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      {isEditing ? (
        <ProfileEdit
          profile={profile}
          onChange={handleChange}
          onUpdate={handleUpdate}
          onCancel={() => setIsEditing(false)}
          message={message}
        />
      ) : (
        <ProfileView
          profile={profile}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </Box>
  );
};

export default ProfilePage;
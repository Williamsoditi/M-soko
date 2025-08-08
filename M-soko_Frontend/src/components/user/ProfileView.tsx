import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface ProfileViewProps {
  profile: any;
  onEdit: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onEdit }) => {
  return (
    <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Username: {profile.username}</Typography>
        <Typography variant="h6">Email: {profile.email}</Typography>
        <Typography variant="h6">First Name: {profile.first_name || 'N/A'}</Typography>
        <Typography variant="h6">Last Name: {profile.last_name || 'N/A'}</Typography>
      </Box>
      <Button variant="contained" color="primary" onClick={onEdit} sx={{ mt: 3 }}>
        Edit Profile
      </Button>
    </Paper>
  );
};

export default ProfileView;
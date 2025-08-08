import React from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';

interface ProfileEditProps {
  profile: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdate: (e: React.FormEvent) => void;
  onCancel: () => void;
  message: string;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onChange, onUpdate, onCancel, message }) => {
  return (
    <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Profile
      </Typography>
      {message && <Typography color="primary" sx={{ mb: 2 }}>{message}</Typography>}
      <form onSubmit={onUpdate}>
        <TextField
          label="Username"
          name="username"
          value={profile.username}
          fullWidth
          margin="normal"
          disabled
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={profile.email}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="First Name"
          name="first_name"
          value={profile.first_name || ''}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          name="last_name"
          value={profile.last_name || ''}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ProfileEdit;
import { useState } from 'react';
import { User, Mail, Phone, Lock, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Loading';

const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('fullName', profileForm.fullName);
      formData.append('phone', profileForm.phone);
      if (avatar) formData.append('avatar', avatar);

      const { data } = await customerAPI.updateProfile(formData);
      updateUser(data.user);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await customerAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111111]">Profile Settings</h1>
        <p className="text-[#737373] text-sm mt-1">Manage your account details</p>
      </div>

      {/* Avatar + Profile */}
      <div className="card p-6 mb-5">
        <h2 className="text-base font-semibold text-[#111111] mb-5">Personal Information</h2>
        <form onSubmit={handleProfileSave} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#111111] flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xl font-bold">
                    {user?.fullName?.charAt(0)}
                  </span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center cursor-pointer shadow-subtle hover:bg-[#F5F5F5]">
                <Camera className="w-3 h-3 text-[#525252]" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-[#111111]">{user?.fullName}</p>
              <p className="text-xs text-[#737373]">{user?.email}</p>
              <p className="text-xs text-[#A3A3A3] mt-0.5">Click camera to change photo</p>
            </div>
          </div>

          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="text"
                className="input-field pl-10"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="email"
                className="input-field pl-10 bg-[#F5F5F5]"
                value={user?.email}
                disabled
              />
            </div>
            <p className="form-hint">Email address cannot be changed.</p>
          </div>

          <div>
            <label className="form-label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="tel"
                className="input-field pl-10"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
            {savingProfile ? (
              <><Spinner size="sm" className="border-white/30 border-t-white" />Saving...</>
            ) : (
              <><CheckCircle className="w-4 h-4" />Save Changes</>
            )}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-[#111111] mb-5">Change Password</h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="form-label">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="form-label">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="Min. 8 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
            className="btn-primary flex items-center gap-2"
          >
            {savingPassword ? (
              <><Spinner size="sm" className="border-white/30 border-t-white" />Updating...</>
            ) : (
              <><Lock className="w-4 h-4" />Update Password</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;

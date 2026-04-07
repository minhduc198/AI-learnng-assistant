import { Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import { useProfile } from "../../context/ProfileContext";
import authService from "../../services/authService";

export default function ProfilePage() {
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [avatarBase64, setAvatarBase64] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState("");

  const { userInfo, loading, fetchProfile } = useProfile();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setPasswordLoading(true);

    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast.error(error.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    setPreviewAvatar(userInfo.avatar);
  }, [userInfo]);

  const submitUploadImage = async (e) => {
    e.preventDefault();

    try {
      await authService.updateProfile({
        profileImage: avatarBase64,
      });

      fetchProfile();

      toast.success("Upload avatar successful");
    } catch (err) {
      console.log(err);
      toast.error("Failed to upload");
    }
  };

  const handleChangeFile = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    setPreviewAvatar(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setAvatarBase64(reader.result);
    };
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title="Profile Settings" />

      <div className="space-y-8">
        {/* User Information Display */}
        <form
          className="flex flex-col md:flex-row gap-4"
          onSubmit={submitUploadImage}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 sm:w-30 sm:h-30 md:w-40 md:h-40 lg:w-60 lg:h-60 group border border-neutral-200 relative rounded-full overflow-hidden">
              <label className="w-full h-full block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChangeFile}
                />

                <img
                  className="w-full h-full object-cover"
                  src={previewAvatar}
                  alt="avatar"
                />

                <div className="w-full h-0 absolute bottom-0 left-0 z-20 bg-linear-to-r from-black/20 to-black/40 group-hover:h-[30%] transition-all duration-200" />

                <div className="absolute bottom-5 left-[50%] -translate-x-[50%] z-30 flex items-center justify-center text-white uppercase font-semibold tracking-wide opacity-0 group-hover:opacity-100">
                  Upload
                </div>
              </label>
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={userInfo.avatar === previewAvatar}
              >
                Save Profile
              </Button>
              <Button
                onClick={() => setPreviewAvatar(userInfo.avatar)}
                disabled={userInfo.avatar === previewAvatar}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
          <div className="bg-white border-neutral-200 border rounded-lg p-6 flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              User Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Username
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-neutral-400" />
                  </div>

                  <p className="w-full h-9 pl-9 pr-3 pt-2 border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900">
                    {userInfo.username}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Email Address
                </label>

                <div className="relative ">
                  <div className="absolute inset-y-0 left0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-neutral-400" />
                  </div>
                  <p className="w-full h-9 pl-9 pr-3 pt-2  border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900">
                    {userInfo.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Change password */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Change Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Current Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-400" />
                </div>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full h-9 pl-9 pr-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                New Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-400" />
                </div>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full h-9 pl-9 pr-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Confirm New Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-400" />
                </div>

                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="w-full h-9 pl-9 pr-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import DefaultLayout from "../../layout/DefaultLayout";

const API_BASE = import.meta.env.VITE_API_LINK_BE;

interface ProfileForm {
  nama: string;
  email: string;
  password: string;
  confPassword: string;
  role: string;
  image_url: string;
}

const ProfilePage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    nama: "",
    email: "",
    password: "",
    confPassword: "",
    role: "",
    image_url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [updateError, setUpdateError] = useState<string>("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        nama: user.nama || "",
        email: user.email || "",
        password: "",
        confPassword: "",
        role: user.role || "",
        image_url: user.image_url || "",
      });
    }
  }, [user]);

  // File handling functions
  async function handleFileUpload(file: File): Promise<string> {
    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE}/api/images`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const fileName =
        response.data.fileName || response.data.filename || response.data.file;
      return fileName;
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setUploadError("Failed to upload file");
      throw error;
    } finally {
      setUploading(false);
    }
  }

  async function handleFileDelete(fileName: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/api/images/${fileName}`, {
        withCredentials: true,
      });
    } catch (error: any) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setUploadError("");

      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  }

  function clearFileSelection(): void {
    setSelectedFile(null);
    setFilePreview("");
    setUploadError("");

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
  }

  async function removeExistingFile(): Promise<void> {
    if (profileForm.image_url) {
      try {
        await handleFileDelete(profileForm.image_url);
        setProfileForm({ ...profileForm, image_url: "" });
      } catch (error) {
        console.error("Error removing file:", error);
      }
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess(false);

    if (!user?.id) {
      setUpdateError("User ID not found");
      return;
    }

    // Validate only if user types passwords
    if (
      (profileForm.password || profileForm.confPassword) &&
      profileForm.password !== profileForm.confPassword
    ) {
      setUpdateError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      let imageFileName = profileForm.image_url;

      // Upload new image if selected
      if (selectedFile) {
        if (profileForm.image_url) {
          await handleFileDelete(profileForm.image_url);
        }
        imageFileName = await handleFileUpload(selectedFile);
      }

      // Always send password fields — even if empty
      const updateData = {
        nama: profileForm.nama,
        email: profileForm.email,
        role: profileForm.role,
        image_url: imageFileName,
        password: profileForm.password || "",
        confPassword: profileForm.confPassword || "",
      };

      // Send update request
      await axios.put(`${API_BASE}/api/users/${user.id}`, updateData, {
        withCredentials: true,
      });

      // Refresh auth info

      await checkAuth();

      // Re-sync form data from refreshed user
      if (user) {
        setProfileForm({
          nama: user.nama || "",
          email: user.email || "",
          password: "",
          confPassword: "",
          role: user.role || "",
          image_url: user.image_url || "",
        });
      }

      setUpdateSuccess(true);
      setIsEditing(false);
      clearFileSelection();

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      console.error("❌ Error updating profile:", error);
      setUpdateError(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileForm({
        nama: user.nama || "",
        email: user.email || "",
        password: "",
        confPassword: "",
        role: user.role || "",
        image_url: user.image_url || "",
      });
    }
    clearFileSelection();
    setIsEditing(false);
    setUpdateError("");
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
              >
                Edit Profile
              </button>
            )}
          </div>

          {updateSuccess && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              Profile updated successfully!
            </div>
          )}

          {updateError && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {updateError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                    />
                  ) : profileForm.image_url ? (
                    <img
                      src={`${API_BASE}/api/images/${profileForm.image_url}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                      onError={(e) => {
                        e.currentTarget.src = "/default-avatar.png"; // fallback
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="w-full max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>

                    {filePreview && (
                      <button
                        type="button"
                        onClick={clearFileSelection}
                        className="mb-2 text-red-600 text-sm hover:text-red-800"
                      >
                        Remove selected file
                      </button>
                    )}

                    {profileForm.image_url && !selectedFile && (
                      <button
                        type="button"
                        onClick={removeExistingFile}
                        className="mb-2 text-red-600 text-sm hover:text-red-800"
                      >
                        Remove current image
                      </button>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full p-2 border border-gray-300 rounded"
                      disabled={!isEditing}
                    />

                    {uploadError && (
                      <p className="text-red-600 text-sm mt-1">{uploadError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileForm.nama}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, nama: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <p className="text-gray-900">{user?.nama}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <p className="text-gray-900">{user?.email}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <p className="text-gray-900">{user?.role}</p>
              </div>

              {/* Password fields - only show when editing */}
              {isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={profileForm.password}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.confPassword}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          confPassword: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
                    disabled={loading || uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || uploading}
                  >
                    {loading || uploading ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProfilePage;

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import DefaultLayout from "../../layout/DefaultLayout";

// Types
interface User {
  id: number;
  nama: string;
  email: string;
  role: "admin" | "super admin";
}

interface Article {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string;
  link: string;
  readMore: string;
}

interface Video {
  id: number;
  title: string;
  description: string;
  date: string;
  videoId: string;
  thumbnail: string;
}

interface UserForm {
  nama: string;
  email: string;
  password: string;
  confPassword: string;
  role: "admin" | "super admin";
}

interface ArticleForm {
  title: string;
  description: string;
  date: string;
  image: string;
  link: string;
}

interface VideoForm {
  title: string;
  description: string;
  date: string;
  videoId: string;
  thumbnail: string;
  videoLink: string; // For form input
}

const API_BASE = import.meta.env.VITE_API_LINK_BE;

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "articles" | "videos">(
    "users"
  );

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userForm, setUserForm] = useState<UserForm>({
    nama: "",
    email: "",
    password: "",
    confPassword: "",
    role: "admin",
  });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleForm, setArticleForm] = useState<ArticleForm>({
    title: "",
    description: "",
    date: "",
    image: "",
    link: "",
  });
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoForm, setVideoForm] = useState<VideoForm>({
    title: "",
    description: "",
    date: "",
    videoId: "",
    thumbnail: "",
    videoLink: "",
  });
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
    fetchArticles();
    fetchVideos();
  }, []);

  // Helper function to extract YouTube video ID and thumbnail from URL
  const extractYouTubeData = (url: string) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    const videoId = match ? match[1] : "";
    const thumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : "";
    return { videoId, thumbnail };
  };

  // Update video form when videoLink changes
  useEffect(() => {
    if (videoForm.videoLink) {
      const { videoId, thumbnail } = extractYouTubeData(videoForm.videoLink);
      setVideoForm((prev) => ({ ...prev, videoId, thumbnail }));
    }
  }, [videoForm.videoLink]);

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
    if (articleForm.image) {
      try {
        await handleFileDelete(articleForm.image);
        setArticleForm({ ...articleForm, image: "" });
      } catch (error) {
        console.error("Error removing file:", error);
      }
    }
  }

  // API functions for Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/users`, {
        withCredentials: true,
      });

      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (userForm.password !== userForm.confPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/users`, userForm, {
        withCredentials: true,
      });
      fetchUsers();
      resetUserForm();
      setShowUserModal(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const updateUser = async () => {
    if (!editingUserId) return;

    try {
      await axios.put(`${API_BASE}/api/users/${editingUserId}`, userForm, {
        withCredentials: true,
      });
      fetchUsers();
      resetUserForm();
      setShowUserModal(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_BASE}/api/users/${id}`, {
          withCredentials: true,
        });
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // API functions for Articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/article`, {
        withCredentials: true,
      });

      // Add default readMore value
      const articlesWithReadMore = response.data.data.map(
        (article: Article) => ({
          ...article,
          readMore: article.readMore || "BACA SELENGKAPNYA",
        })
      );
      setArticles(articlesWithReadMore);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async () => {
    try {
      let imageFileName = "";

      if (selectedFile) {
        imageFileName = await handleFileUpload(selectedFile);
      }

      const articleData = {
        ...articleForm,
        image: imageFileName,
        readMore: "BACA SELENGKAPNYA",
      };

      await axios.post(`${API_BASE}/api/article`, articleData, {
        withCredentials: true,
      });
      fetchArticles();
      resetArticleForm();
      setShowArticleModal(false);
    } catch (error) {
      console.error("Error creating article:", error);
    }
  };

  const updateArticle = async () => {
    if (!editingArticleId) return;

    try {
      let imageFileName = articleForm.image;

      if (selectedFile) {
        if (articleForm.image) {
          await handleFileDelete(articleForm.image);
        }
        imageFileName = await handleFileUpload(selectedFile);
      }

      const articleData = {
        ...articleForm,
        image: imageFileName,
        readMore: "BACA SELENGKAPNYA",
      };

      await axios.put(
        `${API_BASE}/api/article/${editingArticleId}`,
        articleData,
        {
          withCredentials: true,
        }
      );
      fetchArticles();
      resetArticleForm();
      setShowArticleModal(false);
    } catch (error) {
      console.error("Error updating article:", error);
    }
  };

  const deleteArticle = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const article = articles.find((a) => a.id === id);
        if (article && article.image) {
          await handleFileDelete(article.image);
        }
        await axios.delete(`${API_BASE}/api/article/${id}`, {
          withCredentials: true,
        });
        fetchArticles();
      } catch (error) {
        console.error("Error deleting article:", error);
      }
    }
  };

  // API functions for Videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/video`, {
        withCredentials: true,
      });

      setVideos(response.data.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const createVideo = async () => {
    try {
      const videoData = {
        title: videoForm.title,
        description: videoForm.description,
        date: videoForm.date,
        videoId: videoForm.videoId,
        thumbnail: videoForm.thumbnail,
      };

      await axios.post(`${API_BASE}/api/video`, videoData, {
        withCredentials: true,
      });
      fetchVideos();
      resetVideoForm();
      setShowVideoModal(false);
    } catch (error) {
      console.error("Error creating video:", error);
    }
  };

  const updateVideo = async () => {
    if (!editingVideoId) return;

    try {
      const videoData = {
        title: videoForm.title,
        description: videoForm.description,
        date: videoForm.date,
        videoId: videoForm.videoId,
        thumbnail: videoForm.thumbnail,
      };

      await axios.put(`${API_BASE}/api/video/${editingVideoId}`, videoData, {
        withCredentials: true,
      });
      fetchVideos();
      resetVideoForm();
      setShowVideoModal(false);
    } catch (error) {
      console.error("Error updating video:", error);
    }
  };

  const deleteVideo = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await axios.delete(`${API_BASE}/api/video/${id}`, {
          withCredentials: true,
        });
        fetchVideos();
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    }
  };

  // Reset form functions
  const resetUserForm = () => {
    setUserForm({
      nama: "",
      email: "",
      password: "",
      confPassword: "",
      role: "admin",
    });
    setEditingUserId(null);
  };

  const resetArticleForm = () => {
    setArticleForm({
      title: "",
      description: "",
      date: "",
      image: "",
      link: "",
    });
    setEditingArticleId(null);
    clearFileSelection();
  };

  const resetVideoForm = () => {
    setVideoForm({
      title: "",
      description: "",
      date: "",
      videoId: "",
      thumbnail: "",
      videoLink: "",
    });
    setEditingVideoId(null);
  };

  // Edit functions
  const editUser = (user: User) => {
    setUserForm({
      nama: user.nama,
      email: user.email,
      password: "",
      confPassword: "",
      role: user.role,
    });
    setEditingUserId(user.id);
    setShowUserModal(true);
  };

  const editArticle = (article: Article) => {
    setArticleForm({
      title: article.title,
      description: article.description,
      date: article.date,
      image: article.image,
      link: article.link,
    });
    setEditingArticleId(article.id);
    setShowArticleModal(true);
  };

  const editVideo = (video: Video) => {
    setVideoForm({
      title: video.title,
      description: video.description,
      date: video.date,
      videoId: video.videoId,
      thumbnail: video.thumbnail,
      videoLink: `https://www.youtube.com/watch?v=${video.videoId}`,
    });
    setEditingVideoId(video.id);
    setShowVideoModal(true);
  };
  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#145C72]"></div>
            <p className="mt-4 text-[#145C72]">Loading anomaly data...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }
  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
          <div className="mb-4">
            <p className="text-gray-600">Welcome, {user?.nama}</p>
            <p className="text-sm text-gray-500">Role: {user?.role}</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {["users", "articles", "videos"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">User Management</h2>
                <button
                  onClick={() => {
                    resetUserForm();
                    setShowUserModal(true);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.nama}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => editUser(user)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === "articles" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Article Management</h2>
                <button
                  onClick={() => {
                    resetArticleForm();
                    setShowArticleModal(true);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add Article
                </button>
              </div>

              <div className="grid gap-4">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {article.description}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Date: {article.date}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Link: {article.link}
                        </p>
                        {article.image && (
                          <div className="mt-2">
                            <img
                              src={`${API_BASE}/api/images/${article.image}`}
                              alt="Article"
                              className="w-32 h-24 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => editArticle(article)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Video Management</h2>
                <button
                  onClick={() => {
                    resetVideoForm();
                    setShowVideoModal(true);
                  }}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                  Add Video
                </button>
              </div>

              <div className="grid gap-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {video.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {video.description}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Date: {video.date}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Video ID: {video.videoId}
                        </p>
                        {video.thumbnail && (
                          <div className="mt-2">
                            <img
                              src={video.thumbnail}
                              alt="Video Thumbnail"
                              className="w-32 h-24 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => editVideo(video)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Modal */}
          {showUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  {editingUserId ? "Edit User" : "Add User"}
                </h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={userForm.nama}
                    onChange={(e) =>
                      setUserForm({ ...userForm, nama: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={userForm.password}
                    onChange={(e) =>
                      setUserForm({ ...userForm, password: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={userForm.confPassword}
                    onChange={(e) =>
                      setUserForm({ ...userForm, confPassword: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        role: e.target.value as "admin" | "super admin",
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="admin">Admin</option>
                    <option value="super admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingUserId ? updateUser : createUser}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {editingUserId ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Article Modal */}
          {showArticleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                  {editingArticleId ? "Edit Article" : "Add Article"}
                </h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={articleForm.title}
                    onChange={(e) =>
                      setArticleForm({ ...articleForm, title: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <textarea
                    placeholder="Description"
                    value={articleForm.description}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded h-24"
                  />

                  <input
                    type="date"
                    value={articleForm.date}
                    onChange={(e) =>
                      setArticleForm({ ...articleForm, date: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <input
                    type="url"
                    placeholder="Link"
                    value={articleForm.link}
                    onChange={(e) =>
                      setArticleForm({ ...articleForm, link: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Image
                    </label>

                    {/* Current image */}
                    {articleForm.image && !selectedFile && (
                      <div className="mb-2">
                        <img
                          src={`${API_BASE}/api/images/${articleForm.image}`}
                          alt="Current"
                          className="w-32 h-24 object-cover rounded border"
                        />
                        <button
                          onClick={removeExistingFile}
                          className="mt-1 text-red-600 text-sm hover:text-red-800"
                        >
                          Remove current image
                        </button>
                      </div>
                    )}

                    {/* File preview */}
                    {filePreview && (
                      <div className="mb-2">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-32 h-24 object-cover rounded border"
                        />
                        <button
                          onClick={clearFileSelection}
                          className="mt-1 text-red-600 text-sm hover:text-red-800"
                        >
                          Remove selected file
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full p-2 border border-gray-300 rounded"
                    />

                    {uploadError && (
                      <p className="text-red-600 text-sm mt-1">{uploadError}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowArticleModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingArticleId ? updateArticle : createArticle}
                    disabled={uploading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading..."
                      : editingArticleId
                      ? "Update"
                      : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Modal */}
          {showVideoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  {editingVideoId ? "Edit Video" : "Add Video"}
                </h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={videoForm.title}
                    onChange={(e) =>
                      setVideoForm({ ...videoForm, title: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <textarea
                    placeholder="Description"
                    value={videoForm.description}
                    onChange={(e) =>
                      setVideoForm({
                        ...videoForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded h-24"
                  />

                  <input
                    type="date"
                    value={videoForm.date}
                    onChange={(e) =>
                      setVideoForm({ ...videoForm, date: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  <input
                    type="url"
                    placeholder="YouTube Video Link (e.g., https://www.youtube.com/watch?v=VIDEO_ID)"
                    value={videoForm.videoLink}
                    onChange={(e) =>
                      setVideoForm({ ...videoForm, videoLink: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />

                  {/* Display extracted video ID and thumbnail preview */}
                  {videoForm.videoId && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Video ID:
                        </label>
                        <p className="text-sm text-gray-600">
                          {videoForm.videoId}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Thumbnail Preview:
                        </label>
                        <img
                          src={videoForm.thumbnail}
                          alt="Video Thumbnail"
                          className="w-32 h-24 object-cover rounded border mt-1"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingVideoId ? updateVideo : createVideo}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    {editingVideoId ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdminPanel;

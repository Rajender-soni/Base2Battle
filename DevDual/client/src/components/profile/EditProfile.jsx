import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FaUser, FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

function EditProfile() {
  const navigate = useNavigate();
  const { userData, setUserData } = useUser();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    description: userData?.description || "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(userData?.photoURL || "");
  const [loading, setLoading] = useState(false);

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file);
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        withCredentials: true,
      };

      // Update name
      if (formData.name !== userData?.name) {
        await axios.post(
          `${serverUrl}/user/updateName`,
          { name: formData.name },
          config
        );
      }

      // Update description
      if (formData.description !== userData?.description) {
        await axios.post(
          `${serverUrl}/user/updateDescription`,
          { description: formData.description },
          config
        );
        console.log("Description updated successfully");
      }

      // Update photo
      if (photoFile) {
        console.log("Uploading photo...", photoFile.name);
        const photoFormData = new FormData();
        photoFormData.append("photo", photoFile);

        await axios.post(
          `${serverUrl}/user/updatePhotoURL`,
          photoFormData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Photo uploaded successfully");
      }

      // Fetch updated user data
      const { data: updatedUser } = await axios.get(
        `${serverUrl}/user/getcurrentuser`,
        config
      );
      setUserData(updatedUser);

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white py-20 px-4 md:px-12 lg:px-20 relative overflow-visible">
        {/* Subtle grid lines */}
        <div className="fixed top-0 bottom-0 left-8 lg:left-16 w-[1px] bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10 pointer-events-none"></div>
        <div className="fixed top-0 bottom-0 right-8 lg:right-16 w-[1px] bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10 pointer-events-none"></div>

        <div className="max-w-2xl mx-auto pt-10 relative z-20">
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-center mb-8 text-white bg-clip-text">
              Edit Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 border-2 border-zinc-600 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : formData.name ? (
                      <span className="text-white text-5xl font-bold uppercase">
                        {formData.name.charAt(0)}
                      </span>
                    ) : (
                      <FaUser className="text-white text-5xl" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handlePhotoClick}
                    className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                  >
                    <FaCamera className="text-lg" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-zinc-400 mt-3">
                  Click camera icon to change profile picture
                </p>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default EditProfile;
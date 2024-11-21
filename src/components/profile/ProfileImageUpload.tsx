'use client'
import { useState } from 'react';
import { FiCamera, FiUpload, FiSmile } from 'react-icons/fi';
import Image from 'next/image';
import axios from 'axios';

interface ProfileImageUploadProps {
  currentImage?: string;
  currentIcon?: string;
  isDark: boolean;
  onUpdate: (imageUrl: string) => void;
}

const DEFAULT_ICONS = [
  '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍🏫', '👩‍🏫', '🎓', '📚', '✏️', '📝', '🎯',
  '🌟', '💡', '🔬', '🧪', '🔍', '📊', '💻', '🎨', '🎭', '🎬'
];

export default function ProfileImageUpload({ currentImage, currentIcon, isDark, onUpdate }: ProfileImageUploadProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/user/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.imageUrl) {
        onUpdate(response.data.imageUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
      setShowOptions(false);
    }
  };

  const handleIconSelect = async (icon: string) => {
    try {
      const response = await axios.post('/api/user/profile/icon', { icon });
      if (response.data.success) {
        onUpdate(icon);
      }
    } catch (error) {
      console.error('Error setting icon:', error);
    }
    setShowIcons(false);
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <div className="relative h-32 w-32 rounded-full overflow-hidden group">
        {currentImage ? (
          <Image
            src={currentImage}
            alt="Profile"
            fill
            className="object-cover"
          />
        ) : currentIcon ? (
          <div className={`w-full h-full flex items-center justify-center text-4xl ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            {currentIcon}
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <FiCamera size={32} className="text-gray-400" />
          </div>
        )}
        
        <button
          onClick={() => setShowOptions(true)}
          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FiCamera className="text-white" size={24} />
        </button>
      </div>

      {/* Upload Options Modal */}
      {showOptions && (
        <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-xl p-4 z-50`}>
          <div className="space-y-3">
            <button
              onClick={() => document.getElementById('profile-image-upload')?.click()}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FiUpload />
              <span>Upload Photo</span>
            </button>
            <button
              onClick={() => setShowIcons(true)}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FiSmile />
              <span>Choose Icon</span>
            </button>
          </div>
          <input
            type="file"
            id="profile-image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* Icons Grid Modal */}
      {showIcons && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
          isDark ? 'bg-black/50' : 'bg-gray-500/50'
        }`}>
          <div className={`${
            isDark ? 'bg-gray-800' : 'bg-white'
          } rounded-xl p-6 max-w-md w-full`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Choose an Icon
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {DEFAULT_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => handleIconSelect(icon)}
                  className={`text-3xl p-2 rounded-lg ${
                    isDark 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showOptions || showIcons) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowOptions(false);
            setShowIcons(false);
          }}
        />
      )}
    </div>
  );
} 
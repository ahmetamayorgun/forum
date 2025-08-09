import React from 'react';
import { User, UserPoints } from '../lib/supabase';
import MemberLevel from './MemberLevel';

interface ProfileHeaderProps {
  profile: User;
  userPoints: UserPoints | null;
  isOwnProfile: boolean;
  isEditing: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
  onAvatarUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  userPoints,
  isOwnProfile,
  isEditing,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onAvatarUpload
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={profile.avatar_url || '/default-avatar.png'}
            alt={profile.username}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-slate-600"
          />
          {isOwnProfile && (
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarUpload}
              />
            </label>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {profile.username}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {profile.email}
              </p>
            </div>
            
            {userPoints && (
              <div className="flex items-center gap-4">
                <MemberLevel points={userPoints.points} />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {userPoints.points}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Toplam Puan
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isOwnProfile && (
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={onEditClick}
                  className="btn-primary"
                >
                  Profili Düzenle
                </button>
              ) : (
                <>
                  <button
                    onClick={onSaveClick}
                    className="btn-primary"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={onCancelClick}
                    className="btn-secondary"
                  >
                    İptal
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

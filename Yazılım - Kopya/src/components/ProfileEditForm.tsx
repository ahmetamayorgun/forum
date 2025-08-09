import React from 'react';

interface ProfileEditFormProps {
  editForm: {
    bio: string;
    location: string;
    website: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
  };
  onFormChange: (field: string, value: string) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  editForm,
  onFormChange
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Profil Bilgileri
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Hakkımda
          </label>
          <textarea
            value={editForm.bio}
            onChange={(e) => onFormChange('bio', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            rows={4}
            placeholder="Kendiniz hakkında kısa bir açıklama..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Konum
          </label>
          <input
            type="text"
            value={editForm.location}
            onChange={(e) => onFormChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            placeholder="Şehir, Ülke"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={editForm.website}
            onChange={(e) => onFormChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
          Sosyal Medya
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={editForm.instagram}
              onChange={(e) => onFormChange('instagram', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
              placeholder="@kullaniciadi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Twitter
            </label>
            <input
              type="text"
              value={editForm.twitter}
              onChange={(e) => onFormChange('twitter', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
              placeholder="@kullaniciadi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              LinkedIn
            </label>
            <input
              type="text"
              value={editForm.linkedin}
              onChange={(e) => onFormChange('linkedin', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
              placeholder="linkedin.com/in/kullaniciadi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              YouTube
            </label>
            <input
              type="text"
              value={editForm.youtube}
              onChange={(e) => onFormChange('youtube', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
              placeholder="youtube.com/@kanal"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;

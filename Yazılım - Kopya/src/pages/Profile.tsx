import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, User, Topic, UserPoints, PointsHistory } from '../lib/supabase';
import ProfileHeader from '../components/ProfileHeader';
import ProfileEditForm from '../components/ProfileEditForm';
import UserTopics from '../components/UserTopics';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    location: '',
    website: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: ''
  });

  const fetchUserPoints = async (userId: string) => {
    try {
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') throw pointsError;
      setUserPoints(pointsData);

      const { data: historyData, error: historyError } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;
      setPointsHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditForm({
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        instagram: data.social_links?.instagram || '',
        twitter: data.social_links?.twitter || '',
        linkedin: data.social_links?.linkedin || '',
        youtube: data.social_links?.youtube || ''
      });

      await fetchUserPoints(data.id);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchUserTopics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          user:profiles(username)
        `)
        .eq('user.username', username)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching user topics:', error);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
    fetchUserTopics();
  }, [fetchProfile, fetchUserTopics]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website,
          social_links: {
            instagram: editForm.instagram,
            twitter: editForm.twitter,
            linkedin: editForm.linkedin,
            youtube: editForm.youtube
          }
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile(prev => prev ? {
        ...prev,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        social_links: {
          instagram: editForm.instagram,
          twitter: editForm.twitter,
          linkedin: editForm.linkedin,
          youtube: editForm.youtube
        }
      } : null);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !currentUser) return;

    const file = event.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Lütfen geçerli bir resim dosyası seçin (JPG, PNG, GIF, WebP).');
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        alert(`Yükleme hatası: ${uploadError.message}`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id);

      if (updateError) {
        alert(`Profil güncelleme hatası: ${updateError.message}`);
        return;
      }

      alert('Profil fotoğrafı başarıyla güncellendi!');
      fetchProfile();
    } catch (error) {
      alert(`Profil fotoğrafı yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  const isOwnProfile = currentUser?.id === profile?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Kullanıcı Bulunamadı
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Aradığınız kullanıcı mevcut değil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          userPoints={userPoints}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          onEditClick={() => setIsEditing(true)}
          onSaveClick={handleSaveProfile}
          onCancelClick={() => setIsEditing(false)}
          onAvatarUpload={handleAvatarUpload}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Edit Form */}
            {isEditing && (
              <ProfileEditForm
                editForm={editForm}
                onFormChange={handleFormChange}
              />
            )}

            {/* Profile Info */}
            {!isEditing && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Profil Bilgileri
                </h2>
                
                {profile.bio && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Hakkında
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {profile.location && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Konum
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      📍 {profile.location}
                    </p>
                  </div>
                )}

                {profile.website && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Website
                    </h3>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}

                {/* Social Links */}
                {(profile.social_links?.instagram || profile.social_links?.twitter || 
                  profile.social_links?.linkedin || profile.social_links?.youtube) && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Sosyal Medya
                    </h3>
                    <div className="space-y-2">
                      {profile.social_links?.instagram && (
                        <a
                          href={`https://instagram.com/${profile.social_links.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-pink-600 hover:text-pink-700"
                        >
                          📷 Instagram
                        </a>
                      )}
                      {profile.social_links?.twitter && (
                        <a
                          href={`https://twitter.com/${profile.social_links.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-700"
                        >
                          🐦 Twitter
                        </a>
                      )}
                      {profile.social_links?.linkedin && (
                        <a
                          href={profile.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-700 hover:text-blue-800"
                        >
                          💼 LinkedIn
                        </a>
                      )}
                      {profile.social_links?.youtube && (
                        <a
                          href={profile.social_links.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-red-600 hover:text-red-700"
                        >
                          📺 YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Points History */}
            {pointsHistory.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Puan Geçmişi
                </h2>
                <div className="space-y-3">
                  {pointsHistory.slice(0, 5).map((history) => (
                    <div key={history.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {history.points_type === 'topic_created' && '📝'}
                          {history.points_type === 'comment_created' && '💬'}
                          {history.points_type === 'like_received' && '👍'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {history.points_type === 'topic_created' && 'Konu Oluşturma'}
                            {history.points_type === 'comment_created' && 'Yorum Yapma'}
                            {history.points_type === 'like_received' && 'Beğeni Alma'}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(history.created_at).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                      <div className="text-green-600 font-semibold">
                        +{history.points_earned}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <UserTopics topics={topics} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
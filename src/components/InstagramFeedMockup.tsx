import React from 'react';
import InstagramFeedContent from './InstagramFeedContent';
import { ProfileData, SuggestedProfile, FeedPost } from '../../types';

interface InstagramFeedMockupProps {
  profileData: ProfileData;
  suggestedProfiles: SuggestedProfile[];
  posts: FeedPost[]; // Adiciona a prop de posts
  locations: string[];
  onLockedFeatureClick: (featureName: string) => void;
}

const InstagramFeedMockup: React.FC<InstagramFeedMockupProps> = ({ profileData, suggestedProfiles, posts, locations, onLockedFeatureClick }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-black h-screen flex flex-col shadow-2xl shadow-purple-500/20 md:shadow-none relative">
      <InstagramFeedContent 
        profileData={profileData} 
        suggestedProfiles={suggestedProfiles} 
        posts={posts} // Passa os posts para o conteúdo
        locations={locations}
        onLockedFeatureClick={onLockedFeatureClick}
      />
    </div>
  );
};

export default InstagramFeedMockup;
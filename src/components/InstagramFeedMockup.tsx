import React from 'react';
import InstagramFeedContent from './InstagramFeedContent';
import { ProfileData, SuggestedProfile, FeedPost } from '../../types';

interface InstagramFeedMockupProps {
  profileData: ProfileData;
  suggestedProfiles: SuggestedProfile[];
  posts: FeedPost[];
  locations: string[];
  onLockedFeatureClick: (featureName: string) => void;
}

const InstagramFeedMockup: React.FC<InstagramFeedMockupProps> = ({ profileData, suggestedProfiles, posts, locations, onLockedFeatureClick }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-black h-full flex flex-col shadow-2xl shadow-purple-500/20 md:shadow-none relative overflow-hidden">
      <InstagramFeedContent 
        profileData={profileData} 
        suggestedProfiles={suggestedProfiles} 
        posts={posts} 
        locations={locations}
        onLockedFeatureClick={onLockedFeatureClick}
      />
    </div>
  );
};

export default InstagramFeedMockup;
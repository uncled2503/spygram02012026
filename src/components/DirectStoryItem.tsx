import React from 'react';

interface DirectStoryItemProps {
  avatarUrl: string;
  name: string;
  note: string;
  isOwnStory?: boolean;
}

const DirectStoryItem: React.FC<DirectStoryItemProps> = ({ avatarUrl, name, note, isOwnStory = false }) => {
  // Fallback para evitar erro de string vazia no src
  const safeAvatarUrl = avatarUrl || '/perfil.jpg';

  return (
    <div className="story-item">
      <div className="story-bubble">{note}</div>
      <img src={safeAvatarUrl} alt={name} className="story-avatar" />
      <span className="story-name">{isOwnStory ? 'Sua nota' : name}</span>
    </div>
  );
};

export default DirectStoryItem;
export interface PrivacySettings {
  status: string;
  whoCanFollowMe: string;
  whoCanMessageMe: string;
  whoCanSeeMyFriends: string;
  whoCanPostOnMyTimeline: string;
  whoCanSeeMyBirthday: string;
  confirmRequestWhenSomeoneFollowsYou: string;
  showMyActivities: string;
  shareMyLocationWithPublic: string;
  allowSearchEnginesToIndex: string;
}

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  aboutMe: string;
  location: string;
  website: string;
  relationship: string;
  school: string;
  schoolCompleted: boolean;
  workingAt: string;
  companyWebsite: string;
}

// Privacy utility functions
export const canViewProfile = (privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): boolean => {
  if (viewerType === 'self') return true;
  
  switch (privacySettings.whoCanFollowMe) {
    case 'Everyone':
      return true;
    case 'Friends only':
      return viewerType === 'friend';
    case 'No one':
      return false;
    default:
      return true;
  }
};

export const canViewFriends = (privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): boolean => {
  if (viewerType === 'self') return true;
  
  switch (privacySettings.whoCanSeeMyFriends) {
    case 'Everyone':
      return true;
    case 'Friends only':
      return viewerType === 'friend';
    case 'Only me':
      return false;
    default:
      return true;
  }
};

export const canViewLocation = (privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): boolean => {
  if (viewerType === 'self') return true;
  
  if (privacySettings.shareMyLocationWithPublic === 'No') {
    return viewerType === 'friend';
  }
  
  return true;
};

export const canViewActivities = (privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): boolean => {
  if (viewerType === 'self') return true;
  
  return privacySettings.showMyActivities === 'Yes';
};

export const canViewBirthday = (privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): boolean => {
  if (viewerType === 'self') return true;
  
  switch (privacySettings.whoCanSeeMyBirthday) {
    case 'Everyone':
      return true;
    case 'Friends only':
      return viewerType === 'friend';
    case 'Only me':
      return false;
    default:
      return true;
  }
};

export const canMessage = (privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): boolean => {
  if (viewerType === 'self') return false; // Can't message yourself
  
  switch (privacySettings.whoCanMessageMe) {
    case 'Everyone':
      return true;
    case 'Friends only':
      return viewerType === 'friend';
    case 'People I Follow':
      return viewerType === 'following';
    case 'No one':
      return false;
    default:
      return true;
  }
};

export const canPostOnTimeline = (privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): boolean => {
  if (viewerType === 'self') return true;
  
  switch (privacySettings.whoCanPostOnMyTimeline) {
    case 'Everyone':
      return true;
    case 'Friends only':
      return viewerType === 'friend';
    case 'People I Follow':
      return viewerType === 'following';
    case 'Only me':
      return false;
    default:
      return true;
  }
};

export const needsFollowConfirmation = (privacySettings: PrivacySettings): boolean => {
  return privacySettings.confirmRequestWhenSomeoneFollowsYou === 'Yes';
};

// Profile display utilities
export const getDisplayName = (profileSettings: ProfileSettings): string => {
  const firstName = profileSettings.firstName || '';
  const lastName = profileSettings.lastName || '';
  return `${firstName} ${lastName}`.trim() || 'Anonymous User';
};

export const getDisplayBio = (profileSettings: ProfileSettings, privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): string => {
  if (viewerType === 'self') return profileSettings.aboutMe || '';
  
  // If activities are hidden, don't show bio to non-friends
  if (privacySettings.showMyActivities === 'No' && viewerType !== 'friend') {
    return '';
  }
  
  return profileSettings.aboutMe || '';
};

export const getDisplayLocation = (profileSettings: ProfileSettings, privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): string => {
  if (!profileSettings.location) return '';
  
  if (canViewLocation(privacySettings, viewerType)) {
    return profileSettings.location;
  }
  
  return '';
};

export const getDisplayWorkplace = (profileSettings: ProfileSettings, privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): string => {
  if (!profileSettings.workingAt) return '';
  
  if (canViewActivities(privacySettings, viewerType)) {
    return profileSettings.workingAt;
  }
  
  return '';
};

export const getDisplayWebsite = (profileSettings: ProfileSettings, privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): string => {
  if (!profileSettings.website) return '';
  
  if (canViewProfile(privacySettings, viewerType)) {
    return profileSettings.website;
  }
  
  return '';
};

// Online status utilities
export const getOnlineStatus = (privacySettings: PrivacySettings, isOnline: boolean): string => {
  if (!isOnline) return 'Offline';
  
  switch (privacySettings.status) {
    case 'Online':
      return 'Online';
    case 'Away':
      return 'Away';
    case 'Busy':
      return 'Busy';
    case 'Offline':
      return 'Offline';
    default:
      return 'Online';
  }
};

export const shouldShowOnlineStatus = (privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): boolean => {
  if (viewerType === 'self') return true;
  
  // Only show online status to friends if activities are visible
  if (viewerType === 'friend') {
    return privacySettings.showMyActivities === 'Yes';
  }
  
  // Don't show online status to non-friends
  return false;
};

// Follow utilities
export const canFollow = (privacySettings: PrivacySettings, viewerType: 'public' | 'friend' | 'following' | 'self'): boolean => {
  if (viewerType === 'self') return false; // Can't follow yourself
  
  switch (privacySettings.whoCanFollowMe) {
    case 'Everyone':
      return true;
    case 'Friends only':
      return viewerType === 'friend';
    case 'No one':
      return false;
    default:
      return true;
  }
};

// Privacy level calculation
export const calculatePrivacyLevel = (privacySettings: PrivacySettings): number => {
  let privacyLevel = 0;
  
  if (privacySettings.whoCanFollowMe === 'No one') privacyLevel += 20;
  else if (privacySettings.whoCanFollowMe === 'Friends only') privacyLevel += 10;
  
  if (privacySettings.whoCanMessageMe === 'No one') privacyLevel += 20;
  else if (privacySettings.whoCanMessageMe === 'Friends only') privacyLevel += 10;
  
  if (privacySettings.whoCanSeeMyFriends === 'Only me') privacyLevel += 15;
  else if (privacySettings.whoCanSeeMyFriends === 'Friends only') privacyLevel += 7;
  
  if (privacySettings.whoCanPostOnMyTimeline === 'Only me') privacyLevel += 15;
  else if (privacySettings.whoCanPostOnMyTimeline === 'Friends only') privacyLevel += 7;
  
  if (privacySettings.whoCanSeeMyBirthday === 'Only me') privacyLevel += 10;
  else if (privacySettings.whoCanSeeMyBirthday === 'Friends only') privacyLevel += 5;
  
  if (privacySettings.confirmRequestWhenSomeoneFollowsYou === 'Yes') privacyLevel += 5;
  if (privacySettings.showMyActivities === 'No') privacyLevel += 5;
  if (privacySettings.shareMyLocationWithPublic === 'No') privacyLevel += 5;
  if (privacySettings.allowSearchEnginesToIndex === 'No') privacyLevel += 5;
  
  return privacyLevel;
};

export const getPrivacyLevelText = (privacyLevel: number): string => {
  if (privacyLevel >= 80) return 'Very Private';
  if (privacyLevel >= 60) return 'Private';
  if (privacyLevel >= 40) return 'Moderate';
  if (privacyLevel >= 20) return 'Open';
  return 'Very Open';
};

// Custom Hook: useSkillExchange
// Centralized reactive state manager for Peer Skill Exchange (Education Level Aware)

import { useState, useEffect, useCallback } from 'react';
import {
  getUserSkillsToTeach,
  getUserSkillsToLearn,
  getMarketplace,
  publishExchangeOffer,
  addSkillToTeach as addTeach,
  addSkillToLearn as addLearn,
  removeSkillToTeach as removeTeach,
  removeSkillToLearn as removeLearn,
  getExchangeRequests,
  sendExchangeRequest,
  acceptExchangeRequest,
  rejectExchangeRequest,
  getActiveExchanges,
  getSavedMatches,
  saveMatch as saveM,
  removeSavedMatch as removeSavedM,
  calculateUserStatistics
} from '../services/skillExchangeService';
import { getRecommendedMatches, searchMatchesByQuery, sortMatches } from '../services/skillMatchService';
import { useLearner } from '../context/LearnerContext';

export const useSkillExchange = () => {
  const { learner, learnerType = 'college' } = useLearner();

  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeExchanges, setActiveExchanges] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [savedUserIds, setSavedUserIds] = useState(() => getSavedMatches());
  const [stats, setStats] = useState({ skillsTeachCount: 0, skillsWantCount: 0, activeCount: 0, completedCount: 0 });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState({ wantSkill: 'All', experience: 'All', availability: 'All', format: 'All', verifiedOnly: false });

  const currentUser = {
    id: learner?.id || 'current_user',
    name: learner?.name || 'Learner',
    learnerType,
    education: learner?.title || (learnerType === 'school' ? 'Class 10 CBSE' : 'B.Tech CSE'),
    skillsToTeach: teachSkills,
    skillsToLearn: learnSkills,
    experience: learnerType === 'school' ? 'Intermediate' : 'Advanced',
    availability: 'Weekends',
    availableDays: ['Saturday', 'Sunday'],
    learningFormat: learnerType === 'school' ? 'Study partner' : '1-to-1',
    languages: ['English', 'Hindi']
  };

  const refreshState = useCallback(async () => {
    const [teach, learn, exchangeRequests, active, saved, statistics, listings] = await Promise.all([
      getUserSkillsToTeach(learnerType),
      getUserSkillsToLearn(learnerType),
      getExchangeRequests(),
      getActiveExchanges(),
      Promise.resolve(getSavedMatches()),
      calculateUserStatistics(learnerType),
      getMarketplace(),
    ]);
    setTeachSkills(teach);
    setLearnSkills(learn);
    setRequests(exchangeRequests);
    setActiveExchanges(active);
    setSavedUserIds(saved);
    setStats(statistics);
    setMarketplace(listings);
  }, [learnerType]);

  useEffect(() => {
    refreshState().catch((error) => console.error('Unable to load skill exchange data', error));
    const handleUpdate = () => {
      refreshState().catch(() => {});
    };
    window.addEventListener('edunova_skillexchange_updated', handleUpdate);

    // Socket.IO real-time event subscription for multi-user synchronization
    let socket = null;
    try {
      const { getSocket } = require('../lib/socketClient');
      socket = getSocket();
      if (socket) {
        socket.on('exchange:offer_published', handleUpdate);
        socket.on('exchange:new_request', handleUpdate);
        socket.on('exchange:status_updated', handleUpdate);
      }
    } catch (e) {
      console.warn('Socket connection deferred in useSkillExchange:', e);
    }

    return () => {
      window.removeEventListener('edunova_skillexchange_updated', handleUpdate);
      if (socket) {
        socket.off('exchange:offer_published', handleUpdate);
        socket.off('exchange:new_request', handleUpdate);
        socket.off('exchange:status_updated', handleUpdate);
      }
    };
  }, [refreshState]);

  // Perform AI Natural Language / Keyword match calculation
  const marketplaceUsers = marketplace.map((listing) => {
    const isOwn = !!listing.isCommunityListing ||
                  (listing.name && listing.name.toLowerCase().includes('you')) ||
                  (listing.userId && String(listing.userId).startsWith('peer_pub_')) ||
                  (listing.userId && currentUser.id && listing.userId === currentUser.id);

    const teachSkills = Array.isArray(listing.skillsToTeach) && listing.skillsToTeach.length > 0
      ? listing.skillsToTeach
      : [{ name: listing.skillOffered || listing.teachSkill || 'Academic Subject' }];
    const learnSkills = Array.isArray(listing.skillsToLearn) && listing.skillsToLearn.length > 0
      ? listing.skillsToLearn
      : [{ name: listing.skillWanted || listing.learnSkill || 'Practical Skill' }];

    const userRole = listing.role || (listing.learnerType === 'school' ? 'STUDENT' : 'INSTRUCTOR');

    return {
      id: listing.userId || listing.id || `user_${Math.random().toString(36).substr(2, 6)}`,
      name: isOwn ? `${currentUser.name} (You)` : (listing.name || 'Community Learner'),
      avatar: isOwn ? currentUser.avatar : (listing.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
      learnerType: listing.learnerType || 'school',
      role: userRole,
      education: listing.education || (userRole === 'INSTRUCTOR' ? 'Verified Mentor & Educator' : (listing.learnerType === 'school' ? 'School Academics • CBSE' : 'College Degree • Engineering')),
      skillsToTeach: teachSkills,
      skillsToLearn: learnSkills,
      experience: listing.experience || (userRole === 'INSTRUCTOR' ? 'Expert' : 'Advanced'),
      availability: listing.availability || 'Weekends & Evenings',
      learningFormat: listing.format || '1-to-1',
      description: listing.description || '',
      bio: listing.description || listing.bio || `Excited to exchange knowledge in ${teachSkills[0]?.name || 'topics'} for ${learnSkills[0]?.name || 'skills'}!`,
      isCommunityListing: !!listing.isCommunityListing,
      isOwnListing: isOwn,
      rating: listing.rating || 5.0,
      completedExchanges: listing.completedExchanges || (isOwn ? 0 : 4),
      verified: true,
    };
  });
  const matchedCandidates = searchMatchesByQuery(searchQuery, currentUser, marketplaceUsers);

  const filteredCandidates = matchedCandidates.filter(c => {
    // Only exclude exact duplicate of current user's profile
    if (c.id === currentUser.id && c.name === currentUser.name) {
      return false;
    }
    if (filters.wantSkill !== 'All') {
      const hasSkill = c.skillsToTeach.some(s => (typeof s === 'string' ? s : s.name).includes(filters.wantSkill));
      if (!hasSkill) return false;
    }
    if (filters.experience !== 'All' && c.experience !== filters.experience) return false;
    if (filters.availability !== 'All' && c.availability !== filters.availability && c.availability !== 'Flexible') return false;
    if (filters.format !== 'All' && c.learningFormat !== filters.format && c.learningFormat !== '1-to-1') return false;
    if (filters.verifiedOnly && !c.verified) return false;
    return true;
  });

  const sortedCandidates = sortMatches(filteredCandidates, sortBy);
  const savedCandidates = marketplaceUsers.filter(u => savedUserIds.includes(u.id));

  // Handler actions
  const handlePublishOffer = async (offerObj) => {
    const published = await publishExchangeOffer(offerObj, learnerType);
    await refreshState();
    return published;
  };

  const handleAddSkillToTeach = async (skillObj) => {
    await addTeach(skillObj, learnerType);
    await refreshState();
  };

  const handleRemoveSkillToTeach = async (id) => {
    await removeTeach(id, learnerType);
    await refreshState();
  };

  const handleAddSkillToLearn = async (skillObj) => {
    await addLearn(skillObj, learnerType);
    await refreshState();
  };

  const handleRemoveSkillToLearn = async (id) => {
    await removeLearn(id, learnerType);
    await refreshState();
  };

  const handleSendRequest = (targetUser, requestedSkill, offeredSkill, message) => {
    const req = sendExchangeRequest(targetUser, requestedSkill, offeredSkill, message);
    refreshState().catch((error) => console.error('Unable to refresh exchanges', error));
    return req;
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await acceptExchangeRequest(requestId);
      await refreshState();
      return res;
    } catch (error) {
      console.error('Unable to accept exchange', error);
      return null;
    }
  };

  const handleDeclineRequest = (requestId) => {
    rejectExchangeRequest(requestId).then(refreshState).catch((error) => console.error('Unable to reject exchange', error));
  };

  const handleToggleSave = (userId) => {
    if (savedUserIds.includes(userId)) {
      removeSavedM(userId);
    } else {
      saveM(userId);
    }
    refreshState();
  };

  return {
    learner,
    learnerType,
    currentUser,
    teachSkills,
    learnSkills,
    requests,
    activeExchanges,
    savedUserIds,
    stats,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    candidates: sortedCandidates,
    savedCandidates,
    handlePublishOffer,
    handleAddSkillToTeach,
    handleRemoveSkillToTeach,
    handleAddSkillToLearn,
    handleRemoveSkillToLearn,
    handleSendRequest,
    handleAcceptRequest,
    handleDeclineRequest,
    handleToggleSave,
    refreshState
  };
};

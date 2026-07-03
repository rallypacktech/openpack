import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const EQUINE_SPECIES = ['equine', 'livestock'];

    // Fetch all preparedness data
    const [profile, caches, meetSpots, familyMembers, pets, firstAidItems] = await Promise.all([
      base44.entities.UserProfile.filter({ created_by: user.email }),
      base44.entities.EmergencyCache.filter({ created_by: user.email, is_sample: false }),
      base44.entities.MeetSpot.filter({ created_by: user.email }),
      base44.entities.FamilyMember.filter({ created_by: user.email }),
      base44.entities.Pet.filter({ created_by: user.email }),
      base44.entities.FirstAidItem.filter({ created_by: user.email })
    ]);

    const userProfile = profile[0];
    let score = 0;
    const maxScore = 100;
    const breakdown = {};

    const hasLargeAnimals = pets.some(p => EQUINE_SPECIES.includes(p.species));

    // Profile completeness (25 points)
    let profileScore = 0;
    if (userProfile?.street_address) profileScore += 8;
    if (userProfile?.city) profileScore += 4;
    if (userProfile?.state_province) profileScore += 4;
    if (userProfile?.postal_code) profileScore += 4;
    if (userProfile?.latitude && userProfile?.longitude) profileScore += 5;
    breakdown.profile = { score: profileScore, max: 25, label: 'Profile Complete' };
    score += profileScore;

    // Family & Household (20 points)
    let householdScore = 0;
    if (familyMembers.length > 0) householdScore += 10;
    if (pets.length > 0) householdScore += 5;
    const contactsSet = familyMembers.filter(m => m.emergency_contact).length;
    if (contactsSet > 0) householdScore += 5;
    breakdown.household = { score: householdScore, max: 20, label: 'Household Info' };
    score += householdScore;

    // Emergency Caches (25 points)
    let cachesScore = 0;
    if (caches.length >= 1) cachesScore += 10;
    if (caches.length >= 2) cachesScore += 5;
    if (caches.length >= 3) cachesScore += 5;
    // Check if caches have items
    let totalCacheItems = 0;
    for (const cache of caches) {
      const items = await base44.entities.CacheItem.filter({ cache_id: cache.id });
      totalCacheItems += items.length;
    }
    if (totalCacheItems >= 10) cachesScore += 5;

    // Bonus: barn cache for large animals
    if (hasLargeAnimals) {
      const hasBarnCache = caches.some(c => c.cache_type === 'barn');
      if (hasBarnCache) cachesScore = Math.min(cachesScore + 3, 25);
    }

    breakdown.caches = { score: cachesScore, max: 25, label: 'Emergency Caches' };
    score += cachesScore;

    // Meet Spots (15 points)
    let meetSpotScore = 0;
    if (meetSpots.length >= 1) meetSpotScore += 8;
    if (meetSpots.length >= 3) meetSpotScore += 4;
    const hasPrimary = meetSpots.some(s => s.is_primary);
    if (hasPrimary) meetSpotScore += 3;
    breakdown.meetSpots = { score: meetSpotScore, max: 15, label: 'Meeting Spots' };
    score += meetSpotScore;

    // First Aid & Medical (15 points)
    let medicalScore = 0;
    if (firstAidItems.length >= 5) medicalScore += 8;
    if (firstAidItems.length >= 10) medicalScore += 4;
    const currentDate = new Date();
    const validItems = firstAidItems.filter(item => {
      if (!item.expiration_date) return true;
      return new Date(item.expiration_date) > currentDate;
    });
    if (validItems.length >= 5) medicalScore += 3;
    breakdown.medical = { score: medicalScore, max: 15, label: 'First Aid Supplies' };
    score += medicalScore;

    const percentage = Math.round((score / maxScore) * 100);

    return Response.json({
      score: percentage,
      breakdown,
      hasLargeAnimals,
      level: percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : percentage >= 40 ? 'Fair' : 'Needs Improvement',
      recommendations: generateRecommendations(breakdown, familyMembers.length, pets.length, hasLargeAnimals, userProfile)
    });
  } catch (error) {
    console.error('Error calculating readiness score:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateRecommendations(breakdown, familyCount, petCount, hasLargeAnimals, userProfile) {
  const recommendations = [];

  if (breakdown.profile.score < breakdown.profile.max) {
    recommendations.push('Complete your profile with full address information');
  }
  if (breakdown.household.score < 10) {
    recommendations.push('Add family members and pets to personalize your plan');
  }
  if (breakdown.caches.score < 15) {
    recommendations.push('Create emergency caches for home, car, and go-bag');
  }
  if (breakdown.meetSpots.score < 10) {
    recommendations.push('Set up meeting spots in multiple directions from home');
  }
  if (breakdown.medical.score < 10) {
    recommendations.push('Stock your first aid kit with essential supplies');
  }

  // Large animal specific recommendations
  if (hasLargeAnimals) {
    const alertSettings = userProfile?.alert_settings || {};
    const wildfireRadius = alertSettings.wildfire_radius_km ?? 80;
    const severeWeatherRadius = alertSettings.severe_weather_radius_km ?? 120;

    if (wildfireRadius < 150) {
      recommendations.push('🐴 You have equine or livestock — increase your wildfire alert radius to at least 150 km. Large animals need more evacuation lead time and are highly sensitive to smoke.');
    }
    if (severeWeatherRadius < 150) {
      recommendations.push('🐴 Increase your severe weather alert radius to 150+ km for earlier warning when evacuating large animals.');
    }
    if (breakdown.caches.score < 25) {
      recommendations.push('🐴 Create a Barn / Livestock cache stocked with emergency feed, spare halters, and equine medical supplies');
    }
  }

  return recommendations;
}
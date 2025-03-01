import { getMembersFromTeam } from './getMembersFromTeam';
import { getDraft } from './getDraft';
import { calculatePoints } from './database';

interface MemberPoints {
  address: string;
  totalPoints: number;
  kolAddresses: string[];
  kolPoints: {
    kolAddress: string;
    points: number | null;
    message?: string;
  }[];
}

export async function getTeamMembersByPoints(teamId: string, chainId: string): Promise<MemberPoints[]> {
  try {
    // Get all members from the team
    const members = await getMembersFromTeam(teamId, chainId);
    
    // Filter out empty addresses
    const validMembers = members.filter(member => member !== "");
    
    // Get points data for all KOLs using your existing function
    const pointsData = await calculatePoints();
    
    // Process each member
    const memberPointsPromises = validMembers.map(async (memberAddress) => {
      // Get the KOLs drafted by this member
      const draftedKols = await getDraft(memberAddress, chainId);
      
      // Find points for each KOL
      const kolPointsData = draftedKols.map(kolAddress => {
        const pointsEntry = pointsData.find(entry => entry.kolAddress.toLowerCase() === kolAddress.toLowerCase());
        return {
          kolAddress,
          points: pointsEntry ? pointsEntry.points : null,
          message: pointsEntry?.message || (!pointsEntry ? 'No points data available' : undefined)
        };
      });
      
      // Calculate total points (ignoring null values)
      const totalPoints = kolPointsData.reduce((sum, kol) => {
        return sum + (kol.points || 0);
      }, 0);
      
      return {
        address: memberAddress,
        totalPoints,
        kolAddresses: draftedKols,
        kolPoints: kolPointsData
      };
    });
    
    // Wait for all promises to resolve
    const memberPoints = await Promise.all(memberPointsPromises);
    
    // Sort members by total points (highest first)
    return memberPoints.sort((a, b) => b.totalPoints - a.totalPoints);
    
  } catch (error) {
    console.error('Error in getTeamMembersByPoints:', error);
    throw error;
  }
} 
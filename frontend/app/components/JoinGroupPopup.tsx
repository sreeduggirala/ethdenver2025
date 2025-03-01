"use client"

import { useState } from 'react';

interface JoinGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinGroup: (teamId: number) => void;
}

export default function JoinGroupPopup({ isOpen, onClose, onJoinGroup }: JoinGroupPopupProps) {
  const [teamId, setTeamId] = useState<number>(1);

  if (!isOpen) return null;

  const handleJoinGroup = () => {
    // TODO: Add logic to join a group
    onJoinGroup(teamId);
    setTeamId(1); // Reset the form
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Join Existing Group</h2>
        <p className="text-gray-300 mb-4">Enter the Team ID to join:</p>
        
        <div className="mb-6">
          <label htmlFor="teamId" className="block text-gray-300 mb-2">Team ID</label>
          <div className="flex items-center">
            <input
              id="teamId"
              type="number"
              min="1"
              step="1"
              value={teamId}
              onChange={(e) => setTeamId(Number(e.target.value))}
              className="bg-gray-700 p-3 rounded w-full text-white"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleJoinGroup}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded transition-colors flex-1"
            disabled={teamId <= 0}
          >
            Join Group
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded transition-colors flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 
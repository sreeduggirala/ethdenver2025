"use client"

import { useState } from 'react';

interface CreateGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (depositAmount: number) => void;
}

export default function CreateGroupPopup({ isOpen, onClose, onCreateGroup }: CreateGroupPopupProps) {
  const [depositAmount, setDepositAmount] = useState<number>(1);

  if (!isOpen) return null;

  const handleCreateGroup = () => {
    // TODO: Add logic to create a new group
    onCreateGroup(depositAmount);
    setDepositAmount(1); // Reset the form
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create New Group</h2>
        <p className="text-gray-300 mb-4">Set the amount of RLUSD each player must deposit:</p>
        
        <div className="mb-6">
          <label htmlFor="depositAmount" className="block text-gray-300 mb-2">Deposit Amount (RLUSD)</label>
          <div className="flex items-center">
            <input
              id="depositAmount"
              type="number"
              min="1"
              step="1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              className="bg-gray-700 p-3 rounded w-full text-white"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleCreateGroup}
            className="bg-green-500 hover:bg-green-600 px-4 py-3 rounded transition-colors flex-1"
            disabled={depositAmount <= 0}
          >
            Create Group
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
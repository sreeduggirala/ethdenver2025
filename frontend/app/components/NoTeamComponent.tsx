import { useState } from 'react';
import CreateGroupPopup from "./CreateGroupPopup";
import JoinGroupPopup from "./JoinGroupPopup";

export default function NoTeamComponent() {
    const [showCreateGroupPopup, setShowCreateGroupPopup] = useState(false);
    const [showJoinGroupPopup, setShowJoinGroupPopup] = useState(false);

    const handleCreateGroup = (depositAmount: number) => {
        // Implement group creation logic here using depositAmount
        console.log(`Creating new group with ${depositAmount} RLUSD deposit requirement`);
        setShowCreateGroupPopup(false);
    };

    const handleJoinGroup = (teamId: number) => {
        // Implement group joining logic here using teamId
        console.log(`Joining group with ID: ${teamId}`);
        setShowJoinGroupPopup(false);
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold mt-16 mb-8 text-center">
                Welcome!
            </h1>

            {/* Create Group Popup */}
            <CreateGroupPopup 
                isOpen={showCreateGroupPopup}
                onClose={() => setShowCreateGroupPopup(false)}
                onCreateGroup={handleCreateGroup}
            />

            {/* Join Group Popup */}
            <JoinGroupPopup 
                isOpen={showJoinGroupPopup}
                onClose={() => setShowJoinGroupPopup(false)}
                onJoinGroup={handleJoinGroup}
            />

            <div className="flex flex-col items-center gap-6 mt-8">
                <p className="text-xl text-gray-300">You're not part of any team yet!</p>
                <div className="flex gap-4">
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md mr-40 transition-colors mt-16"
                        onClick={() => setShowCreateGroupPopup(true)}
                    >
                        Create Group
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors mt-16"
                        onClick={() => setShowJoinGroupPopup(true)}
                    >
                        Join Group
                    </button>
                </div>
            </div>
        </div>
    );
} 
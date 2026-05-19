import React from 'react';
import { FiPhone } from 'react-icons/fi';

interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    avatar?: string;
    bio?: string;
    status: 'online' | 'offline' | 'away';
  };
}

interface UserListProps {
  users: User[];
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
  onCall?: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, selectedUserId, onSelectUser, onCall }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Contacts</h2>
        <p className="text-sm text-gray-500">{users.length} users online</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users available</div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => onSelectUser(user)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                selectedUserId === user._id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.profile.status === 'online'
                          ? 'bg-green-500'
                          : user.profile.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    <span className="text-xs text-gray-500 ml-1">{user.profile.status}</span>
                  </div>
                </div>

                {onCall && user.profile.status === 'online' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCall(user);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                  >
                    <FiPhone size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;

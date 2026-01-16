import React from "react";

export default function AttendeeList({ attendees, onLowerHand }) {
  return (
    <>
      {attendees.length > 0 ? (
        <ul className="space-y-3">
          {attendees.map(attendee => (
            <li key={attendee._id || attendee.id || attendee.email || attendee.name} className="flex items-center p-3 border rounded shadow-sm hover:bg-blue-50 transition">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-lg">{attendee.name}</p>
                  {attendee.raisedHand && (
                    <>
                      <span title="Raised Hand" className="text-yellow-500 text-xl animate-bounce">✋</span>
                      {onLowerHand && (
                        <button
                          onClick={() => onLowerHand(attendee)}
                          className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-semibold hover:bg-green-600 transition"
                        >
                          Lower Hand
                        </button>
                      )}
                    </>
                  )}
                  {attendee.isHost && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">Host</span>
                  )}
                </div>
                {attendee.email && (
                  <p className="text-sm text-gray-500">{attendee.email}</p>
                )}
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {attendee.role || (attendee.isHost ? "Host" : "Guest")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No attendees yet</p>
      )}
    </>
  );
}
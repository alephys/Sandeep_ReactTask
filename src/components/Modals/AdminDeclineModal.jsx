import React, { useState } from "react";

const AdminDeclineModal = ({ isOpen, onClose, onSubmit }) => {
  const [comments, setComments] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Decline Request</h2>

        <textarea
          className="w-full p-2 border rounded"
          placeholder="Add comments (optional)"
          rows="4"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            onClick={() => onSubmit(comments)}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDeclineModal;
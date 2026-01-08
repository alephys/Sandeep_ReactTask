import React, { useState } from "react";
import axios from "axios";

const UserAlterTopicModal = ({ isOpen, onClose, topic }) => {
  const [newPartitions, setNewPartitions] = useState("");
  const [message, setMessage] = useState(null);

  if (!isOpen || !topic) return null;

  const handleSendRequest = async () => {
    if (!newPartitions || Number(newPartitions) <= topic.partitions) {
      setMessage({
        type: "error",
        text: "New partition count must be greater than current.",
      });
      return;
    }

    try {
      const res = await axios.post(
        "/api/home_api/",
        {
          topic_name: topic.name,
          partitions: Number(newPartitions),
          request_type: "ALTER",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage({
        type: res.data.success ? "success" : "error",
        text: res.data.message,
      });

      if (res.data.success) {
        setTimeout(() => {
          setMessage(null);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to send request.",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-5 rounded shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Request Topic Alter</h2>

        <p><b>Topic:</b> {topic.name}</p>
        <p className="text-sm text-gray-600 mb-4">
          Current partitions: {topic.partitions}
        </p>

        <label className="block mb-1 text-gray-700">New partition count</label>
        <input
          type="number"
          min={topic.partitions + 1}
          className="w-full border p-2 rounded"
          value={newPartitions}
          onChange={(e) => setNewPartitions(e.target.value)}
        />

        {message && (
          <div
            className={`mt-3 p-2 rounded text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSendRequest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAlterTopicModal;

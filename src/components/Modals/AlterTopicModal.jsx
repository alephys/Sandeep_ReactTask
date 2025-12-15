import React, { useEffect, useState } from "react";
import axios from "axios";

const AlterTopicModal = ({ isOpen, onClose, topicName, onSuccess }) => {
  const [topic, setTopic] = useState(null);
  const [newPartitions, setNewPartitions] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !topicName) return;

    // reset state on open
    setTopic(null);
    setNewPartitions("");
    setMessages([]);
    setError("");
    setLoading(true);

    axios
      .get(`/api/topic/${encodeURIComponent(topicName)}/`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setTopic(res.data.topic);
          setNewPartitions(res.data.topic.partitions);
        } else {
          setError(res.data.message || "Failed to load topic details");
        }
      })
      .catch(() => setError("Error fetching topic details"))
      .finally(() => setLoading(false));
  }, [isOpen, topicName]);

  const handleAlter = async () => {
    if (!topic)
      return setMessages([{ text: "Topic not loaded yet", type: "error" }]);

    if (!newPartitions || newPartitions <= topic.partitions)
      return setMessages([
        {
          text: "New partition count must be greater than existing",
          type: "error",
        },
      ]);

    try {
      const res = await axios.patch(
        `/api/alter_topic_api/${topic.name}/`,
        { new_partition_count: parseInt(newPartitions) },
        { withCredentials: true }
      );

      setMessages([{ text: res.data.message, type: "success" }]);

      // notify parent (dashboard refresh)
      if (onSuccess) onSuccess();

      // auto close after success
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error(err);
      setMessages([{ text: "Error altering topic", type: "error" }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Alter Topic
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Loading / Error */}
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 p-3 rounded text-sm font-medium ${
              msg.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* Body */}
        {!loading && topic && (
          <>
            <p className="mb-2">
              <b>Topic:</b> {topic.name}
            </p>

            <p className="mb-4 text-sm text-gray-500">
              Current Partitions: {topic.partitions}
            </p>

            <label className="block text-gray-600 mb-1">
              New partition count
            </label>
            <input
              type="number"
              min={topic.partitions + 1}
              value={newPartitions}
              onChange={(e) => setNewPartitions(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />

            {/* Footer */}
            <div className="mt-6 text-right space-x-3">
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAlter}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Alter
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AlterTopicModal;
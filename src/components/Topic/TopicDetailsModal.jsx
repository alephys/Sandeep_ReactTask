import React, { useEffect, useState } from "react";
import axios from "axios";

const TopicDetailsModal = ({ isOpen, onClose, topicName, role }) => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !topicName) return;

    setTopic(null);
    setLoading(true);
    setError("");

    axios
      .get(`/api/topic/${encodeURIComponent(topicName)}/`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setTopic(res.data.topic);
        } else {
          setError("Topic not found");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch topic details");
      })
      .finally(() => setLoading(false));
  }, [isOpen, topicName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Topic Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && topic && (
          <div className="space-y-3">
            <p>
              <b>Name:</b> {topic.name}
            </p>
            <p>
              <b>Partitions:</b> {topic.partitions}
            </p>
            <p>
              <b>Replication Factor:</b> {topic.replication_factor}
            </p>
            <p>
              <b>Created By:</b> {topic.created_by}
            </p>

            {role === "admin" && (
              <p className="text-sm text-gray-500">
                Internal Topic: {topic.is_internal ? "Yes" : "No"}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicDetailsModal;

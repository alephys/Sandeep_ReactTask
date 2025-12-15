import React from "react";

const AdminCreateTopicModal = ({
  isOpen,
  onClose,
  topicName,
  setTopicName,
  partitions,
  setPartitions,
  handleSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
      onClick={onClose} // Close when clicking outside
    >
      <div
        className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop closing
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Create a New Topic
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-600 mb-1">Topic Name</label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Number of Partitions</label>
            <input
              type="number"
              value={partitions}
              onChange={(e) => setPartitions(e.target.value)}
              min="1"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Topic
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AdminCreateTopicModal;

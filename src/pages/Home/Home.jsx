import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import SideBar from "../../components/SideBar/SideBar";
import NavBar from "../../components/NavBar/NavBar";
import { fetchUserTopics } from "../../api";
import useWebSocket, { getWebSocketUrl } from "../../hooks/useWebSocket";
import RequestTopicModal from "../../components/Modals/RequestTopicModal";
import TopicDetailsModal from "../../components/Topic/TopicDetailsModal";
import UserAlterTopicModal from "../../components/Modals/UserAlterTopicModal";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [partitions, setPartitions] = useState(1);
  const [createdTopics, setCreatedTopics] = useState([]);
  const [uncreatedRequests, setUncreatedRequests] = useState([]);

  const debounceTimer = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUserAlterModalOpen, setIsUserAlterModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // ---------------------------------------------------
  // 1. Debounced Refresh Function
  // ---------------------------------------------------
  const refreshData = useCallback(() => {
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const { data } = await axios.get("/api/home_api/");
        setUncreatedRequests(data.uncreated_requests || []);
        setCreatedTopics(data.created_topics || []);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      }
    }, 200);
  }, []);

  // ---------------------------------------------------
  // 2. Initial Fetch (no polling)
  // ---------------------------------------------------
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ---------------------------------------------------
  // 3. WebSocket Setup — REAL TIME User Updates
  // ---------------------------------------------------
  useWebSocket(getWebSocketUrl("/ws/user/"), (msg) => {
    console.log("WS User Message:", msg);

    const { event, payload = {} } = msg;

    switch (event) {
      case "topic_created":
        setMessages([
          {
            text: `Topic "${payload.topic_name}" created successfully.`,
            type: "success",
          },
        ]);
        refreshData();
        break;

      case "request_declined":
        setMessages([
          {
            text: `Your ${payload.request_type?.toLowerCase()} request for "${
              payload.topic_name
            }" was declined by admin. Comment: ${payload.comments || "-"}`,
            type: "error",
          },
        ]);
        refreshData();
        break;

      case "topic_deleted":
        setMessages([
          {
            text: `Topic "${payload.topic_name}" was deleted by admin.`,
            type: "success",
          },
        ]);
        refreshData();
        break;

      case "topic_created_by_admin":
        setMessages([
          {
            text: `Topic "${payload.topic_name}" created successfully.`,
            type: "success",
          },
        ]);
        refreshData();
        break;

      case "partitions_altered":
        setMessages([
          {
            text: `Partitions updated for "${payload.topic_name}" (${payload.old} → ${payload.new}).`,
            type: "success",
          },
        ]);
        refreshData();
        break;

      case "user_refresh":
        refreshData();
        break;

      default:
        console.log("Unknown WS event:", event);
    }
  });

  // ---------------------------------------------------
  // 4. Submit Topic Request
  // ---------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      topic_name: topicName,
      partitions: Number(partitions),
    };

    try {
      const { data } = await axios.post("/api/home_api/", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setMessages([
        { text: data.message, type: data.success ? "success" : "error" },
      ]);

      if (data.success) {
        setTopicName("");
        setPartitions(1);

        const topics = await fetchUserTopics();
        setCreatedTopics(topics);
      }
    } catch (err) {
      console.error("Error creating topic:", err);
      setMessages([
        {
          text: err.response?.data?.message || "Failed to send topic request",
          type: "error",
        },
      ]);
    }
  };

  // ---------------------------------------------------
  // 5. Create topic (after admin approved user's request)
  // ---------------------------------------------------
  // const handleCreateTopic = async (id) => {
  //   try {
  //     const { data } = await axios.post(`/api/create_topic_api/${id}/`);

  //     setMessages([
  //       { text: data.message, type: data.success ? "success" : "error" },
  //     ]);

  //     if (data.success) {
  //       const topics = await fetchUserTopics();
  //       setCreatedTopics(topics);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setMessages([{ text: "Topic creation failed", type: "error" }]);
  //   }
  // };

  // ---------------------------------------------------
  // 6. Delete User Topic
  // ---------------------------------------------------
  // const handleDeleteTopic = async (id) => {
  //   try {
  //     const { data } = await axios.delete(`/api/delete_topic/${id}/`);

  //     setMessages([
  //       { text: data.message, type: data.success ? "success" : "error" },
  //     ]);

  //     if (data.success) {
  //       const topics = await fetchUserTopics();
  //       setCreatedTopics(topics);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setMessages([{ text: "Delete failed", type: "error" }]);
  //   }
  // };

  const handleDeleteTopic = async (topic) => {
    try {
      const payload = {
        topic_name: topic.name,
        partitions: topic.partitions,
        request_type: "DELETE",
      };

      const { data } = await axios.post("/api/home_api/", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setMessages([
        { text: data.message, type: data.success ? "success" : "error" },
      ]);

      if (data.success) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
      setMessages([{ text: "Delete request failed", type: "error" }]);
    }
  };

  useEffect(() => {
    const openModal = () => setIsModalOpen(true);
    window.addEventListener("openRequestTopicModal", openModal);

    return () => window.removeEventListener("openRequestTopicModal", openModal);
  }, []);

  // ---------------------------------------------------
  // Render Component
  // ---------------------------------------------------
  return (
    <div className="max-w-10xl mx-auto font-sans mt-12">
      <NavBar />

      <div className="flex">
        <SideBar />

        {/* <main className="flex-1 p-5 bg-gray-100 rounded-md"> */}
        <main className="flex-1 ml-60 p-5 bg-gray-100 rounded-md min-h-screen">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            User Dashboard
          </h2>

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 mb-3 rounded text-sm font-medium ${
                msg.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {msg.text}
            </div>
          ))}

          {/* Request New Topic */}
          {/* <div className="bg-white rounded-lg p-5 mb-5 shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Request a New Topic
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
                <label className="block text-gray-600 mb-1">
                  Number of Partitions
                </label>
                <input
                  type="number"
                  value={partitions}
                  onChange={(e) => setPartitions(e.target.value)}
                  min="1"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded">
                Submit Request
              </button>
            </form>
          </div> */}
          <RequestTopicModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            topicName={topicName}
            setTopicName={setTopicName}
            partitions={partitions}
            setPartitions={setPartitions}
            handleSubmit={(e) => {
              handleSubmit(e);
              setIsModalOpen(false);
            }}
          />

          {/* Approved Requests */}
          <div className="bg-white rounded-lg p-5 mb-5 shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Topic Requests
            </h2>

            {uncreatedRequests.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="p-2 text-left">Topic</th>
                    <th className="p-2 text-left">Partitions</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Comments</th>
                  </tr>
                </thead>

                <tbody>
                  {uncreatedRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="p-2">{req.topic_name}</td>
                      <td className="p-2">{req.partitions}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            req.request_type === "DELETE"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {req.request_type}
                        </span>
                      </td>
                      {/* Status with color */}
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            req.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : req.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-2">{req.comments || "-"}</td>
                      {/* <td className="p-2"> */}
                      {/* <button
                          onClick={() => handleCreateTopic(req.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Create Topic
                        </button> */}
                      {/* <button
                          onClick={() => handleCreateTopic(req.id)}
                          disabled={req.status !== "APPROVED"} // only active when approved
                          className={`px-3 py-1 rounded text-sm text-white ${
                            req.status === "APPROVED"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Create Topic
                        </button> */}
                      {/* CREATE requests will never appear here now */}
                      {/* </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No approved requests.</p>
            )}
          </div>

          {/* Created Topics */}
          <div className="bg-white rounded-lg p-5 mb-5 shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Created Topics
            </h2>

            {createdTopics.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left">Topic</th>
                    <th className="p-2 text-left">Partitions</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {createdTopics.map((topic) => (
                    <tr key={topic.id}>
                      <td className="p-2">{topic.name}</td>
                      <td className="p-2">{topic.partitions}</td>

                      <td className="p-2 space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTopic(topic.name);
                            setIsViewModalOpen(true);
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          View
                        </button>

                        {/* <TopicDetailsModal
                          isOpen={isViewModalOpen}
                          onClose={() => setIsViewModalOpen(false)}
                          topicName={selectedTopic}
                          role="user"
                        /> */}

                        {/* <button
                          onClick={() => navigate(`/topic/${topic.name}`)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          View
                        </button> */}
                        <button
                          onClick={() => {
                            setSelectedTopic(topic);
                            setIsUserAlterModalOpen(true);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Request Alter
                        </button>

                        <button
                          onClick={() => handleDeleteTopic(topic)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete request
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No created topics yet.</p>
            )}
          </div>
          <TopicDetailsModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedTopic(null);
            }}
            topicName={selectedTopic}
            role="user"
          />
          <UserAlterTopicModal
            isOpen={isUserAlterModalOpen}
            onClose={() => setIsUserAlterModalOpen(false)}
            topic={selectedTopic}
          />
        </main>
      </div>
    </div>
  );
};

export default Home;

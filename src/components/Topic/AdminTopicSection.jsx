import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../../hooks/useWebSocket";
import AdminCreateTopicModal from "../Modals/AdminCreateTopicModal";
import TopicDetailsModal from "./TopicDetailsModal";
import AlterTopicModal from "../Modals/AlterTopicModal";

const AdminTopicSection = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [createdTopics, setCreatedTopics] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [topicName, setTopicName] = useState("");
  const [partitions, setPartitions] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isAlterModalOpen, setIsAlterModalOpen] = useState(false);
  const [selectedAlterTopic, setSelectedAlterTopic] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // number of topics per page

  // Debounced admin dashboard refresh
  const refreshData = useCallback(() => {
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const { data } = await axios.get("/api/admin_dashboard_api/");
        setPendingRequests(data.pending_requests || []);
        setCreatedTopics(data.created_topics || []);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      }
    }, 200);
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // WebSocket listener (Admin)
  useWebSocket("ws://127.0.1.1:8000/ws/admin/", (msg) => {
    console.log("WS Admin Message:", msg);

    // const event = msg?.data?.event;
    // if (!event) return;

    switch (msg.event) {
      case "new_request": // user submitted request
      case "topic_created": // user created topic
      case "topic_deleted": // topic removed
      case "admin_refresh": // admin panel actions
        refreshData();
        break;

      default:
        console.log("Unknown WS event:", msg.event);
    }
  });

  useEffect(() => {
    const openModal = () => setIsCreateModalOpen(true);

    window.addEventListener("openCreateTopicModal", openModal);

    return () => window.removeEventListener("openCreateTopicModal", openModal);
  }, []);

  // const handleCreateTopic = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setMessages([]);

  //   try {
  //     const res = await axios.post("/api/admin_dashboard_api/", {
  //       topic_name: topicName,
  //       partitions: partitions,
  //     });

  //     if (res.data.success) {
  //       setMessages([{ text: res.data.message, type: "success" }]);
  //       setTopicName("");
  //       setPartitions(1);
  //     } else {
  //       setError(res.data.message || "Failed to create topic");
  //     }
  //   } catch {
  //     setError("Error creating topic");
  //   }
  // };

  const handleApprove = async (id) => {
    try {
      const res = await axios.post(`/api/approve_request/${id}/`);
      setMessages([{ text: res.data.message, type: "success" }]);
    } catch {
      setMessages([{ text: "Failed to approve request", type: "error" }]);
    }
  };

  const handleDecline = async (id) => {
    try {
      const res = await axios.post(`/api/decline_request/${id}/`);
      setMessages([{ text: res.data.message, type: "error" }]);
    } catch {
      setMessages([{ text: "Failed to decline request", type: "error" }]);
    }
  };

  const handleDeleteTopic = async (id) => {
    try {
      const res = await axios.delete(`/api/delete_topic/${id}/`);
      setMessages([
        {
          text: res.data.message,
          type: res.data.success ? "success" : "error",
        },
      ]);
    } catch {
      setMessages([{ text: "Delete failed", type: "error" }]);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/admin_dashboard_api/", {
        topic_name: topicName,
        partitions,
      });

      if (res.data.success) {
        setMessages([{ text: res.data.message, type: "success" }]);
        setTopicName("");
        setPartitions(1);
        setIsCreateModalOpen(false);
      } else {
        setError(res.data.message || "Failed to create topic");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating topic");
    }
  };

  const openAlterModal = (topicName) => {
    setSelectedAlterTopic(topicName);
    setIsAlterModalOpen(true);
  };

  const closeAlterModal = () => {
    setIsAlterModalOpen(false);
    setSelectedAlterTopic(null);
  };

  const totalPages = Math.ceil(createdTopics.length / pageSize);

  const paginatedTopics = createdTopics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="mt-6">
      {/* Message Alerts */}
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
      <AdminCreateTopicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        topicName={topicName}
        setTopicName={setTopicName}
        partitions={partitions}
        setPartitions={setPartitions}
        handleSubmit={handleAdminSubmit}
      />

      {/* CREATE TOPIC */}
      {/* <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Create a New Topic
        </h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Topic Name
            </label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Partitions
            </label>
            <input
              type="number"
              min="1"
              value={partitions}
              onChange={(e) => setPartitions(Number(e.target.value))}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <button className="bg-green-600 text-white px-6 py-2 rounded-md">
            Create Topic
          </button>
        </form>
      </div> */}

      {/* PENDING REQUESTS */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Pending Topic Requests
        </h2>

        {pendingRequests.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">Topic Name</th>
                <th className="px-6 py-3 text-left">Partitions</th>
                <th className="px-6 py-3 text-left">Requested By</th>
                <th className="p-2 text-left">Type</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {pendingRequests.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-4">{req.topic_name}</td>
                  <td className="px-6 py-4">{req.partitions}</td>
                  <td className="px-6 py-4">{req.requested_by__username}</td>
                  <td className="p-2">
                    {req.request_type === "CREATE"
                      ? "Create Topic"
                      : "Delete Topic"}
                  </td>

                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleDecline(req.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                    >
                      Decline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No pending requests.</p>
        )}
      </div>

      {/* CREATED TOPICS */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Created Topics
        </h2>

        {createdTopics.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Topic Name</th>
                <th className="px-6 py-3 text-left">Partitions</th>
                <th className="px-6 py-3 text-left">Created By</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTopics.map((topic) => (
                <tr key={topic.name}>
                  <td className="px-6 py-4">
                    {topic.name}
                    {topic.is_internal && (
                      <span className="ml-2 text-xs text-gray-500">
                        (internal)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{topic.partitions}</td>
                  <td className="px-6 py-4">{topic.created_by__username}</td>

                  <td className="px-2 py-2 space-x-2">
                    {/* <button
                      onClick={() => navigate(`/topic/${topic.name}`)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      View
                    </button> */}
                    <button
                      onClick={() => {
                        setSelectedTopic(topic.name);
                        setIsViewModalOpen(true);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      View
                    </button>

                    {/* <button
                      onClick={() =>
                        topic.id && navigate(`/alter-topic/${topic.name}`)
                      }
                      disabled={!topic.id}
                      className={`px-3 py-1 rounded text-sm ${
                        topic.id
                          ? "bg-orange-500 text-white"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Alter
                    </button> */}

                    <button
                      onClick={() => openAlterModal(topic.name)}
                      disabled={topic.is_internal}
                      className={`px-3 py-1 rounded text-sm ${
                        topic.is_internal
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      Alter
                    </button>

                    <button
                      onClick={() => topic.id && handleDeleteTopic(topic.id)}
                      disabled={!topic.id}
                      className={`px-3 py-1 rounded text-sm ${
                        topic.id
                          ? "bg-red-600 text-white"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* <tbody>
              {createdTopics.map((topic) => (
                <tr key={topic.id}>
                  <td className="px-6 py-4">{topic.name}</td>
                  <td className="px-6 py-4">{topic.partitions}</td>
                  <td className="px-6 py-4">{topic.created_by__username}</td>

                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => navigate(`/topic/${topic.name}`)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/alter-topic/${topic.name}`)}
                      className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Alter
                    </button>

                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody> */}
          </table>
        ) : (
          <p className="text-gray-500">No topics created yet.</p>
        )}
        <div className="flex justify-end items-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <TopicDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTopic(null);
        }}
        topicName={selectedTopic}
        role="admin"
      />

      <AlterTopicModal
        isOpen={isAlterModalOpen}
        topicName={selectedAlterTopic}
        onClose={closeAlterModal}
        onSuccess={() => {
          refreshData(); // reload topics
          closeAlterModal();
        }}
      />
    </div>
  );
};

export default AdminTopicSection;

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import useWebSocket from "../../hooks/useWebSocket";

// const AdminTopicSection = () => {
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [createdTopics, setCreatedTopics] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [error, setError] = useState("");
//   const [topicName, setTopicName] = useState("");
//   const [partitions, setPartitions] = useState(1);

//   const navigate = useNavigate();
//   const debounceTimer = useRef(null);

//   // ------------------------------
//   // Debounced API refresh
//   // ------------------------------
//   const refreshData = useCallback(() => {
//     clearTimeout(debounceTimer.current);
//     debounceTimer.current = setTimeout(async () => {
//       try {
//         const { data } = await axios.get("/api/admin_dashboard_api/");
//         setPendingRequests(data.pending_requests || []);
//         setCreatedTopics(data.created_topics || []);
//       } catch (err) {
//         console.error("Failed to refresh admin dashboard:", err);
//       }
//     }, 200);
//   }, []);

//   // Initial fetch
//   useEffect(() => {
//     refreshData();
//   }, [refreshData]);

//   // --------------------------------------
//   // Real-time WebSocket Listener (Admin)
//   // --------------------------------------
//   useWebSocket("ws://127.0.1.1:8000/ws/admin/", (msg) => {
//     console.log("WS Admin Message:", msg);

//     switch (msg.type) {
//       case "pending_request_added":
//       case "topic_created_by_user":
//       case "admin_refresh":
//       case "topic_deleted":
//         refreshData();
//         break;

//       default:
//         console.log("Unknown WS event:", msg);
//     }
//   });

//   // -------------------------------
//   // Create Topic (Admin)
//   // -------------------------------
//   const handleCreateTopic = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMessages([]);

//     try {
//       const res = await axios.post("/api/admin_dashboard_api/", {
//         topic_name: topicName,
//         partitions: partitions,
//       });

//       if (res.data.success) {
//         setMessages([{ text: res.data.message, type: "success" }]);
//         setTopicName("");
//         setPartitions(1);
//       } else {
//         setError(res.data.message || "Failed to create topic");
//       }
//     } catch (err) {
//       console.error("Error while creating topic:", err);
//       setError("Error while creating topic");
//     }
//   };

//   // -------------------------------
//   // Approve Request
//   // -------------------------------
//   const handleApprove = async (id) => {
//     try {
//       const res = await axios.post(`/api/approve_request/${id}/`);

//       setMessages([{ text: res.data.message, type: "success" }]);
//     } catch {
//       setMessages([{ text: "Failed to approve request", type: "error" }]);
//     }
//   };

//   // -------------------------------
//   // Decline Request
//   // -------------------------------
//   const handleDecline = async (id) => {
//     try {
//       const res = await axios.post(`/api/decline_request/${id}/`);
//       setMessages([{ text: res.data.message, type: "error" }]);
//     } catch {
//       setMessages([{ text: "Failed to decline request", type: "error" }]);
//     }
//   };

//   // -------------------------------
//   // Delete Topic
//   // -------------------------------
//   const handleDeleteTopic = async (id) => {
//     try {
//       const res = await axios.delete(`/api/delete_topic/${id}/`);
//       setMessages([{ text: res.data.message, type: res.data.success ? "success" : "error" }]);
//     } catch {
//       setMessages([{ text: "Delete failed", type: "error" }]);
//     }
//   };

//   return (
//     <div className="mt-6">
//       {/* Messages */}
//       {messages.map((msg, i) => (
//         <div
//           key={`${msg.type}-${i}`}
//           className={`mb-3 p-3 rounded text-sm font-medium ${
//             msg.type === "success"
//               ? "bg-green-100 text-green-700"
//               : "bg-red-100 text-red-700"
//           }`}
//         >
//           {msg.text}
//         </div>
//       ))}

//       {/* -------- Create Topic Form -------- */}
//       <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">
//           Create a New Topic
//         </h2>
//         {error && <p className="text-red-600 mb-4">{error}</p>}
//         <form onSubmit={handleCreateTopic} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Topic Name
//             </label>
//             <input
//               type="text"
//               value={topicName}
//               onChange={(e) => setTopicName(e.target.value)}
//               required
//               className="w-full p-2 border rounded-md"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Partitions
//             </label>
//             <input
//               type="number"
//               min="1"
//               value={partitions}
//               onChange={(e) => setPartitions(e.target.value)}
//               required
//               className="w-full p-2 border rounded-md"
//             />
//           </div>

//           <button className="bg-green-600 text-white px-6 py-2 rounded-md">
//             Create Topic
//           </button>
//         </form>
//       </div>

//       {/* -------- Pending Requests -------- */}
//       <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">
//           Pending Topic Requests
//         </h2>

//         {pendingRequests.length > 0 ? (
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="px-6 py-3 text-left">Topic Name</th>
//                 <th className="px-6 py-3 text-left">Partitions</th>
//                 <th className="px-6 py-3 text-left">Requested By</th>
//                 <th className="px-6 py-3 text-left">Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {pendingRequests.map((req) => (
//                 <tr key={req.id}>
//                   <td className="px-6 py-4">{req.topic_name}</td>
//                   <td className="px-6 py-4">{req.partitions}</td>
//                   <td className="px-6 py-4">{req.requested_by__username}</td>

//                   <td className="px-6 py-4 space-x-3">
//                     <button
//                       onClick={() => handleApprove(req.id)}
//                       className="px-3 py-1 rounded bg-green-600 text-white text-xs"
//                     >
//                       Approve
//                     </button>

//                     <button
//                       onClick={() => handleDecline(req.id)}
//                       className="px-3 py-1 rounded bg-red-600 text-white text-xs"
//                     >
//                       Decline
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500">No pending requests.</p>
//         )}
//       </div>

//       {/* -------- Created Topics -------- */}
//       <div className="bg-white p-6 rounded-lg shadow-lg">
//         <h2 className="text-xl font-semibold text-gray-700 mb-3">
//           Created Topics
//         </h2>

//         {createdTopics.length > 0 ? (
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left">Topic Name</th>
//                 <th className="px-6 py-3 text-left">Partitions</th>
//                 <th className="px-6 py-3 text-left">Created By</th>
//                 <th className="px-6 py-3 text-left">Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {createdTopics.map((topic) => (
//                 <tr key={topic.id}>
//                   <td className="px-6 py-4">{topic.name}</td>
//                   <td className="px-6 py-4">{topic.partitions}</td>
//                   <td className="px-6 py-4">{topic.created_by__username}</td>

//                   <td className="px-6 py-4 space-x-2">
//                     <button
//                       onClick={() => navigate(`/topic/${topic.name}`)}
//                       className="bg-green-600 text-white px-3 py-1 rounded text-sm"
//                     >
//                       View
//                     </button>

//                     <button
//                       onClick={() => navigate(`/alter-topic/${topic.name}`)}
//                       className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
//                     >
//                       Alter
//                     </button>

//                     <button
//                       onClick={() => handleDeleteTopic(topic.id)}
//                       className="bg-red-600 text-white px-3 py-1 rounded text-sm"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500">No created topics yet.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminTopicSection;

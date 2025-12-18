import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import useWebSocket, { getWebSocketUrl } from "../../hooks/useWebSocket";
import AdminCreateTopicModal from "../Modals/AdminCreateTopicModal";
import TopicDetailsModal from "./TopicDetailsModal";
import AlterTopicModal from "../Modals/AlterTopicModal";

const AdminTopicSection = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [createdTopics, setCreatedTopics] = useState([]);
  const [messages, setMessages] = useState([]);

  const [topicName, setTopicName] = useState("");

  const [partitions, setPartitions] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [isAlterModalOpen, setIsAlterModalOpen] = useState(false);
  const [selectedAlterTopic, setSelectedAlterTopic] = useState(null);

  const [topicFilter, setTopicFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const debounceTimer = useRef(null);

  // -------------------------------
  // Fetch dashboard data (debounced)
  // -------------------------------
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

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // -------------------------------
  // WebSocket refresh
  // -------------------------------
  useWebSocket(getWebSocketUrl("/ws/admin/"), (msg) => {
    switch (msg.event) {
      case "new_request":
      case "topic_created":
      case "topic_deleted":
      case "admin_refresh":
        refreshData();
        break;
      default:
        break;
    }
  });

  // -------------------------------
  // Filtering logic
  // -------------------------------
  const filteredTopics = createdTopics.filter((topic) => {
    switch (topicFilter) {
      case "INTERNAL":
        return topic.is_internal;

      case "CLI":
        return topic.created_by__username === "CLI / System";

      case "ADMIN":
        return topic.created_by__username === "admin";

      case "USER":
        return (
          topic.created_by__username !== "admin" &&
          topic.created_by__username !== "CLI / System" &&
          !topic.is_internal
        );

      default:
        return true;
    }
  });

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [topicFilter]);

  const topicCounts = {
    ALL: createdTopics.length,

    INTERNAL: createdTopics.filter((t) => t.is_internal).length,

    CLI: createdTopics.filter((t) => t.created_by__username === "CLI / System")
      .length,

    ADMIN: createdTopics.filter((t) => t.created_by__username === "admin")
      .length,

    USER: createdTopics.filter(
      (t) =>
        t.created_by__username !== "admin" &&
        t.created_by__username !== "CLI / System" &&
        !t.is_internal
    ).length,
  };

  // -------------------------------
  // Pagination
  // -------------------------------
  const totalPages = Math.ceil(filteredTopics.length / pageSize);

  const paginatedTopics = filteredTopics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // -------------------------------
  // Actions
  // -------------------------------
  const handleApprove = async (id) => {
    const res = await axios.post(`/api/approve_request/${id}/`);
    setMessages([{ text: res.data.message, type: "success" }]);
  };

  const handleDecline = async (id) => {
    const res = await axios.post(`/api/decline_request/${id}/`);
    setMessages([{ text: res.data.message, type: "error" }]);
  };

  const handleDeleteTopic = async (id) => {
    const res = await axios.delete(`/api/delete_topic/${id}/`);
    setMessages([
      { text: res.data.message, type: res.data.success ? "success" : "error" },
    ]);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("/api/admin_dashboard_api/", {
      topic_name: topicName,
      partitions,
    });

    if (res.data.success) {
      setMessages([{ text: res.data.message, type: "success" }]);
      setTopicName("");
      setPartitions(1);
      setIsCreateModalOpen(false);
    }
  };

  useEffect(() => {
    const openModal = () => setIsCreateModalOpen(true);

    window.addEventListener("openCreateTopicModal", openModal);

    return () => window.removeEventListener("openCreateTopicModal", openModal);
  }, []);

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="mt-6">
      {/* Alerts */}
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

      {/* ===========================
           PENDING TOPIC REQUESTS
         =========================== */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Pending Topic Requests
        </h2>

        {pendingRequests.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Topic Name</th>
                <th className="px-6 py-3 text-left">Partitions</th>
                <th className="px-6 py-3 text-left">Requested By</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-4">{req.topic_name}</td>
                  <td className="px-6 py-4">{req.partitions}</td>
                  <td className="px-6 py-4">{req.requested_by__username}</td>
                  <td className="px-6 py-4">
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

      {/* ===========================
           CREATED TOPICS
         =========================== */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Created Topics
          </h2>

          <div className="flex gap-2">
            {[
              ["ALL", "All"],
              ["INTERNAL", "Internal"],
              ["CLI", "CLI / System"],
              ["ADMIN", "Admin"],
              ["USER", "User"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTopicFilter(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                  topicFilter === value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{label}</span>

                {/* Count Badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold
        ${
          topicFilter === value
            ? "bg-white text-blue-600"
            : "bg-gray-300 text-gray-700"
        }`}
                >
                  {topicCounts[value]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredTopics.length > 0 ? (
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
                    <button
                      onClick={() => {
                        setSelectedTopic(topic.name);
                        setIsViewModalOpen(true);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      View
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAlterTopic(topic.name);
                        setIsAlterModalOpen(true);
                      }}
                      disabled={topic.is_internal}
                      className={`px-3 py-1 rounded text-sm ${
                        topic.is_internal
                          ? "bg-gray-300 cursor-not-allowed"
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
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-6">
            No topics match this filter.
          </p>
        )}

        {totalPages > 1 && (
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <TopicDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        topicName={selectedTopic}
        role="admin"
      />

      <AlterTopicModal
        isOpen={isAlterModalOpen}
        topicName={selectedAlterTopic}
        onClose={() => setIsAlterModalOpen(false)}
        onSuccess={() => {
          refreshData();
          setIsAlterModalOpen(false);
        }}
      />
    </div>
  );
};

export default AdminTopicSection;

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import axios from "axios";
// import useWebSocket from "../../hooks/useWebSocket";
// import AdminCreateTopicModal from "../Modals/AdminCreateTopicModal";
// import TopicDetailsModal from "./TopicDetailsModal";
// import AlterTopicModal from "../Modals/AlterTopicModal";

// const AdminTopicSection = () => {
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [createdTopics, setCreatedTopics] = useState([]);
//   const [messages, setMessages] = useState([]);

//   const [topicName, setTopicName] = useState("");
//   const [partitions, setPartitions] = useState(1);

//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

//   const debounceTimer = useRef(null);

//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [selectedTopic, setSelectedTopic] = useState(null);

//   const [isAlterModalOpen, setIsAlterModalOpen] = useState(false);
//   const [selectedAlterTopic, setSelectedAlterTopic] = useState(null);

//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 5; // number of topics per page

//   const [topicFilter, setTopicFilter] = useState("ALL");

//   // Debounced admin dashboard refresh
//   const refreshData = useCallback(() => {
//     clearTimeout(debounceTimer.current);

//     debounceTimer.current = setTimeout(async () => {
//       try {
//         const { data } = await axios.get("/api/admin_dashboard_api/");
//         setPendingRequests(data.pending_requests || []);
//         setCreatedTopics(data.created_topics || []);
//       } catch (err) {
//         console.error("Failed to load admin dashboard:", err);
//       }
//     }, 200);
//   }, []);

//   // Initial load
//   useEffect(() => {
//     refreshData();
//   }, [refreshData]);

//   // WebSocket listener (Admin)
//   useWebSocket("ws://127.0.1.1:8000/ws/admin/", (msg) => {
//     console.log("WS Admin Message:", msg);

//     // const event = msg?.data?.event;
//     // if (!event) return;

//     switch (msg.event) {
//       case "new_request": // user submitted request
//       case "topic_created": // user created topic
//       case "topic_deleted": // topic removed
//       case "admin_refresh": // admin panel actions
//         refreshData();
//         break;

//       default:
//         console.log("Unknown WS event:", msg.event);
//     }
//   });
//   // -------------------------------
//   // Filtering Logic
//   // -------------------------------
//   const filteredTopics = createdTopics.filter((topic) => {
//     switch (topicFilter) {
//       case "INTERNAL":
//         return topic.is_internal;

//       case "CLI":
//         return topic.created_by__username === "CLI / System";

//       case "ADMIN":
//         return topic.created_by__username === "admin";

//       case "USER":
//         return (
//           topic.created_by__username !== "admin" &&
//           topic.created_by__username !== "CLI / System" &&
//           !topic.is_internal
//         );

//       default:
//         return true;
//     }
//   });

//   // Reset page on filter change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [topicFilter]);

//   useEffect(() => {
//     const openModal = () => setIsCreateModalOpen(true);

//     window.addEventListener("openCreateTopicModal", openModal);

//     return () => window.removeEventListener("openCreateTopicModal", openModal);
//   }, []);

//   const handleApprove = async (id) => {
//     try {
//       const res = await axios.post(`/api/approve_request/${id}/`);
//       setMessages([{ text: res.data.message, type: "success" }]);
//     } catch {
//       setMessages([{ text: "Failed to approve request", type: "error" }]);
//     }
//   };

//   const handleDecline = async (id) => {
//     try {
//       const res = await axios.post(`/api/decline_request/${id}/`);
//       setMessages([{ text: res.data.message, type: "error" }]);
//     } catch {
//       setMessages([{ text: "Failed to decline request", type: "error" }]);
//     }
//   };

//   const handleDeleteTopic = async (id) => {
//     try {
//       const res = await axios.delete(`/api/delete_topic/${id}/`);
//       setMessages([
//         {
//           text: res.data.message,
//           type: res.data.success ? "success" : "error",
//         },
//       ]);
//     } catch {
//       setMessages([{ text: "Delete failed", type: "error" }]);
//     }
//   };

//   const handleAdminSubmit = async (e) => {
//     e.preventDefault();

//       const res = await axios.post("/api/admin_dashboard_api/", {
//         topic_name: topicName,
//         partitions,
//       });

//       if (res.data.success) {
//         setMessages([{ text: res.data.message, type: "success" }]);
//         setTopicName("");
//         setPartitions(1);
//         setIsCreateModalOpen(false);
//       }
//   };

//   const openAlterModal = (topicName) => {
//     setSelectedAlterTopic(topicName);
//     setIsAlterModalOpen(true);
//   };

//   const closeAlterModal = () => {
//     setIsAlterModalOpen(false);
//     setSelectedAlterTopic(null);
//   };

//   const totalPages = Math.ceil(createdTopics.length / pageSize);

//   const paginatedTopics = filteredTopics.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [topicFilter]);

//   return (
//     <div className="mt-6">
//       {/* Message Alerts */}
//       {messages.map((msg, i) => (
//         <div
//           key={i}
//           className={`mb-3 p-3 rounded text-sm font-medium ${
//             msg.type === "success"
//               ? "bg-green-100 text-green-700"
//               : "bg-red-100 text-red-700"
//           }`}
//         >
//           {msg.text}
//         </div>
//       ))}
//       <AdminCreateTopicModal
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         topicName={topicName}
//         setTopicName={setTopicName}
//         partitions={partitions}
//         setPartitions={setPartitions}
//         handleSubmit={handleAdminSubmit}
//       />

//       {/* PENDING REQUESTS */}
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
//                 <th className="p-2 text-left">Type</th>
//                 <th className="px-6 py-3 text-left">Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {pendingRequests.map((req) => (
//                 <tr key={req.id}>
//                   <td className="px-6 py-4">{req.topic_name}</td>
//                   <td className="px-6 py-4">{req.partitions}</td>
//                   <td className="px-6 py-4">{req.requested_by__username}</td>
//                   <td className="p-2">
//                     {req.request_type === "CREATE"
//                       ? "Create Topic"
//                       : "Delete Topic"}
//                   </td>

//                   <td className="px-6 py-4 space-x-3">
//                     <button
//                       onClick={() => handleApprove(req.id)}
//                       className="px-3 py-1 rounded bg-green-600 text-white text-sm"
//                     >
//                       Approve
//                     </button>

//                     <button
//                       onClick={() => handleDecline(req.id)}
//                       className="px-3 py-1 rounded bg-red-600 text-white text-sm"
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

//       {/* CREATED TOPICS */}
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-xl font-semibold text-gray-700 mb-3">
//           Created Topics
//         </h2>

//         {/* Segmented Filter */}
//         <div className="flex flex-wrap gap-2">
//           {[
//             { label: "All", value: "ALL" },
//             { label: "Internal", value: "INTERNAL" },
//             { label: "CLI / System", value: "CLI" },
//             { label: "Admin", value: "ADMIN" },
//             { label: "User", value: "USER" },
//           ].map((item) => (
//             <button
//               key={item.value}
//               onClick={() => setTopicFilter(item.value)}
//               className={`px-4 py-1.5 rounded-full text-sm font-medium transition
//           ${
//             topicFilter === item.value
//               ? "bg-blue-600 text-white"
//               : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//           }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>
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
//               {paginatedTopics.map((topic) => (
//                 <tr key={topic.name}>
//                   <td className="px-6 py-4">
//                     {topic.name}
//                     {topic.is_internal && (
//                       <span className="ml-2 text-xs text-gray-500">
//                         (internal)
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4">{topic.partitions}</td>
//                   <td className="px-6 py-4">{topic.created_by__username}</td>

//                   <td className="px-2 py-2 space-x-2">
//                     {/* <button
//                       onClick={() => navigate(`/topic/${topic.name}`)}
//                       className="bg-green-600 text-white px-3 py-1 rounded text-sm"
//                     >
//                       View
//                     </button> */}
//                     <button
//                       onClick={() => {
//                         setSelectedTopic(topic.name);
//                         setIsViewModalOpen(true);
//                       }}
//                       className="bg-green-600 text-white px-3 py-1 rounded text-sm"
//                     >
//                       View
//                     </button>

//                     {/* <button
//                       onClick={() =>
//                         topic.id && navigate(`/alter-topic/${topic.name}`)
//                       }
//                       disabled={!topic.id}
//                       className={`px-3 py-1 rounded text-sm ${
//                         topic.id
//                           ? "bg-orange-500 text-white"
//                           : "bg-gray-300 text-gray-600 cursor-not-allowed"
//                       }`}
//                     >
//                       Alter
//                     </button> */}

//                     <button
//                       onClick={() => openAlterModal(topic.name)}
//                       disabled={topic.is_internal}
//                       className={`px-3 py-1 rounded text-sm ${
//                         topic.is_internal
//                           ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                           : "bg-orange-500 text-white"
//                       }`}
//                     >
//                       Alter
//                     </button>

//                     <button
//                       onClick={() => topic.id && handleDeleteTopic(topic.id)}
//                       disabled={!topic.id}
//                       className={`px-3 py-1 rounded text-sm ${
//                         topic.id
//                           ? "bg-red-600 text-white"
//                           : "bg-gray-300 text-gray-600 cursor-not-allowed"
//                       }`}
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500">No topics created yet.</p>
//         )}

//         <div className="flex justify-end items-center mt-4 space-x-2">
//           <button
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((p) => p - 1)}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Prev
//           </button>

//           <span className="text-sm text-gray-600">
//             Page {currentPage} of {totalPages}
//           </span>

//           <button
//             disabled={currentPage === totalPages || totalPages === 0}
//             onClick={() => setCurrentPage((p) => p + 1)}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//       <TopicDetailsModal
//         isOpen={isViewModalOpen}
//         onClose={() => {
//           setIsViewModalOpen(false);
//           setSelectedTopic(null);
//         }}
//         topicName={selectedTopic}
//         role="admin"
//       />

//       <AlterTopicModal
//         isOpen={isAlterModalOpen}
//         topicName={selectedAlterTopic}
//         onClose={closeAlterModal}
//         onSuccess={() => {
//           refreshData(); // reload topics
//           closeAlterModal();
//         }}
//       />
//     </div>
//   );
// };

// export default AdminTopicSection;

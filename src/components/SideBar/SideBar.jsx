import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

function SideBar() {
  const [createdTopics, setCreatedTopics] = useState([]);
  // const [isExpanded, setIsExpanded] = useState(false);
  // const [isExpandedAcl, setIsExpandedAcl] = useState(false);
  const role = localStorage.getItem("role"); // "admin" or "user"
  const navigate = useNavigate();

  const fetchTopics = useCallback(async () => {
    if (!role) return;
    try {
      const endpoint =
        role === "admin" ? "/api/admin_dashboard_api/" : "/api/home_api/";
      const { data } = await axios.get(endpoint, { withCredentials: true });
      // backend returns created_topics for both admin and user endpoints
      setCreatedTopics(data.created_topics || []);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  }, [role]);

  // initial load
  useEffect(() => {
    if (role) fetchTopics();
  }, [role, fetchTopics]);

  // event-driven updates: use data from event.detail if provided
  useEffect(() => {
    const handleUpdated = (ev) => {
      try {
        const detail = ev?.detail;
        if (detail && detail.created_topics) {
          setCreatedTopics(detail.created_topics);
        } else {
          // fallback: fetch from backend
          fetchTopics();
        }
      } catch (e) {
        console.error("Error applying dataUpdated event:", e);
        fetchTopics();
      }
    };

    window.addEventListener("dataUpdated", handleUpdated);
    return () => window.removeEventListener("dataUpdated", handleUpdated);
  }, [fetchTopics]);

  return (
    // <aside className="w-full md:w-60 bg-gray-50 border-r border-gray-300 p-4 rounded-md shadow-sm">
    <aside
      className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-60 bg-gray-50 border-r border-gray-300 p-4 overflow-y-auto shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Dashboard</h2>
      <div>
        {/* <button
          onClick={() => setIsExpanded((s) => !s)}
          className="flex items-center justify-between w-full text-left bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 transition"
        >
          <span className="font-medium">My Topics</span>
          {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <ul className="mt-2 space-y-2 pl-3">
            {createdTopics.length > 0 ? (
              createdTopics.map((topic) => (
                <li
                  key={topic.id}
                  onClick={() => navigate(`/topic/${encodeURIComponent(topic.name)}`)}
                  className="bg-gray-300 p-2 rounded-md text-gray-700 hover:bg-gray-200 cursor-pointer transition"
                >
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-sm text-gray-500">Partitions: {topic.partitions}</div>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 pl-2">No topics yet. Create one!</p>
            )}
          </ul>
        )} */}
        {/* Request or Create Topic Button */}
        {role === "user" && (
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("openRequestTopicModal"))
            }
            className="flex items-center justify-between w-full text-left bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 transition mt-2"
          >
            <span className="font-medium">Request New Topic</span>
          </button>
        )}

        {role === "admin" && (
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("openCreateTopicModal"))
            }
            className="flex items-center justify-between w-full text-left bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 transition mt-2"
          >
            <span className="font-medium">Create New Topic</span>
          </button>
        )}

        <br />

        <button
          onClick={() => navigate("/acls")}
          className="flex items-center justify-between w-full text-left bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 transition"
        >
          <span className="font-medium">ACL's</span>
        </button>
      </div>
    </aside>
  );
}

export default SideBar;

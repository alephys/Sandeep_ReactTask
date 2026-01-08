import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../NavBar/NavBar";
import { Search } from "lucide-react";

const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState([]);

  // -------------------------------
  // Fetch History
  // -------------------------------
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get("/api/history_api/");
        if (data.success) {
          setHistory(data.history || []);
          setFilteredHistory(data.history || []);
        } else {
          setMessages([{ text: "Failed to load history data", type: "error" }]);
        }
      } catch (err) {
        console.error("Failed to fetch topic history:", err);
        setMessages([{ text: "Failed to load topic history", type: "error" }]);
      }
    };

    fetchHistory();
  }, []);

  // -------------------------------
  // Debounced Search
  // -------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredHistory(history);
        return;
      }

      const lowerSearch = searchTerm.toLowerCase();

      const filtered = history.filter((item) =>
        item.topic_name?.toLowerCase().includes(lowerSearch) ||
        item.requested_by?.toLowerCase().includes(lowerSearch) ||
        item.status?.toLowerCase().includes(lowerSearch)
      );

      setFilteredHistory(filtered);
    }, 300); // ⏱ debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm, history]);

  return (
    <div className="max-w-10xl mx-auto font-sans mt-16">
      <NavBar />

      <div className="bg-white rounded-lg p-5 mb-5 shadow mt-5">
        <h2 className="text-xl text-center font-semibold text-gray-700 mb-5">
          Topic History
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

        {/* 🔍 Search Bar */}
        <div className="relative max-w-md mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by topic, user or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 text-left border-b">Topic Name</th>
                <th className="p-2 text-left border-b">Partitions</th>
                <th className="p-2 text-left border-b">Requested By</th>
                <th className="p-2 text-left border-b">Requested At</th>
                <th className="p-2 text-left border-b">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{req.topic_name}</td>
                    <td className="p-2">{req.partitions}</td>
                    <td className="p-2">{req.requested_by}</td>
                    <td className="p-2">{req.requested_at}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No matching history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;

import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../NavBar/NavBar";

const History = () => {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get("/api/history_api/");
        if (data.success) {
          setHistory(data.history || []);
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

  return (
    <div className="mx-auto font-sans">
      <NavBar />

      <div className="bg-white rounded-lg p-5 mb-5 shadow mt-5">
        <h2 className="text-xl text-center font-semibold text-gray-700 mb-3">
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
              {history.length > 0 ? (
                history.map((req) => (
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
                    No History
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

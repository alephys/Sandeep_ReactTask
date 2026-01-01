import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar/NavBar";

const ClusterInfo = () => {
  const [loading, setLoading] = useState(true);
  const [clusterStatus, setClusterStatus] = useState("CHECKING...");
  const [brokers, setBrokers] = useState([]);
  const [brokerCount, setBrokerCount] = useState(0);

  const fetchClusterInfo = async () => {
    try {
      const { data } = await axios.get("/api/cluster_status/");

      if (data.success) {
        setClusterStatus(data.status);
        setBrokerCount(data.brokers_count);
        setBrokers(data.brokers);
      }
    } catch (err) {
      setClusterStatus("INACTIVE");
      setBrokers([]);
      setBrokerCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusterInfo();
  }, []);

  const statusColor =
    clusterStatus === "ACTIVE"
      ? "bg-green-500"
      : clusterStatus === "INACTIVE"
      ? "bg-red-500"
      : "bg-gray-400";

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-6">
      <NavBar/>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Cluster Information</h1>

      <div className="flex items-center gap-4 mb-6">
        <span className={`w-4 h-4 rounded-full ${statusColor}`}></span>
        <span className="text-xl font-semibold text-gray-700">
          Status: {clusterStatus}
        </span>
        <span className="text-xl font-semibold text-gray-700">
          | Brokers: {brokerCount}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg p-5">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Active Brokers
        </h2>

        {loading ? (
          <p className="text-gray-600">Loading cluster information...</p>
        ) : brokerCount === 0 ? (
          <p className="text-red-600 text-lg">No active brokers found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3 border-b text-gray-700">Broker ID</th>
                <th className="p-3 border-b text-gray-700">Host</th>
                <th className="p-3 border-b text-gray-700">Port</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((b) => (
                <tr key={b.id} className="hover:bg-gray-100">
                  <td className="p-3 border-b text-gray-600">{b.id}</td>
                  <td className="p-3 border-b text-gray-600">{b.host}</td>
                  <td className="p-3 border-b text-gray-600">{b.port}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClusterInfo;

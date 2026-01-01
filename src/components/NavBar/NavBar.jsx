import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { CircleUserRound } from "lucide-react";
import useWebSocket, { getWebSocketUrl } from "../../hooks/useWebSocket";

const NavBar = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  const [clusterStatus, setClusterStatus] = useState({
    status: "CHECKING...",
    brokers: 0,
  });

  const navigate = useNavigate();

  // Fetch user info
  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get("/api/home_api/");
      if (data.success) {
        setUsername(data.username || "Guest");
        setRole(data.role || "");
      }
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    }
  };

  // Fetch initial cluster status (API)
  const fetchClusterStatus = async () => {
    try {
      const { data } = await axios.get("/api/cluster_status/");
      setClusterStatus({
        status: data.status,
        brokers: data.brokers,
      });
    } catch (err) {
      setClusterStatus({
        status: "INACTIVE",
        brokers: 0,
      });
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchClusterStatus();
  }, []);

  // WebSocket URL based on role
  const wsPath = role ? (role === "admin" ? "/ws/admin/" : "/ws/user/") : null;
  const wsUrl = getWebSocketUrl(wsPath);

  // WebSocket handling cluster updates
  useWebSocket(wsUrl, (msg) => {
    if (msg.event === "cluster_status") {
      setClusterStatus({
        status: msg.payload.status,
        brokers: msg.payload.brokers,
      });
    }
  });

  // Logout
  const handleLogout = async () => {
    try {
      const { data } = await axios.post("/api/logout_api/");
      if (data.success) navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const displayName =
    role === "admin" ? `Hi, ${username} (superUser)` : `Hi, ${username}`;

  const goToMain = () =>
    navigate(role === "admin" ? "/admin-dashboard" : "/home");

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center items-center py-3 border-b bg-blue-950 border-blue-900">
      <h1
        className="text-3xl font-bold text-white cursor-pointer"
        onClick={goToMain}
      >
        Kafka Manager
      </h1>

      {/* Cluster Status */}
      <div
        className="absolute left-5 flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/cluster-info")}
        title="Click to view cluster details"
      >
        <span
          className={`w-3 h-3 rounded-full ${
            clusterStatus.status === "ACTIVE"
              ? "bg-green-500 pulse-active"
              : clusterStatus.status === "INACTIVE"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        ></span>

        <span className="text-lg text-white">
          {clusterStatus.status === "ACTIVE" && "Cluster Active"}
          {clusterStatus.status === "INACTIVE" && "Cluster Inactive"}
          {clusterStatus.status === "CHECKING..." && "Checking Cluster"}
        </span>

        <span className="text-white">{clusterStatus.brokers?.length || 0} brokers</span>
      </div>
      {/* Cluster Status */}
      {/* <div className="absolute left-5 flex items-center gap-3">
        <span
          className={`w-3 h-3 rounded-full ${
            clusterStatus.status === "ACTIVE"
              ? "bg-green-500 pulse-active"
              : clusterStatus.status === "INACTIVE"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        ></span>

        <span className="text-lg text-white">
          {clusterStatus.status === "ACTIVE" && "Cluster Active"}
          {clusterStatus.status === "INACTIVE" && "Cluster Inactive"}
          {clusterStatus.status === "CHECKING..." && "Checking Cluster"}
        </span>

        <span className="text-white">[ {clusterStatus.brokers?.length || 0} brokers ]</span>
      </div> */}

      {/* User Menu */}
      <div className="absolute right-5 flex items-center gap-3">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-300 hover:bg-gray-100">
            <CircleUserRound />
            <span className="text-gray-800 text-base">{displayName}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-600" />
          </MenuButton>

          <MenuItems className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none transition">
            <div className="py-1">
              {role === "admin" && (
                <MenuItem>
                  <a
                    onClick={() => navigate("/admin-dashboard/history")}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 cursor-pointer"
                  >
                    History
                  </a>
                </MenuItem>
              )}

              <MenuItem>
                <a className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">
                  Settings
                </a>
              </MenuItem>

              <MenuItem>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-red-100 hover:text-red-700"
                >
                  Logout
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
};

export default NavBar;

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { CircleUserRound } from 'lucide-react';

const NavBar = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get("/api/home_api/");
      if (data.success) {
        setUsername(data.username || "Guest");
        setRole(data.role || "");
      } else {
        setMessages([{ text: "Failed to load dashboard data", type: "error" }]);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setMessages([{ text: "Failed to load dashboard data", type: "error" }]);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      const { data } = await axios.post("/api/logout_api/");
      if (data.success) navigate("/login");
      else setMessages([{ text: "Logout failed", type: "error" }]);
    } catch (err) {
      console.error("Logout request failed:", err);
      setMessages([{ text: "Logout request failed", type: "error" }]);
    }
  };

  const displayName =
    role === "admin" ? `Hi, ${username} (superUser)` : `Hi, ${username}`;

  const goToMain = () => {
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/home");
    }
  };

  return (
    // <header className="flex justify-center items-center py-4 border-b bg-blue-950 border-blue-900 relative">
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center items-center py-4 border-b bg-blue-950 border-blue-900">
      <h1 className="text-3xl font-bold text-white cursor-pointer" onClick={goToMain}>
        Kafka Topic Manager
      </h1>

      <div className="absolute right-5 flex items-center gap-3">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-300 hover:bg-gray-100">
            <CircleUserRound />
            <span className="text-gray-800 text-base">{displayName}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-600" />
          </MenuButton>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 transition"
          >
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
                <a
                  // onClick={navigate()}
                  className="block px-4 py-2 text-sm text-gray-600  hover:bg-gray-200 hover:text-gray-600"
                >
                  Settings
                </a>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-600   hover:bg-red-100 hover:text-red-700"
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

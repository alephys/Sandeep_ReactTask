import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import SideBar from "../../components/SideBar/SideBar";
import NavBar from "../../components/NavBar/NavBar";
import DashboardStats from "../../components/Stats/DashboardStats";
import AdminTopicSection from "../../components/Topic/AdminTopicSection";
import useWebSocket from "../../hooks/useWebSocket";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    topics_admin: 0,
    topics_users: 0,
    requests_total: 0,
    requests_approved: 0,
    requests_declined: 0,
    acls_total: 0,
  });

  const debounceTimer = useRef(null);

  // Debounced stats API call
  const fetchStats = useCallback(() => {
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await axios.get("/api/admin_stats/");
        if (res.data.success) setStats(res.data.stats);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      }
    }, 200);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // WebSocket listener
  useWebSocket("ws://127.0.1.1:8000/ws/admin/", (msg) => {
    console.log("WS Stats Update:", msg);

    if (!msg.event) return;

    // ANY admin event → refresh stats
    fetchStats();
  });

  return (
    <div className="max-w-10xl mx-auto font-sans mt-16">
      <NavBar />

      <div className="flex flex-col md:flex-row">
        <SideBar />

        <main className="flex-1 ml-60 p-5 bg-gray-100 rounded-md min-h-screen">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Admin Dashboard
          </h2>

          <DashboardStats stats={stats} />
          <AdminTopicSection />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";
// import SideBar from "../../components/SideBar/SideBar";
// import NavBar from "../../components/NavBar/NavBar";
// import DashboardStats from "../../components/Stats/DashboardStats";
// import AdminTopicSection from "../../components/Topic/AdminTopicSection";
// import useWebSocket from "../../hooks/useWebSocket";

// const AdminDashboard = () => {
//   const [stats, setStats] = useState({
//     topics_admin: 0,
//     topics_users: 0,
//     requests_total: 0,
//     requests_approved: 0,
//     requests_declined: 0,
//     acls_total: 0,
//   });

//   const debounceTimer = useRef(null);

//   // Debounced stats refresh
//   const fetchStats = useCallback(() => {
//     clearTimeout(debounceTimer.current);
//     debounceTimer.current = setTimeout(async () => {
//       try {
//         const res = await axios.get("/api/admin_stats/");
//         if (res.data.success) setStats(res.data.stats);
//       } catch (err) {
//         console.error("Failed to load admin stats:", err);
//       }
//     }, 200);
//   }, []);

//   useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);

//   // Real-time WebSocket updates
//   useWebSocket("ws://127.0.1.1:8000/ws/admin/", (msg) => {
//     console.log("WS Stats Update:", msg);

//     // ANY update triggers a stats refresh
//     fetchStats();
//   });

//   return (
//     <div className="max-w-10xl mx-auto font-sans">
//       <NavBar />

//       <div className="flex flex-col md:flex-row">
//         <SideBar />

//         <main className="flex-1 p-5 bg-gray-100 rounded-md">
//           <h2 className="text-2xl font-semibold text-gray-700 mb-4">
//             Admin Dashboard
//           </h2>

//           {/* Stats Section */}
//           <DashboardStats stats={stats} />

//           {/* Topics Section */}
//           <AdminTopicSection />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

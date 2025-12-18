// USING REGULAR CSS
import React from "react";

const DashboardStats = ({ stats }) => {
  const gridStyle = {
    display: "grid",
    gridTemplateAreas: `
      "total total total"
      "admin admin user"
      "approved declined acls"
    `,
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
  };

  return (
    <div style={gridStyle} className="mb-8">
      {/* TOTAL REQUESTS */}
      <div
        style={{ gridArea: "total" }}
        className="bg-white shadow p-6 rounded-lg text-center"
      >
        <h3 className="text-gray-500 text-sm">Total Topic Requests</h3>
        <p className="text-4xl font-bold text-purple-600">
          {stats.requests_total}
        </p>
      </div>

      {/* TOPICS ADMIN */}
      <div
        style={{ gridArea: "admin" }}
        className="bg-white shadow p-6 rounded-lg text-center"
      >
        <h3 className="text-gray-500 text-sm">Topics Created by Admin</h3>
        <p className="text-4xl font-bold text-green-600">
          {stats.topics_admin}
        </p>
      </div>

      {/* TOPICS USERS */}
      <div
        style={{ gridArea: "user" }}
        className="bg-white shadow p-6 rounded-lg text-center"
      >
        <h3 className="text-gray-500 text-sm">Topics Created by Users</h3>
        <p className="text-4xl font-bold text-blue-600">{stats.topics_users}</p>
      </div>

      {/* APPROVED */}
      <div
        style={{ gridArea: "approved" }}
        className="bg-white shadow p-6 rounded-lg text-center"
      >
        <h3 className="text-gray-500 text-sm">Approved Requests</h3>
        <p className="text-4xl font-bold text-green-700">
          {stats.requests_approved}
        </p>
      </div>

      {/* DECLINED */}
      <div
        style={{ gridArea: "declined" }}
        className="bg-white shadow p-6 rounded-lg text-center"
      >
        <h3 className="text-gray-500 text-sm">Declined Requests</h3>
        <p className="text-4xl font-bold text-red-600">
          {stats.requests_declined}
        </p>
      </div>

      {/* ACLS */}
      <div
        style={{ gridArea: "acls" }}
        className="bg-white shadow p-6 rounded-lg text-center"
      >
        <h3 className="text-gray-500 text-sm">ACLs Created</h3>
        <p className="text-4xl font-bold text-yellow-600">{stats.acls_total}</p>
      </div>
    </div>
  );
};

export default DashboardStats;

// USING TAILWIND CSS
// import React from "react";

// const DashboardStats = ({ stats }) => {
//   const statCards = [
//     {
//       label: "Topics Created by Admin",
//       value: stats.topics_admin,
//       color: "text-green-600",
//     },
//     {
//       label: "Topics Created by Users",
//       value: stats.topics_users,
//       color: "text-blue-600",
//     },
//     {
//       label: "Total Topic Requests",
//       value: stats.requests_total,
//       color: "text-purple-600",
//     },
//     {
//       label: "Approved Requests",
//       value: stats.requests_approved,
//       color: "text-green-700",
//     },
//     {
//       label: "Declined Requests",
//       value: stats.requests_declined,
//       color: "text-red-600",
//     },
//     {
//       label: "ACLs Created",
//       value: stats.acls_total,
//       color: "text-yellow-600",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
//       {statCards.map((card, index) => (
//         <div
//           key={index}
//           className="bg-white shadow rounded-lg p-6 flex flex-col items-center"
//         >
//           <h3 className="text-gray-500 text-sm text-center">{card.label}</h3>
//           <p className={`text-4xl font-bold mt-2 ${card.color}`}>
//             {card.value}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default DashboardStats;

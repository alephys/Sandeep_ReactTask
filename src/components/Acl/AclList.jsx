// src/components/Acl/AclList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AclFormModal from "./AclFormModal";
import NavBar from "../NavBar/NavBar";

const AclList = () => {
  const [acls, setAcls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const role = localStorage.getItem("role"); // "admin" or "user"

  const fetchAcls = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/acls/", { withCredentials: true });
      setAcls(data.acls || []);
    } catch (err) {
      console.error("Failed to fetch ACLs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcls();
  }, []);

  const handleDelete = async (acl) => {
    if (!window.confirm("Delete this ACL?")) return;
    try {
      const payload = {
        principal: acl.principal,
        resource_type: acl.resource_type,
        resource_name: acl.resource_name,
      };
      const res = await axios.post("/api/acls/delete/", payload, {
        withCredentials: true,
      });
      console.log(res.data);
      fetchAcls();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="bg-white rounded mx-auto font-sans mt-16">
      <NavBar />
      <div className="flex justify-between p-4 items-center mb-4">
        <h2 className="text-lg font-semibold">Access Control (ACLs)</h2>
        {role === "admin" && (
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Add ACL
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="p-4">
          {acls.length === 0 ? (
            <p className="text-gray-500">No ACLs found.</p>
          ) : (
            <table className="w-full text-sm ">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Principal</th>
                  <th className="p-2 text-left">Resource</th>
                  <th className="p-2 text-left">Permission</th>
                  <th className="p-2 text-left">Granted By</th>
                  <th className="p-2 text-left">Created At</th>
                  {role === "admin" && <th className="p-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {acls.map((acl) => (
                  <tr
                    key={`${acl.principal}-${acl.resource_type}-${acl.resource_name}-${acl.permission}`}
                    className="border-t"
                  >
                    <td className="p-2">{acl.principal}</td>
                    <td className="p-2">
                      {acl.resource_type}
                      {acl.resource_name ? ":" + acl.resource_name : ""}
                    </td>
                    <td className="p-2">{acl.permission}</td>
                    <td className="p-2">{acl.granted_by || "-"}</td>
                    <td className="p-2">
                      {acl.created_at && acl.created_at !== "-"
                        ? new Date(acl.created_at).toLocaleString()
                        : "-"}
                    </td>
                    {role === "admin" && (
                      <td className="p-2">
                        <button
                          onClick={() => handleDelete(acl)}
                          className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showModal && (
        <AclFormModal
          onClose={() => {
            setShowModal(false);
            fetchAcls();
          }}
        />
      )}
    </div>
  );
};

export default AclList;

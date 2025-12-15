// src/components/Acl/AclFormModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
// import { useParams } from "react-router-dom";

const PERMISSIONS = ['READ','WRITE','DESCRIBE','CREATE','DELETE','ALL','READ_WRITE'];
const RESOURCE_TYPES = ['TOPIC','GROUP','CLUSTER'];

const AclFormModal = ({ onClose }) => {
  const [principal, setPrincipal] = useState("");
  const [resourceType, setResourceType] = useState("TOPIC");
  const [resourceName, setResourceName] = useState("");
  const [permission, setPermission] = useState("READ");
  const [ldapUsers, setLdapUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  // const { topicName } = useParams();

  // useEffect(() => {
  //   // fetch LDAP users for dropdown
  //   axios.get("/api/ldap-users/", { withCredentials: true })
  //     .then(res => {
  //       setLdapUsers(res.data.users || []);
  //     })
  //     .catch(e => console.error(e));  

  //   // fetch topics
  //   axios.get(`/api/topic/${topicName}/`, { withCredentials: true })
  //     .then(res => setTopics(res.data.topics || []))
  //     .catch(e => console.error(e));
  // }, [topicName]);
  useEffect(() => {
  // fetch LDAP users
  axios.get("/api/ldap-users/", { withCredentials: true })
    .then(res => setLdapUsers(res.data.users || []))
    .catch(e => console.error(e));

  // fetch approved topics
  axios.get("/api/topics/", { withCredentials: true })
    .then(res => setTopics(res.data.topics || []))
    .catch(e => console.error(e));
  }, []);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      // principal might be a DN or username. If user selected uid/dn from LDAP, construct principal format:
      let principalValue = principal;
      if (!principalValue.startsWith("User:")) {
        // Example: allow either full DN or simple names; adjust according to your broker expectation
        principalValue = `User:${principal}`;
      }

      const payload = {
        principal: principalValue,
        resource_type: resourceType,
        resource_name: resourceType === 'CLUSTER' ? '' : resourceName,
        permission
      };

      const res = await axios.post("/api/acls/create/", payload, { withCredentials: true });
      console.log(res.data);
      if (res.data.status === 'success') {
        onClose();
      } else {
        alert(JSON.stringify(res.data));
      }
    } catch (err) {
      console.error(err);
      alert("Create ACL failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded p-4 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add ACL</h3>
          <button onClick={onClose} className="text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            <div className="text-sm">Principal (LDAP user)</div>
            <select value={principal} onChange={(e)=>setPrincipal(e.target.value)} className="w-full border p-2">
              <option value="">-- select user --</option>
              {ldapUsers.map(u => (
                // user object might be {uid, dn} or {username}
                <option key={u.dn || u.username} value={u.dn || u.username}>
                  {u.uid || u.username} {u.dn ? `(${u.dn})` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="block mb-2">
            <div className="text-sm">Resource Type</div>
            <select value={resourceType} onChange={(e)=>setResourceType(e.target.value)} className="w-full border p-2">
              {RESOURCE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>

          {resourceType !== 'CLUSTER' && (
            <label className="block mb-2">
              <div className="text-sm">Resource Name</div>
              {/* Provide topics dropdown + text input */}
              <input value={resourceName} onChange={(e)=>setResourceName(e.target.value)} className="w-full border p-2" list="topic-list" />
              <datalist id="topic-list">
                {topics.map(t => <option key={t} value={t} />)}
              </datalist>
            </label>
          )}

          <label className="block mb-2">
            <div className="text-sm">Permission</div>
            <select value={permission} onChange={(e)=>setPermission(e.target.value)} className="w-full border p-2">
              {PERMISSIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <div className="flex gap-2 mt-4">
            <button disabled={loading} type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AclFormModal;
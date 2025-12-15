import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router";
// import "antd/dist/reset.css";

import Home from "./pages/Home/Home";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import TopicView from "./components/Topic/TopicView";
import AlterTopic from "./components/AlterTopic/AlterTopic";
import Login from "./pages/Login/Login";
import History from "./components/History/History";
import AclList from "./components/Acl/AclList";
// import NavBar from "./components/NavBar/NavBar";

function App() {
  return (
    <>
      <BrowserRouter>
        {/* <NavBar/> */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/topic/:topicName" element={<TopicView />} />
          <Route path="/alter-topic/:topicName" element={<AlterTopic />} />
          <Route path="/admin-dashboard/history" element={<History/> } />
          <Route path="/acls" element={<AclList />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

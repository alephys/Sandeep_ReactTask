import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "../NavBar/NavBar";
import SideBar from "../SideBar/SideBar";

const TopicView = () => {
  const { topicName } = useParams();
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/topic/${topicName}/`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setTopic(res.data.topic);
        } else {
          setError("Topic not found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching topic:", err);
        setError("Error fetching topic details.");
      });
  }, [topicName]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!topic) return <div>Loading...</div>;

  return (
    <div className="max-w-10xl mx-auto font-sans">
      <NavBar />
      <div className="flex flex-col md:flex-row">
        <SideBar />
        <main className="flex-1 p-5 bg-gray-100 rounded-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Topic Details: {topic.name}
          </h2>
          <div className="bg-white rounded-lg p-5 mb-5 shadow">
            {/* <div className="space-y-1 text-gray-700"> */}
            <h2 className="text-l font-semibold text-gray-700 mb-3">
              <p>
                <strong>Topic Name:</strong> {topic.name}
              </p>
              <p>
                <strong>Status:</strong> {topic.status || "Active"}
              </p>
              <p>
                <strong>Partitions:</strong> {topic.partitions}
              </p>
              <p>
                <strong>Production:</strong> {topic.production}
              </p>
              <p>
                <strong>Consumption:</strong> {topic.consumption}
              </p>
              <p>
                <strong>Followers:</strong> {topic.followers}
              </p>
              <p>
                <strong>Observers:</strong> {topic.observers}
              </p>
              <p>
                <strong>Last Produced:</strong> {topic.last_produced}
              </p>
            </h2>
            {/* </div> */}
            <br />
            <button
              onClick={() => navigate(-1)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-medium"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TopicView;

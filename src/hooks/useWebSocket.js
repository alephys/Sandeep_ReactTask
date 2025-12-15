import { useEffect, useRef } from "react";

// hooks/useWebSocket.js
export default function useWebSocket(url, onMessage) {
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  const connect = () => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log("WS Connected:", url);
    };

    wsRef.current.onclose = () => {
      console.log("WS Closed. Reconnecting in 2s...");
      reconnectRef.current = setTimeout(connect, 2000);
    };

    wsRef.current.onerror = (err) => {
      console.error("WS Error:", err);
      try { wsRef.current.close(); } catch (e) {console.error("WS Close Error:", e);}
    };

    wsRef.current.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);

        // Accept both shapes:
        // 1) { event: "...", payload: {...} }
        // 2) { data: { event: "..." }, payload: {...} }  (older shape)
        let evt = raw.event;
        let payload = raw.payload || {};

        if (!evt && raw.data) {
          if (typeof raw.data === "string") evt = raw.data;
          else if (raw.data.event) evt = raw.data.event;
        }

        const msg = { event: evt, payload };

        // optionally log raw for debug:
        // console.debug("WS recv raw:", raw, "-> parsed msg:", msg);

        onMessage(msg);
      } catch (err) {
        console.error("WS Parse Error:", event.data, err);
      }
    };
  };

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      try { wsRef.current?.close(); } catch(e) {console.error("WS Cleanup Close Error:", e);}
    };
  }, []);
}

// import { useEffect, useRef } from "react";

// export default function useWebSocket(url, onMessage) {
//   const wsRef = useRef(null);
//   const reconnectRef = useRef(null);

//   const connect = () => {
//     wsRef.current = new WebSocket(url);

//     wsRef.current.onopen = () => {
//       console.log("WS Connected:", url);
//     };

//     wsRef.current.onclose = () => {
//       console.log("WS Closed. Reconnecting in 2s...");
//       reconnectRef.current = setTimeout(connect, 2000);
//     };

//     wsRef.current.onerror = (err) => {
//       console.error("WS Error:", err);
//       wsRef.current.close();
//     };

//     wsRef.current.onmessage = (event) => {
//       try {
//         const raw = JSON.parse(event.data);

//         // Backend sends: {event: "...", payload: {...}}
//         const msg = {
//           event: raw.event,
//           payload: raw.payload,
//         };

//         onMessage(msg);
//       } catch (err) {
//         console.error("WS Parse Error:", event.data);
//       }
//     };
//   };

//   useEffect(() => {
//     connect();
//     return () => {
//       clearTimeout(reconnectRef.current);
//       wsRef.current?.close();
//     };
//   }, []);
// }

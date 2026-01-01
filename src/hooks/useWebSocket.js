import { useEffect, useRef } from "react";

export function getWebSocketUrl(path) {
  if (!path) return null;

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host; // 127.0.0.1:8000 or domain in prod
  return `${protocol}://${host}${path}`;
}

export default function useWebSocket(url, onMessage) {
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    if (!url) {
      console.log("WS → Skipped (URL not ready yet)");
      return;
    }

    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      console.log("WS → Connecting:", url);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => console.log("WS → Connected:", url);

      ws.onclose = () => {
        console.log("WS → Closed. Reconnecting in 2s…");
        reconnectTimer.current = setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error("WS → Error:", err);
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);

          const evt =
            raw.event ??
            raw.data?.event ??
            raw.data ??
            null;

          const payload =
            raw.payload ??
            raw.data?.payload ??
            raw ??
            {};

          onMessage && onMessage({ event: evt, payload });
        } catch (err) {
          console.error("WS → Parse Error:", err);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;

      console.log("WS → Cleanup");
      clearTimeout(reconnectTimer.current);

      try {
        wsRef.current?.close();
      } catch {}
    };
  }, [url]);

  return { ws: wsRef.current };
}

// import { useEffect, useRef } from "react";

// /**
//  * Build a correct WS URL based on HTTP/HTTPS
//  */
// // export function getWebSocketUrl(path) {
// //   const protocol = window.location.protocol === "https:" ? "wss" : "ws";
// //   return `${protocol}://${window.location.host}${path}`;
// // }
// // replaced with below function

// // export function getWebSocketUrl(path) {
// //   const protocol = window.location.protocol === "https:" ? "wss" : "ws";
// //   const backendHost = "127.0.0.1:8000"; // Django ASGI server
// //   return `${protocol}://${backendHost}${path}`;
// // }
// export function getWebSocketUrl(path) {
//   const protocol = window.location.protocol === "https:" ? "wss" : "ws";

//   // If running under Vite (localhost:5173)
//   if (window.location.port === "5173") {
//     return `${protocol}://127.0.0.1:8000${path}`;
//   }

//   // If running in Django deployment
//   return `${protocol}://${window.location.host}${path}`;
// }


// /**
//  * Fully stable WebSocket hook:
//  * - Auto reconnect
//  * - Heartbeat keepalive
//  * - Graceful cleanup
//  * - Works with Django Channels
//  */
// export default function useWebSocket(url, onMessage) {
//   const wsRef = useRef(null);
//   const reconnectTimer = useRef(null);
//   const heartbeatTimer = useRef(null);

//   /**
//    * Send heartbeat every 25 seconds to keep connection alive.
//    */
//   const startHeartbeat = () => {
//     stopHeartbeat();
//     heartbeatTimer.current = setInterval(() => {
//       try {
//         if (wsRef.current?.readyState === WebSocket.OPEN) {
//           wsRef.current.send(JSON.stringify({ type: "ping" }));
//         }
//       } catch (e) {}
//     }, 25000);
//   };

//   const stopHeartbeat = () => {
//     if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
//   };

//   /**
//    * Establish WebSocket connection
//    */
//   const connect = () => {
//     if (!url) return;

//     console.log("WS → Connecting:", url);
//     const ws = new WebSocket(url);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("WS → Connected:", url);
//       startHeartbeat();
//     };

//     ws.onclose = () => {
//       console.warn("WS → Closed. Reconnecting in 2s…");
//       stopHeartbeat();
//       reconnectTimer.current = setTimeout(connect, 2000);
//     };

//     ws.onerror = (err) => {
//       console.error("WS → Error:", err);
//       try {
//         ws.close();
//       } catch (_) {}
//     };

//     ws.onmessage = (event) => {
//       try {
//         const raw = JSON.parse(event.data);

//         const evt =
//           raw.event ||
//           raw.data?.event ||
//           raw.type ||
//           null;

//         const payload =
//           raw.payload ||
//           raw.data ||
//           raw ||
//           {};

//         if (onMessage && evt) {
//           onMessage({ event: evt, payload });
//         }
//       } catch (e) {
//         console.error("WS → Parse Error:", e);
//       }
//     };
//   };

//   useEffect(() => {
//     connect();

//     return () => {
//       console.log("WS → Cleanup");
//       stopHeartbeat();
//       if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
//       try {
//         wsRef.current?.close();
//       } catch (_) {}
//     };
//   }, [url]);

//   return { ws: wsRef.current };
// }

// import { useEffect, useRef } from "react";

// // helper remains because components import it
// // export function getWebSocketUrl(path) {
// //   const protocol = window.location.protocol === "https:" ? "wss" : "ws";
// //   return `${protocol}://${window.location.host}${path}`;
// // }

// // export function getWebSocketUrl(path) {
// //   const protocol = window.location.protocol === "https:" ? "wss" : "ws";
// //   const backendHost = "127.0.0.1:8000";  // Django backend port

// //   return `${protocol}://${backendHost}${path}`;
// // }

// export function getWebSocketUrl(path) {
//   const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//   return `${protocol}://${window.location.host}${path}`;
// }


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
//       try { wsRef.current.close(); } catch (e) {}
//     };

//     wsRef.current.onmessage = (event) => {
//       try {
//         const raw = JSON.parse(event.data);

//         let evt = raw.event;
//         let payload = raw.payload || {};

//         if (!evt && raw.data) {
//           if (typeof raw.data === "string") evt = raw.data;
//           else if (raw.data.event) evt = raw.data.event;
//         }

//         onMessage({ event: evt, payload });

//       } catch (err) {
//         console.error("WS Parse Error:", err);
//       }
//     };
//   };

//   useEffect(() => {
//     connect();
//     return () => {
//       clearTimeout(reconnectRef.current);
//       try { wsRef.current?.close(); } catch {}
//     };
//   }, [url]);

//   return { ws: wsRef.current };
// }



// import { useEffect, useRef } from "react";

// //  Central place: Django ASGI backend URL
// const WS_BASE = "ws://127.0.0.1:8000";

// // ---------------------------------------------------
// //  Exported helper used everywhere else
// // ---------------------------------------------------
// export function getWebSocketUrl(path) {
//   if (!path.startsWith("/")) {
//     // enforce proper leading slash
//     path = "/" + path;
//   }

//   return `${WS_BASE}${path}`;
// }

// // ---------------------------------------------------
// //  Main WebSocket hook
// // ---------------------------------------------------
// export default function useWebSocket(pathOrUrl, onMessage) {
//   const wsRef = useRef(null);
//   const reconnectRef = useRef(null);

//   useEffect(() => {
//     if (!pathOrUrl) return;

//     // Detect if the user passed a path or a full URL
//     const url = pathOrUrl.startsWith("ws")
//       ? pathOrUrl                     // full ws:// URL
//       : getWebSocketUrl(pathOrUrl);   // convert /ws/admin/ → ws://127.0.0.1:8000/ws/admin/

//     const connect = () => {
//       console.log("WS Connecting →", url);
//       wsRef.current = new WebSocket(url);

//       wsRef.current.onopen = () => {
//         console.log("WS Connected:", url);
//       };

//       wsRef.current.onclose = () => {
//         console.log("WS Closed. Reconnecting...");
//         reconnectRef.current = setTimeout(connect, 2000);
//       };

//       wsRef.current.onerror = (err) => {
//         console.error("WS Error:", err);
//         try { wsRef.current.close(); } catch {}
//       };

//       wsRef.current.onmessage = (event) => {
//         try {
//           const raw = JSON.parse(event.data);
//           onMessage?.({
//             event: raw.event,
//             payload: raw.payload || raw,
//           });
//         } catch (err) {
//           console.error("WS Parse Error:", err);
//         }
//       };
//     };

//     connect();

//     return () => {
//       clearTimeout(reconnectRef.current);
//       try { wsRef.current?.close(); } catch {}
//     };
//   }, [pathOrUrl]);

//   return { ws: wsRef.current };
// }



// // import { useEffect, useRef } from "react";

// // export function getWebSocketUrl(path) {
// //   const protocol = window.location.protocol === "https:" ? "wss" : "ws";
// //   return `${protocol}://${window.location.host}${path}`;
// // }

// // export default function useWebSocket(path, onMessage) {
// //   const wsRef = useRef(null);
// //   const reconnectRef = useRef(null);

// //   useEffect(() => {
// //     if (!path) return;

// //     const url = getWebSocketUrl(path);  // 🔥 ALWAYS convert path → full ws:// URL

// //     const connect = () => {
// //       wsRef.current = new WebSocket(url);

// //       wsRef.current.onopen = () => {
// //         console.log("WS Connected:", url);
// //       };

// //       wsRef.current.onclose = () => {
// //         console.log("WS closed, reconnecting…");
// //         reconnectRef.current = setTimeout(connect, 2000);
// //       };

// //       wsRef.current.onerror = (err) => {
// //         console.error("WS Error:", err);
// //         try { wsRef.current.close(); } catch {}
// //       };

// //       wsRef.current.onmessage = (event) => {
// //         try {
// //           const raw = JSON.parse(event.data);
// //           let evt = raw.event;
// //           let payload = raw.payload || {};

// //           if (!evt && raw.data?.event) evt = raw.data.event;

// //           onMessage?.({ event: evt, payload });
// //         } catch (e) {
// //           console.error("WS Parse Error:", e);
// //         }
// //       };
// //     };

// //     connect();

// //     return () => {
// //       clearTimeout(reconnectRef.current);
// //       try { wsRef.current?.close(); } catch {}
// //     };
// //   }, [path]);

// //   return { ws: wsRef.current };
// // }

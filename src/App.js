import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { ReactSketchCanvas } from "react-sketch-canvas";
import SVGO from "../node_modules/svgo/dist/svgo.browser";

import "./App.css";

function App() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState();

  const canvas = useRef();

  function getImage() {
    canvas.current
      .exportSvg()
      .then((data) => {
        let result = SVGO.optimize(data, {
          plugins: [
            { name: "preset-default" }, // enable default preset
          ],
        });
        socket.emit("chat message", result.data);
        setDrawing(result.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  const [strokewidth, setStrokewidth] = useState(10);
  const [drawing, setDrawing] = useState();

  useEffect(() => {
    const newSocket = io(
      "https://socket-drawing-123.herokuapp.com/",
      {
        withCredentials: true,
        extraHeaders: {
          "my-custom-header": "abcd",
        },
      }
    );
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

  useEffect(() => {
    if (socket) {
      socket.on("chat message", function (msg) {
        setMessage(msg);
      });
    }
  }, [socket]);

  return (
    <div className="App">
      <ReactSketchCanvas
        ref={canvas}
        width="400px"
        height="400px"
        strokeWidth={strokewidth}
        strokeColor="red"
        onStroke={() => getImage()}
      />

      <button onClick={() => setStrokewidth(1)}>Stroke</button>

      <div
        dangerouslySetInnerHTML={{
          __html: message,
        }}
      />
    </div>
  );
}

export default App;

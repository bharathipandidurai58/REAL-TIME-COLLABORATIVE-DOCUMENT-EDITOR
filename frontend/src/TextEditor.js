import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";

export default function TextEditor() {
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  // connect to backend
  useEffect(() => {
    const s = io("http://localhost:4000");
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // load and update document
  useEffect(() => {
    if (!socket || !quill) return;

    socket.on("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.on("receive-changes", (delta) => {
      quill.updateContents(delta);
    });

    return () => {
      socket.off("receive-changes");
      socket.off("load-document");
    };
  }, [socket, quill]);

  // send changes
  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);

    return () => quill.off("text-change", handler);
  }, [socket, quill]);

  const wrapperRef = useRef(null);
  useEffect(() => {
    const editor = document.createElement("div");
    wrapperRef.current.append(editor);
    const q = new Quill(editor, { theme: "snow" });
    q.disable();
    q.setText("Loading document...");
    setQuill(q);
  }, []);

  return <div className="container" ref={wrapperRef}></div>;
}

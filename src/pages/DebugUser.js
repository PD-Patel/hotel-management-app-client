import React from "react";
import { useAuth } from "../contexts/AuthContext";

const DebugUser = () => {
  const auth = useAuth();

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>Debug User Data</h2>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
};

export default DebugUser;

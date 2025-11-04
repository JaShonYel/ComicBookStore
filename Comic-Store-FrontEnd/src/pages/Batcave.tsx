import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Batcave() {
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/api/Batcave/${userId}`);
        if (!res.data.message) {
            
          navigate("/", { replace: true });
        } else {
          setMessage(res.data.message);
        }
      } catch (err) {
        navigate("/", { replace: true });
      }
    };
    if (userId) load();
    else navigate("/", { replace: true });
  }, [userId, navigate]);

  return (
    <div style={{ padding: "2rem" }}>
      {message && (
        <>
          <h1>{message}</h1>
          <p>Welcome to your admin area. You can add user management here later.</p>
        </>
      )}
    </div>
  );
}

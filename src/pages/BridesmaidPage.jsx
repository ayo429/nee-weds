import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBridesmaidByPhone } from "../firebase/config";
import Reveal from "../components/Reveal";
import PersonalPage from "../components/PersonalPage";

export default function BridesmaidPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [bridesmaid, setBridesmaid] = useState(location.state?.bridesmaid || null);
  const [loading, setLoading] = useState(!location.state?.bridesmaid);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!bridesmaid) {
      getBridesmaidByPhone(id).then((data) => {
        if (data) setBridesmaid(data);
        else navigate("/");
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "#FFB3C6" }}>
        <p className="playfair italic text-white text-2xl">
          Just a moment...
        </p>
      </div>
    );
  }

  if (!bridesmaid) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {!revealed ? (
        <Reveal
          bridesmaid={bridesmaid}
          onEnter={() => setRevealed(true)}
        />
      ) : (
        <PersonalPage bridesmaid={bridesmaid} />
      )}
    </div>
  );
}
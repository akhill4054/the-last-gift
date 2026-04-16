import { useEffect, useState } from "react";

export default function FadeIn({ children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // next tick → triggers transition from .fade → .fade.show
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className={`fade ${visible ? "show" : ""}`}>
      {children}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [transitioning, setTransitioning] = useState(false);
  const iframeRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleMessage(event) {
      if (event.data && event.data.type === "cal-get-started") {
        setTransitioning(true);
        setTimeout(() => {
          router.push("/dashboard/event-types");
        }, 400);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return (
    <main className={`viewer-shell ${transitioning ? "landing-exit" : ""}`}>
      <iframe
        ref={iframeRef}
        className="viewer-frame"
        src="/raw"
        title="cal-home"
      />
    </main>
  );
}

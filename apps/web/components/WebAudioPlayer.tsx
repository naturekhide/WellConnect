"use client";
import { useEffect, useState } from "react";

export default function WebAudioPlayer({ url, isMine }: { url: string; isMine?: boolean }) {
    const [src, setSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!url) {
            setError(true);
            return;
        }

        // Fetch the file as a blob to bypass Chrome's streaming restrictions
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch audio");
                return res.blob();
            })
            .then((blob) => {
                setSrc(URL.createObjectURL(blob));
            })
            .catch((err) => {
                console.error("Audio load failed:", err);
                setError(true);
            });
    }, [url]);

    if (error) return <p style={{ color: "#ef4444", fontSize: 12, margin: "8px 0" }}>Failed to load audio</p>;
    if (!src) return <p style={{ color: "#94a3b8", fontSize: 12, margin: "8px 0" }}>Loading audio...</p>;

    return (
        <audio
            controls
            src={src}
            style={{
                height: 40,
                maxWidth: "100%",
                marginTop: 4,
                filter: isMine ? "invert(1) hue-rotate(180deg)" : "none"
            }}
        />
    );
}
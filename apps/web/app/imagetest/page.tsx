"use client";

export default function ImageTest() {
  return (
    <div style={{ background: "#0a0f0d", minHeight: "100vh", padding: 40, color: "#fff" }}>
      <h1>Image Test</h1>

      <h2>Test 1: External Image (Placehold.co)</h2>
      <img
        src="https://placehold.co/300x200/png"
        alt="External image test"
        width={300}
        height={200}
      />

      <h2 style={{ marginTop: 40 }}>Test 2: Direct Blob Image (No Proxy, No SafeImage)</h2>
      <img
        src="PASTE_YOUR_ACTUAL_BLOB_URL_HERE"
        alt="Blob image test"
        width={300}
        height={200}
      />

      <h2 style={{ marginTop: 40 }}>Test 3: Proxy Blob Image</h2>
      <img
        src={`/api/image?url=${encodeURIComponent("PASTE_YOUR_ACTUAL_BLOB_URL_HERE")}`}
        alt="Proxy image test"
        width={300}
        height={200}
      />
    </div>
  );
}
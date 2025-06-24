"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Prediction {
  class: string;
  confidence: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    setMounted(true);
    fetch("http://localhost:3000/health")
      .then((res) => (res.ok ? setApiStatus('online') : setApiStatus('offline')))
      .catch(() => setApiStatus('offline'));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPredictions(null);
    setError(null);
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPredictions(null);
    if (!selectedFile) {
      setError("Please select an image file.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const res = await fetch("http://localhost:3000/classify", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Classification failed");
      }
      const data = await res.json();
      setPredictions(data.predictions);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <header className="w-full max-w-2xl flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          {/* Emoji as logo for best alignment and simplicity */}
          <span className="text-4xl" role="img" aria-label="fruit">🍎</span>
          <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">Fruit Classifier</h1>
        </div>
        <p className="text-gray-600 text-center max-w-xl">
          Upload a fruit image to get instant AI-powered classification. Powered by a deep learning model and a modern API gateway.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-300'} inline-block`}></span>
          <span className="text-xs text-gray-500">
            API Status: {apiStatus === 'checking' ? 'Checking...' : apiStatus === 'online' ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-8 border border-indigo-100">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <label className="block text-sm font-medium text-indigo-700 mb-1">
            Select a fruit image
            <span className="ml-1 text-gray-400" title="Supported formats: jpg, png, jpeg, webp">[?]</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {mounted && previewUrl && (
            <div className="flex flex-col items-center gap-2">
              <Image
                src={previewUrl}
                alt="Preview"
                width={220}
                height={220}
                className="rounded-lg border object-contain bg-gray-50 shadow"
              />
              <span className="text-xs text-gray-500">Image Preview</span>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="mt-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                Classifying...
              </span>
            ) : (
              "Classify Fruit"
            )}
          </button>
        </form>
        {error && (
          <div className="w-full bg-red-100 text-red-700 px-4 py-2 rounded text-center text-sm border border-red-200">
            {error}
          </div>
        )}
        {predictions && (
          <div className="w-full mt-4">
            {/* Classification Result */}
            <div className="mb-4 text-center">
              {(() => {
                if (predictions.length === 0) return null;
                // Find the highest confidence value
                const maxConfidence = Math.max(...predictions.map(p => parseFloat(p.confidence)));
                // Find all predictions with the highest confidence
                const topPreds = predictions.filter(p => parseFloat(p.confidence) === maxConfidence);
                if (topPreds.length === 1) {
                  return (
                    <div className="text-2xl font-bold text-green-700">
                      Classified as: <span className="underline">{topPreds[0].class}</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-xl font-semibold text-yellow-700">
                      Could be either: {topPreds.map(p => p.class).join(" or ")}
                    </div>
                  );
                }
              })()}
            </div>
            <h2 className="text-lg font-semibold text-indigo-800 mb-2 text-center">
              Top Predictions
            </h2>
            <ul className="flex flex-col gap-2">
              {predictions.map((pred, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-indigo-50 rounded px-4 py-2 shadow-sm border border-indigo-100"
                >
                  <span className="font-medium text-indigo-700 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
                    {pred.class}
                  </span>
                  <span className="text-indigo-500 font-mono flex items-center gap-1">
                    <span className="w-24 h-2 bg-indigo-200 rounded-full overflow-hidden mr-2">
                      <span
                        className="block h-2 bg-gradient-to-r from-green-400 to-indigo-500 rounded-full"
                        style={{ width: `${parseFloat(pred.confidence)}%` }}
                      ></span>
                    </span>
                    {pred.confidence}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="w-full mt-6 bg-indigo-50 rounded-lg p-4 text-indigo-700 text-sm shadow-sm border border-indigo-100">
          <h3 className="font-semibold mb-1">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click the file input and select a fruit image (jpg, png, etc.).</li>
            <li>Click <span className="font-semibold">Classify Fruit</span>.</li>
            <li>Wait for the predictions to appear below.</li>
          </ol>
          <div className="mt-2 text-xs text-gray-500">
            Example images: apple, banana, orange, etc.
          </div>
        </div>
      </div>
      <footer className="mt-8 text-gray-400 text-xs text-center">
        Powered by <a href="https://nextjs.org/" className="underline hover:text-indigo-600">Next.js</a>, <a href="https://tailwindcss.com/" className="underline hover:text-indigo-600">Tailwind CSS</a>, and Fruit Classifier API
        <br />
        <a href="https://github.com/mehedi-hasan-2302/Fruit-Classifier" className="underline hover:text-indigo-600">GitHub Repo</a>
      </footer>
    </div>
  );
}

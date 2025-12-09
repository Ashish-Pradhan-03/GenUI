import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRightFromSquareIcon,
  RefreshCw,
  Download,
  Copy,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AceEditor from "react-ace";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-github";

function Generate() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    prompt,
    frameworkValue,     // string like "html-css-js"
    skipGenerate = false,
    initialCode = "",
  } = location.state || {};

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(!skipGenerate);
  const [refreshKey, setRefreshKey] = useState(0);

  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const progressInterval = useRef(null);

  useEffect(() => {
    if (skipGenerate) {
      setLoading(false);
      return;
    }

    if (!prompt) {
      navigate("/");
      return;
    }

    const generateCode = async () => {
      try {
        setLoading(true);
        setProgressPercent(5);
        setProgressStep("Analyzing prompt and generating code...");

        progressInterval.current = setInterval(() => {
          setProgressPercent((p) =>
            Math.min(95, p + Math.floor(Math.random() * 6) + 1)
          );
        }, 500);

        const resp = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            framework: frameworkValue, // <-- send correct framework
          }),
        });

        if (!resp.ok) throw new Error("Generation failed");
        const data = await resp.json();

        let extracted = (data.code || "").toString();

        // Try to strip fenced code blocks if present
        const fenced = extracted.match(
          /```(?:[\w-]+)?\s*\n?([\s\S]*?)\s*```/m
        );
        if (fenced && fenced[1]) {
          extracted = fenced[1];
        } else {
          extracted = extracted.replace(/^```(?:[\w-]+)?\s*\n?/i, "");
          extracted = extracted.replace(/\n?```\s*$/i, "");
        }

        extracted = extracted.replace(/^```html\s*/i, "");
        extracted = extracted.replace(/^```\s*/i, "");

        setCode(extracted.trim());
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate code");
      } finally {
        if (progressInterval.current) clearInterval(progressInterval.current);
        setProgressPercent(100);
        setProgressStep("Finalizing...");
        setTimeout(() => setLoading(false), 600);
        setTimeout(() => {
          setProgressPercent(0);
          setProgressStep("");
        }, 1000);
      }
    };

    generateCode();

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [prompt, frameworkValue, navigate, skipGenerate]);

  const copyCode = async () => {
    if (!code) return toast.error("No code to copy");
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const downloadCode = () => {
    if (!code) return toast.error("No code to download");
    try {
      const blob = new Blob([code], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Generated-Component.html";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  const getAceTheme = () =>
    document.documentElement.classList.contains("light")
      ? "github"
      : "dracula";

  const iconSize = 20;

  return (
    <div
      className="min-h-screen flex flex-col relative bolt-bg"
      style={{ color: "var(--text-primary)" }}
    >
      <Navbar />

      <div className="flex-1 grid md:grid-cols-2 gap-4 p-4">
        {/* Code panel */}
        <div className="rounded-xl overflow-hidden card">
          <div
            className="flex justify-between items-center px-4 py-4 border-b"
            style={{
              borderColor: "var(--glass-border)",
              background: "var(--background-secondary)",
            }}
          >
            <span className="font-mono font-bold text-lg">Code</span>
            <div className="flex gap-4">
              <button
                onClick={copyCode}
                className="header-icon hover:opacity-90 cursor-pointer"
                aria-label="Copy code"
              >
                <Copy size={iconSize} />
              </button>
              <button
                onClick={downloadCode}
                className="header-icon hover:opacity-90 cursor-pointer"
                aria-label="Download code"
              >
                <Download size={iconSize} />
              </button>
            </div>
          </div>

          <AceEditor
            value={code}
            mode="javascript"
            theme={getAceTheme()}
            width="100%"
            height="80vh"
            fontSize={16}
            onChange={setCode}
            setOptions={{ useWorker: true }}
          />
        </div>

        {/* Preview panel */}
        <div className="rounded-xl overflow-hidden card">
          <div
            className="flex justify-between items-center px-4 py-4"
            style={{
              background: "var(--background-secondary)",
              borderBottom: "1px solid var(--glass-border)",
            }}
          >
            <span className="font-bold font-mono text-lg">Preview</span>
            <div className="flex gap-4">
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="header-icon hover:opacity-90 cursor-pointer"
                aria-label="Refresh preview"
              >
                <RefreshCw size={iconSize} />
              </button>
              <button
                onClick={() => {
                  if (!code) return toast.error("Nothing to preview");
                  try {
                    const newWin = window.open("", "_blank");
                    if (!newWin) return toast.error("Unable to open new tab");
                    newWin.document.open();
                    newWin.document.write(code);
                    newWin.document.close();
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to open preview");
                  }
                }}
                className="header-icon hover:opacity-90 cursor-pointer"
                aria-label="Open preview in new tab"
              >
                <ArrowUpRightFromSquareIcon size={iconSize} />
              </button>
            </div>
          </div>

          <iframe
            key={refreshKey}
            srcDoc={code}
            className="w-full h-[80vh]"
            sandbox="allow-scripts"
            style={{ background: "var(--card-bg)" }}
          />
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <ClipLoader color="var(--accent)" size={40} />
          <p className="mt-4 text-primary">
            {progressStep || "Starting..."}
          </p>
          <div
            className="mt-3 w-80 h-3 rounded-full overflow-hidden"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                background: "var(--accent)",
              }}
              className="h-3 transition-all duration-500"
            />
          </div>
          <p className="text-secondary text-sm mt-1">
            {progressPercent}%
          </p>
        </div>
      )}
    </div>
  );
}

export default Generate;

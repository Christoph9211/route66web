import { useEffect, useState } from "react";

export default function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isAdult = localStorage.getItem("isAdult") === "true";
    setVisible(!isAdult);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-gray-900 shadow-xl">
        <h2 className="mb-2 text-xl font-semibold">Are you 21 or older?</h2>
        <p className="mb-6 text-sm text-gray-600">
          You must be of legal age to enter this site.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (window.confirmAge21) window.confirmAge21();
              setVisible(false);
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            I am 21+
          </button>
          <a
            href="https://www.google.com"
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            No, take me back
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          By confirming, you certify that you are of legal age in your jurisdiction.
        </p>
      </div>
    </div>
  );
}


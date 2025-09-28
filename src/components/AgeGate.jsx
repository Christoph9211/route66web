import { useEffect, useState } from "react";

const shouldLogWarnings =
  typeof import.meta !== "undefined" && import.meta.env?.MODE !== "production";

function getSafeLocalStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch (error) {
    if (shouldLogWarnings) {
      console.warn("localStorage is unavailable; age gate will not persist state.", error);
    }
    return null;
  }
}

export default function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const storage = getSafeLocalStorage();
    const isAdult = storage?.getItem("isAdult") === "true";
    setVisible(!isAdult);
  }, []);

  const handleConfirm = () => {
    try {
      if (typeof window !== "undefined" && typeof window.confirmAge21 === "function") {
        window.confirmAge21();
      }
    } catch (error) {
      if (shouldLogWarnings) {
        console.warn("Failed to persist age confirmation.", error);
      }
    } finally {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-gray-900 shadow-xl">
        <h2 className="mb-2 text-xl font-semibold">Are you 21 or older?</h2>
        <p className="mb-6 text-sm text-black">
          You must be of legal age to enter this site.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
          >
            I am 21+
          </button>
          <a
            href="https://www.google.com"
            className="rounded-lg border border-gray-300 text-black px-4 py-2 hover:bg-gray-50"
          >
            No, take me back
          </a>
        </div>
        <p className="mt-4 text-xs text-black">
          By confirming, you certify that you are of legal age in your jurisdiction.
        </p>
      </div>
    </div>
  );
}


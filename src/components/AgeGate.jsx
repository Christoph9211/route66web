import { useEffect, useRef, useState } from "react";

const shouldLogWarnings =
  typeof import.meta !== "undefined" && import.meta.env?.MODE !== "production";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const dialogRef = useRef(null);

  useEffect(() => {
    const storage = getSafeLocalStorage();
    const isAdult = storage?.getItem("isAdult") === "true";
    setVisible(!isAdult);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const previousActiveElement =
      typeof document !== "undefined" && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (element) => element instanceof HTMLElement
      );

    const focusFirstElement = () => {
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0] ?? dialog;
      firstElement.focus();
    };

    focusFirstElement();

    const handleKeyDown = (event) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;
      const isActiveInsideDialog =
        activeElement instanceof Node && dialog.contains(activeElement);

      if (event.shiftKey) {
        if (activeElement === firstElement || !isActiveInsideDialog) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement || !isActiveInsideDialog) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const handleFocusIn = (event) => {
      if (!(event.target instanceof Node)) return;
      if (dialog.contains(event.target)) return;
      focusFirstElement();
    };

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);
      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus();
      }
    };
  }, [visible]);

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
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-xl bg-white p-6 text-gray-900 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        aria-describedby="age-gate-description"
        tabIndex={-1}
      >
        <h2 id="age-gate-title" className="mb-2 text-xl font-semibold">
          Are you 21 or older?
        </h2>
        <p id="age-gate-description" className="mb-6 text-sm text-black">
          You must be of legal age to enter this site.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
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


"use client";

import React, { useState } from "react";
import { isImageUrl } from "@/lib/imageHelper";

/**
 * Reusable component to render question option content
 * If optionText is an image URL (e.g. Digialm diagrams, reasoning figures),
 * it displays an optimized <img> tag with click-to-zoom preview.
 * Otherwise, it displays standard clean text.
 */
export default function QuestionOptionDisplay({
  optionText,
  letter = "",
  className = "",
  imageClassName = "max-h-24 sm:max-h-28",
  enableZoom = true,
}) {
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!optionText) {
    return <span className="text-gray-400 italic">Empty option</span>;
  }

  const isImg = !hasError && isImageUrl(optionText);

  if (isImg) {
    return (
      <div className={`inline-flex flex-col items-start gap-1 py-1 ${className}`}>
        <div
          onClick={(e) => {
            if (enableZoom) {
              e.stopPropagation();
              setIsZoomed(true);
            }
          }}
          className={`relative rounded-lg border border-gray-200 bg-white p-1.5 shadow-2xs transition-all ${
            enableZoom ? "cursor-zoom-in hover:border-blue-400 hover:shadow-xs" : ""
          }`}
          title={enableZoom ? "Click to enlarge diagram" : undefined}
        >
          <img
            src={optionText}
            alt={letter ? `Option ${letter} diagram` : "Option diagram"}
            onError={() => setHasError(true)}
            className={`w-auto object-contain rounded ${imageClassName}`}
            loading="lazy"
          />
        </div>

        {/* Optional Zoom Modal */}
        {isZoomed && enableZoom && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs cursor-zoom-out"
          >
            <div
              className="relative max-h-[90vh] max-w-[90vw] rounded-xl bg-white p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                <span className="text-xs font-bold text-gray-700">
                  {letter ? `Option (${letter}) Diagram Preview` : "Diagram Preview"}
                </span>
                <button
                  onClick={() => setIsZoomed(false)}
                  className="rounded-full bg-gray-100 p-1 text-gray-500 hover:bg-gray-200 text-xs px-2"
                >
                  ✕ Close
                </button>
              </div>
              <img
                src={optionText}
                alt={letter ? `Option ${letter} enlarged` : "Option diagram enlarged"}
                className="max-h-[75vh] max-w-full object-contain mx-auto rounded"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <span className={`break-words leading-relaxed ${className}`}>
      {optionText}
    </span>
  );
}

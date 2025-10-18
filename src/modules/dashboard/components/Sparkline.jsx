import React, { useMemo } from "react";

/**
 * Minimal sparkline (no external deps)
 * props: data:number[], width=140, height=42
 */
export default function Sparkline({ data = [], width = 140, height = 42 }) {
  // width/height are used as the SVG viewBox coordinates. The SVG element
  // is rendered with width="100%" so it will scale to its container while
  // preserving the internal coordinate system used for the polyline points.
  const { path } = useMemo(() => {
    if (!data?.length) return { path: "" };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = Math.max(1, max - min);
    const stepX = width / Math.max(1, data.length - 1);

    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * height;
      return `${x},${y}`;
    });
    return { path: points.join(" ") };
  }, [data, width, height]);

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="block"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="2"
        points={path}
      />
    </svg>
  );
}

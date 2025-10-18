import React from "react";

export default function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-3 w-40 bg-white/10 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-3 w-24 bg-white/10 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-3 w-48 bg-white/10 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-3 w-28 bg-white/10 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-3 w-20 bg-white/10 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-24 bg-white/10 rounded-pill" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-8 w-28 bg-white/10 rounded-pill ml-auto" />
      </td>
    </tr>
  );
}

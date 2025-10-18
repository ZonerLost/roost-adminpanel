import React from "react";

export default function SectionCard({ title, desc, children, actions }) {
  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium">{title}</div>
          {desc && <div className="text-sm text-muted">{desc}</div>}
        </div>
        {actions ? (
          <div className="w-full sm:w-auto mt-2 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-start sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

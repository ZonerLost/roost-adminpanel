import React from "react";

export default function DeleteConfirm({ open, onClose, onConfirm, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="glass p-5 rounded-2xl w-full max-w-md">
          <div className="text-lg font-semibold mb-1">Delete event</div>
          <div className="text-sm text-muted">
            Are you sure you want to delete{" "}
            <span className="font-medium text-text">
              {title || "this event"}
            </span>
            ?
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn bg-danger/20 text-danger border border-danger/30"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

// Minimal AnimatePresence passthrough for environments without framer-motion
export function AnimatePresence({ children }) {
  return React.createElement(React.Fragment, null, children);
}

// Create a motion-like proxy that returns simple DOM wrappers for motion.* usages
const createMotion = (tag) =>
  React.forwardRef(({ children, ...rest }, ref) => {
    // strip animation-specific props to avoid React DOM warnings
    return React.createElement(tag, { ref, ...rest }, children);
  });

const motion = new Proxy(
  {},
  {
    get(_, prop) {
      // Return a forwardRef component that renders the given tag (e.g. 'div', 'span')
      return createMotion(prop);
    },
  }
);

export { motion };
export default motion;

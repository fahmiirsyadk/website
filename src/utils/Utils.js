// Utils.js - FFI implementations for Utils.purs

"use strict";

// Debug output function
export function debugOutput(label) {
  return function(value) {
    console.log(`=== ${label} ===`);
    console.log(JSON.stringify(value, null, 2));
    return value;
  };
} 
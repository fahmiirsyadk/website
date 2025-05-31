// Implementation of string replace
export function replaceImpl(from) {
  return function(to) {
    return function(str) {
      return str.split(from).join(to);
    };
  };
} 
// Debug script to identify infinite recursion issues
console.log('🔍 Debug Console Loaded');

let callStack = [];
let maxStackDepth = 0;

// Monkey patch console.error to detect stack overflow
const originalConsoleError = console.error;
console.error = function(...args) {
  const stackTrace = new Error().stack;
  const currentDepth = (stackTrace.match(/at /g) || []).length;

  if (currentDepth > 100) {
    console.warn('🔥 POTENTIAL STACK OVERFLOW DETECTED!');
    console.warn('Current call depth:', currentDepth);
    console.warn('Last few calls:', stackTrace.split('\n').slice(0, 10));
  }

  originalConsoleError.apply(console, args);
};

// Add performance monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('🔥 Global Error:', event.error);
    console.error('Error stack:', event.error?.stack);
    console.error('Error filename:', event.filename);
    console.error('Error line:', event.lineno);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🔥 Unhandled Promise Rejection:', event.reason);
  });

  // Monitor React component updates
  const originalSetState = Object.getOwnPropertyDescriptor(React.Component.prototype, 'setState')?.value;
  if (originalSetState) {
    Object.defineProperty(React.Component.prototype, 'setState', {
      value: function(...args) {
        callStack.push(`${this.constructor.name}.setState`);
        if (callStack.length > 50) {
          console.warn('🔥 DEEP SETSTATE CALL STACK:', callStack.length);
          console.warn('Last 10 calls:', callStack.slice(-10));
        }
        const result = originalSetState.apply(this, args);
        callStack.pop();
        return result;
      }
    });
  }
}

console.log('✅ Debug monitoring active');

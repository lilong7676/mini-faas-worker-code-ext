import { fetch as method1 } from "/method1.js";
import method2 from "/method2.js";

function log() {
  console.log('main log');
}

log();

export { method1, method2 };

import { fetch as method1 } from "/faas/method1.js";
import method2 from "/faas/method2.js";

function log() {
  console.log('main log');
}

log();

export { method1, method2 };

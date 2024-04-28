import { log } from '/common.js';

export async function fetch(params, context) {
  log('log from method1');
  return 'method1';
}

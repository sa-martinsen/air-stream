const _performance = typeof performance !== "undefined" ? performance : require('perf_hooks').performance;
export default () => _performance.now();
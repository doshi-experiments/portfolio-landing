/* Globals the tools read from inside page.evaluate() callbacks. */
export {};
declare global {
  interface Window {
    rd: any;
    __fp: any;
    __t: number[];
    __fcp: number;
  }
}

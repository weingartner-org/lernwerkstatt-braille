/** Type declaration for the vendored Emscripten-generated liblouis asm.js glue.
 *  Lizenz: MIT/NCSA (Emscripten-Glue). Kein GPL-Wrapper. */
declare const liblouisBuild: {
  FS: {
    mkdir(path: string): void;
    writeFile(path: string, content: string, opts?: { encoding: string }): void;
    readFile(path: string): Uint8Array;
  };
  ccall(
    ident: string,
    returnType: string | null,
    argTypes: string[],
    args: (string | number | null)[],
  ): number | string;
  cwrap(ident: string, returnType: string | null, argTypes: string[]): (...args: (string | number | null)[]) => number | string;
  _malloc(size: number): number;
  _free(ptr: number): void;
  HEAP32: Int32Array;
  HEAPU32: Uint32Array;
};
export default liblouisBuild;

const { transform } = require("@babel/core");
const plugin = require("babel-plugin-macros");

function applyMacro(src) {
  return transform(src, {
    babelrc: false,
    plugins: [plugin],
    filename: __filename,
  }).code.trim();
}

describe("Name of the group", () => {
  it("should import the first argument if the env specified is defined at all", () => {
    process.env.ENABLE_A_THING = "0";
    const result = applyMacro(`
    import { loadPerEnv } from "./perEnv.macro";
    loadPerEnv('./src/aaa.js', 'ENABLE_A_THING');

`);

    expect(result).toBe(`import * as _ENV_LOAD from "src/aaa.js";`);
  });

  it("should not import the first argument if third argument does is not equal to the environmental variable", () => {
    process.env.ENABLE_ANOTHER_THING = "1";
    const result = applyMacro(`
        import { loadPerEnv } from "./perEnv.macro";
  loadPerEnv('./src/aaa.js', 'ENABLE_ANOTHER_THING', '2');`);

    expect(result).toBe(``);
  });
});

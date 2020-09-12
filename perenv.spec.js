const { transform } = require("@babel/core");
const plugin = require("babel-plugin-macros");

function applyMacro(src) {
  return transform(src, {
    babelrc: false,
    plugins: [plugin],
    filename: __filename,
  }).code.trim();
}

describe("String signature", () => {
  it("should import the first argument if the env specified is defined at all", () => {
    process.env.ENABLE_A_THING = "0";
    const result = applyMacro(`
      import { loadPerEnv } from "./perEnv.macro";
      loadPerEnv('./aaa.js', 'ENABLE_A_THING');
    `);

    expect(result).toBe(`import "./aaa.js";`);
  });

  it("should import the first argument if third argument is equal to the environmental variable", () => {
    process.env.ENABLE_ANOTHER_THING = "1";
    const result = applyMacro(`
        import { loadPerEnv } from "./perEnv.macro";
        loadPerEnv('./aaa.js', 'ENABLE_ANOTHER_THING', '1');
    `);

    expect(result).toBe(`import "./aaa.js";`);
  });

  it("should not import the first argument if third argument does is not equal to the environmental variable", () => {
    process.env.ENABLE_ONE_MORE_THING = "1";
    const result = applyMacro(`
        import { loadPerEnv } from "./perEnv.macro";
        loadPerEnv('./src/aaa.js', 'ENABLE_ONE_MORE_THING ', '2');
    `);

    expect(result).toBe(``);
  });
});

describe("Object signature", () => {
  it("should declare an idenfier if declared in the object signature overload", () => {
    process.env.ENABLE_A_THING = "0";
    const result = applyMacro(`
      import { loadPerEnv } from "./perEnv.macro";
      loadPerEnv({path: './ccc.js', identifier: 'thing'}, 'ENABLE_A_THING');
    `);
    expect(result).toBe(`import * as thing from "./ccc.js";`);
  });

  it("should throw an error if a duplicate identifier is an already defined variable", () => {
    process.env.ENABLE_A_THING = "0";
    expect(() =>
      applyMacro(`
      import { loadPerEnv } from "./perEnv.macro";
      const alreadyDeclared = true
      loadPerEnv({path: 'ccc.js', identifier: 'alreadyDeclared'}, 'ENABLE_A_THING');
    `)
    ).toThrow(
      `It seems you're trying to use an identifier that already exists with perenv.macro`
    );
  });

  it("should throw an error if a duplicate identifier is an already defined import", () => {
    process.env.ENABLE_A_THING = "0";
    expect(() =>
      applyMacro(`
      import { loadPerEnv } from "./perEnv.macro";
      import alreadyDeclared from 'already.js'
      loadPerEnv({path: 'ccc.js', identifier: 'alreadyDeclared'}, 'ENABLE_A_THING');
    `)
    ).toThrow(
      `It seems you're trying to use an identifier that already exists with perenv.macro`
    );
  });

  it("should throw an error if a duplicate identifier is an already destructured import", () => {
    process.env.ENABLE_A_THING = "0";
    expect(() =>
      applyMacro(`
      import { loadPerEnv } from "./perEnv.macro";
      import { alreadyDeclared } from 'already.js'
      loadPerEnv({path: 'ccc.js', identifier: 'alreadyDeclared'}, 'ENABLE_A_THING');
    `)
    ).toThrow(
      `It seems you're trying to use an identifier that already exists with perenv.macro`
    );
  });
});

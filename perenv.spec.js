const { transform } = require("@babel/core");
const plugin = require("babel-plugin-macros");

function applyMacro(src) {
  return transform(src, {
    babelrc: false,
    plugins: [plugin],
    filename: __filename,
  }).code.trim();
}

describe("loadPerEnv: String signature", () => {
  it("should import the first argument if the env specified is defined at all", () => {
    process.env.ENABLE_A_THING = "0";
    const result = applyMacro(`
      import { loadPerEnv } from "./perenv.macro";
      loadPerEnv('./aaa.js', 'ENABLE_A_THING');
    `);

    expect(result).toBe(`import "./aaa.js";`);
  });

  it("should import the first argument if third argument is equal to the environmental variable", () => {
    process.env.ENABLE_ANOTHER_THING = "1";
    const result = applyMacro(`
        import { loadPerEnv } from "./perenv.macro";
        loadPerEnv('./aaa.js', 'ENABLE_ANOTHER_THING', '1');
    `);

    expect(result).toBe(`import "./aaa.js";`);
  });

  it("should not import the first argument if third argument does is not equal to the environmental variable", () => {
    process.env.ENABLE_ONE_MORE_THING = "1";
    const result = applyMacro(`
        import { loadPerEnv } from "./perenv.macro";
        loadPerEnv('./src/aaa.js', 'ENABLE_ONE_MORE_THING ', '2');
    `);

    expect(result).toBe(``);
  });
});

describe("loadPerEnv: Object signature", () => {
  it("should declare an idenfier if declared in the object signature overload", () => {
    process.env.ENABLE_A_THING = "0";
    const result = applyMacro(`
      import { loadPerEnv } from "./perenv.macro";
      loadPerEnv({path: './ccc.js', identifier: 'thing'}, 'ENABLE_A_THING');
    `);
    expect(result).toBe(`import * as thing from "./ccc.js";`);
  });

  it("should throw an error if a duplicate identifier is an already defined variable", () => {
    process.env.ENABLE_A_THING = "0";
    expect(() =>
      applyMacro(`
      import { loadPerEnv } from "./perenv.macro";
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
      import { loadPerEnv } from "./perenv.macro";
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
      import { loadPerEnv } from "./perenv.macro";
      import { alreadyDeclared } from 'already.js'
      loadPerEnv({path: 'ccc.js', identifier: 'alreadyDeclared'}, 'ENABLE_A_THING');
    `)
    ).toThrow(
      `It seems you're trying to use an identifier that already exists with perenv.macro`
    );
  });
});

describe("loadPerEnvMap", () => {
  it("Should use the assignment identifier as the import namespace", () => {
    process.env.FEATURE_VERSION = "alpha";

    const result = applyMacro(`
      import { loadPerEnvMap } from "./perenv.macro";
      const feature = loadPerEnvMap({alpha: './aaaa.js'}, 'FEATURE_VERSION');
    `);

    expect(result.includes("import * as feature ")).toBe(true);
  });

  it("Should support string literal keys", () => {
    process.env.FEATURE_VERSION = "alpha";

    const result = applyMacro(`
      import { loadPerEnvMap } from "./perenv.macro";
      const feature = loadPerEnvMap({'alpha': './aaaa.js'}, 'FEATURE_VERSION');
    `);

    expect(result.includes("import * as feature ")).toBe(true);
  });

  it("Should throw if the envar value is not found in the env map", () => {
    process.env.FEATURE_VERSION = "alpha";

    expect(() =>
      applyMacro(`
        import { loadPerEnvMap } from "./perenv.macro";
        const feature = loadPerEnvMap({beta: './aaaa.js'}, 'FEATURE_VERSION');
      `)
    ).toThrow("Entry not found in loadPerEnvMap, FEATURE_VERSION:alpha");
  });

  it("Should assign null if env var is not found in map and nullable flag is set to true", () => {
    process.env.FEATURE_VERSION = "alpha";

    const result = applyMacro(`
      import { loadPerEnvMap } from "./perenv.macro";
      const feature = loadPerEnvMap({beta: './aaaa.js'}, 'FEATURE_VERSION', true);
    `);

    expect(result).toEqual("const feature = null;");
  });

  it("Should remove statement without an assignment if env var is not found in map and nullable flag is set to true", () => {
    process.env.FEATURE_VERSION = "alpha";

    const result = applyMacro(`
      import { loadPerEnvMap } from "./perenv.macro";
      loadPerEnvMap({beta: './aaaa.js'}, 'FEATURE_VERSION', true);
    `);

    expect(result).toEqual("");
  });

  it("Should not use an import namespace if there is no assignment", () => {
    process.env.FEATURE_VERSION = "alpha";

    const result = applyMacro(`
      import { loadPerEnvMap } from "./perenv.macro";
      loadPerEnvMap({alpha: './aaaa.js'}, 'FEATURE_VERSION');
    `);
    expect(result).toEqual(`import "./aaaa.js";`);
  });

  it("Should use an import namespace if there is an assignment", () => {
    process.env.FEATURE_VERSION = "alpha";

    const result = applyMacro(`
      import { loadPerEnvMap } from "./perenv.macro";
      const feature = loadPerEnvMap({alpha: './aaaa.js'}, 'FEATURE_VERSION');
    `);

    expect(result).toEqual(`import * as feature from "./aaaa.js";`);
  });
});

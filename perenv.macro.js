const { createMacro } = require("babel-plugin-macros");
const path = require("path");

function loadPerEnvMacro({ state, babel, references }) {
  const program = state.file.path;
  const { loadPerEnv = [] } = references;

  loadPerEnv.forEach((reference) => {
    const configObject = {
      path: null,
      identifier: null,
    };

    if (reference.parentPath.node.arguments[0].type === "StringLiteral") {
      configObject.path = reference.parentPath.node.arguments[0].value;
    }

    if (reference.parentPath.node.arguments[0].type === "ObjectExpression") {
      const arg = reference.parentPath.node.arguments[0];
      const pathProperty = arg.properties.find((p) => p.key.name === "path");
      configObject.path = pathProperty.value.value;
      const identifierProperty = arg.properties.find(
        (p) => p.key.name === "identifier"
      );

      const imports = program.node.body
        .map((n) => n.specifiers)
        .filter(Boolean)
        .flat(1)
        .map((i) => i.local.name);

      const declarations = program.node.body
        .map((n) => n.declarations)
        .filter(Boolean)
        .flat(1)
        .map((d) => d.id.name);

      if (
        [...imports, ...declarations].includes(identifierProperty.value.value)
      ) {
        throw new Error(
          `It seems you're trying to use an identifier that already exists with perenv.macro`
        );
      }
      configObject.identifier = identifierProperty.value.value;
    }

    const envKey = reference.parentPath.node.arguments[1].value;

    const doImport = reference.parentPath.node.arguments[2]
      ? process.env[envKey] === reference.parentPath.node.arguments[2].value
      : Boolean(process.env[envKey]);

    if (doImport) {
      const callerFilePath = state.file.opts.filename;
      const callerBaseDir = path.dirname(callerFilePath);
      const importFilePath =
        "./" + path.relative(callerBaseDir, configObject.path);
      const t = babel.types;

      const importIdentifiers = [];

      if (configObject.identifier) {
        importIdentifiers.push(
          t.importNamespaceSpecifier(t.identifier(configObject.identifier))
        );
      }
      program.node.body.unshift(
        t.importDeclaration(importIdentifiers, t.stringLiteral(importFilePath))
      );
    }
    reference.parentPath.remove();
  });
}

module.exports = createMacro(loadPerEnvMacro);

const { createMacro } = require("babel-plugin-macros");

function loadPerEnvMacro({ state, babel, references }) {
  const t = babel.types;
  const program = state.file.path;
  const {
    loadPerEnv = [],
    loadPerEnvMap = [],
    ...strayReferences
  } = references;

  Object.entries(strayReferences).forEach(([key]) => {
    throw new Error(`Cannot find reference: ${key} in perenv.macro`);
  });
  loadPerEnvMap.forEach((reference) => {
    const isAssigned =
      reference.parentPath.container.type === "VariableDeclarator";

    const [
      envMapReference,
      envKeyReference,
      nullableReference,
    ] = reference.parent.arguments;

    const nullable =
      nullableReference &&
      nullableReference.type === "BooleanLiteral" &&
      nullableReference.value;

    const envMapKeys = envMapReference.properties.map((p) => p.key.name);
    const envKey = envKeyReference.value;

    if (!envMapKeys.includes(process.env[envKey]) && !nullable) {
      throw new Error(
        `Entry not found in loadPerEnvMap, ${envKey}:${process.env[envKey]}`
      );
    }

    const propertyReference = envMapReference.properties.find(
      (p) => p.key.name === process.env[envKey]
    );

    if (!propertyReference && nullable) {
      if (isAssigned) {
        reference.parentPath.replaceWith(t.nullLiteral());
      } else {
        reference.parentPath.remove();
      }

      return;
    }

    const propertyValue = propertyReference.value.value;

    if (isAssigned) {
      const identifier = reference.parentPath.parent.id.name;
      reference.parentPath.parentPath.remove();
      program.node.body.unshift(
        t.importDeclaration(
          [t.importNamespaceSpecifier(t.identifier(identifier))],
          t.stringLiteral(propertyValue)
        )
      );
    } else {
      reference.parentPath.remove();
      program.node.body.unshift(
        t.importDeclaration([], t.stringLiteral(propertyValue))
      );
    }
  });

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
        .reduce((a, b) => [...a, ...b], [])
        .map((i) => i.local.name);

      const declarations = program.node.body
        .map((n) => n.declarations)
        .filter(Boolean)
        .reduce((a, b) => [...a, ...b], [])
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
      const importFilePath = configObject.path;

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

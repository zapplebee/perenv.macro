const { createMacro } = require("babel-plugin-macros");
const path = require("path");

function loadPerEnvMacro({ state, babel, references }) {
  const { loadPerEnv = [] } = references;

  loadPerEnv.forEach((reference) => {
    const importableFilePath = reference.parentPath.node.arguments[0].value;
    const envKey = reference.parentPath.node.arguments[1].value;

    const doImport = reference.parentPath.node.arguments[2]
      ? process.env[envKey] === reference.parentPath.node.arguments[2].value
      : Boolean(process.env[envKey]);

    if (doImport) {
      const callerFilePath = state.file.opts.filename;
      const callerBaseDir = path.dirname(callerFilePath);
      const importFilePath = path.relative(callerBaseDir, importableFilePath);
      const t = babel.types;
      const id = reference.parentPath.scope.generateUidIdentifier("ENV_LOAD");
      const program = state.file.path;
      program.node.body.unshift(
        t.importDeclaration(
          [t.importNamespaceSpecifier(id)],
          t.stringLiteral(importFilePath)
        )
      );
    }
    reference.parentPath.remove();
  });
}

module.exports = createMacro(loadPerEnvMacro);

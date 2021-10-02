declare module 'perenv.macro';

/**
 * Macro. 
 * If the environmental variable ENABLE_MY_CONFIGURATION is set loadPerEnv will transpile like this
 *
 * @example
 * loadPerEnv('./a_configuration_file.js', 'ENABLE_MY_CONFIGURATION');
 * 
 * @param path	Node resolveable path to import (relative path or package name)
 * @param envar	The environmental variable to inspect
 * @param value (optional) Conditionally load the import if the envar is equal to this value
 */
export function loadPerEnv(path: string, envar: string, value?: any): void;

/**
 * Macro. 
 * If the environmental variable ENABLE_MY_CONFIGURATION is set loadPerEnv will transpile like this.
 * 
 * @example
 * loadPerEnv({path: './feature.js', identifier: 'feature'}, 'NODE_ENV', "dev");
 * 
 * @param path	Node resolveable path to import (relative path or package name)
 * @param identifier	Identifier to use if imported (You probably want to use loadPerEnvMap instead of this)
 * @param envar The environmental variable to inspect
 * @param value (optional) Conditionally load the import if the envar is equal to this value
 */
export function loadPerEnv({path, identifier}: {path: string, identifier: string}, envar: string, value?: any): void;



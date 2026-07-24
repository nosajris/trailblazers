export type LogLevel = 'info' | 'warn' | 'error';

let _dbSink: ((level: LogLevel, module: string, msg: string, details?: any) => void) | null = null;

export function registerDbSink(fn: (level: LogLevel, module: string, msg: string, details?: any) => void): void {
	_dbSink = fn;
}

export const logger = {
	info(module: string, msg: string, details?: any) {
		console.log(`[INFO] [${module}] ${msg}`, details ?? '');
		if (_dbSink) _dbSink('info', module, msg, details);
	},
	warn(module: string, msg: string, details?: any) {
		console.warn(`[WARN] [${module}] ${msg}`, details ?? '');
		if (_dbSink) _dbSink('warn', module, msg, details);
	},
	error(module: string, msg: string, details?: any) {
		console.error(`[ERROR] [${module}] ${msg}`, details ?? '');
		if (_dbSink) _dbSink('error', module, msg, details);
	}
};

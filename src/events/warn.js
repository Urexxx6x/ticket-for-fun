

const Logger = require('leekslazylogger');
const log = new Logger();

module.exports = {
	event: 'warn',
	execute(_client, [e]) {
		log.warn(e);
	}
};
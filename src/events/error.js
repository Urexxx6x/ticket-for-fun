
const Logger = require('leekslazylogger');
const log = new Logger();

module.exports = {
	event: 'error',
	execute(_client, [e]) {
		log.error(e);
	}
};
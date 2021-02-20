

const Logger = require('leekslazylogger');
const log = new Logger();

module.exports = {
	event: 'debug',
	execute(_client, [e]) {
		log.debug(e);
	}
};
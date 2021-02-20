
const Logger = require('leekslazylogger');
const log = new Logger();

module.exports = {
	event: 'rateLimit',
	execute(_client, [limit]) {
	log.warn('[AnWR]! (Enable debug mode in config for details)');
		log.debug(limit);
	}
};
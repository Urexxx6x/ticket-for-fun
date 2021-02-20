
const { version, homepage } = require('../../package.json');
const link = require('terminal-link');

module.exports = (leeks) => {
	console.log(leeks.colours.red(`
 █████  ███    ██ ██     ██ ██████      ████████ ██  ██████ ██   ██ ███████ ████████ ███████ 
██   ██ ████   ██ ██     ██ ██   ██        ██    ██ ██      ██  ██  ██         ██    ██      
███████ ██ ██  ██ ██  █  ██ ██████         ██    ██ ██      █████   █████      ██    ███████ 
██   ██ ██  ██ ██ ██ ███ ██ ██   ██        ██    ██ ██      ██  ██  ██         ██         ██ 
██   ██ ██   ████  ███ ███  ██   ██        ██    ██  ██████ ██   ██ ███████    ██    ███████ 
                                                                                                                                                                                       

`));
	console.log(leeks.colours.redBright(`AnWRTickets bot v${version} by AnWR#0707`));
	console.log(leeks.colours.redBright(homepage + '\n'));
	console.log(leeks.colours.redBright(`Developed And Made By AnWR#0707`));
	console.log('\n\n');
};
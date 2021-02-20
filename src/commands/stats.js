
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'stats',
	description: 'رؤية حالة التذاكر',
	usage: 'اكتب الامر',
	aliases: ['data', 'statistics'],
	
	args: false,
	async execute(client, message, _args, {config, Ticket}) {
		const guild = client.guilds.cache.get(config.guild);

		let open = await Ticket.count({ where: { open: true } });
		let closed = await Ticket.count({ where: { open: false } });

		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setTitle(':bar_chart: حالة التذاكر')
				.addField('التذاكر المفتوحة', open, true)
				.addField('التذاكر المغلقة', closed, true)
				.addField('مجموع التذاكر', open + closed, true)
				.setFooter(guild.name, guild.iconURL())
		);
	}
};
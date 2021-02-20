
const fs = require('fs');
const { join } = require('path');

const {
	MessageEmbed
} = require('discord.js');

module.exports = {
	name: 'getback',
	description: 'هذي نسخة محفوظة من تذكرتك لدينا',
	usage: '<getback-رقم التذكرة>',
	aliases: ['archive', 'download'],
	example: 'getback 57',
	args: true,
	async execute(client, message, args, {config, Ticket}) {
		const guild = client.guilds.cache.get(config.guild);
		const id = args[0];

		let ticket = await Ticket.findOne({
			where: {
				id: id,
				open: false
			}
		});


		if (!ticket) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **تذكرة غير معروفة**')
					.setDescription('لم نتمكن من العثور على تذكرة بهذا الرقم')
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role)) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **لا توجد صلاحية**')
					.setDescription(`لا يمكنك الاطلاع عن التذكرة ${id} لانها لاتخصك ولا انت موظف لدينا`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		let res = {};
		const embed = new MessageEmbed()
			.setColor(config.colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle(`تذكرة رقم ${id}`)
			.setFooter(guild.name, guild.iconURL());

		let file = `../../user/getbacks/text/${ticket.channel}.txt`;
		if (fs.existsSync(join(__dirname, file))) {
			embed.addField('نسخة من تذكرتك', 'الرجاء قم بتحميلها لحفظها');
			res.files = [
				{
					attachment: join(__dirname, file),
					name: `تذكرة-${id}.txt`
				}
			];
		}


		const BASE_URL = config.getbacks.web.server;
		if (config.getbacks.web.enabled) embed.addField('ارشيف الموقع', `${BASE_URL}/${ticket.creator}/${ticket.channel}`);

		if (embed.fields.length < 1) embed.setDescription(`No text getbacks or archive data exists for ticket ${id}`);

		res.embed = embed;

		let channel;
		try {
			channel = message.author.dmChannel || await message.author.createDM();
		} catch (e) {
			channel = message.channel;
		}

		channel.send(res).then(m => {
			if (channel.id === message.channel.id) m.delete({timeout: 15000});
		});
		message.delete({timeout: 1500});
	}
};
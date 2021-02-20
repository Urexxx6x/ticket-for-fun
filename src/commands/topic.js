
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'topic',
	description: 'اضافة موضوع لي التذكرة',
	usage: '<*new والموضوع>',
	aliases: ['edit'],
	example: 'عندي مشكلة يا الغالي',
	args: true,
	async execute(client, message, args, {config, Ticket}) {
		const guild = client.guilds.cache.get(config.guild);

		let ticket = await Ticket.findOne({
			where: {
				channel: message.channel.id
			}
		});

		if (!ticket) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **هذي ليست تذكرة**')
					.setDescription('')
					.addField('موضوع', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		let topic = args.join(' ');
		if (topic.length > 256) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **الموضوع طويل**')
					.setDescription('رجاء حد احرف الموضوع بحيث لا تتعدى 256 حرف.')
					.setFooter(guild.name, guild.iconURL())
			);
		}

		message.channel.setTopic(`<@${ticket.creator}> | ` + topic);

		Ticket.update({
			topic: topic
		}, {
			where: {
				channel: message.channel.id
			}
		});

		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle('✅ **تم تعديل التذكرة**')
				.setDescription('لقد تم تعديل موضوع التذكرة')
				.setFooter(client.user.username, client.user.displayAvatarURL())
		);
	}
};
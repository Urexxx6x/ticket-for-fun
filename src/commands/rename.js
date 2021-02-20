
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'rename',
	description: 'تغير اسم التذكرة',
	usage: '<الاسم الجديد>',
	aliases: ['none'],
	example: 'تغير اسم تذكرة مهمة',
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
					.setDescription('استخدم هذا الامر لتغير اسم التذكرة')
					.addField('استخدم', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (!message.member.roles.cache.has(config.staff_role))
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **لاتوجد صلاحية**')
					.setDescription('لا تمتلك هذي الصلاحية لتغيراسم التذكرة')
					.addField('استخدم', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
					.setFooter(guild.name, guild.iconURL())
			);

		message.channel.setName(args.join('-')); // new channel name

		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle('✅ **تم تحديث التذكرة**')
				.setDescription('لقد تم تغير اسم التذكرة')
				.setFooter(client.user.username, client.user.displayAvatarURL())
		);
	}
};


const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'transfer',
	description: 'نقل ملكية تذكرة الى شخص اخر',
	usage: '<@member>',
	aliases: ['none'],
	example: 'transfer @user',
	args: true,
	async execute(client, message, args, { config, Ticket }) {
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
					.setDescription('اكتب هذا الامر في التذكرة الذي تريد نقل ملكية صاحبها.')
					.addField('طريقة الاستخدام', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('تحتاج مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المساعدات`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (!message.member.roles.cache.has(config.staff_role))
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **لا تمتلك صلاحية**')
					.setDescription('لاتمتلك الصلاحية لتغير صاحب التيكت لانك لست موظف لدينا.')
					.addField('طريقة الاستخدام', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('تحتاج مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المساعدات`)
					.setFooter(guild.name, guild.iconURL())
			);

		let member = guild.member(message.mentions.users.first() || guild.members.cache.get(args[0]));

		if (!member) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **شخص غير موجود**')
					.setDescription('يرجى ذكر عضو صالح.')
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المساعدات`)
					.setFooter(guild.name, guild.iconURL())
			);
		}


		message.channel.setTopic(`${member} | ${ticket.topic}`);

		Ticket.update({
			creator: member.user.id
		}, {
			where: {
				channel: message.channel.id
			}
		});

		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle('✅ **لقد تم تغير صاحب التذكرة**')
				.setDescription(`صاحب التذكرة الان هو ${member}.`)
				.setFooter(client.user.username, client.user.displayAvatarURL())
		);
	}
};


const { MessageEmbed } = require('discord.js');
const Logger = require('leekslazylogger');
const log = new Logger();

module.exports = {
	name: 'add',
	description: 'اضافة عضو في التذكرة',
	usage: '<@member> [... #تذكرة]',
	aliases: ['none'],
	example: 'اضافة @member في #تذكرة-23',
	args: true,
	async execute(client, message, args, {config, Ticket}) {
		const guild = client.guilds.cache.get(config.guild);

		const notTicket = new MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle('❌ **هذي ليست تذكرة**')
			.setDescription('استخدم هذا الامر لي اضافة عضو في التذكرة')
			.addField('طريقة الاستخدام', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('تحتاج مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من العلومات`)
			.setFooter(guild.name, guild.iconURL());

		let ticket;

		let channel = message.mentions.channels.first();

		if (!channel) {
			channel = message.channel;
			ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
			if (!ticket) return message.channel.send(notTicket);

		} else {
			ticket = await Ticket.findOne({ where: { channel: channel.id } });
			if (!ticket) {
				notTicket
					.setTitle('❌ **هذي ليست تذكرة**')
					.setDescription(`${channel} هذي ليست تذكرة.`);
				return message.channel.send(notTicket);
			}
		}

		if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role)) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **لاتمتلك الصلاحية**')
					.setDescription(`لا تمتلك الصلاحية في التحكم في ${channel} لانها لا تخصك او انك لست موظف لدينا.`)
					.addField('طريقة الاستخدام', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		let member = guild.member(message.mentions.users.first() || guild.members.cache.get(args[0]));

		if (!member) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **عضو غير موجود**')
					.setDescription('الرجاء منشن الشخص بطريقة صحيحة.')
					.addField('طريقة الاستخدام', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من العلومات`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		try {
			channel.updateOverwrite(member.user, {
				VIEW_CHANNEL: true,
				SEND_MESSAGES: true,
				ATTACH_FILES: true,
				READ_MESSAGE_HISTORY: true
			});

			if (channel.id !== message.channel.id) {
				channel.send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle('**تمت اضافة العضو**')
						.setDescription(`${member} لقد تمت اضافة من قبل ${message.author}`)
						.setFooter(guild.name, guild.iconURL())
				);
			}

			message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle('✅ **لقد تمت اضافة العضو بنجاح**')
					.setDescription(`${member} لقد انضاف لي تذكرة <#${ticket.channel}>`)
					.setFooter(guild.name, guild.iconURL())
			);

			log.info(`${message.author.tag} اضاف عضو في تذكرة (#${message.channel.id})`);
		} catch (error) {
			log.error(error);
		}
		// command ends here
	},
};

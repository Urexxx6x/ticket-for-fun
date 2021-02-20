
const { MessageEmbed } = require('discord.js');
const Logger = require('leekslazylogger');
const log = new Logger();

module.exports = {
	name: 'remove',
	description: 'ازالة عضو من التذكرة',
	usage: '<@member> [#واسم التذكرة]',
	aliases: ['none'],
	example: 'ازالة @member من #ticket-23',
	args: true,
	async execute(client, message, args, {config, Ticket}) {
		const guild = client.guilds.cache.get(config.guild);

		const notTicket = new MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle('❌ **هذي ليست تذكرة**')
			.setDescription('اكتب الامر في التذكرة الذي تريد ازالة شخص منها او قم ب اضافة منشن لي التذكرة')
			.addField('استخدم', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
			.setFooter(guild.name, guild.iconURL());

		let ticket;

		let channel = message.mentions.channels.first();

		if (!channel) {

			channel = message.channel;
			ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
			if (!ticket)
				return message.channel.send(notTicket);

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
					.setTitle('❌ **لاتوجد صلاحية**')
					.setDescription(`لا تمتلك الصلاحية في ${channel} لانها لاتخصك ولا انت موظف عندنا`)
					.addField('استخدم', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		let member = guild.member(message.mentions.users.first() || guild.members.cache.get(args[0]));

		if (!member || member.id === message.author.id || member.id === guild.me.id)
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **عضو غير معروف**')
					.setDescription('الرجاء ادخل الاسم الصحيح')
					.addField('استخدم', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
					.setFooter(guild.name, guild.iconURL())
			);

		try {
			channel.updateOverwrite(member.user, {
				VIEW_CHANNEL: false,
				SEND_MESSAGES: false,
				ATTACH_FILES: false,
				READ_MESSAGE_HISTORY: false
			});

			if (channel.id !== message.channel.id) {
				channel.send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle('**تمت ازالة العضو**')
						.setDescription(`${member} لقد تمت ازالة من قبل ${message.author}`)
						.setFooter(guild.name, guild.iconURL())
				);
			}

			message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle('✅ **تمت ازالة العضو بنجاح**')
					.setDescription(`${member} تمت ازالة من تذكرة <#${ticket.channel}>`)
					.setFooter(guild.name, guild.iconURL())
			);

			log.info(`${message.author.tag} تمت ازالة من تذكرة (#${message.channel.id})`);
		} catch (error) {
			log.error(error);
		}
	},
};

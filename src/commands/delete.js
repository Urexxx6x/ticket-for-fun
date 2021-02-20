
const Logger = require('leekslazylogger');
const log = new Logger();
const {
	MessageEmbed
} = require('discord.js');
const fs = require('fs');
const { join } = require('path');

module.exports = {
	name: 'delete',
	description: 'حذف تذكرة نفس اغلاق التذكرة بس بدون حفظ التذكرة',
	usage: '[تذكرة]',
	aliases: ['حذف'],
	example: 'خذف #تذكرة-17',
	args: false,
	async execute(client, message, args, {
		config,
		Ticket
	}) {
		const guild = client.guilds.cache.get(config.guild);

		const notTicket = new MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle('❌ **هذي ليست تذكرة**')
			.setDescription('اكتب هذا الامر في التذكرة الذي تريد حذفها او قم اضافة منشن لي التذكرة')
			.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('Help', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
			.setFooter(guild.name, guild.iconURL());

		let ticket;
		let channel = message.mentions.channels.first();
		// || client.channels.resolve(await Ticket.findOne({ where: { id: args[0] } }).channel) // channels.fetch()

		if (!channel) {
			channel = message.channel;

			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket) return channel.send(notTicket);

		} else {
			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket) {
				notTicket
					.setTitle('❌ **هذي ليست تذكرة**')
					.setDescription(`${channel} is not a ticket channel.`);
				return message.channel.send(notTicket);
			}

		}
		if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role)) 
			return channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **لاتوجد صلاحية**')
					.setDescription(`ليس لديك صلاحية في حذف ${channel} لانها لا تخصك ولا انك موظف لدينا`)
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من  المعلومات`)
					.setFooter(guild.name, guild.iconURL())
			);
		
		let success;

		let confirm = await message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle('❔ هل انت متاكد?')
				.setDescription(
					`:تحذير: هذا القرار **لا رجعة فيه**, التذكرة سوف تنحذف من نظامنا.
					انت  **لم** تتمكن من روية او استرجاع او حفظ هذا التذكرة.
					استخدم امر \`close\` بدلاً من ذلك إذا كنت لا تريد هذا السلوك.\n**تفاعل مع ✅ لتاكيد الامر.**`)
				.setFooter(guild.name + ' | الانتهاء في 15 ثانية', guild.iconURL())
		);

		await confirm.react('✅');

		const collector = confirm.createReactionCollector(
			(r, u) => r.emoji.name === '✅' && u.id === message.author.id, {
				time: 15000
			});

		collector.on('collect', async () => {
			if (channel.id !== message.channel.id)
				channel.send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('**تم حذف التذكرة**')
						.setDescription(`التذكرة حذفة من قبل ${message.author}`)
						.setFooter(guild.name, guild.iconURL())
				);

			confirm.reactions.removeAll();
			confirm.edit(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`✅ **التذكرة ${ticket.id} حذفت**`)
					.setDescription('هذي التذكرة سوف تحذف بعد بضع ثواني')
					.setFooter(guild.name, guild.iconURL())
			);

			let txt = join(__dirname, `../../user/getbacks/text/${ticket.get('channel')}.txt`),
				raw = join(__dirname, `../../user/getbacks/raw/${ticket.get('channel')}.log`),
				json = join(__dirname, `../../user/getbacks/raw/entities/${ticket.get('channel')}.json`);

			if (fs.existsSync(txt)) fs.unlinkSync(txt);
			if (fs.existsSync(raw)) fs.unlinkSync(raw);
			if (fs.existsSync(json)) fs.unlinkSync(json);

			// update database
			success = true;
			ticket.destroy(); // remove ticket from database

			// delete messages and channel
			setTimeout(() => {
				channel.delete();
				if (channel.id !== message.channel.id)
					message.delete()
						.then(() => confirm.delete());
			}, 5000);

			log.info(`${message.author.tag} حذف تذكرة (#تذكرة-${ticket.id})`);

			if (config.logs.discord.enabled) {
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('التذكرة حذفت')
						.addField('المنشئ', `<@${ticket.creator}>`, true)
						.addField('حذفت من', message.author, true)
						.setFooter(guild.name, guild.iconURL())
						.setTimestamp()
				);
			}
		});


		collector.on('end', () => {
			if (!success) {
				confirm.reactions.removeAll();
				confirm.edit(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('❌ **الانتهاء**')
						.setDescription('استغرقت وقت طويل في التفاعل لقد فشل التاكيد')
						.setFooter(guild.name, guild.iconURL()));

				message.delete({
					timeout: 10000
				})
					.then(() => confirm.delete());
			}
		});

	}
};
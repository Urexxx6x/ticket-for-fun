
const Logger = require('leekslazylogger');
const log = new Logger();
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { join } = require('path');
const archive = require('../modules/archive');

module.exports = {
	name: 'close',
	description: '.اغلاق تذكرة تم الانتهاء منها او زايدة',
	usage: '[#التذكرة]',
	aliases: ['none'],
	example: 'اغلاق #تذكرة-17',
	args: false,
	async execute(client, message, args, { config, Ticket }) {
		const guild = client.guilds.cache.get(config.guild);

		const notTicket = new MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle('❌ **هذي ليست تذكرة**')
			.setDescription('استخدم هذا الامر في التذكرة الذي تريد اغلاقها او قم باضافة منشن لي التذكرة.')
			.addField('طريقة الاستخدام', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
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
			if (!ticket) return message.channel.send(notTicket);
		} else {
			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket) {
				notTicket
					.setTitle('❌ **هذي ليست تذكرة**')
					.setDescription(`${channel} هذي ليست تذكرة.`);
				return message.channel.send(notTicket);
			}

		}

		if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role))
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **لاتمتلك الصلاحية**')
					.setDescription(`لا تمتلك الصلاحية لاغلاق التذكرة ${channel} لانها لا تخصك او انك لست موظف لدينا.`)
					.addField('طريقة الاستخدام', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
					.setFooter(guild.name, guild.iconURL())
			);

		let success;
		let pre = fs.existsSync(join(__dirname, `../../user/getbacks/text/${channel.id}.txt`)) ||
			fs.existsSync(join(__dirname, `../../user/getbacks/raw/${channel.id}.log`)) ?
			`يمكنك رؤية النسخة المحفوظة لدينا من خلال امر \`${config.prefix}getback ${ticket.id}\`` :
			'';

		let confirm = await message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle(' هل انت متاكد ?')
				.setDescription(`${pre}\n**تفاعل مع ✅ لتاكيد.**`)
				.setFooter(guild.name + ' | تنتهي في 15 ثانية', guild.iconURL())
		);

		await confirm.react('✅');

		const collector = confirm.createReactionCollector(
			(r, u) => r.emoji.name === '✅' && u.id === message.author.id, {
				time: 15000
			});

		collector.on('collect', async () => {
			if (channel.id !== message.channel.id) {
				channel.send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('**التذكرة مغلقة**')
						.setDescription(`تم اغلاق التذكرة من قبل ${message.author}`)
						.setFooter(guild.name, guild.iconURL())
				);
			}

			confirm.reactions.removeAll();
			confirm.edit(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`✅ **التذكرة ${ticket.id} اغلقت**`)
					.setDescription('التذكرة سوف تنحذف اول ما تنحفظ عندنا.')
					.setFooter(guild.name, guild.iconURL())
			);

			if (config.getbacks.text.enabled || config.getbacks.web.enabled) {
				let u = await client.users.fetch(ticket.creator);

				if (u) {
					let dm;
					try {
						dm = u.dmChannel || await u.createDM();
					} catch (e) {
						log.warn(`لايمكنك انشاء محادثة خاصة مع ${u.tag}`);
					}


					let res = {};
					const embed = new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(`التذكرة ${ticket.id}`)
						.setFooter(guild.name, guild.iconURL());

					if (fs.existsSync(join(__dirname, `../../user/getbacks/text/${ticket.get('channel')}.txt`))) {
						embed.addField('نسخة محفوطة من تذكرتك', 'قم بتحميلها لرؤيتها');
						res.files = [{
							attachment: join(__dirname, `../../user/getbacks/text/${ticket.get('channel')}.txt`),
							name: `Ticket-${ticket.id}.txt`
						}];
					}

					if (fs.existsSync(join(__dirname, `../../user/getbacks/raw/${ticket.get('channel')}.log`)) && fs.existsSync(join(__dirname, `../../user/getbacks/raw/entities/${ticket.get('channel')}.json`))) {
						embed.addField('Web archive', await archive.export(Ticket, channel));
					}

					if (embed.fields.length < 1) {
						embed.setDescription(`لاتوجد تذكرة بهذا الرقم ${ticket.id}`);
					}

					res.embed = embed;

					
					try {
						dm.send(res).then();
					} catch (e) {
						message.channel.send('❌ لايمكن الارسال في الخاص');
					}
				}
			}

			// update database
			success = true;
			ticket.update({
				open: false
			}, {
				where: {
					channel: channel.id
				}
			});

			// delete messages and channel
			setTimeout(() => {
				channel.delete();
				if (channel.id !== message.channel.id)
					message.delete()
						.then(() => confirm.delete());
			}, 5000);

			log.info(`${message.author.tag} اغلقت هذي التذكرة (#${ticket.creator}-${ticket.id})`);

			if (config.logs.discord.enabled) {
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('التذكرة اغلقت')
						.addField('المنشئ', `<@${ticket.creator}>`, true)
						.addField('اغلقت من قبل', message.author, true)
						.addField("رقم التذكرة", ticket.id, true)
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
						.setTitle('❌ **انتهاء**')
						.setDescription('تاخرت لي التفاعل مع التاكيد')
						.setFooter(guild.name, guild.iconURL()));

				message.delete({
					timeout: 10000
				})
					.then(() => confirm.delete());
			}
		});

	}
};
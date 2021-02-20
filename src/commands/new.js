
const Logger = require('leekslazylogger');
const log = new Logger();
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { join } = require('path');

module.exports = {
	name: 'new',
	description: 'اضافة تذكرة دعم جديدة',
	usage: '[انشاء تذكرة جديدة ويمكن كتابة موضوع بعد الاختصار]',
	aliases: ['ticket', 'open'],
	example: 'new و موضوعك',
	args: false,
	async execute(client, message, args, {config, Ticket}) {
		const guild = client.guilds.cache.get(config.guild);

		const supportRole = guild.roles.cache.get(config.staff_role);
		if (!supportRole)
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setTitle('❌ **خطاء**')
					.setDescription(`${config.name} لم يتم ظبط رتبة الدعم الفني  في السيرفر \`${config.staff_role}\``)
					.setFooter(guild.name, guild.iconURL())
			);


		let tickets = await Ticket.findAndCountAll({
			where: {
				creator: message.author.id,
				open: true
			},
			limit: config.tickets.max
		});

		if (tickets.count >= config.tickets.max) {
			let ticketList = [];
			for (let t in tickets.rows) {
				let desc = tickets.rows[t].topic.substring(0, 30);
				ticketList
					.push(`<#${tickets.rows[t].channel}>: \`${desc}${desc.length > 30 ? '...' : ''}\``);
			}

			let m = await message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`❌ ** لديك ${tickets.count} او اكثر من تذكرة مفتوحة**`)
					.setDescription(`استخدم \`${config.prefix}close\` لاغلاق التذاكر الزايدة \n\n${ticketList.join(',\n')}`)
					.setFooter(guild.name + ' | هذي الرسالة سوف تنحذف بعد 15 ثانية', guild.iconURL())
			);

			return setTimeout(async () => {
				await message.delete();
				await m.delete();
			}, 15000);
		}


		let topic = args.join(' ');
		if (topic.length > 256)
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **الوصف زايد عن الحد المسموح**')
					.setDescription('الرجاء ترتيب الكلام بحيث لا يتعدى 256 حرف')
					.setFooter(guild.name, guild.iconURL())
			);
		else if (topic.length < 1) topic = 'لم يتم اضافة موضوع لي التذكرة';

		let ticket = await Ticket.create({
			channel: '',
			creator: message.author.id,
			open: true,
			archived: false,
			topic: topic
		});

		let name = 'تذكرة-' + ticket.get('id');

		guild.channels.create(name, {
			type: 'text',
			topic: `${message.author} | ${topic}`,
			parent: config.tickets.category,
			permissionOverwrites: [{
				id: guild.roles.everyone,
				deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
			},
			{
				id: client.user,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
			},
			{
				id: message.member,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
			},
			{
				id: supportRole,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
			}
			],
			reason: 'المستخدم طلب تذكرة جديدة'
		}).then(async c => {

			Ticket.update({
				channel: c.id
			}, {
				where: {
					id: ticket.id
				}
			});

			let m = await message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('✅ **تم انشاء تذكرة**')
					.setDescription(`لقد تم انشاء تذكرتك: ${c}`)
					.setFooter(client.user.username + ' | هذي الرسالة سوف تحذف في غضون 15 ثانية', client.user.displayAvatarURL())
			);

			setTimeout(async () => {
				await message.delete();
				await m.delete();
			}, 15000);

			// require('../modules/archive').create(client, c); // create files

			let ping;
			switch (config.tickets.ping) {
			case 'staff':
				ping = `<@&${config.staff_role}>,\n`;
				break;
			case false:
				ping = '';
				break;
			default:
				ping = `@${config.tickets.ping},\n`;
			}

			await c.send(ping + `${message.author} لقد قام بانشاء تذكرة جديدة`);

			if (config.tickets.send_img) {
				const images = fs.readdirSync(join(__dirname, '../../user/images'));
				await c.send({
					files: [
						join(__dirname, '../../user/images', images[Math.floor(Math.random() * images.length)])
					]
				});
			}

			let text = config.tickets.text
				.replace(/{{ ?name ?}}/gmi, message.author.username)
				.replace(/{{ ?(tag|mention) ?}}/gmi, message.author);


			let w = await c.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setDescription(text)
					.addField('الموضوع', `\`${topic}\``)
					.setFooter(guild.name, guild.iconURL())
			);

			if (config.tickets.pin) await w.pin();
			// await w.pin().then(m => m.delete()); // oopsie, this deletes the pinned message

			if (config.logs.discord.enabled)
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('تذكرة جديدة')
						.setDescription(`\`${topic}\``)
						.addField('المنشئ', message.author, true)
						.addField('المحادثة', c, true)
						.setFooter(guild.name, guild.iconURL())
						.setTimestamp()
				);

			log.info(`${message.author.tag} انشاء تذكرة جديدة (#${name})`);


		}).catch(log.error);
	},
};



const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { join } = require('path');

module.exports = {
	name: 'tickets',
	description: 'لسته كاملة من تذاكرنا كاملة مع محتوياتها',
	usage: '[@member]',
	aliases: ['list'],
	args: false,
	async execute(client, message, args, {config, Ticket}) {
		const guild = client.guilds.cache.get(config.guild);

		const supportRole = guild.roles.cache.get(config.staff_role);
		if (!supportRole) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setTitle('❌ **Error**')
					.setDescription(`${config.name} لم يتم ظبط رتبة الموظفين في السيرفر \`${config.staff_role}\``)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		let context = 'self';
		let user = message.mentions.users.first() || guild.members.cache.get(args[0]);

		if (user) {
			if (!message.member.roles.cache.has(config.staff_role)) {
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('❌ **لا تمتلك صلاحية**')
						.setDescription('لا تمتلك صلاحية لرؤية تذاكرنا لي انك لست من موظفينا')
						.addField('طريقة الاستلام', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
						.addField('تحتاج مساعدة', `اكتب \`${config.prefix}help ${this.name}\` لمزيد من المعلومات`)
						.setFooter(guild.name, guild.iconURL())
				);
			}

			context = 'staff';
		} else user = message.author;

		let openTickets = await Ticket.findAndCountAll({
			where: {
				creator: user.id,
				open: true
			}
		});

		let closedTickets = await Ticket.findAndCountAll({
			where: {
				creator: user.id,
				open: false
			}
		});

		closedTickets.rows = closedTickets.rows.slice(-10); // get most recent 10

		let embed = new MessageEmbed()
			.setColor(config.colour)
			.setAuthor(user.username, user.displayAvatarURL())
			.setTitle(`${context === 'انت' ? 'الخاص بك' : user.username + '\'s'} التذاكر`)
			.setFooter(guild.name + ' | هذي الرسالة سوف تحذف بعد 60 ثانية', guild.iconURL());

		/* if (config.getbacks.web.enabled) {
			embed.setDescription(`You can access all of your ticket archives on the [web portal](${config.getbacks.web.server}/${user.id}).`);
		} */

		let open = [],
			closed = [];

		for (let t in openTickets.rows)  {
			let desc = openTickets.rows[t].topic.substring(0, 30);
			open.push(`> <#${openTickets.rows[t].channel}>: \`${desc}${desc.length > 20 ? '...' : ''}\``);
		}

		for (let t in closedTickets.rows)  {
			let desc = closedTickets.rows[t].topic.substring(0, 30);
			let getback = '';
			let c = closedTickets.rows[t].channel;
			if (config.getbacks.web.enabled || fs.existsSync(join(__dirname, `../../user/getbacks/text/${c}.txt`))) {
				getback = `\n> اكتب \`${config.prefix}getback ${closedTickets.rows[t].id}\` لرؤية تذكرتك.`;
			}

			closed.push(`> **#${closedTickets.rows[t].id}**: \`${desc}${desc.length > 20 ? '...' : ''}\`${getback}`);

		}

		let pre = context === 'نفسك' ? 'انت' : user.username + 'لديك';
		embed.addField('تذاكر مفتوحة', openTickets.count === 0 ? `${pre} لا توجد تذكرة مفتوحة.` : open.join('\n\n'), false);
		embed.addField('تذاكر مغلقة', closedTickets.count === 0 ? `${pre} لا توجد تذكرة قديمة` : closed.join('\n\n'), false);

		message.delete({timeout: 15000});

		let channel;
		try {
			channel = message.author.dmChannel || await message.author.createDM();
			message.channel.send('لقد تم الارسال لك على الخاص').then(msg => msg.delete({timeout: 15000}));
		} catch (e) {
			channel = message.channel;
		}

		let m = await channel.send(embed);
		m.delete({timeout: 60000});
	},
};
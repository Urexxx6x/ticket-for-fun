

const { Collection, MessageEmbed } = require('discord.js');
const Logger = require('leekslazylogger');
const log = new Logger();
const archive = require('../modules/archive');

module.exports = {
	event: 'message',
	async execute(client, [message], {config, Ticket, Setting}) {

		const guild = client.guilds.cache.get(config.guild);

		if (message.channel.type === 'dm' && !message.author.bot) {
			log.console(`تلقيت رسالة على الخاص من  ${message.author.tag}: ${message.cleanContent}`);
			return message.channel.send(`https://discord.gg/7RFdpTraBq`);
		} // stop here if is DM

		let ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
		if (ticket) archive.add(message); // add message to archive

		if (message.author.bot || message.author.id === client.user.id) return; // goodbye bots

		const regex = new RegExp(`^(<@!?${client.user.id}>|\\${config.prefix.toLowerCase()})\\s*`);
		if (!regex.test(message.content.toLowerCase())) return; // not a command

		const [, prefix] = message.content.toLowerCase().match(regex);
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command || commandName === 'none') return; // not an existing command

		if (command.permission && !message.member.hasPermission(command.permission)) {
			log.console(`${message.author.tag} بدون صلحية '${command.name}' حاول يستخدم امر`);
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setTitle('❌ لاتوجد صلاحية')
					.setDescription(`**.(تحتاج هذي الصلاحية \`${command.permission}\`) \`${command.name}\` لا تمتلك الصلحية لاستخدام هذا الامر**`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (command.args && !args.length) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.addField('طريقة الاستخدام', `\`${config.prefix}${command.name} ${command.usage}\`\n`)
					.addField('تحتاج مساعدة', `لمزيد من المعلومات \`${config.prefix}help ${command.name}\` اكتب`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Collection());

		const now = Date.now();
		const timestamps = client.cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || config.cooldown) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				log.console(`${message.author.tag} attempted to use the '${command.name}' command before the cooldown was over`);
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setDescription(`❌ انتظر ${timeLeft.toFixed(1)} ثواني قبل  تستخدم \`${command.name}\` هذا الامر.`)
						.setFooter(guild.name, guild.iconURL())
				);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(client, message, args, {config, Ticket, Setting});
			log.console(`${message.author.tag} used the '${command.name}' command`);
		} catch (error) {
			log.warn(`An error occurred whilst executing the '${command.name}' command`);
			log.error(error);
			message.channel.send(`❌ حدث خطاء في تنفيض هذا \`${command.name}\` الامر.`);
		}
	}
};

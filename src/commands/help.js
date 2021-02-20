
const Logger = require('leekslazylogger');
const log = new Logger();
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'help',
	description: 'اظهار قائمة المساعدة',
	usage: '[امر]',
	aliases: ['امر', 'اوامر'],
	example: '',
	args: false,
	execute(client, message, args, {config}) {
		const guild = client.guilds.cache.get(config.guild);

		const commands = Array.from(client.commands.values());

		if (!args.length) {
			let cmds = [];

			for (let command of commands) {
				if (command.hide) continue;
				if (command.permission && !message.member.hasPermission(command.permission)) continue;

				let desc = command.description;

				if (desc.length > 50) desc = desc.substring(0, 50) + '...';
				cmds.push(`**${config.prefix}${command.name}** **·** ${desc}`);
			}

			message.channel.send(
				new MessageEmbed()
					.setTitle('الاوامر')
					.setColor(config.colour)
					.setDescription(
						`\nالاوامر المتاحة لك تم ترتيبها لك اكتب \`${config.prefix}help [الامر]\` لمزيد من المعلومات عن امر معين.
						\n${cmds.join('\n\n')}
						\nالرجاء التواصل مع احد الموظفين اذا كنت تحتاج المساعدة.`
					)
					.setFooter(guild.name, guild.iconURL())
			).catch((error) => {
				log.warn('لم يمكن ارسال قائمة المساعدة');
				log.error(error);
			});

		} else {
			const name = args[0].toLowerCase();
			const command = client.commands.get(name) || client.commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command)
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setDescription(`❌ **امر غير متاح** (\`${config.prefix}help\`)`)
				);


			const cmd = new MessageEmbed()
				.setColor(config.colour)
				.setTitle(command.name);


			if (command.long) cmd.setDescription(command.long);
			else cmd.setDescription(command.description);

			if (command.usage) cmd.addField('طريقة الاستخدام', `\`${config.prefix}${command.name} ${command.usage}\``, false);

			if (command.usage) cmd.addField('مثال', `\`${config.prefix}${command.example}\``, false);


			if (command.permission && !message.member.hasPermission(command.permission)) {
				cmd.addField('يتطلب صلاحية', `\`${command.permission}\` :بمعنى: لا تمتلك الصلاحية لاستخدام هذا الامر`, true);
			} else cmd.addField('يتطلب صلاحية', `\`${command.permission || 'غير متوفرة'}\``, true);

			message.channel.send(cmd);
		}

		// command ends here
	},
};
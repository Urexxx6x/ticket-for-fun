
module.exports = {
	prefix: '$',
	name: 'FunTickets',
	presences: [
		{
			activity: 'New',
			type: 'LISTENING'
		},
		{
			activity: 'Fun',
			type: 'WATCHING'
		}
	],
	append_presence: ' | Tickets',
	colour: '#ffa5a5',
	err_colour: 'RED',
	cooldown: 3,

	guild: '765940309255127103', // ID of your guild
	staff_role: '811968229676285972', // ID of your Support Team role

	tickets: {
		category: '811967758358282290', // ID of your tickets category
		send_img: true,
		ping: 'here',	
		text: `هلا وغلا منورنا {{ tag }} <:safg:811969308678815764>
لاهنت انتظر على ما بال نتواصل معك وسعيدين في خدمتك <:safg:811969308678815764>
`,
		pin: false,
		max: 3
	},

	getbacks: {
		text: {
			enabled: true,
			keep_for: 90,
		},
		web: {
			enabled: false,
			server: 'https://tickets.example.com',
		}
	},

	panel: {
		title: 'تذاكر الدعم الفني',
		description: ' اضغط على علامة التذكرة لفتح تذكرة 🧾',
		reaction: '🧾'
	},

	storage: {
		type: 'sqlite'
	},

	logs: {
		files: {
			enabled: true,
			keep_for: 7
		},
		discord: {
			enabled: false,
			channel: '765940310101852174' // ID of your log channel
		}
	},

	debug: false,
	updater: true
};

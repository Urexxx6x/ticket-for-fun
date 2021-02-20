
module.exports = {
	plural(word, num) {
		return num !== 1 ? word + 's' : word;
	}
};
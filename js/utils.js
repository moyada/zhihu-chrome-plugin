
function getLast(list) {
	return list[list.length - 1]
}

function nowTime() {
	return Math.round(new Date() / 1000)
}

function format(date) {
	return date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日'
}
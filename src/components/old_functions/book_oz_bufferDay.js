export default function book_oz_bufferDay(fal,date) {
	if (fal > 0 && typeof oz_vars.minTime !== 'undefined' && oz_vars.minTime > 0) {
		var buffer = moment().add(oz_vars.minTime, 'hours');
		var now = moment(date);
		oz_app.resetBuffer()
		if (buffer.isAfter(now, 'day')) {
			oz_app.toggleBuffer()
			return 0;
		}
	}
	return fal;
}
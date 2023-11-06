import plav_bus_days from './plav_bus_days'
import book_oz_bufferDay from './book_oz_bufferDay'

export default function createCalendar(options = {}, TimeWeek = [], daysoff='') {
		let time =  plav_bus_days(TimeWeek);
		time =  oz_app.plav_bus_days(time);
		oz_app.add({'schedule': TimeWeek, time, daysoff})
		oz_app.removeDaysoffFromTime()
		var maxMonth = (typeof oz_vars.maxMonth !== 'undefined' && oz_vars.maxMonth ) ? oz_vars.maxMonth+'M' : '1M';
		let deb = moment()
		let defOptions = {
			minDate: 0,
			maxDate: maxMonth,
			beforeShowDay: function(date){
				if (!time.length) return [1];
				var popup;
				let AllIndexes = [];
				var day = jQuery.datepicker.formatDate('yy-mm-dd', date);
				var today = moment().format('YYYY-MM-DD');
				//var ind = time.map(function(obj,ind) { if (obj.day == day) {AllIndexes.push(time[ind])} return obj.day }).indexOf(day);
					AllIndexes = oz_app.get('time_without_daysoff').filter((obj,ind) => (typeof obj.timezone == 'undefined' && obj.day == day) || (typeof obj.timezone != 'undefined' && obj.timezone.indexOf(day) > -1));
				let fal;
					if (AllIndexes.length) {
						var popup = '';
						for (var key in AllIndexes) {
							//if (popup.indexOf('time-'+AllIndexes[key].start+'-'+AllIndexes[key].end+'-'+AllIndexes[key].pId+' ') < 0)
							popup += 'time-'+AllIndexes[key].start+'-'+AllIndexes[key].end+'-'+AllIndexes[key].pId+' ';
						}
					}
					fal = AllIndexes.length > 0;
					fal = book_oz_bufferDay(fal,date);
				
						return [ fal, popup, ];
			},
			dateFormat: 'dd.mm.yy',
			firstDay: oz_vars.firstDay,
		}

		for (let key in options) {
			defOptions[key] = options[key]
		}
		jQuery('.inlinedatepicker').datepicker(defOptions);
		return time;
}
import store from '../store'
import {getCookie} from '../functions/functions'
import onlyUniq from '../functions/onlyUniq'
export default class oz_App {
	constructor() {
		this.app = {}
		this.iter = 0
		this.buffer = false
		this.store = store
		this.use_tz = oz_vars.timezone_detect && getCookie('oz_timezone') != 'no'
		this.setUserTimezone = this.setUserTimezone.bind(this)
		this.userAreaTime()
		this.events()
	}
	
	events() {
		let that = this
		document.addEventListener('animateNextEv',function(e){
			setTimeout(function() {
				that.setPrice()
			},700)
		})
	}
	
	setPrice() {
		let that = this;
		let total = jQuery('.oz_zapis_info .oz_amount_info');
		if (that.get('amount') && that.get('amount') > 0) {
			if (this.isRecurring()) {
				if (this.get('recurring').get('pay') == 'all') {
					let times = this.getRecurring().length + 1
					this.add({'amount': this.get('services').map(el => el.price).reduce((pr,el) => pr + el) * times})
				}
			}
			total.show();
			
			total.find('span').text(that.get('amount'));
			jQuery('.chist[name="oz_order_sum"]').val(that.get('amount'));
		}
		else {
			total.hide();
			total.find('span').text('');
			jQuery('.chist[name="oz_order_sum"]').val('');
		}
	}
	
	time() {
		return 'Site time: '+moment().utcOffset(this.ctz()).format('DD.MM.YYYY HH:mm:ss')+"\n"+
		'User time: '+ moment().utcOffset(this.tz()).format('DD.MM.YYYY HH:mm:ss')
	}
	
	u_tz__old() {
		if (typeof getCookie('oz_timezone') == 'undefined') return true;
		return !this.use_tz || (this.use_tz && this.ctz() == this.tz());
	}

	u_tz() {
		if (typeof this.__u_tz_cached != 'undefined') return this.__u_tz_cached
		if (typeof getCookie('oz_timezone') == 'undefined')
		this.__u_tz_cached = true
		else
		this.__u_tz_cached = (!this.use_tz || (this.use_tz && this.ctz() == this.tz()))
		return this.__u_tz_cached;
	}
	
	add(params = {}) {
		for (let key in params) {
			this.app[key] = params[key]
		}
	}
	
	remove(param) {
		if (param && typeof this.app[param] != 'undefined') {
				delete this.app[param]
		}
		return this.app		
	}
	
	get(param = '') {
		if (param) {
			if (typeof this.app[param] != 'undefined') {
				return this.app[param]
			}
			else {
				return false;
			}
		}
		return this.app
	}
	
	getField(name = '') {
		var form = this.get('form')
		if (name && typeof form[name] != 'undefined') {
			return form[name]
		}
		else {
			return '';
		}
	}
	
	iterReset() {
		this.iter = 0
	}
	
	getStartEnd(date, pers) {
		let startEnd = {}
		let ind = this.get('time').filter(t => moment(t.day, 'YYYY-MM-DD').format('DD.MM.YYYY') == date && t.pId == pers )
			if (ind.length) {
				ind.forEach( t => {
					startEnd = {
						'dHStart' : Number(t.start.split(':')[0]),
						'dMStart' : Number(t.start.split(':')[1]),
						'dHFinish' : Number(t.end.split(':')[0]),
						'dMFinish' : Number(t.end.split(':')[1]),				
					};	
				}
				)				
			}
			return startEnd;
	}
	
	getDaysOff(pers = 0) {
		let daysoff = [];
		if (!pers) {
			daysoff = {}
		}
		if (typeof this.get('daysoff') == 'string' && this.get('daysoff').indexOf('{') > -1) {
			let alls = JSON.parse(this.get('daysoff'));
				for (let key in alls) {
					if (!pers) {
						let p = Object.keys(alls[key])[0]
						daysoff[p] = alls[key][p].split(',')
					}
					else {
					if (typeof alls[key][pers] != 'undefined') daysoff = alls[key][pers].split(',')
					}
				}
		 }
		else if (typeof this.get('daysoff') == 'object') {
			let alls = this.get('daysoff');
				for (let key in alls) {
					if (!pers) {
						let p = alls[key]['pId']
						if (alls[key][p])
						daysoff[p] = alls[key][p].split(',')
					}
					else {
						if (typeof alls[key][pers] != 'undefined') daysoff = alls[key][pers].split(',')
					}
				}
		}		
		else {
			if (this.get('daysoff')) {
				if (!pers) {
					daysoff[this.get('pers')] = this.get('daysoff').split(',');
				}
				else {
				daysoff = this.get('daysoff').split(',');
				}
			}
		}
		return daysoff;
	}
	
	isDayOff(day, useTZ = true) {
		let isDayOff = false;
		let st = store.getState()
		let main_filter = []
        if (st.filter.employee && Object.keys(st.filter.employee).length) {
			main_filter = onlyUniq(st.filter.employee)
		  }
		let offs = st.employees.filter(emp => main_filter.indexOf(emp.id) > -1).map(em => em.daysOff)
		if (offs.length) {
			if (!this.u_tz() && useTZ) {
				let start = moment(day, 'YYYY-MM-DD').startOf('day')
				let end = moment(day, 'YYYY-MM-DD').endOf('day')
				let findDate = this.ctz() < this.tz() ? end.clone().utcOffset(this.ctz()) : start.clone().utcOffset(this.ctz());
				isDayOff = this.get('time_without_daysoff_timezone').filter(tim => tim.day.indexOf(findDate.format('YYYY-MM-DD')) > -1).length == 0
			}
			else isDayOff = offs[0].indexOf(moment(day, 'YYYY-MM-DD').format('DD.MM.YYYY')) > -1 
		}
		return isDayOff;
	}
	
	checkToday(addTime) {
		if (this.u_tz()) return addTime.isBefore(moment());
		let time = addTime.clone()
		if (this.ctz() < this.tz())
		return moment(this.get('dateText')+' '+time.format('HH:mm')+' '+this.ctzt(), 'DD.MM.YYYY HH:mm Z').isBefore(moment().utcOffset(this.ctz()))
		else
		return addTime.isBefore(moment());
	}
	
	isWorkNow(isWorkNow, day, pers) {
		if (this.u_tz()) return isWorkNow;
		if (moment(day,'YYYY-MM-DD').isSame(moment(), 'day')) {
			let per = this.get('time').filter(tim => tim.timezone.indexOf(day) > -1 && tim.pId == pers)
			if (per.length > 0) {
				let work = per.filter(tim => {
					return moment().isBetween(moment(tim.day+' '+tim.start+' '+this.ctzt(), 'YYYY-MM-DD HH:mm Z'), moment(tim.day+' '+tim.end+' '+this.ctzt(), 'YYYY-MM-DD HH:mm Z'))
				})
				
				if (work.length) {
					isWorkNow = false;
				}
				else isWorkNow = true;
			}
		}
		return isWorkNow;
		//moment(AllIndexes[key].end+' '+oz_app.ctzt(),'HH:mm Z').diff(moment().utcOffset(oz_app.ctz()), 'seconds') < 0
	}
	
	toTimeB(apps) {
		if (apps.length) {
			apps = apps.reduce((acc,el) => { 
					acc.push({
						start:el.timeStart, 
						w_time:el.w_time,
						pId:el.pers_id, 
						breaks: el.breaks, 
						day: el.dayStart					
					}); 
				return acc},[])
		}
		return apps;
	}
	
	ctz() {
		return typeof oz_vars.timezone != 'undefined' ? oz_vars.timezone*60 : 0
	}
	
	ctzt() {
		let min = this.ctz() < 0 ? '-' : '+'
		return min+moment().clone().startOf('day').add(Math.abs(this.ctz()), 'minutes').format('HH:mm')
	}
	
	tz() {
		return moment().clone().utcOffset()
	}
	
	toUserTimezone(th) {
		if (!this.u_tz()) {
			th = moment(th+' '+this.ctzt(), 'HH:mm Z').utcOffset(this.tz()).format('HH:mm')
		}
		return th;
	}
	
	removeDaysoffFromTime() {
		let daysoff = this.getDaysOff()
		let today = moment()	
			if (!this.u_tz()) {
				today = today.utcOffset(this.ctz()) 
			}
		let time_without_daysoff = this.get('time').filter(el => {
			let end = el.end == '00:00' ? '23:59' : el.end
			let isEnd = moment(el.day+' '+end, 'YYYY-MM-DD HH:mm')
			if (!this.u_tz()) {
				isEnd = moment(el.day+' '+end+' '+this.ctzt(), 'YYYY-MM-DD HH:mm Z')
			}
		return typeof daysoff[el.pId] == 'undefined' 
			   || (typeof daysoff[el.pId] != 'undefined' && daysoff[el.pId].indexOf(moment(el.day, 'YYYY-MM-DD').format('DD.MM.YYYY')) < 0)
			   && !(el.day == today.format('YYYY-MM-DD') && today.isAfter(isEnd))
		})
		this.add({time_without_daysoff})
		if (!this.u_tz()) {
			let time_without_daysoff_timezone = time_without_daysoff.reduce((cur, el) => {
				let day = []
				let end = el.end == '00:00' ? moment(el.day+' '+el.end+' '+this.ctzt(), 'YYYY-MM-DD HH:mm Z').endOf('day') : moment(el.day+' '+el.end+' '+this.ctzt(), 'YYYY-MM-DD HH:mm Z').subtract(1, 'minute') // удаляем одну минуту, чтобы не учитывать последний тайм слот
				day.push(moment(el.day+' '+el.start+' '+this.ctzt(), 'YYYY-MM-DD HH:mm Z').format('YYYY-MM-DD'))
				if (day.indexOf(end.format('YYYY-MM-DD')) < 0) {
					day.push(end.format('YYYY-MM-DD'))
				}
				cur.push({...el, day})
				return cur
			}, [])
		this.add({time_without_daysoff_timezone})
		}
	}
		
	plav_bus_days(time) {
		if (this.u_tz()) return time;
		time = time.map(tim => {
			let timeend = tim.end == '00:00' ? '23:59' : tim.end
			let start = moment(tim.day+' '+tim.start+' '+this.ctzt(), 'YYYY-MM-DD HH:mm Z')
			let end = moment(tim.day+' '+timeend+' '+this.ctzt(), 'YYYY-MM-DD HH:mm Z')
			tim.timezone = [
				start.clone().utcOffset(this.tz()).format('YYYY-MM-DD'),
				end.clone().utcOffset(this.tz()).format('YYYY-MM-DD') // удаляем одну минуту, чтобы не учитывать последний тайм слот
			]
		return tim
		})
		return time;
	}
	
	daysOff(fal_or_popup,date, daysoff, ktorabotaet, popup) {
		this.add({daysoff})
		if (this.u_tz()) return fal_or_popup;
		if (this.ctz() == this.tz() || this.buffer || fal_or_popup > 0 || (typeof fal_or_popup == 'string' && fal_or_popup && fal_or_popup.trim().split(' ').length == ktorabotaet.length )) return fal_or_popup;
		var skipPers = false;		
		if (daysoff.indexOf('{') > -1) {
		var daysoff = JSON.parse(daysoff);
		var skipPers = true;
		 }
		else if (typeof daysoff == 'object') {
		var skipPers = true;
		}		
		else {
		var daysoff = daysoff.split(',');
			if (this.get('pers')) {
				let days = {}
				days[this.get('pers')] = daysoff
				//this.add({'daysoff':days})
			}
		}
		if (skipPers) {
		let who = []
		let persWithDaysOff = []
		for (let key in daysoff) {
			persWithDaysOff.push(Object.keys(daysoff[key])[0])
		}

		let noDaysOff = ktorabotaet.filter(kto => persWithDaysOff.indexOf(kto.pId) < 0)
		if (noDaysOff.length) {
			noDaysOff.map( n => {
				who.push('time-'+n.start+'-'+n.end+'-'+n.pId)
				return n
			})
		}
		

			for (let key in daysoff) {
			let dayf = Object.values(daysoff[key])[0]
			let pers = Object.keys(daysoff[key])[0]
				if (this.check_daysOff(fal_or_popup, date, dayf.split(','), pers)) {
					let vib = ktorabotaet.filter(kto => kto.pId == pers)
					if (vib.length)
					who.push('time-'+vib[0].start+'-'+vib[0].end+'-'+vib[0].pId)
				}
			}
			if (who.length == 0) {
				fal_or_popup = 0
			}
			else {
				who = who.filter((v,i,s) => s.indexOf(v) === i)
				fal_or_popup = who.join(' ')
			}
		}
		else {
		fal_or_popup = this.check_daysOff(fal_or_popup, date, daysoff)
		}
		return fal_or_popup;
	}
	
	check_daysOff(on, date, daysoff, pers = 0) {
		let check = this.ctz() > this.tz() ? moment(date, 'DD.MM.YYYY').add(1,'day').format('DD.MM.YYYY') : moment(date, 'DD.MM.YYYY').subtract(1,'day').format('DD.MM.YYYY')
		if (daysoff.indexOf(check) > -1 ) return on;
		let t = daysoff.indexOf(date)
			if (t > -1) {
				let started = moment(date, 'DD.MM.YYYY').startOf('day').utcOffset(this.ctz())
				let ended = moment(date, 'DD.MM.YYYY').endOf('day').utcOffset(this.ctz())
				let ctzt = this.ctzt()
				let usl = this.get('time').filter(tim => {
					let start = moment(tim.day+' '+tim.start+' '+ctzt, 'YYYY-MM-DD HH:mm Z' )
					let end = tim.end == '00:00' ? moment(tim.day+' 23:59:59 '+ctzt, 'YYYY-MM-DD HH:mm:ss Z' ) : moment(tim.day+' '+tim.end+' '+ctzt, 'YYYY-MM-DD HH:mm Z' )
					let st = date != started.format('DD.MM.YYYY') && started.format('YYYY-MM-DD') == tim.day && started.isBetween(start,end)
					let nd = date != ended.format('DD.MM.YYYY') && ended.format('YYYY-MM-DD') == tim.day && ended.isBetween(start,end)
					return st || nd && ( pers && pers == tim.pId || !pers )
				})

				if (usl.length) {
					on = 1
				}
			}		
		return on;
	}

	
	resetBuffer() {
		this.buffer = false
		return this.buffer		
	}
	
	toggleBuffer() {
		this.buffer = !this.buffer
		return this.buffer
	}

	setUserTimezone(decline = false) {
		this.__u_tz_cached = undefined
		if (!decline) {
			let st = store.getState()
			let userTimezone = moment().utcOffset()
			this.add({userTimezone})
			document.cookie = "oz_timezone="+this.tz()+"; max-age="+(3600*24*90)+";path=/";			
			document.cookie = "oz_site_tz="+this.ctz()+"; max-age="+(3600*24*90)+";path=/";
			this.userAreaTime()
			if (st.steps.indexOf('date') == 0) {
				location.reload();
			}
		}
		else {
			document.cookie = "oz_timezone=no; max-age="+(3600*24*90)+";path=/";	
			this.use_tz = false
		}
		store.dispatch({type:'CLOSE_POPUP'})
	}
	
	userAreaTime() {
		if (!this.u_tz()) {
			document.querySelectorAll('.oz_book_cont_time').forEach(el => {
				if (el.dataset.date) {
					let date = el.dataset.date
					if (date) {
						let format = oz_vars.dateFormat
						let t_f = oz_vars.AMPM ? 'hh:mm A' : 'HH:mm'
						format += ' '+t_f
						el.innerText = moment(date).format(format)						
					}
				}
			})
		}
	}
	
	updateTimeList(busyslots) {
		jQuery('.timeRange .checkb').each(function() {
			var has = 0;
			var t = moment(jQuery(this).val(), 'HH:mm')
			var pId = jQuery(this).attr('data-pId')
			var li = jQuery(this).parent()
			var tb = busyslots.filter(function(elem) { 
				var apStart = moment(elem.timeStart, 'HH:mm')
				var apFinish = apStart.clone().add(elem.w_time,'minutes') 
				return t.isSameOrAfter(apStart) && t.isBefore(apFinish)
			}).length
			
			// update appointments
			if (busyslots.length && tb == busyslots.length) {
				li.addClass('oz_busy')
			}
			
		})
		if (typeof timeB != 'undefined') {
				busyslots.forEach(function(slot) {
					timeB.push({
						start:slot.timeStart,
						pId:slot.persId,
						w_time:slot.w_time,
						})
				})
		}
		if (jQuery('.personal.active').length) {
			var raspis = JSON.parse(jQuery('.personal.active .pname').attr('data-raspis'))
			busyslots.forEach(function(slot) {
				raspis.push(slot)
			})
			jQuery('.personal.active .pname').attr('data-raspis', JSON.stringify(raspis))
		}
		// надо рассчитать сколько будет minrange к этому времени
		//oz_app.add({minRange:30})
		return this.getPers()
		//generTimeList(this.app.min,this.app.max,this.app.minR,this.app.clientRas,this.app.dateText)
	}
	
	waitngInfo(text = '') {
		jQuery('<div class="oz_waiting_info"><div class="oz_flex oz_flex-center oz_wh-100"><span>'+text+'</span></div></div>').insertAfter('.oz_hid')
	}
	
	removeWaitng() {
		jQuery('.oz_waiting_info').remove()
	}
	
	DialogInfo(text = '', callback = false, showNo = false) {
		let no = showNo ? '<div style="margin-left:10px;" class="oz_btn oz_btn_no">'+oz_lang.no+'</div>' : '';
		jQuery('<div class="oz_dialog_info"><div class="oz_dialog_wrap oz_flex oz_flex-center oz_h-100"><div class="oz_dialog_info_win"><span>'+text+'</span><div class="oz_btn">'+oz_lang.yes+'</div>'+no+'</div></div></div>').insertAfter('.oz_hid')
		jQuery('body').on('click', '.oz_dialog_info .oz_btn', function() {
			let no = jQuery(this).hasClass('oz_btn_no')
			if (typeof callback === "function") {
			callback(no)
			callback = false
			}
			jQuery(this).parents('.oz_dialog_info').remove()
		})
    }
    
    oneDaySlots(slot) {
		let DebugStart = moment();
        let times = [];
        let otherzone = this.u_tz()
        let oneDay = moment.duration(1, 'day').as('minutes')
        let startFrom = 0
        let addTime = moment().startOf('hour')
        if (!otherzone) {
            addTime = addTime.utcOffset(this.ctz())
        }
        for (let i = startFrom; i <= oneDay; i += slot) {
                addTime.add(i === startFrom ? startFrom : slot, 'minutes');
                let classes = []
				// check today
				if (!moment().isSame(addTime, 'day')) {
					classes.push('oz_today_past')
				}
				
				//check buffer
				if (typeof oz_vars.minTime !== 'undefined' && oz_vars.minTime > 0) {
					var tnow = moment().add(oz_vars.minTime, 'hours')
					if (!otherzone) {
						tnow = tnow.utcOffset(this.ctz())
					}
					if (addTime.isBefore(tnow)) {
						classes.push('oz_buffer')
						classes.push('oz_not_allowed')
					}	
                }
            times.push({
                'time': addTime.format('HH:mm'),
                'day' : addTime.format('DD.MM.YYYY'),
                'class' : classes,
                'moment': addTime,
                'pId'   : 0
                })
        }
		console.log('Генерация времени: '+parseInt(moment() - DebugStart)+'мс');
        return times
    }
	
	forTime(dateText = 0, pId = 0, apps = []) {
			let DebugStart = moment();
			let times = []
			let store = this.store.getState()
			let b = (typeof oz_vars.timeslot !== 'undefined') ? parseInt(oz_vars.timeslot) : 15; // временной интервал
			let main_filter = []
			if (store.filter.employee && Object.keys(store.filter.employee).length) {
				main_filter = onlyUniq(store.filter.employee)
			  }			
			if (main_filter.length == 1) {
				let tslot = store.employees.filter(emp => main_filter.indexOf(emp.id) > -1)
				b = tslot[0].timeslot > 0 ? tslot[0].timeslot : b
			}
			this.add({b})
			
			let busy = false
			let busyBreak = false
			
			let otherzone = this.u_tz()
			let ctztext = this.ctzt()
						
			let oneDay = moment.duration(1, 'day').as('minutes')
			let start = moment(dateText, 'DD.MM.YYYY').startOf('day')
			let end = moment(dateText, 'DD.MM.YYYY').endOf('day')
			if (!otherzone) {
				start = start.utcOffset(this.ctz())
				end = end.utcOffset(this.ctz())
			}
			let daysoff = this.getDaysOff(pId)
			let rasp = this.get('time').filter(ev => (ev.day == start.format('YYYY-MM-DD') || ev.day == end.format('YYYY-MM-DD')) && ev.pId == pId && daysoff.indexOf(moment(ev.day,'YYYY-MM-DD').format('DD.MM.YYYY')) < 0 )
			if (!rasp.length) return this.oneDaySlots(b);
			let startFrom = 0
			let addTime = moment(dateText, 'DD.MM.YYYY HH:mm')
				if (!otherzone) {
					addTime = addTime.utcOffset(this.ctz())
				}
			let mtime = 0
			let buffer = 0
			let today_apps = [] 
			if (store.service.length) {
				mtime = store.services.reduce((cur,arr) => { 
					let sum = 0;
					if (store.service.indexOf(arr.id) > -1) {
						buffer = arr.buffer[1] > buffer ? arr.buffer[1] : buffer;
						sum = arr.w_time;
					} 
					return cur+sum;},0)
				if (mtime > 0) {
					mtime = mtime + buffer
				}
			}

			if (typeof oneUsl !== 'undefined' && typeof oneUsl.mtime !== 'undefined' && oneUsl.mtime) mtime = oneUsl.mtime

			// check appointments (+breaks sometimes)
			//apps = JSON.stringify(apps)
			let isToday = moment(dateText,'DD.MM.YYYY').isSame(moment(), 'day')
			apps = JSON.stringify(apps)
			apps = JSON.parse(apps).map(function (img, ind) {
				if (!otherzone) {
					img.moment = moment(img.start+' '+ctztext, 'DD.MM.YYYY HH:mm Z')
				}
				else {
					img.moment = moment(img.start, 'DD.MM.YYYY HH:mm')
				}
				if (typeof img.buffer != 'undefined') {
					if (img.buffer[0]) {
						img.moment.subtract(img.buffer[0], 'minutes')
						img.w_time = Number(img.w_time) + Number(img.buffer[0])
					}
					
					if (img.buffer[1]) {
						img.w_time = Number(img.w_time) + Number(img.buffer[1])
					}
					
				}
				if (img.moment.isSame(addTime, 'day')) {
					today_apps.push(img)
				}
				return img;
				})

			// пока закоментил, т.к. не протестировано
			// начинать рабочий день с первого свободного слота
			// если первичный слот был забронирован, предлагать ближайший следующий
			// в качестве старта дня
			// today_apps.map(el => {
			// 	let st = el.start.split(' ')
			// 	if (st[1] == rasp[0].start) {
			// 		let add = st[1].split(':') 
			// 		let t = moment().startOf('day')
			// 		.add({hours: add[0], minutes:add[1]})
			// 		.add(el.w_time, 'minutes')
			// 		.format('HH:mm')
			// 		rasp[0].start = t
			// 	}
			// })


			// пока что коммент, т.к. не помню можно ли начинать генерацию времени с момента начала работы сотрудника
			//rasp.forEach(t => { let m = moment(t.start, 'HH:mm'); startFrom = (m.hour()*60) + m.minute();})			
			try {
				rasp.sort((a,b) => Number(a.day.replaceAll('-', '')) - Number(b.day.replaceAll('-', '')) )
				if (!otherzone) {
					let start = moment(rasp[0].day+' '+rasp[0].start+' '+this.ctzt(), 'YYYY-MM-DD HH:mm Z')
					let s = 0
					let findStartTime = start.clone(); 
					while(!(findStartTime.isSameOrAfter(addTime)) && s < 1440) {
						findStartTime = findStartTime.clone().add(b, 'minutes') 
						s = s+b
					}
					let add = findStartTime.diff(addTime, 'minutes')
					addTime = addTime.clone().add(add, 'minutes')
				}
				else {
					let m = moment(rasp[0].start, 'HH:mm')
					startFrom = (m.hour()*60) + m.minute()
				}
			}
			catch(err) {
				console.log(err)
			}
			for (let i = startFrom; i <= oneDay; i += b) {
				addTime.add(i === startFrom ? startFrom : b, 'minutes');
				let classes = [];
				
				let working = rasp.filter(t => {
				
				let startOfWork, endofWork;
				

				if (!otherzone) {
					startOfWork = moment(t.day+' '+t.start+' '+ctztext, 'YYYY-MM-DD HH:mm Z')
					endofWork = t.end == '00:00' ? end = moment(t.day+' 23:59:59 '+ctztext, 'YYYY-MM-DD HH:mm:ss Z').utcOffset(this.ctz()) :  moment(t.day+' '+t.end+' '+ctztext, 'YYYY-MM-DD HH:mm Z')
				}
				else {
					startOfWork = moment(t.day+' '+t.start, 'YYYY-MM-DD HH:mm')
					endofWork = t.end == '00:00' ? moment(t.day+' '+t.end, 'YYYY-MM-DD HH:mm').endOf('day') : moment(t.day+' '+t.end, 'YYYY-MM-DD HH:mm')
					
					// если какая то услуга уже выбрана, не занимать последний слот (если слотов больше одного)
					//if (mtime && times.length && b < (mtime - buffer)) endofWork.subtract(mtime, 'minutes')
				}
				return addTime.isBefore(startOfWork) || addTime.isSameOrAfter(endofWork)
				}) 
				
				
				// check schedule
				if (working.length == rasp.length) {
					classes.push('oz_not_allowed')
				}
				
				// last time slot on this day
				if (oneDay == i) {
					//classes.push('oz_last_time')
				}
				
				// check today
				if (classes.length == 0 && isToday && addTime.isBefore(moment())) {
					classes.push('oz_today_past')
				}
				
				//check buffer
				if (typeof oz_vars.minTime !== 'undefined' && oz_vars.minTime > 0) {
					var tnow = moment().add(oz_vars.minTime, 'hours')
					if (!otherzone) {
						tnow = tnow.utcOffset(this.ctz())
					}
					if (addTime.isBefore(tnow)) {
						classes.push('oz_buffer')
						classes.push('oz_not_allowed')
					}	
				}


				// check appointments (+breaks sometimes)
				let max_w_time = 0; // если в одно и тоже время несколько записей, ищем самую длинную
				apps.forEach(function (img) {
					if ((typeof img.pId != 'undefined' && img.pId == pId) || typeof img.pId == 'undefined') {
						let app = img.moment;
						if (app.isSame(addTime, 'day') && (app.isSame(addTime) || addTime.isBetween(app, app.clone().add(img.w_time, 'minutes')) || (!times.length && app.isBefore(addTime)))) {
								if (img.w_time > max_w_time) {
								max_w_time = img.w_time;
								busy = app.clone().add(img.w_time, 'minutes')
								if (typeof img.breaks != 'undefined' && img.breaks) 
								busyBreak = true
								}
						}
					}
					})
					
				if (busy && addTime.isBefore(busy) ) {
					if (!busyBreak) classes.push('oz_busy')
					else {
						if (classes.indexOf('oz_breaks') < 0 && classes.indexOf('oz_busy') < 0)
						classes.push('oz_breaks');
					}
				}
				else {
					busy = false
					busyBreak = false
				}


			// check breaks	
			if (classes.indexOf('oz_breaks') < 0 &&			
				(typeof staffBreaks !== 'undefined' && typeof staffBreaks[pId] !== 'undefined') ||
				(typeof onePers !== 'undefined' && onePers.id == pId && onePers.breaks) ||
				(typeof staffBreaks == 'string' && typeof startFromeService != 'undefined') ||
				this.get('breaks')
				) {
				let breaks = []
				if (this.get('breaks')) {
					breaks = this.get('breaks');
				}
				else {
				if (typeof staffBreaks == 'string' && typeof startFromeService != 'undefined')
					breaks = JSON.parse(staffBreaks);
				else
					breaks = (typeof staffBreaks !== 'undefined') ? staffBreaks[pId] : JSON.parse(onePers.breaks);
				}
				//var mtime = (typeof onePers !== 'undefined') ? onePers.mtime : false; // по идее не нужна эта строчка
				//var mtime = (typeof oneUsl !== 'undefined' && typeof oneUsl.mtime !== 'undefined' && oneUsl.mtime) ? oneUsl.mtime : mtime;
				breaks.map(function(t,i) {
					let day = t.day.split('_')[1]
					if (day == addTime.locale('en').format('ddd').toLowerCase()) {
						let start = moment(dateText+' '+t.start, 'DD.MM.YYYY HH:mm')
						let end = moment(dateText+' '+t.end, 'DD.MM.YYYY HH:mm')
							if (!otherzone) {
									start = moment(addTime.format('DD.MM.YYYY')+' '+t.start+' '+ctztext, 'DD.MM.YYYY HH:mm Z')
									end = moment(addTime.format('DD.MM.YYYY')+' '+t.end+' '+ctztext, 'DD.MM.YYYY HH:mm Z')
							}
						if (addTime.isSame(start) || addTime.isBetween(start,end)) {
							classes.push('oz_breaks')
						}					
					}
					
				})	
			}
			
				times.push({
					'time': addTime.format('HH:mm'),
					'day' : addTime.format('DD.MM.YYYY'),
					'class' : classes,
					'moment': addTime,
					pId
					})
			}
			
			
			// убираем полночь след дня в зоне клиента
			//if (!otherzone) {
				if (times[times.length-1].moment.utcOffset(this.tz()).format('DD.MM.YYYY') != dateText ) {
					times.pop()
				}
			//}
			
			// todo если уже выбрана услуга с буфером перед, то нужно после oz_busy слотов добавить буфер buffer[0] выбранной услуги (наверное только для recurring потребуется)
			if (mtime || oz_app.get('w_time')) {
				mtime = mtime || oz_app.get('w_time')
			let how = Math.ceil(mtime/b)
			times = times.map((el, i) => {
				let endOfWorkDay = (el['class'].indexOf('oz_not_allowed') > -1 && typeof times[i-1] != 'undefined' && times[i-1]['class'].indexOf('oz_serv_dur') < 0 && times[i-1]['class'].indexOf('oz_not_allowed') < 0 )
				if ((el['class'].indexOf('oz_breaks') > -1 || el['class'].indexOf('oz_busy') > -1) || 
					endOfWorkDay // end of the day 
					|| i == times.length - 1 // конец дня?
					&& (how >= 1 || endOfWorkDay && how == 1 )) {
					for (let r = 1; (!endOfWorkDay ? r< how : r<= how); r++) {
						let index = i == times.length - 1 ? times.length-r : i-r
						if (typeof times[index] != 'undefined' && !times[index]['class'].length && times[index]['class'].indexOf('oz_serv_dur') < 0 && times[index].pId == el.pId) {
							if (endOfWorkDay || i == times.length - 1) {
								if (moment(rasp[0].end, 'HH:mm').diff(moment(times[index].time, 'HH:mm'), 'minutes') < mtime) {
									times[index]['class'].push('oz_serv_dur')
								}
							}
							else {
								times[index]['class'].push('oz_serv_dur')
							} 
						}
					}
				}
				return el})
			
			// проверяет, если есть брони которые могут быть между слотами (не кратные слотам)
			if (today_apps.length) {
				times = times.map(el => {
					if (el.class.length < 1) {
					let have_app = false
					let ifEnd = moment(el.day+' '+el.time, 'DD.MM.YYYY HH:mm').add(mtime, 'minutes')
						if (!otherzone) {
							ifEnd = moment(el.day+' '+el.time+' '+this.ctzt(), 'DD.MM.YYYY HH:mm Z').add(mtime, 'minutes')
						}
					today_apps.forEach(appointment => {
					let start = appointment.moment
					let dur = Number(appointment.w_time) + Number(appointment?.buffer ? appointment.buffer[1] : 0)
					let end = start.clone().add(dur, 'minutes')
					if (ifEnd.isBetween(start,end)) {
					have_app = true
					}
					})
					if (have_app) {
					el.class.push('oz_busy')
					}
					}
					return el
					})
			}
			}
			
			console.log('Генерация времени: '+parseInt(moment() - DebugStart)+'мс');
			return times;
	}
	
	isRecurring() {
		return this.get('recurring') && typeof this.get('recurring').generated != 'undefined' && this.get('recurring').generated.length
	}
	
	getRecurring() {
		return this.isRecurring() ? this.get('recurring').generated.reduce((acc, cur) => {
										acc.push({
										'day': moment(cur.day, 'YYYY-MM-DD').format('DD.MM.YYYY'),
										'time': cur.time
										}); return acc;
									}, []) : []
	}
}
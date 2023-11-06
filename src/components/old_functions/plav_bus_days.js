export default function plav_bus_days(rasp = []) {
	
    var start = moment();
    
   
       var postG = [];
       var postV = [];
       var postC = []; // custom graph
       var postG_plav_bus_days = [];
       var postV_bus_days = [];
       var plav_bus_days = [];
       var postC_custom_days = []; // custom graph
       var maxMonth = (typeof oz_vars.maxMonth !== 'undefined' && oz_vars.maxMonth ) ? oz_vars.maxMonth*30 : 60;
       //var postG = rasp.map(function (its) { return its.day; });
        jQuery.each(rasp, function(index) {
           if (typeof rasp[index].dayF != 'undefined') {
               postG.push(rasp[index]);
           }
           
           else if (typeof rasp[index].day != 'undefined') {
               postV.push(rasp[index]);
           }
           
           else if (typeof rasp[index].days != 'undefined') {
               postC.push(rasp[index]);
           }
       });
       
       if (postG.length) {
           jQuery.each(postG, function(i,v) {
            var now = moment(v.dayF,'DD.MM.YYYY');
            var rabd = v.graph.split('/')[0];
            var vihd = v.graph.split('/')[1];		
            var rab = 0;
            var pId = (v.pId) ? v.pId : '';
            for (let i=0; i < maxMonth; i++) {
                if (rab == rabd) {
               now.add(vihd, 'days');	
               rab = 0;
                }
                postG_plav_bus_days.push({
                    day: now.format('YYYY-MM-DD'),
                    start: v.start,
                    end: v.end,
                    pId
                }) 
                rab++;
                now.add(1, 'days');
            }			 
           });
       }
       
       if (postC.length) {
           var max = moment().add(maxMonth, 'days').format('DD.MM.YYYY')
           for (let k=0; k<postC.length; k++) {
               var dates = postC[k].days;
               
               for (let l=0; l<dates.length; l++) {
                   var date = dates[l];
                   postC_custom_days.push({
                    day: moment(date,'DD.MM.YYYY').format('YYYY-MM-DD'),
                    start: postC[k].time.start,
                    end: postC[k].time.end,
                    pId: postC[k].pId
                   })
               }
           }
       }
       
       if (postV.length) {
           jQuery.each(postV, function(i,v) {
           var now = moment();
        for (let i=0; i < maxMonth; i++) {
       var dayName = now.locale('en').format('ddd').toLowerCase();
            if ('oz_'+dayName == v.day) {
                now.format('YYYY-MM-DD');
                var pId = (v.pId) ? v.pId : '';
            postV_bus_days.push({
                day: now.format('YYYY-MM-DD'),
                start: v.start,
                end: v.end,
                pId
            }) 
            } 
            now.add(1, 'days');
        }
           })
       }
       plav_bus_days = postG_plav_bus_days.concat(postV_bus_days, postC_custom_days);

       var end = moment() - start;
       console.log('Время генерации рабочих дней: '+end+'мс');
    
    return plav_bus_days;
 }
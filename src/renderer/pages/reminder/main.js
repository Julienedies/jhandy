/**
 * Created by j on 18/6/3.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import Reader from '../../../libs/reader'

import '../../js/common.js'
import '../../js/common-stock.js'
import '../../js/utils.js'
import viewerMarkTagCtrl from '../viewer/markTag-ctrl'

brick.reg('reminderCtrl', function (scope) {

    let $memo = $('#memo');
    $.get('/stock/memo').done(function (o) {
        $memo.html(o.text);
        let reader = new Reader('#memo');
        reader.init();
        reader.autoSpeak();
    });

/*    $.get('/stock/tags/').done((data) => {
        console.log(data);
        scope.render('prepare', data);
        scope.render('mistake', data);
        //scope.render('logic', data);
        //scope.render('principle', data);
    });*/

    let timer = 320; // 10分钟，600秒
    let $timer = $('#timer');

    setInterval(() => {
        timer--;
        $timer.text(timer);
        if (timer <= 0) {
            window.close();
        }
    }, 1000);

});

brick.reg('mistakeCtrl', function (scope) {

});


brick.reg('viewerMarkTagCtrl', viewerMarkTagCtrl);



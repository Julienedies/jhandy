/*!
 * Created by j on 2019-02-25.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import electron from 'electron'
import $ from 'jquery'

import voice from '../../../libs/voice'

import setting from '../../../libs/setting'

//const voiceWarnText = setting.get('voiceWarnText') || {};
const voiceWarnText = {
    'daban': '无系统买入',
    'buy': '无系统买入',
    'sell': '卖飞',
}

const ipc = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;
let win;
let timer;

const socket = io();
let $news = $('#news');
let $warn = $('#warn');

let activeCla = 'active blink';

//////////////////////////////////////////////////////////////
// 隐藏窗口
function hideWin () {
    //win.hide();
    //win && win.minimize();
    $news.removeClass(activeCla);

}

//////////////////////////////////////////////////////////////
// 显示窗口
function showWin () {
    // win.showInactive();
    //win && win.restore();
    //$news.addClass(activeCla);
}

//////////////////////////////////////////////////////////////
// 获取窗口ID，只在窗口创建后触发一次
ipc.on('id', function (event, windowID) {
    win = BrowserWindow.fromId(windowID);
    setTimeout(() => {
        hideWin();
    }, 45 * 1000);
});


//////////////////////////////////////////////////////////////
// 有财经新消息显示窗口,  稍后隐藏窗口
socket.on('cls_news', (msg) => {
    clearTimeout(timer);
    $news.text(msg).addClass(activeCla);

    timer = setTimeout(() => {
        $news.removeClass(activeCla);
    }, 14 * 1000);

    /*    if (win) {
        showWin();
        timer = setTimeout(() => {
            hideWin();
        }, 14 * 1000);
    }*/
});


//////////////////////////////////////////////////////////////
// 交易警告文字版
socket.on('warn', (info) => {
    let text = voiceWarnText[info] || info;
    $warn.text(text).addClass(activeCla);

    setTimeout(function () {
        $warn.removeClass(activeCla);
    }, 1000 * 14);

    voice(text);

    if (info === 'daban') {
        //voice('控制本能！ 宁缺毋滥！只做风口龙头热门最强势! 绝不要做跟风杂毛趁势弱势!');
        //voice(voiceWarnText[info]);
    }
});



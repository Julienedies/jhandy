/*!
 * Created by j on 2019-02-25.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import '@julienedies/brick/dist/brick.transition.js'

import '@fortawesome/fontawesome-free/css/all.css'
import 'froala-editor/css/froala_editor.pkgd.css'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/js/froala_editor.pkgd.min.js'

import '../../js/utils.js'
import { FroalaEditorConfig } from '../../js/constants'

import electron from 'electron'
import moment from 'moment'
import utils from '../../../libs/utils'
//import userJodb from '../../../libs/jodb-user'
import jd from '../../../libs/jodb-data'

const ipc = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;

const todoJodb = jd('todo');

let currentWindow;
let mainWindow;
let $body = $('body');
let socket = io();

// 显示随机背景图片
function randomBgImg () {
    // $body.css('background-image', `url("/file/random/?time=${ +new Date }")`);
}

ipc.on('windowId', function (event, windowID) {
    currentWindow = BrowserWindow.fromId(windowID);
});
ipc.on('mainWindowId', function (event, windowID) {
    mainWindow = windowID && BrowserWindow.fromId(windowID);
});

ipc.on('view', (e, view) => {
    brick.view.to(view);
});


brick.reg('mainCtrl', function (scope) {

    let hideWindowTimer = null;

    let timerHandleArr = [];

    scope.currentTodoItem = null;

    scope.hideWindow = function (e) {
        currentWindow && currentWindow.hide();
    };

    scope.complete = function (e) {
        if (scope.currentTodoItem) {
            scope.currentTodoItem.complete = true;
            todoJodb.set(scope.currentTodoItem);
        }
        scope.hideWindow();
    };

    scope.stop = function (e) {
        $(this).hide().next().show();
        clearTimeout(hideWindowTimer);
        clearInterval(scope.todoTimer);
        let handle;
        while (handle = timerHandleArr.shift()) {
            handle.cancel();
        }
    };

    scope.start = function (e) {
        $(this).hide().prev().show();
        start();
        $.icMsg('已经开启ToDo提醒');
    };

    scope.restart = function () {
        scope.stop();
        scope.start();
    };

    scope.activePrompt = activePrompt;

    function activePrompt (todoItem) {
        currentWindow.showInactive();
        //currentWindow.setFullScreen(true);
        hideWindowTimer = setTimeout(() => {
            scope.hideWindow();
        }, 1000 * (todoItem.duration || 17));

        let type = todoItem.type;

        type = (type === 'prepare' || type === 'mistake') ? type : 'prompt';

        scope.emit(type, todoItem);

        // 打开相关的独立窗口
        if (todoItem.singleWindow) {
            console.log('singleWindow =>', todoItem.singleWindow);
            mainWindow.webContents.send('openWindow', todoItem.singleWindow);
        }
    }

    function start () {
        // 处理只执行一次的任务定时器
        todoJodb.each((todoItem) => {
            if (todoItem.disable) return;
            if (todoItem.repeat === 1 && todoItem.start) {
                let handle = utils.timer(todoItem.start, () => {
                    activePrompt(todoItem);
                });
                timerHandleArr.push(handle);
            }
        });

        let currentIndex = -1;
        // 每10分钟执行一次, 检查todo列表里是否有项需要提醒 win.showInactive()
        scope.todoTimer = setInterval(() => {
            let todoArr = todoJodb.get();
            let length = todoArr.length;
            let over = false;

            currentIndex += 1;
            if (currentIndex === length - 1) currentIndex = -1;

            todoArr.forEach((todoItem, index) => {
                if (index < currentIndex) return;
                console.log('todo =>', index, currentIndex);
                // 每轮只执行一个提醒
                if (over) return;
                if (todoItem.disable) return;
                // 先判断任务是否完成，未完成才提醒
                if (todoItem.complete || todoItem.repeat === 1) {
                    return;
                }
                // 计算当前时间和任务开始时间之差
                // moment().diff(moment('8:00', 'HH:mm'),'minutes');
                let diffM = moment().diff(moment(todoItem.start, 'HH:mm'), 'minutes');
                // 如果到达开始时间
                if (diffM > 0) {
                    let promptTimes = todoItem.promptTimes || 0; // 提醒次数
                    let prevPromptTime = todoItem.prevPromptTime; // 上次提醒时间
                    // 如果还没有达到提醒次数
                    if (promptTimes < todoItem.repeat) {
                        // 如果还没有提醒过; 或者
                        // 当前时间和上次提醒时间之差达到间隔时间
                        if (promptTimes === 0 || moment().diff(moment(prevPromptTime, 'x'), 'minutes') >= todoItem.interval) {
                            todoItem.promptTimes = promptTimes + 1;
                            todoItem.prevPromptTime = +new Date();
                            todoJodb.set(todoItem);
                            scope.currentTodoItem = todoItem;
                            activePrompt(todoItem);
                            over = true;  // 终止todo数组循环
                        }
                    }
                }

            });

        }, 1000 * 60 * 45);

    }

    // 当窗口激活，表明我在当前窗口进行操作，暂停执行todo提示
    $(window).on('focus', function (e) {
        clearTimeout(hideWindowTimer);
        //scope.stop();
    });

    // 当窗口失去焦点，恢复todo提示
    $(window).on('blue', function (e) {
        //scope.stop();
        //start();
    });

    // 获取视图内容并显示
    $.get('/stock/tags/').done((data) => {
        console.log(data);
        let model = data;
        scope.render('prepare', {model});
        scope.render('mistake', {model});
        //scope.render('principle', model);
    });

    // main --------------------------------------------------------
    if (!utils.isTradingDate()) {
        return;
    }

    // 每天早上开启时，清除昨天的提醒数据,重新开始
    (function () {
        let hour = moment().hour();
        if (hour < 10) {
            todoJodb.each((todoItem) => {
                delete todoItem.complete;
                delete todoItem.promptTimes;
                delete todoItem.prevPromptTime;
            }).save();
        }
    })();

    //start();

});


brick.reg('todoListCtrl', function (scope) {

    const dragOverCla = 'onDragOver';
    let filterByType = '错误';
    let $elm = scope.$elm;

    function getMapByType (arr) {
        let mapByType = {};
        arr.forEach((v, i) => {
            let arr2 = mapByType[v.type || '_null'] = mapByType[v.type || '_null'] || [];
            arr2.push(v);
        });

        console.log(mapByType);
        return mapByType;
    }

    function render () {
        let todoArr = todoJodb.get();
        let mapByType = getMapByType(todoArr);
        if (filterByType) {
            todoArr = mapByType[filterByType];
        }
        todoArr.sort((a, b) => {
            let al = a.level || 0;
            let bl = b.level || 0;
            return bl - al;
        });
        console.log(filterByType, todoArr);
        scope.render('types', {model: {mapByType:mapByType, filterByType:filterByType}});
        scope.render('todoList', {model: todoArr}, function () {
            /*$(this).find('tr').on('dragstart', scope.dragstart)
                .on('dragover', scope.dragover)
                .on('dragleave', scope.dragleave)
                .on('drop', scope.drop);*/
        });
    }

    scope.filter = function (e, type) {
        _onFilter(type);
    };

    scope.onFilterKeyChange = function(msg) {
        _onFilter(msg.value);
    };

    function _onFilter (type) {
        filterByType = type;
        render();
    }

    scope.toggle = function (e) {
        let cla = 'toggle';
        $(this).toggleClass(cla);
    };

    scope.allToggle = function (e) {
        $elm.toggleClass('shirk');
        //let cla = 'toggle';
        //$('.pre.text').toggleClass(cla);
    };

    scope.addTodo = function (e) {
        scope.emit('setTodo', {});
    };

    scope.edit = function (e, id) {
        scope.emit('setTodo', todoJodb.get2(id));
    };

    scope.rm = function (e, id) {
        if (confirm('确认删除？')) {
            todoJodb.remove(id);
        }
    };

    // 置顶
    scope.focus = function (e, id) {
        todoJodb.insert(id);
    };

    scope.plus = function (e, id) {
        let item = todoJodb.get2(id);
        let level = item.level || 1;
        item.level = level + 5;
        todoJodb.set(item);
    };

    scope.test = function (e, id) {
        let item = todoJodb.get2(id);
        scope.activePrompt(item);
    };

    scope.complete = function (e, id, isComplete) {
        let item = todoJodb.get2(id);
        item.complete = !item.complete;
        todoJodb.set(item);
    };

    scope.disable = function (e, id, isDisable) {
        let item = todoJodb.get2(id);
        item.disable = !item.disable;
        todoJodb.set(item);
    };

    todoJodb.on('change', function(msg) {
        console.log('todoJodb changed: ', +new Date);
        render();
        if(msg.type === 'add') {
            setTimeout(() => {
                let id = '#k' + msg.data.id;
                console.log(id);
                //document.querySelector(id).scrollIntoViewIfNeeded(false);
                document.querySelector(id).scrollIntoView(true);
            }, 300);

        }
    });

/*    scope.on('scrollToNewItem', function (e, id) {
        let $th = $elm.find(id);
        $elm.scrollTop($th.offset().top);
    });*/

    render();

    // ------------------------------------------------------------
    scope.dragstart = function (e) {
        let id = $(this).data('id');
        e.originalEvent.dataTransfer.setData("Text", id);
        console.log('dragstart', id);
    };

    scope.dragover = function (e) {
        e.preventDefault();
        //e.stopPropagation();
        e.originalEvent.dataTransfer.dropEffect = 'move';
        $(e.target).addClass(dragOverCla);
        return false;
    };

    scope.dragleave = function (e) {
        $(e.target).removeClass(dragOverCla);
    };

    scope.drop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        let $target = $(e.target);
        let id = e.originalEvent.dataTransfer.getData("Text");
        let distId = $target.data('id') || $target.closest('tr[data-id]').data('id');
        if (!distId || distId === id) {
            return console.log('not dist');
        }
        console.log('drop', id, distId + '', e.target);
        todoJodb.insert(id, distId + '');
        return false;
    };
});


brick.reg('setTodoCtrl', function (scope) {

    let $elm = scope.$elm;
    let $editor;

    this.save = function (fields) {
        //console.log(fields);
        fields.content = $editor.froalaEditor('html.get', true);
        let result = todoJodb.set(fields);
        brick.view.to('todoList');
        //$editor.froalaEditor('destroy');
       /* console.log(result);
        let item = result[0];
        let id = 'k'+item.id;
        scope.emit('scrollToNewItem', id);*/
    };

    this.reset = function () {
        scope.render('setTodo', {model: {}});
    };

    this.cancel = function (e) {
        brick.view.to('todoList');
    };

    scope.on('setTodo', function (e, msg) {
        brick.view.to('setTodo');
        let model = msg || {};
        scope.render('setTodo', {model}, function () {
            $editor = $elm.find('#editor').froalaEditor({
                ...FroalaEditorConfig,
                height: 440,
            });
            $editor.froalaEditor('html.set', model.content || '');
        });
    });

});


brick.reg('promptCtrl', function () {

    const scope = this;
    let _todoItem = null;
    let $todoContent = scope.$elm.find('#todoContent');
    let $todoTitle = scope.$elm.find('#todoTitle');

    scope.edit = function (e) {
        scope.emit('setTodo', _todoItem);
    };

    scope.on('prompt', function (e, todoItem) {
        brick.view.to('prompt');
        _todoItem = todoItem;
        $todoTitle.text(todoItem.title);
        $todoContent.html(todoItem.content);
        let str = $todoContent.text();
        console.log(str, str.substr(0, 240));
        //voice(str.substr(0, 240));
    });

});


brick.reg('prepareCtrl', function (scope) {
    scope.on('prepare', function (e, _todoItem) {
        brick.view.to('prepare');
    });
});


brick.reg('mistakeCtrl', function (scope) {
    scope.on('mistake', function (e, _todoItem) {
        brick.view.to('mistake');
    });
});


brick.reg('planCtrl', function (scope) {

    $.get({
        url: '/stock/replay'
    }).done((data) => {
        //console.info(data);
        scope.render('replay', {model: data.replay});
    });

    $.get({
        url: '/stock/plan'
    }).done((data) => {
        //console.info(data);
        data.plans && data.plans.length && scope.render('plans', {model: data.plans});
    });

    scope.on('plan', function (e, _todoItem) {
        brick.view.to('plan');
    });

});




/**
 *
 * Created by j on 2021/12/4.
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

import {
    GET_TAGS_DONE,
    ON_SET_TAG_DONE,
    ON_DEL_TAG_DONE,
    DEL_TAG,
    TAG_SELECT_CHANGE,
    READY_SELECT_TAGS,
    TAGS_CHANGE,
    FroalaEditorConfig
} from '../../js/constants'

import '../../js/utils.js'
import '../../js/common-stock.js'
import setTagCtrl from '../tags/set-tag-ctrl'
import selectTagsCtrl from '../tags/select-tags-ctrl'

import setRpCtrl from './setRp'

import replayCtrl from './replayCtrl'

//brick.set('ic-event.extend', 'click,change,dblclick,focus,hover');

brick.set('ic-select-cla', 'is-info');

brick.reg('setTagCtrl', setTagCtrl);
brick.reg('selectTagsCtrl', selectTagsCtrl);

brick.reg('setRpCtrl', setRpCtrl);

brick.reg('replayCtrl', replayCtrl);


brick.reg('rpListCtrl', function (scope) {

    let filterByType = 'rp';  // 默认要显示的类型
    let dragOverCla = 'onDragOver';
    let rpMap = window.RPMQS_MAP = {};

    let $elm = this.$elm;
    let $title = $('title');

    let rpForm = {};

    let listManager = brick.services.get('recordManager')();

    scope.listManager = listManager;

    // window.GET_TAGS_FOR_RP =
    function getTagsForRp (arr) {
        if (Array.isArray(arr)) {
            // 如果只有一个标签选项，并且这个选项是type类型的标签，则把这个标签替换成该类型的所有标签
            if (arr.length === 1) {
                let id = arr[0];
                let o = window.TAGS_MAP_BY_ID[id];
                let type = o.type;
                if (type === 'type') {
                    arr = window.TAGS_MAP[o.text] || [];
                    arr = arr.map((item) => {
                        return item.id;
                    });
                }
            }

            return arr;

        } else {
            return arr;
            /*return arr.map( (id) => {
                return window.TAGS_MAP_BY_ID[id];
            });*/
        }
    }

    // 把rp.json这个数组按type进行分组，生成一个map；
    function getMapByType (arr) {
        let mapByType = {};
        let rpmqs = TAGS_MAP['rpmqs'];
        for (let i in rpmqs) {
            let o = rpmqs[i];
            let key = o.key;
            mapByType[key] = [];
            rpMap[key] = o.text;
        }

        arr.forEach((v, i) => {
            let arr2 = mapByType[v.type || '_null'] = mapByType[v.type || '_null'] || [];
            arr2.push(v);
        });

        //console.log(mapByType);
        return mapByType;
    }

    // 渲染rpList
    function render () {
        let rpList = listManager.get();
        rpList.sort((a, b) => {
            let al = a.level || 0;
            let bl = b.level || 0;
            return bl - al;
        });
        let mapByType = getMapByType(rpList);

        // 根据类型过滤
        if (filterByType) {
            if (filterByType === 'Re') {
                rpList = rpList.filter((v, i) => {
                    return v.re === 'true';
                });
            } else {
                rpList = mapByType[filterByType];
            }
        }

        // 对rpList数据进行处理，以方便显示
        rpList = rpList.map((item) => {
            let options = item.options;
            item.options = getTagsForRp(options);
            return item;
        });
        //console.log(filterByType, todoArr);
        scope.render('types', {model: {mapByType: mapByType, filterByType: filterByType}});

        scope.render('rpList', {model: {rpList, rpForm, filterByType}}, function () {
            $(this).find('li').on('dragstart', scope.dragstart)
                .on('dragover', scope.dragover)
                .on('dragleave', scope.dragleave)
                .on('drop', scope.drop);
        });

        // 修改document.title, 主要用于save2Text chrome插件;
        $title.text(`rp_${ rpMap[filterByType] }_${ formatDate() }`);
    }

    //-----------------------------------------------------------
    let def2 = $.Deferred();
    let def3 = $.Deferred();

    function getRpData () {
        $.get('/stock/rp').done((data) => {
            def2.resolve(data);
        });
    }

    function getRpForm () {
        $.get(`/stock/replay?date=${ formatDate2() }`).done((data) => {
            def3.resolve(data);
        });
    }

    function setList (d2, d3) {
        listManager.init(d2);

        rpForm = d3 || rpForm;
        render();
        createRpMap(d2);
    }

    function createRpMap (rpArr) {
        window.RP_MAP = {};
        rpArr.forEach((v) => {
            RP_MAP[v.id + ''] = v;
        })
    }


    // 等待标签数据获取后，否则 TAGS_MAP_BY_ID 不存在
    scope.on(GET_TAGS_DONE, function (e, data) {
        $.when(window.GET_TAGS_DEF, def2, def3).done((d1, d2, d3) => {
            console.log('when', d2, d3);
            setList(d2, d3);
        });
    });

    getRpData();
    getRpForm();


    scope.reset = function () {
        $elm.find('#rpPlanItem').text('');
    };


    scope.filter = scope.onFilterKeyChange2 = function (e, type) {
        _onFilter(type);
    };

    scope.onFilterKeyChange = function (msg) {
        _onFilter(msg.value);
    };

    function _onFilter (type) {
        filterByType = type;
        render();
    }

    scope.toggleForm = function (e) {
        $elm.find('#mainFooter').toggle();
    };

    scope.toggleText = function (e) {
        let cla = 'shrink';
        $elm.toggleClass(cla);
        let $th = $(this).text($elm.hasClass(cla) ? '收缩模式' : '展开模式');
    };

    scope.toggle = function (e) {
        $(this).nextAll().find('.pre.text').toggle();
        return false;
    };

    scope.refreshTags = function (e) {
        scope.emit(TAGS_CHANGE);
    };

    scope.addTodo = function (e) {
        scope.emit('setRp', {type: filterByType});
    };

    scope.edit = function (e, id) {
        scope.emit('setRp', listManager.get(id));
    };

    scope.copy = function (e, id) {
        let item = listManager.get(id);
        delete item.id;
        scope.emit('setRp', item);
    };

    scope.delBeforeConfirm = function (e) {
        return confirm('确认删除？');
    };

    scope.onDelDone = function (data) {
        setList(data);
    };

    // re
    scope.re = function (e, id) {
        let item = listManager.get(id);
        item.re = item.re === 'true' ? 'false' : 'true';
        $.post('/stock/rp', item).done((data) => {
            $.icMsg(data && data.length);
            setList(data);
        });
    };

    // 置顶
    scope.focus = function (e, id) {
        // scope.emit('move', {id});
    };

    // 加权
    scope.plus = function (e, id) {
        let item = listManager.get(id);
        let level = (item.level || 1) * 1;
        item.level = level + 1;
        $.post('/stock/rp', item).done((data) => {
            setList(data);
        });
    };

    // ---------------------------------------------------------------------------------------

    scope.on('rp.change', function (e, data) {
        setList(data);
    });

    $(document.body).on('dblclick', () => {
        console.log('dblclick');
        scope.toggleForm();
    });

    scope.createReplay = function (e) {
        scope.emit('createReplay', rpForm);
    };


    // 获取复盘表单数据的ajax回调函数
    scope.replay = {
        before: function (fields) {
            console.info('复盘表单数据 =》', fields);
            return fields;
        },
        done: function (data) {
            rpForm = data || rpForm;
        }
    };

    // 提交复盘表单
    function submit () {
        $elm.find('#rpForm[ic-form="rp"]').icFormSubmit();
    }

    // 根据键盘输入，随时提交数据进行保存；
    $elm.on('keyup', 'textarea', _.throttle(submit, 2900));


    // 表单数据保存
    $elm.on('ic-select.change', '[ic-select][ic-form-field]', function (e, msg) {
        console.log('on ic-select.change', msg);
        submit();
        // let data = $elm.find('[ic-form="rp"]').icForm();
        // let $th = $(this);
        // let name = $th.attr('ic-form-field');
        // console.log('form => ',data);
        //model.replay[name] = $th.attr('ic-val');
    });


    scope.on('move', function (e, data) {
        console.log('move', data);
        let id = data.id;
        let dest = data.dest;
        let a = listManager.get(id);
        let b = listManager.get(dest);
        a.level = b.level * 1 + 1;
        $.post('/stock/rp', a).done((data) => {
            setList(data);
        });
        /*        $.post('/stock/rp/move', data).done((data) => {
                    setList(data);
                });*/
    });


    // ---------------------------------------------------------------------------------------
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
        let destId = $target.data('id') || $target.closest('li[data-id]').data('id');
        if (!destId || destId === id) {
            return console.log('not dist');
        }
        //console.log('drop', id, destId + '', e.target);
        scope.emit('move', {id, dest: destId + ''});
        return false;
    };
});


/*brick.reg('tagsCtrl', function (scope) {

    alert(1);
    console.log(222);

    let model = {tags: {}, rp: {}};

    // tags数据保存在setTagCtrl
    scope.on(GET_TAGS_DONE, function (e, data) {
        //console.log(data);
        model.options = data;
        render();
    });

    scope.on('setRp', function (e, data) {
        model.rp = data || {};
        render();
    });

    // tag select change
    scope.onChange = function (data) {
        model.rp.tags = data.value;
        scope.emit(TAG_SELECT_CHANGE, data);
    };

    function render () {
        scope.render('tags', {model});
    }

});*/


/*brick.reg('replayCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    let list = brick.services.get('recordManager')();
    let model;

    scope.onGetReplayDone = function (data) {
        console.info(data);
        list.init(scope.tags_convert(data.tags));
        model = data;
        scope.render('replay', data);
    };

    scope.replay = {
        before: function (fields) {
            console.info(fields);
            return fields;
        },
        done: function (data) {
            scope.onGetReplayDone(data);
            $.icMsg(JSON.stringify(data.replay));
        }
    };

    scope.tag_edit = function (e, id) {
        scope.emit('tag.edit', list.get(id));
    };

    scope.tag_remove_done = function (data) {
        model.replay = $elm.find('[ic-form="replay"]').icForm();
        model.tags = data;
        scope.onGetReplayDone(model);
    };


    scope.on('tag.edit.done', function (e, msg) {
        console.info(e, msg);
        scope.tag_remove_done(msg);
    });


    $elm.on('ic-select.change', '[ic-select][ic-form-field]', function (e) {
        let $th = $(this)
        let name = $th.attr('ic-form-field')
        model.replay[name] = $th.attr('ic-val')
    });

    $.get(`/stock/replay?date=${ formatDate() }`).done(scope.onGetReplayDone);

});*/


/*brick.reg('prepareCtrl', function (scope) {
    scope.on('prepare', function (e, _todoItem) {
        brick.view.to('prepare');
    });
});*/


/*brick.reg('mistakeCtrl', function (scope) {
    scope.on('mistake', function (e, _todoItem) {
        brick.view.to('mistake');
    });
});*/


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




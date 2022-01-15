/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/utils'
import '../../../js/common-stock.js'

import setTagCtrl from '../../tags/set-tag-ctrl'
import tagsCtrl from '../../tags/tags-ctrl'

brick.reg('tags_ctrl', tagsCtrl);

brick.reg('setTagCtrl', setTagCtrl);

brick.reg('replayCtrl', function () {

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

});

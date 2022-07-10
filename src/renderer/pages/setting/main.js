/*!
 * Created by j on 2019-02-09.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'

import userJodb from '../../../libs/jodb-user'

import bridge from '../../../libs/utils'

const setting = bridge.setting();

brick.reg('mainCtrl', function (scope) {

    if (!setting.json.warn) {
        setting.json.warn = {};
    }

    let model = setting.json

    this.render('setting', {model})

    this.onSelectRandomBgImgDirDone = (paths) => {
        let randomBgImgDir = paths[0]
        randomBgImgDir && setting.refresh().merge('warn', {randomBgImgDir}).save();
    };

    this.setIcViewerInterval = function (e) {
        let v = $('#icViewerInterval').val();
        v && setting.refresh().set('icViewerInterval', v).save();
    };

});

// 语音警告系统
brick.reg('setWarnSystemCtrl', function (scope) {

    const warnJodb = userJodb('warn', [], {joinType:'push'});

    let $input = scope.$elm.find('[ic-form] input');

    let render = () => {
        let model = warnJodb.get();
        scope.render('warnList', {model});
    };

    warnJodb.on('change', render);

    scope.save = function (fields) {
        warnJodb.set(fields);
        scope.reset();
    };

    scope.reset = (model = {}) => {
        scope.render('setWarnItem', {model});
    };

    scope.edit = function (e, id) {
        //$input.filter('[ic-form-field="name"]').val(name);
        //$input.filter('[ic-form-field="text"]').val(setting.json.voiceWarnText[name]);
        let model = warnJodb.get(id)[0];
        scope.render('setWarnItem', {model});
    };

    scope.rm = function (e, id) {
        warnJodb.remove(id);
    };

    scope.up = function(e, id){
        warnJodb.insert(id);
    };


    render();

});


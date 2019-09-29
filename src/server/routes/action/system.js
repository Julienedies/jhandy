/**
 *
 * Created by j on 2019-08-18.
 */

import dob from '../../../libs/dob.js'
import viewerMap, { beforeGet } from '../../helper/viewerMap'
import _tags from './tags'
import _ from 'lodash'

const tags = _tags.tags;

let systemJodb = dob('system', {
    beforeGet
});


function getData () {
    viewerMap.get();
    return {system: systemJodb.get2(), tags: tags.convert()};
}

export default {

    get (req, res) {
        res.json(getData());
    },

    post (req, res) {
        let obj = req.body;
        obj['示例图片'] = obj['示例图片'] || '';
        systemJodb.set(obj);
        res.json(getData());
    },

    del (req, res) {
        let id = req.params.id;
        systemJodb.remove(id);
        res.json(getData());
    },

    move (req, res) {
        let id = req.params.id;
        let dest = req.params.dest;
        systemJodb.move(id, dest);
        res.json(getData());
    }
}

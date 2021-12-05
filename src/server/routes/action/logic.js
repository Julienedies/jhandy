/**
 * Created by j on 18/7/28.
 */

import dobFactory from '../../../libs/dob.js'

function getDb () {
    getDb.dob = getDb.dob || dobFactory('logic');
    return getDb.dob;
}

function getData () {
    let dob = getDb();
    return dob.get();
}


export default {

    get (req, res) {
        res.json(getData());
    },

    post (req, res) {
        let dob = getDb();
        let data = req.body;
        if(data.tag === undefined) {
            data.tag = [];
        }
        if(data.type === undefined) {
            data.type = [];
        }
        dob.set(data);
        res.json(getData());
    },

    del (req, res) {
        let dob = getDb();
        let id = req.params.id;
        dob.remove(id);
        res.json(getData());
    },

    // 提高level级别;
    focus (req, res) {
        let dob = getDb();
        let id = req.params.id;
        let record = dob.get2(id);
        record.level = (record.level || 1) * 1 + 100;
        dob.set(record);
        res.json(getData());
    }
}

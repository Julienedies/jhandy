/*!
 * 把json文件包装成对象进行增删改查及序列化 json object
 * Created by j on 18/11/9.
 */

import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'

class Jo {

    /**
     *
     * @param jsonPath {String} json file path
     * @param initData {*} 初始数据
     */
    constructor (jsonPath, initData = {}) {

        jsonPath = path.resolve(__dirname, `${ jsonPath }`)
        initData = initData || {}
        this.jsonPath = jsonPath

        if (!fs.existsSync(jsonPath)) {
            // fs.createWriteStream(jsonPath)
            // fs.writeFileSync(jsonPath, '{}')
            fse.outputFileSync(jsonPath, JSON.stringify(initData))
            this.json = initData
        } else {
            try {
                let str = fs.readFileSync(this.jsonPath, 'utf8')
                this.json = JSON.parse(str)
            } catch (e) {
                throw new Error(e)
            }
        }
    }

    // 获取文件最新内容，避免多个对象实例写入操作被覆盖
    refresh () {
        let str = fs.readFileSync(this.jsonPath, 'utf8');
        let nowJson = JSON.parse(str);
        //this.json = _.merge(nowJson, this.json);
        this.json = nowJson;
        return this;
    }

    save () {
        //this.refresh();
        return this._save();
    }

    _save () {
        fs.writeFileSync(this.jsonPath, JSON.stringify(this.json, null, '\t'));
        return this;
    }

    merge (key, obj) {
        let args = [].slice.call(arguments);
        obj = args[1] || args[0];
        key = args[1] && args[0];
        let oldVal = this.get(key);

        if (!oldVal) {
            oldVal = _.isArray(obj) ? [] : {};
            this.set(key, oldVal);
        }

        // 数组合并或对象合并
        if (_.isArray(oldVal) && _.isArray(obj)) {
            obj.forEach((v, i) => {
                oldVal.push(v);
            });
        } else {
            Object.assign(oldVal, obj);
        }

        return this.save();
    }

    set (key, val = {}) {
        if (!key) return this;

        if (typeof key === 'object') {
            this.json = key
            return this;
        }

        let keys = key.split('.');

        (function fx (namespace, keys) {
            let k = keys.shift()
            let o = namespace[k]

            if (keys.length) {

                o = namespace[k] = o || {}
                fx(o, keys)

            } else {
                namespace[k] = val
            }

        })(this.json, keys);

        return this.save();
    }

    get (key) {
        if (!key) return this.json

        let keys = key.split('.')

        return (function fx (namespace, keys) {
            let k = keys.shift()
            let o = namespace[k]
            if (o && keys.length) return fx(namespace[k], keys)
            return o
        })(this.json, keys);
    }

    match (key) {
        return this.get(key)
    }

}


export { Jo }


export default function (jsonFile, initData) {

    return new Jo(jsonFile, initData)

}

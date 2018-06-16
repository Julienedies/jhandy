/**
 * Created by j on 18/6/16.
 * 管理状态数据,单例对象
 */

const _ = require('underscore');

module.exports = function(namespace){
    return new F(namespace);
};

function F(namespace){
    this.namespace = namespace;
    this._pool = {};
}

F.prototype = {
    get: function (key) {
        if (!key) return this._pool;

        var keys = key.split('.');

        return (function x(namespace, keys) {
            var k = keys.shift();
            var o = namespace[k];
            if (o && keys.length) return x(namespace[k], keys);
            return o;
        })(this._pool, keys);

    },

    set: function (key, val) {

        var old = this.get(key);

        if (old && _.isObject(old) && _.isObject(val)) return _.extend(old, val);

        this._set(key, val);
    },

    _set: function (key, val) {

        var keys = key.split('.');

        (function x(namespace, keys) {
            var k = keys.shift();
            var o = namespace[k];
            if (keys.length) {
                if (!o) o = namespace[k] = {};
                x(o, keys);
            } else {
                if (val === undefined) return delete namespace[k];
                namespace[k] = val;
            }
        })(this._pool, keys);

    },

    clear: function () {
        this._pool = {};
    },

    remove: function (key) {
        this.set(key);
    }

};
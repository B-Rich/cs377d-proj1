/*
 http://keithamus.mit-license.org/
 @copyright Copyright ?? 2011, Keith Cirkel

*/
if (top.document == document) {
    function initMessenger(window) {
        Array.prototype.remove = function (from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest)
        };
        var Messenger;
        Messenger = {
            el: null,
            ob_els: {},
            ob_callbacks: {},
            init: function (cb) {
                this.el = document.getElementById("messengerEventPasser");
                if (!this.el) {
                    this.el = document.createElement("div");
                    this.el.setAttribute("id", "messengerEventPasser");
                    this.el.setAttribute("style", "display:none;");
                    document.body.appendChild(this.el)
                }
                if (cb) cb(this)
            },
            observe: function (msgName, cb, id) {
                var self = this;
                if (!id) id = "noid";
                if (!this.ob_els[msgName]) {
                    var e = document.getElementById(msgName + "_eventPasser");
                    if (!e) {
                        var e = document.createElement("div");
                        e.setAttribute("id", msgName + "_eventPasser");
                        this.el.appendChild(e)
                    }
                    this.ob_els[msgName] = e
                }
                this.ob_els[msgName].addEventListener(msgName, function (e) {
                    var data = null;
                    var kids = self.listToArray(this.childNodes);
                    for (var i = 0; el = kids[i]; i++) {
                        var eid = el.getAttribute("id").split("_")[1];
                        if (id == "all" || eid == id) {
                            var subkids = self.listToArray(el.childNodes);
                            var mpEl = subkids[subkids.length - 1];
                            try {
                                data = JSON.parse(mpEl.innerText)
                            } catch (err) {}
                            el.parentNode.removeChild(el);
                            var tCBs = [];
                            var len = len = self.ob_callbacks[msgName][id].length;
                            for (var j = 0; j < len; j++) {
                                var cb = self.ob_callbacks[msgName][id][j];
                                if (!cb.runOnce) tCBs.push(cb);
                                cb(data, eid)
                            }
                            if (el) el.innerText = "";
                            if (self.ob_callbacks[msgName][id]) for (var k = len; k < self.ob_callbacks[msgName][id].length; k++) tCBs.push(self.ob_callbacks[msgName][id][k]);
                            self.ob_callbacks[msgName][id] = tCBs
                        }
                    }
                });
                if (!this.ob_callbacks[msgName]) this.ob_callbacks[msgName] = {};
                if (!this.ob_callbacks[msgName][id]) this.ob_callbacks[msgName][id] = [];
                this.ob_callbacks[msgName][id].push(cb)
            },
            unobserve: function (msgName, id) {
                delete this.ob_callbacks[msgName][id]
            },
            sendMessage: function (msgName, data, retMsgName, cb, id) {
                var cEl = document.getElementById(msgName + "_eventPasser");
                if (cEl) {
                    if (!id) id = "noid";
                    if (retMsgName) if (cb) {
                        cb.runOnce = true;
                        this.observe(retMsgName, cb, id)
                    }
                    var cEvent = document.createEvent("Event");
                    cEvent.initEvent(msgName, true, true);
                    cEvent.callId = id;
                    var mEl = document.getElementById(msgName + "_" + id + "_eventPasser");
                    if (!mEl) {
                        mEl = this.createElement(msgName + "_" + id + "_eventPasser");
                        cEl.appendChild(mEl)
                    }
                    var mpEl = document.createElement("div");
                    mEl.appendChild(mpEl);
                    var copy = {};
                    try {
                        var fields = Object.getOwnPropertyNames(data);
                        for (var i = 0; i < fields.length; i++) {
                            var field = fields[i];
                            try {
                                copy[field] = data[field]
                            } catch (err) {
                                copy[field] = null
                            }
                        }
                    } catch (outerErr) {}
                    try {
                        mpEl.innerText = JSON.stringify(copy)
                    } catch (err) {}
                    cEl.dispatchEvent(cEvent)
                }
            },
            storeData: function (id, data) {
                var theId = "messenger_" + id + "_dataStore";
                var d = document.getElementById(theId);
                if (!d) {
                    d = document.createElement("div");
                    d.setAttribute("style", "display:none;");
                    d.setAttribute("id", theId);
                    this.el.appendChild(d)
                }
                d.innerText = JSON.stringify(data)
            },
            getData: function (id) {
                var theId = "messenger_" + id + "_dataStore";
                var d = document.getElementById(theId);
                if (d) try {
                    return JSON.parse(d.innerText)
                } catch (err) {}
            },
            createElement: function (id) {
                var e = document.createElement("div");
                e.setAttribute("id", id);
                return e
            },
            listToArray: function (nodeList) {
                var arr = [];
                for (var i = 0; node = nodeList[i]; i++) arr.push(node);
                return arr
            }
        };
        window.Messenger = Messenger;
        Messenger.init()
    }
    initMessenger(window)
}
var Streak = {};
Streak.clientVersion = "5.10";
Streak.mixpanelToken = "2571495d12e0773c350cab1c2446b8fb";
Streak.analyticsToken = "UA-25304962-1";
Streak.extVersion = Messenger.getData("extVersion");
Streak.server = Messenger.getData("server");
Streak.combinedPath = Messenger.getData("combinedPath");
Streak.devRealtimeServer = Messenger.getData("devRealtimeServer");
Streak.getCombined = function (type, includeServer) {
    return (includeServer ? Streak.server : "") + Streak.combinedPath + "combined-" + Streak.extVersion + "." + type
};
if (!top.document.getElementById("js_frame")) throw new Error("not in gmail");
Streak.iframe = document.createElement("iframe");
Streak.iframe.style.display = "none";
document.body.appendChild(Streak.iframe);
Streak.Date = window.Date; //Streak.iframe.contentWindow.Date;
(function (Streak) {
    var Date = Streak.Date;
    var object = Object,
        array = Array,
        regexp = RegExp,
        date = Date,
        string = String,
        number = Number,
        Undefined;
    var definePropertySupport = object.defineProperty && object.defineProperties;

    function extend(klass, instance, override, methods) {
        var extendee = instance ? klass.prototype : klass;
        initializeClass(klass, instance, methods);
        iterateOverObject(methods, function (name, method) {
            if (typeof override === "function") defineProperty(extendee, name, wrapNative(extendee[name], method, override));
            else if (override === true || !extendee[name]) defineProperty(extendee, name, method);
            klass["SugarMethods"][name] = {
                instance: instance,
                method: method
            }
        })
    }
    function initializeClass(klass) {
        if (klass.SugarMethods) return;
        defineProperty(klass, "SugarMethods", {});
        extend(klass, false, false, {
            "restore": function () {
                var all = arguments.length === 0,
                    methods = multiArgs(arguments);
                iterateOverObject(klass["SugarMethods"], function (name, m) {
                    if (all || methods.has(name)) defineProperty(m.instance ? klass.prototype : klass, name, m.method)
                })
            },
            "extend": function (methods, override, instance) {
                if (klass === object && arguments.length === 0) mapObjectPrototypeMethods();
                else extend(klass, instance !== false, override, methods)
            }
        })
    }
    function wrapNative(nativeFn, extendedFn, condition) {
        return function () {
            if (nativeFn && (condition === true || !condition.apply(this, arguments))) return nativeFn.apply(this, arguments);
            else return extendedFn.apply(this, arguments)
        }
    }
    function defineProperty(target, name, method) {
        if (definePropertySupport) object.defineProperty(target, name, {
            "value": method,
            "configurable": true,
            "enumerable": false,
            "writable": true
        });
        else target[name] = method
    }
    function hasOwnProperty(obj, key) {
        return object.prototype.hasOwnProperty.call(obj, key)
    }
    function iterateOverObject(obj, fn) {
        var key;
        for (key in obj) {
            if (!hasOwnProperty(obj, key)) continue;
            fn.call(obj, key, obj[key])
        }
    }
    function multiMatch(el, match, scope, params) {
        var result = true;
        if (el === match) return true;
        else if (object.isRegExp(match)) return regexp(match).test(el);
        else if (object.isFunction(match)) return match.apply(scope, [el].concat(params));
        else if (object.isObject(match) && object.isObject(el)) {
            iterateOverObject(match, function (key, value) {
                if (!multiMatch(el[key], match[key], scope, params)) result = false
            });
            return !object.isEmpty(match) && result
        } else return object.equal(el, match)
    }
    function stringify(thing, stack) {
        var value, klass, isObject, isArray, arr, i, key, type = typeof thing;
        if (type === "string") return thing;
        klass = object.prototype.toString.call(thing);
        isObject = klass === "[object Object]";
        isArray = klass === "[object Array]";
        if (thing != null && isObject || isArray) {
            if (!stack) stack = [];
            if (stack.length > 1) {
                i = stack.length;
                while (i--) if (stack[i] === thing) return "CYC"
            }
            stack.push(thing);
            value = string(thing.constructor);
            arr = isArray ? thing : object.keys(thing).sort();
            for (i = 0; i < arr.length; i++) {
                key = isArray ? i : arr[i];
                value += key + stringify(thing[key], stack)
            }
            stack.pop()
        } else if (1 / thing === -Infinity) value = "-0";
        else value = string(thing);
        return type + klass + value
    }
    function transformArgument(el, map, context, mapArgs) {
        if (isUndefined(map)) return el;
        else if (object.isFunction(map)) return map.apply(context, mapArgs || []);
        else if (object.isFunction(el[map])) return el[map].call(el);
        else return el[map]
    }
    function getArgs(args, index) {
        return Array.prototype.slice.call(args, index)
    }
    function multiArgs(args, fn, flatten, index) {
        args = getArgs(args);
        if (flatten === true) args = arrayFlatten(args, 1);
        arrayEach(args, fn ||
        function () {}, index);
        return args
    }
    function entryAtIndex(arr, args, str) {
        var result = [],
            length = arr.length,
            loop = args[args.length - 1] !== false,
            r;
        multiArgs(args, function (index) {
            if (object.isBoolean(index)) return false;
            if (loop) {
                index = index % length;
                if (index < 0) index = length + index
            }
            r = str ? arr.charAt(index) || "" : arr[index];
            result.push(r)
        });
        return result.length < 2 ? result[0] : result
    }
    function isClass(obj, str) {
        return object.prototype.toString.call(obj) === "[object " + str + "]"
    }
    function isUndefined(o) {
        return o === Undefined
    }
    function setParamsObject(obj, param, value, deep) {
        var reg = /^(.+?)(\[.*\])$/,
            isArray, match, allKeys, key;
        if (deep !== false && (match = param.match(reg))) {
            key = match[1];
            allKeys = match[2].replace(/^\[|\]$/g, "").split("][");
            arrayEach(allKeys, function (k) {
                isArray = !k || k.match(/^\d+$/);
                if (!key && object.isArray(obj)) key = obj.length;
                if (!obj[key]) obj[key] = isArray ? [] : {};
                obj = obj[key];
                key = k
            });
            if (!key && isArray) key = obj.length.toString();
            setParamsObject(obj, key, value)
        } else if (value.match(/^[\d.]+$/)) obj[param] = parseFloat(value);
        else if (value === "true") obj[param] = true;
        else if (value === "false") obj[param] = false;
        else obj[param] = value
    }
    function Hash(obj) {
        var self = this;
        iterateOverObject(obj, function (key, value) {
            self[key] = value
        })
    }
    var ObjectTypeMethods = ["isObject", "isNaN"];
    var ObjectHashMethods = ["keys", "values", "each", "merge", "isEmpty", "clone", "equal", "watch", "tap", "has"];

    function buildTypeMethods() {
        var methods = {},
            name;
        arrayEach(["Array", "Boolean", "Date", "Function", "Number", "String", "RegExp"], function (type) {
            name = "is" + type;
            ObjectTypeMethods.push(name);
            methods[name] = function (obj) {
                return isClass(obj, type)
            }
        });
        extend(Object, false, false, methods)
    }
    function buildInstanceMethods(set, target) {
        var methods = {};
        arrayEach(set, function (name) {
            methods[name + (name === "equal" ? "s" : "")] = function () {
                return Object[name].apply(null, [this].concat(getArgs(arguments)))
            }
        });
        extend(target, true, false, methods)
    }
    function buildObject() {
        buildTypeMethods();
        buildInstanceMethods(ObjectHashMethods, Hash)
    }
    function mapObjectPrototypeMethods() {
        buildInstanceMethods(ObjectTypeMethods.concat(ObjectHashMethods), Object)
    }
    extend(object, false, true, {
        "watch": function (obj, prop, fn) {
            if (!definePropertySupport) return;
            var value = obj[prop];
            object.defineProperty(obj, prop, {
                "get": function () {
                    return value
                },
                "set": function (to) {
                    value = fn.call(obj, prop, value, to)
                },
                "enumerable": true,
                "configurable": true
            })
        }
    });
    extend(object, false, false, {
        "extended": function (obj) {
            return new Hash(obj)
        },
        "isObject": function (obj) {
            if (obj == null) return false;
            else return isClass(obj, "Object") && string(obj.constructor) === string(object)
        },
        "isNaN": function (obj) {
            return object.isNumber(obj) && obj.valueOf() !== obj.valueOf()
        },
        "each": function (obj, fn) {
            if (fn) iterateOverObject(obj, function (k, v) {
                fn.call(obj, k, v, obj)
            });
            return obj
        },
        "merge": function (target, source, deep, resolve) {
            var key, val;
            if (target && typeof source != "string") for (key in source) {
                if (!hasOwnProperty(source, key) || !target) continue;
                val = source[key];
                if (target[key] !== Undefined) {
                    if (resolve === false) continue;
                    if (object.isFunction(resolve)) val = resolve.call(source, key, target[key], source[key])
                }
                if (deep === true && val && typeof val === "object") if (object.isDate(val)) val = new Date(val.getTime());
                else if (object.isRegExp(val)) val = new RegExp(val.source, val.getFlags());
                else {
                    if (!target[key]) target[key] = array.isArray(val) ? [] : {};
                    Object.merge(target[key], source[key], deep, resolve);
                    continue
                }
                target[key] = val
            }
            return target
        },
        "isEmpty": function (obj) {
            if (obj == null || typeof obj != "object") return !(obj && obj.length > 0);
            return object.keys(obj).length == 0
        },
        "equal": function (a, b) {
            return stringify(a) === stringify(b)
        },
        "values": function (obj, fn) {
            var values = [];
            iterateOverObject(obj, function (k, v) {
                values.push(v);
                if (fn) fn.call(obj, v)
            });
            return values
        },
        "clone": function (obj, deep) {
            if (obj == null || typeof obj !== "object") return obj;
            if (array.isArray(obj)) return obj.clone();
            var target = obj.constructor === Hash ? new Hash : {};
            return object.merge(target, obj, deep)
        },
        "fromQueryString": function (str, deep) {
            var result = object.extended(),
                split;
            str = str && str.toString ? str.toString() : "";
            str.replace(/^.*?\?/, "").unescapeURL().split("&").each(function (p) {
                var split = p.split("=");
                if (split.length !== 2) return;
                setParamsObject(result, split[0], split[1], deep)
            });
            return result
        },
        "tap": function (obj, fn) {
            transformArgument(obj, fn, obj, [obj]);
            return obj
        },
        "has": function (obj, key) {
            return hasOwnProperty(obj, key)
        }
    });
    extend(object, false, function () {
        return arguments.length > 1
    }, {
        "keys": function (obj, fn) {
            if (obj == null || typeof obj != "object" && !object.isRegExp(obj) && !object.isFunction(obj)) throw new TypeError("Object required");
            var keys = [];
            iterateOverObject(obj, function (key, value) {
                keys.push(key);
                if (fn) fn.call(obj, key, value)
            });
            return keys
        }
    });

    function arrayEach(arr, fn, startIndex, loop, sparse) {
        var length, index, i;
        checkCallback(fn);
        if (startIndex < 0) startIndex = arr.length + startIndex;
        i = toIntegerWithDefault(startIndex, 0);
        length = loop === true ? arr.length + i : arr.length;
        while (i < length) {
            index = i % arr.length;
            if (!(index in arr) && sparse === true) return iterateOverSparseArray(arr, fn, i, loop);
            else if (fn.call(arr, arr[index], index, arr) === false) break;
            i++
        }
    }
    function arrayFind(arr, f, startIndex, loop, returnIndex) {
        var result, index;
        arrayEach(arr, function (el, i, arr) {
            if (multiMatch(el, f, arr, [i, arr])) {
                result = el;
                index = i;
                return false
            }
        }, startIndex, loop);
        return returnIndex ? index : result
    }
    function arrayUnique(arr, map) {
        var result = [],
            o = {},
            stringified, transformed;
        arrayEach(arr, function (el, i) {
            transformed = map ? transformArgument(el, map, arr, [el, i, arr]) : el;
            stringified = stringify(transformed);
            if (!arrayObjectExists(o, stringified, el)) {
                o[stringified] = transformed;
                result.push(el)
            }
        });
        return result
    }
    function arrayFlatten(arr, level, current) {
        level = level || Infinity;
        current = current || 0;
        var result = [];
        arrayEach(arr, function (el) {
            if (object.isArray(el) && current < level) result = result.concat(arrayFlatten(el, level, current + 1));
            else result.push(el)
        });
        return result
    }
    function arrayIntersect(arr1, arr2, subtract) {
        var result = [],
            o = {};
        arr2.each(function (el) {
            o[stringify(el)] = el
        });
        arr1.each(function (el) {
            var stringified = stringify(el),
                exists = arrayObjectExists(o, stringified, el);
            if (exists != subtract) {
                delete o[stringified];
                result.push(el)
            }
        });
        return result
    }
    function arrayObjectExists(hash, stringified, obj) {
        return stringified in hash && (typeof obj !== "function" || obj === hash[stringified])
    }
    function arrayIndexOf(arr, search, fromIndex, increment) {
        var length = arr.length,
            fromRight = increment == -1,
            start = fromRight ? length - 1 : 0,
            index = toIntegerWithDefault(fromIndex, start);
        if (index < 0) index = length + index;
        if (!fromRight && index < 0 || fromRight && index >= length) index = start;
        while (fromRight && index >= 0 || !fromRight && index < length) {
            if (arr[index] === search) return index;
            index += increment
        }
        return -1
    }
    function arrayReduce(arr, fn, initialValue, fromRight) {
        var length = arr.length,
            count = 0,
            defined = initialValue !== Undefined,
            result, index;
        checkCallback(fn);
        if (length == 0 && !defined) throw new TypeError("Reduce called on empty array with no initial value");
        else if (defined) result = initialValue;
        else {
            result = arr[fromRight ? length - 1 : count];
            count++
        }
        while (count < length) {
            index = fromRight ? length - count - 1 : count;
            if (index in arr) result = fn.call(Undefined, result, arr[index], index, arr);
            count++
        }
        return result
    }
    function toIntegerWithDefault(i, d) {
        if (isNaN(i)) return d;
        else return parseInt(i >> 0)
    }
    function isArrayIndex(arr, i) {
        return i in arr && toUInt32(i) == i && i != 4294967295
    }
    function toUInt32(i) {
        return i >>> 0
    }
    function checkCallback(fn) {
        if (!fn || !fn.call) throw new TypeError("Callback is not callable");
    }
    function checkFirstArgumentExists(args) {
        if (args.length === 0) throw new TypeError("First argument must be defined");
    }
    function iterateOverSparseArray(arr, fn, fromIndex, loop) {
        var indexes = [],
            i;
        for (i in arr) if (isArrayIndex(arr, i) && i >= fromIndex) indexes.push(i.toNumber());
        indexes.sort().each(function (index) {
            return fn.call(arr, arr[index], index, arr)
        });
        return arr
    }
    function getMinOrMax(obj, map, which, isArray) {
        var max = which === "max",
            min = which === "min";
        var edge = max ? -Infinity : Infinity;
        var result = [];
        iterateOverObject(obj, function (key) {
            var entry = obj[key];
            var test = transformArgument(entry, map, obj, isArray ? [entry, key.toNumber(), obj] : []);
            if (test === edge) result.push(entry);
            else if (max && test > edge || min && test < edge) {
                result = [entry];
                edge = test
            }
        });
        return result
    }
    function collateStrings(a, b) {
        var aValue, bValue, aChar, bChar, aEquiv, bEquiv, index = 0,
            tiebreaker = 0;
        a = getCollationReadyString(a);
        b = getCollationReadyString(b);
        do {
            aChar = getCollationCharacter(a, index);
            bChar = getCollationCharacter(b, index);
            aValue = getCollationValue(aChar);
            bValue = getCollationValue(bChar);
            if (aValue === -1 || bValue === -1) {
                aValue = a.charCodeAt(index) || null;
                bValue = b.charCodeAt(index) || null
            }
            aEquiv = aChar !== a.charAt(index);
            bEquiv = bChar !== b.charAt(index);
            if (aEquiv !== bEquiv && tiebreaker === 0) tiebreaker = aEquiv - bEquiv;
            index += 1
        } while (aValue != null && bValue != null && aValue === bValue);
        if (aValue === bValue) return tiebreaker;
        return aValue < bValue ? -1 : 1
    }
    function getCollationReadyString(str) {
        if (array[AlphanumericSortIgnoreCase]) str = str.toLowerCase();
        return str.remove(array[AlphanumericSortIgnore])
    }
    function getCollationCharacter(str, index) {
        var chr = str.charAt(index),
            eq = array[AlphanumericSortEquivalents] || {};
        return eq[chr] || chr
    }
    function getCollationValue(chr) {
        if (!chr) return null;
        else return array[AlphanumericSortOrder].indexOf(chr)
    }
    var AlphanumericSortOrder = "AlphanumericSortOrder";
    var AlphanumericSortIgnore = "AlphanumericSortIgnore";
    var AlphanumericSortIgnoreCase = "AlphanumericSortIgnoreCase";
    var AlphanumericSortEquivalents = "AlphanumericSortEquivalents";

    function buildArray() {
        var order = "A\u00c1\u00c0\u00c2\u00c3\u0104BC\u0106\u010c\u00c7D\u010e\u00d0E\u00c9\u00c8\u011a\u00ca\u00cb\u0118FG\u011eH\u0131I\u00cd\u00cc\u0130\u00ce\u00cfJKL\u0141MN\u0143\u0147\u00d1O\u00d3\u00d2\u00d4PQR\u0158S\u015a\u0160\u015eT\u0164U\u00da\u00d9\u016e\u00db\u00dcVWXY\u00ddZ\u0179\u017b\u017d\u00de\u00c6\u0152\u00d8\u00d5\u00c5\u00c4\u00d6";
        var equiv = "A\u00c1\u00c0\u00c2\u00c3\u00c4,C\u00c7,E\u00c9\u00c8\u00ca\u00cb,I\u00cd\u00cc\u0130\u00ce\u00cf,O\u00d3\u00d2\u00d4\u00d5\u00d6,S\u00df,U\u00da\u00d9\u00db\u00dc";
        array[AlphanumericSortOrder] = order.split("").map(function (str) {
            return str + str.toLowerCase()
        }).join("");
        var equivalents = {};
        equiv.split(",").each(function (set) {
            var equivalent = set.charAt(0);
            set.slice(1).chars(function (chr) {
                equivalents[chr] = equivalent;
                equivalents[chr.toLowerCase()] = equivalent.toLowerCase()
            })
        });
        array[AlphanumericSortIgnoreCase] = true;
        array[AlphanumericSortEquivalents] = equivalents
    }
    extend(array, false, false, {
        "create": function (obj) {
            var result = [];
            multiArgs(arguments, function (a) {
                if (a && a.callee) a = getArgs(a);
                result = result.concat(a)
            });
            return result
        },
        "isArray": function (obj) {
            return isClass(obj, "Array")
        }
    });
    extend(array, true, function () {
        var a = arguments;
        return a.length > 0 && !object.isFunction(a[0])
    }, {
        "every": function (f, scope) {
            var length = this.length,
                index = 0;
            checkFirstArgumentExists(arguments);
            while (index < length) {
                if (index in this && !multiMatch(this[index], f, scope, [index, this])) return false;
                index++
            }
            return true
        },
        "some": function (f, scope) {
            var length = this.length,
                index = 0;
            checkFirstArgumentExists(arguments);
            while (index < length) {
                if (index in this && multiMatch(this[index], f, scope, [index, this])) return true;
                index++
            }
            return false
        },
        "map": function (map, scope) {
            var length = this.length,
                index = 0,
                el, result = new Array(length);
            checkFirstArgumentExists(arguments);
            while (index < length) {
                if (index in this) {
                    el = this[index];
                    result[index] = transformArgument(el, map, scope, [el, index, this])
                }
                index++
            }
            return result
        },
        "filter": function (f, scope) {
            var length = this.length,
                index = 0,
                result = [];
            checkFirstArgumentExists(arguments);
            while (index < length) {
                if (index in this && multiMatch(this[index], f, scope, [index, this])) result.push(this[index]);
                index++
            }
            return result
        }
    });
    extend(array, true, false, {
        "indexOf": function (search, fromIndex) {
            if (object.isString(this)) return this.indexOf(search, fromIndex);
            return arrayIndexOf(this, search, fromIndex, 1)
        },
        "lastIndexOf": function (search, fromIndex) {
            if (object.isString(this)) return this.lastIndexOf(search, fromIndex);
            return arrayIndexOf(this, search, fromIndex, -1)
        },
        "forEach": function (fn, scope) {
            var length = this.length,
                index = 0;
            checkCallback(fn);
            while (index < length) {
                if (index in this) fn.call(scope, this[index], index, this);
                index++
            }
        },
        "reduce": function (fn, init) {
            return arrayReduce(this, fn, init)
        },
        "reduceRight": function (fn, init) {
            return arrayReduce(this, fn, init, true)
        },
        "each": function (fn, index, loop) {
            arrayEach(this, fn, index, loop, true);
            return this
        },
        "find": function (f, index, loop) {
            return arrayFind(this, f, index, loop)
        },
        "findAll": function (f, index, loop) {
            var result = [];
            arrayEach(this, function (el, i, arr) {
                if (multiMatch(el, f, arr, [i, arr])) result.push(el)
            }, index, loop);
            return result
        },
        "findIndex": function (f, startIndex, loop) {
            var index = arrayFind(this, f, startIndex, loop, true);
            return isUndefined(index) ? -1 : index
        },
        "count": function (f) {
            if (isUndefined(f)) return this.length;
            return this.findAll(f).length
        },
        "none": function () {
            return !this.any.apply(this, arguments)
        },
        "remove": function () {
            var i, arr = this;
            multiArgs(arguments, function (f) {
                i = 0;
                while (i < arr.length) if (multiMatch(arr[i], f, arr, [i, arr])) arr.splice(i, 1);
                else i++
            });
            return arr
        },
        "removeAt": function (start, end) {
            if (isUndefined(start)) return this;
            if (isUndefined(end)) end = start;
            for (var i = 0; i <= end - start; i++) this.splice(start, 1);
            return this
        },
        "add": function (el, index) {
            if (!object.isNumber(number(index)) || isNaN(index) || index == -1) index = this.length;
            else if (index < -1) index += 1;
            array.prototype.splice.apply(this, [index, 0].concat(el));
            return this
        },
        "include": function (el, index) {
            return this.clone().add(el, index)
        },
        "exclude": function () {
            return array.prototype.remove.apply(this.clone(), arguments)
        },
        "clone": function () {
            return object.merge([], this)
        },
        "unique": function (map) {
            return arrayUnique(this, map)
        },
        "union": function () {
            var arr = this;
            multiArgs(arguments, function (arg) {
                arr = arr.concat(arg)
            });
            return arrayUnique(arr)
        },
        "intersect": function () {
            return arrayIntersect(this, multiArgs(arguments, null, true), false)
        },
        "subtract": function (a) {
            return arrayIntersect(this, multiArgs(arguments, null, true), true)
        },
        "at": function () {
            return entryAtIndex(this, arguments)
        },
        "first": function (num) {
            if (isUndefined(num)) return this[0];
            if (num < 0) num = 0;
            return this.slice(0, num)
        },
        "last": function (num) {
            if (isUndefined(num)) return this[this.length - 1];
            var start = this.length - num < 0 ? 0 : this.length - num;
            return this.slice(start)
        },
        "from": function (num) {
            return this.slice(num)
        },
        "to": function (num) {
            if (isUndefined(num)) num = this.length;
            return this.slice(0, num)
        },
        "min": function (map) {
            return arrayUnique(getMinOrMax(this, map, "min", true))
        },
        "max": function (map) {
            return arrayUnique(getMinOrMax(this, map, "max", true))
        },
        "least": function () {
            var result = arrayFlatten(getMinOrMax(this.groupBy.apply(this, arguments), "length", "min"));
            return result.length === this.length ? [] : arrayUnique(result)
        },
        "most": function () {
            var result = arrayFlatten(getMinOrMax(this.groupBy.apply(this, arguments), "length", "max"));
            return result.length === this.length ? [] : arrayUnique(result)
        },
        "sum": function (map) {
            var arr = map ? this.map(map) : this;
            return arr.length > 0 ? arr.reduce(function (a, b) {
                return a + b
            }) : 0
        },
        "average": function (map) {
            var arr = map ? this.map(map) : this;
            return arr.length > 0 ? arr.sum() / arr.length : 0
        },
        "groupBy": function (map, fn) {
            var arr = this,
                result = object.extended(),
                key;
            arrayEach(arr, function (el, index) {
                key = transformArgument(el, map, arr, [el, index, arr]);
                if (!result[key]) result[key] = [];
                result[key].push(el)
            });
            return result.each(fn)
        },
        "inGroups": function (num, padding) {
            var pad = arguments.length > 1;
            var arr = this;
            var result = [];
            var divisor = (this.length / num).ceil();
            (0).upto(num - 1, function (i) {
                var index = i * divisor;
                var group = arr.slice(index, index + divisor);
                if (pad && group.length < divisor)(divisor - group.length).times(function () {
                    group = group.add(padding)
                });
                result.push(group)
            });
            return result
        },
        "inGroupsOf": function (num, padding) {
            if (this.length === 0 || num === 0) return this;
            if (isUndefined(num)) num = 1;
            if (isUndefined(padding)) padding = null;
            var result = [];
            var group = null;
            var len = this.length;
            this.each(function (el, i) {
                if (i % num === 0) {
                    if (group) result.push(group);
                    group = []
                }
                if (isUndefined(el)) el = padding;
                group.push(el)
            });
            if (!this.length.isMultipleOf(num)) {
                (num - this.length % num).times(function () {
                    group.push(padding)
                });
                this.length = this.length + (num - this.length % num)
            }
            if (group.length > 0) result.push(group);
            return result
        },
        "compact": function (all) {
            var result = [];
            arrayEach(this, function (el, i) {
                if (object.isArray(el)) result.push(el.compact());
                else if (all && el) result.push(el);
                else if (!all && el != null && !object.isNaN(el)) result.push(el)
            });
            return result
        },
        "isEmpty": function () {
            return this.compact().length == 0
        },
        "flatten": function (limit) {
            return arrayFlatten(this, limit)
        },
        "sortBy": function (map, desc) {
            var arr = this.clone();
            arr.sort(function (a, b) {
                var aProperty, bProperty, comp;
                aProperty = transformArgument(a, map, arr, [a]);
                bProperty = transformArgument(b, map, arr, [b]);
                if (object.isString(aProperty) && object.isString(bProperty)) comp = collateStrings(aProperty, bProperty);
                else if (aProperty < bProperty) comp = -1;
                else if (aProperty > bProperty) comp = 1;
                else comp = 0;
                return comp * (desc ? -1 : 1)
            });
            return arr
        },
        "randomize": function () {
            var a = this.concat();
            for (var j, x, i = a.length; i; j = parseInt(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
            return a
        },
        "zip": function () {
            var args = getArgs(arguments);
            return this.map(function (el, i) {
                return [el].concat(args.map(function (k) {
                    return i in k ? k[i] : null
                }))
            })
        },
        "sample": function (num) {
            var result = [],
                arr = this.clone(),
                index;
            if (!(num > 0)) num = 1;
            while (result.length < num) {
                index = Number.random(0, arr.length - 1);
                result.push(arr[index]);
                arr.removeAt(index);
                if (arr.length == 0) break
            }
            return arguments.length > 0 ? result : result[0]
        }
    });
    extend(array, true, false, {
        "all": array.prototype.every,
        "any": array.prototype.some,
        "has": array.prototype.some,
        "insert": array.prototype.add
    });

    function round(val, precision, method) {
        var fn = Math[method || "round"];
        var multiplier = Math.pow(10, (precision || 0).abs());
        if (precision < 0) multiplier = 1 / multiplier;
        return fn(val * multiplier) / multiplier
    }
    function getRange(start, stop, fn, step) {
        var arr = [],
            i = parseInt(start),
            up = step > 0;
        while (up && i <= stop || !up && i >= stop) {
            arr.push(i);
            if (fn) fn.call(this, i);
            i += step
        }
        return arr
    }
    function abbreviateNumber(num, roundTo, str, mid, limit, bytes) {
        var fixed = num.toFixed(20),
            decimalPlace = fixed.search(/\./),
            numeralPlace = fixed.search(/[1-9]/),
            significant = decimalPlace - numeralPlace,
            unit, i, divisor;
        if (significant > 0) significant -= 1;
        i = Math.max(Math.min((significant / 3).floor(), limit === false ? str.length : limit), -mid);
        unit = str.charAt(i + mid - 1);
        if (significant < -9) {
            i = -3;
            roundTo = significant.abs() - 9;
            unit = str.first()
        }
        divisor = bytes ? (2).pow(10 * i) : (10).pow(i * 3);
        return (num / divisor).round(roundTo || 0).format() + unit.trim()
    }
    extend(number, false, false, {
        "random": function (n1, n2) {
            var min, max;
            if (arguments.length == 1) n2 = n1, n1 = 0;
            min = Math.min(n1 || 0, isUndefined(n2) ? 1 : n2);
            max = Math.max(n1 || 0, isUndefined(n2) ? 1 : n2);
            return round(Math.random() * (max - min) + min)
        }
    });
    extend(number, true, false, {
        "toNumber": function () {
            return parseFloat(this, 10)
        },
        "abbr": function (precision) {
            return abbreviateNumber(this, precision, "kmbt", 0, 4)
        },
        "metric": function (precision, limit) {
            return abbreviateNumber(this, precision, "n\u03bcm kMGTPE", 4, isUndefined(limit) ? 1 : limit)
        },
        "bytes": function (precision, limit) {
            return abbreviateNumber(this, precision, "kMGTPE", 0, isUndefined(limit) ? 4 : limit, true) + "B"
        },
        "isInteger": function () {
            return this % 1 == 0
        },
        "ceil": function (precision) {
            return round(this, precision, "ceil")
        },
        "floor": function (precision) {
            return round(this, precision, "floor")
        },
        "abs": function () {
            return Math.abs(this)
        },
        "pow": function (power) {
            if (isUndefined(power)) power = 1;
            return Math.pow(this, power)
        },
        "round": function (precision) {
            return round(this, precision, "round")
        },
        "chr": function () {
            return string.fromCharCode(this)
        },
        "isOdd": function () {
            return !this.isMultipleOf(2)
        },
        "isEven": function () {
            return this.isMultipleOf(2)
        },
        "isMultipleOf": function (num) {
            return this % num === 0
        },
        "upto": function (num, fn, step) {
            return getRange(this, num, fn, step || 1)
        },
        "downto": function (num, fn, step) {
            return getRange(this, num, fn, -(step || 1))
        },
        "times": function (fn) {
            if (fn) for (var i = 0; i < this; i++) fn.call(this, i);
            return this.toNumber()
        },
        "ordinalize": function () {
            var suffix, num = this.abs(),
                last = num.toString().last(2).toNumber();
            if (last >= 11 && last <= 13) suffix = "th";
            else switch (num % 10) {
            case 1:
                suffix = "st";
                break;
            case 2:
                suffix = "nd";
                break;
            case 3:
                suffix = "rd";
                break;
            default:
                suffix = "th"
            }
            return this.toString() + suffix
        },
        "pad": function (place, sign, base) {
            base = base || 10;
            var str = this.toNumber() === 0 ? "" : this.toString(base).replace(/^-/, "");
            str = padString(str, "0", place - str.replace(/\.\d+$/, "").length, 0);
            if (sign || this < 0) str = (this < 0 ? "-" : "+") + str;
            return str
        },
        "format": function (place, thousands, decimal) {
            var str, split, method, after, r = /(\d+)(\d{3})/;
            if (string(thousands).match(/\d/)) throw new TypeError("Thousands separator cannot contain numbers.");
            str = object.isNumber(place) ? round(this, place).toFixed(Math.max(place, 0)) : this.toString();
            thousands = thousands || ",";
            decimal = decimal || ".";
            split = str.split(".");
            str = split[0];
            after = split[1] || "";
            while (str.match(r)) str = str.replace(r, "$1" + thousands + "$2");
            if (after.length > 0) str += decimal + padString(after, "0", 0, place - after.length);
            return str
        },
        "hex": function (pad) {
            return this.pad(pad || 1, false, 16)
        }
    });
    var getTrimmableCharacters = function () {
            return "\t\n\x0B\u000c\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u2028\u2029\u3000\ufeff"
        };
    var unicodeScripts = [{
        names: ["Arabic"],
        source: "\u0600-\u06ff"
    }, {
        names: ["Cyrillic"],
        source: "\u0400-\u04ff"
    }, {
        names: ["Devanagari"],
        source: "\u0900-\u097f"
    }, {
        names: ["Greek"],
        source: "\u0370-\u03ff"
    }, {
        names: ["Hangul"],
        source: "\uac00-\ud7af\u1100-\u11ff"
    }, {
        names: ["Han", "Kanji"],
        source: "\u4e00-\u9fff\uf900-\ufaff"
    }, {
        names: ["Hebrew"],
        source: "\u0590-\u05ff"
    }, {
        names: ["Hiragana"],
        source: "\u3040-\u309f\u30fb-\u30fc"
    }, {
        names: ["Kana"],
        source: "\u3040-\u30ff\uff61-\uff9f"
    }, {
        names: ["Katakana"],
        source: "\u30a0-\u30ff\uff61-\uff9f"
    }, {
        names: ["Latin"],
        source: "\u0001-\u007f\u0080-\u00ff\u0100-\u017f\u0180-\u024f"
    }, {
        names: ["Thai"],
        source: "\u0e00-\u0e7f"
    }];

    function buildUnicodeScripts() {
        unicodeScripts.each(function (s) {
            var is = regexp("^[" + s.source + "\\s]+$");
            var has = regexp("[" + s.source + "]");
            s.names.each(function (name) {
                defineProperty(string.prototype, "is" + name, function () {
                    return is.test(this.trim())
                });
                defineProperty(string.prototype, "has" + name, function () {
                    return has.test(this)
                })
            })
        })
    }
    function convertCharacterWidth(str, args, reg, table) {
        var mode = getArgs(args).join("");
        mode = mode.replace(/all/, "").replace(/(\w)lphabet|umbers?|atakana|paces?|unctuation/g, "$1");
        return str.replace(reg, function (c) {
            if (table[c] && (!mode || mode.has(table[c].type))) return table[c].to;
            else return c
        })
    }
    var widthConversionRanges = [{
        type: "a",
        shift: 65248,
        start: 65,
        end: 90
    }, {
        type: "a",
        shift: 65248,
        start: 97,
        end: 122
    }, {
        type: "n",
        shift: 65248,
        start: 48,
        end: 57
    }, {
        type: "p",
        shift: 65248,
        start: 33,
        end: 47
    }, {
        type: "p",
        shift: 65248,
        start: 58,
        end: 64
    }, {
        type: "p",
        shift: 65248,
        start: 91,
        end: 96
    }, {
        type: "p",
        shift: 65248,
        start: 123,
        end: 126
    }];
    var ZenkakuTable = {};
    var HankakuTable = {};
    var allHankaku = /[\u0020-\u00A5]|[\uFF61-\uFF9F][\uff9e\uff9f]?/g;
    var allZenkaku = /[\u3000-\u301C]|[\u301A-\u30FC]|[\uFF01-\uFF60]|[\uFFE0-\uFFE6]/g;
    var hankakuPunctuation = "\uff61\uff64\uff62\uff63\u00a5\u00a2\u00a3";
    var zenkakuPunctuation = "\u3002\u3001\u300c\u300d\uffe5\uffe0\uffe1";
    var voicedKatakana = /[\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd\u30bf\u30c1\u30c4\u30c6\u30c8\u30cf\u30d2\u30d5\u30d8\u30db]/;
    var semiVoicedKatakana = /[\u30cf\u30d2\u30d5\u30d8\u30db\u30f2]/;
    var hankakuKatakana = "\uff71\uff72\uff73\uff74\uff75\uff67\uff68\uff69\uff6a\uff6b\uff76\uff77\uff78\uff79\uff7a\uff7b\uff7c\uff7d\uff7e\uff7f\uff80\uff81\uff82\uff6f\uff83\uff84\uff85\uff86\uff87\uff88\uff89\uff8a\uff8b\uff8c\uff8d\uff8e\uff8f\uff90\uff91\uff92\uff93\uff94\uff6c\uff95\uff6d\uff96\uff6e\uff97\uff98\uff99\uff9a\uff9b\uff9c\uff66\uff9d\uff70\uff65";
    var zenkakuKatakana = "\u30a2\u30a4\u30a6\u30a8\u30aa\u30a1\u30a3\u30a5\u30a7\u30a9\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd\u30bf\u30c1\u30c4\u30c3\u30c6\u30c8\u30ca\u30cb\u30cc\u30cd\u30ce\u30cf\u30d2\u30d5\u30d8\u30db\u30de\u30df\u30e0\u30e1\u30e2\u30e4\u30e3\u30e6\u30e5\u30e8\u30e7\u30e9\u30ea\u30eb\u30ec\u30ed\u30ef\u30f2\u30f3\u30fc\u30fb";

    function buildWidthConversionTables() {
        var hankaku;
        arrayEach(widthConversionRanges, function (r) {
            r.start.upto(r.end, function (n) {
                setWidthConversion(r.type, n.chr(), (n + r.shift).chr())
            })
        });
        zenkakuKatakana.each(function (c, i) {
            hankaku = hankakuKatakana.charAt(i);
            setWidthConversion("k", hankaku, c);
            if (c.match(voicedKatakana)) setWidthConversion("k", hankaku + "\uff9e", c.shift(1));
            if (c.match(semiVoicedKatakana)) setWidthConversion("k", hankaku + "\uff9f", c.shift(2))
        });
        zenkakuPunctuation.each(function (c, i) {
            setWidthConversion("p", hankakuPunctuation.charAt(i), c)
        });
        setWidthConversion("k", "\uff73\uff9e", "\u30f4");
        setWidthConversion("k", "\uff66\uff9e", "\u30fa");
        setWidthConversion("s", " ", "\u3000")
    }
    function setWidthConversion(type, half, full) {
        ZenkakuTable[half] = {
            type: type,
            to: full
        };
        HankakuTable[full] = {
            type: type,
            to: half
        }
    }
    function padString(str, p, left, right) {
        var padding = String(p);
        if (padding != p) padding = "";
        if (!object.isNumber(left)) left = 1;
        if (!object.isNumber(right)) right = 1;
        return padding.repeat(left) + str + padding.repeat(right)
    }
    function getAcronym(word) {
        return string.Inflector && string.Inflector.acronyms && string.Inflector.acronyms[word]
    }
    var btoa, atob;

    function buildBase64(key) {
        if (this.btoa) {
            btoa = this.btoa;
            atob = this.atob
        }
        var base64reg = /[^A-Za-z0-9\+\/\=]/g;
        btoa = function (str) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            do {
                chr1 = str.charCodeAt(i++);
                chr2 = str.charCodeAt(i++);
                chr3 = str.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = (chr1 & 3) << 4 | chr2 >> 4;
                enc3 = (chr2 & 15) << 2 | chr3 >> 6;
                enc4 = chr3 & 63;
                if (isNaN(chr2)) enc3 = enc4 = 64;
                else if (isNaN(chr3)) enc4 = 64;
                output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = ""
            } while (i < str.length);
            return output
        };
        atob = function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            if (input.match(base64reg)) throw new Error("String contains invalid base64 characters");
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            do {
                enc1 = key.indexOf(input.charAt(i++));
                enc2 = key.indexOf(input.charAt(i++));
                enc3 = key.indexOf(input.charAt(i++));
                enc4 = key.indexOf(input.charAt(i++));
                chr1 = enc1 << 2 | enc2 >> 4;
                chr2 = (enc2 & 15) << 4 | enc3 >> 2;
                chr3 = (enc3 & 3) << 6 | enc4;
                output = output + chr1.chr();
                if (enc3 != 64) output = output + chr2.chr();
                if (enc4 != 64) output = output + chr3.chr();
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = ""
            } while (i < input.length);
            return unescape(output)
        }
    }
    function buildTrim() {
        var support = getTrimmableCharacters().match(/^\s+$/);
        try {
            string.prototype.trim.call([1])
        } catch (e) {
            support = false
        }
        var trimL = regexp("^[" + getTrimmableCharacters() + "]+");
        var trimR = regexp("[" + getTrimmableCharacters() + "]+$");
        extend(string, true, !support, {
            "trim": function () {
                return this.toString().trimLeft().trimRight()
            },
            "trimLeft": function () {
                return this.replace(trimL, "")
            },
            "trimRight": function () {
                return this.replace(trimR, "")
            }
        })
    }
    function buildString() {
        buildBase64("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
        buildTrim();
        buildWidthConversionTables();
        buildUnicodeScripts()
    }
    extend(string, true, false, {
        "escapeRegExp": function () {
            return regexp.escape(this)
        },
        "escapeURL": function (param) {
            return param ? encodeURIComponent(this) : encodeURI(this)
        },
        "unescapeURL": function (param) {
            return param ? decodeURI(this) : decodeURIComponent(this)
        },
        "escapeHTML": function () {
            return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        },
        "unescapeHTML": function () {
            return this.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
        },
        "encodeBase64": function () {
            return btoa(this)
        },
        "decodeBase64": function () {
            return atob(this)
        },
        "capitalize": function (all) {
            var reg = all ? /^\S|\s\S/g : /^\S/;
            return this.toLowerCase().replace(reg, function (letter) {
                return letter.toUpperCase()
            })
        },
        "pad": function (padding, num) {
            return padString(this, padding, num, num)
        },
        "padLeft": function (padding, num) {
            return padString(this, padding, num, 0)
        },
        "padRight": function (padding, num) {
            return padString(this, padding, 0, num)
        },
        "repeat": function (num) {
            var str = "",
                i = 0;
            if (object.isNumber(num) && num > 0) while (i < num) {
                str += this;
                i++
            }
            return str
        },
        "each": function (search, fn) {
            if (object.isFunction(search)) {
                fn = search;
                search = /[\s\S]/g
            } else if (!search) search = /[\s\S]/g;
            else if (object.isString(search)) search = regexp(regexp.escape(search), "gi");
            else if (object.isRegExp(search)) search = search.addFlag("g");
            var match = this.match(search) || [];
            if (fn) for (var i = 0; i < match.length; i++) match[i] = fn.call(this, match[i], i, match) || match[i];
            return match
        },
        "shift": function (n) {
            var result = "";
            n = n || 0;
            this.codes(function (c) {
                result += (c + n).chr()
            });
            return result
        },
        "codes": function (fn) {
            var codes = [];
            for (var i = 0; i < this.length; i++) {
                var code = this.charCodeAt(i);
                codes.push(code);
                if (fn) fn.call(this, code, i)
            }
            return codes
        },
        "chars": function (fn) {
            return this.each(fn)
        },
        "words": function (fn) {
            return this.trim().each(/\S+/g, fn)
        },
        "lines": function (fn) {
            return this.trim().each(/^.*$/gm, fn)
        },
        "paragraphs": function (fn) {
            var paragraphs = this.trim().split(/[\r\n]{2,}/);
            paragraphs = paragraphs.map(function (p) {
                if (fn) var s = fn.call(p);
                return s ? s : p
            });
            return paragraphs
        },
        "startsWith": function (reg, c) {
            if (isUndefined(c)) c = true;
            var source = object.isRegExp(reg) ? reg.source.replace("^", "") : regexp.escape(reg);
            return regexp("^" + source, c ? "" : "i").test(this)
        },
        "endsWith": function (reg, c) {
            if (isUndefined(c)) c = true;
            var source = object.isRegExp(reg) ? reg.source.replace("$", "") : regexp.escape(reg);
            return regexp(source + "$", c ? "" : "i").test(this)
        },
        "isBlank": function () {
            return this.trim().length === 0
        },
        "has": function (find) {
            return this.search(object.isRegExp(find) ? find : RegExp.escape(find)) !== -1
        },
        "add": function (str, index) {
            return this.split("").add(str, index).join("")
        },
        "remove": function (f) {
            return this.replace(f, "")
        },
        "hankaku": function () {
            return convertCharacterWidth(this, arguments, allZenkaku, HankakuTable)
        },
        "zenkaku": function () {
            return convertCharacterWidth(this, arguments, allHankaku, ZenkakuTable)
        },
        "hiragana": function (all) {
            var str = this;
            if (all !== false) str = str.zenkaku("k");
            return str.replace(/[\u30A1-\u30F6]/g, function (c) {
                return c.shift(-96)
            })
        },
        "katakana": function () {
            return this.replace(/[\u3041-\u3096]/g, function (c) {
                return c.shift(96)
            })
        },
        "toNumber": function (base) {
            var str = this.replace(/,/g, "");
            return str.match(/\./) ? parseFloat(str) : parseInt(str, base || 10)
        },
        "reverse": function () {
            return this.split("").reverse().join("")
        },
        "compact": function () {
            return this.trim().replace(/([\r\n\s\u3000])+/g, function (match, whitespace) {
                return whitespace === "\u3000" ? whitespace : " "
            })
        },
        "at": function () {
            return entryAtIndex(this, arguments, true)
        },
        "first": function (num) {
            if (isUndefined(num)) num = 1;
            return this.substr(0, num)
        },
        "last": function (num) {
            if (isUndefined(num)) num = 1;
            var start = this.length - num < 0 ? 0 : this.length - num;
            return this.substr(start)
        },
        "from": function (num) {
            return this.slice(num)
        },
        "to": function (num) {
            if (isUndefined(num)) num = this.length;
            return this.slice(0, num)
        },
        "toDate": function (locale) {
            var str = this.toString();
            return date.create ? date.create(str, locale) : new date(str)
        },
        "dasherize": function () {
            return this.underscore().replace(/_/g, "-")
        },
        "underscore": function () {
            return this.replace(/[-\s]+/g, "_").replace(String.Inflector && String.Inflector.acronymRegExp, function (acronym, index) {
                return (index > 0 ? "_" : "") + acronym.toLowerCase()
            }).replace(/([A-Z\d]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").toLowerCase()
        },
        "camelize": function (first) {
            return this.underscore().replace(/(^|_)([^_]+)/g, function (match, pre, word, index) {
                var acronym = getAcronym(word),
                    capitalize = first !== false || index > 0;
                if (acronym) return capitalize ? acronym : acronym.toLowerCase();
                return capitalize ? word.capitalize() : word
            })
        },
        "spacify": function () {
            return this.underscore().replace(/_/g, " ")
        },
        "stripTags": function () {
            var str = this,
                args = arguments.length > 0 ? arguments : [""];
            multiArgs(args, function (tag) {
                str = str.replace(regexp("</?" + tag.escapeRegExp() + "[^<>]*>", "gi"), "")
            });
            return str
        },
        "removeTags": function () {
            var str = this,
                args = arguments.length > 0 ? arguments : ["\\S+"];
            multiArgs(args, function (t) {
                var reg = regexp("<(" + t + ")[^<>]*(?:\\/>|>.*?<\\/\\1>)", "gi");
                str = str.replace(reg, "")
            });
            return str
        },
        "truncate": function (length, append, split) {
            var reg, repeatedCharacter;
            append = isUndefined(append) ? "..." : String(append);
            length -= append.length;
            if (this.length <= length) return this.toString();
            repeatedCharacter = append.match(/^(.)\1+$/) ? append.slice(0, 1) : "";
            reg = regexp("[^" + getTrimmableCharacters() + repeatedCharacter + "][" + getTrimmableCharacters() + repeatedCharacter + "]");
            while (length > 0 && !reg.test(this.slice(length - 1, length + 1)) && split !== true) length--;
            return this.slice(0, length) + (length > 0 ? append : "")
        },
        "assign": function () {
            var assign = object.extended();
            multiArgs(arguments, function (a, i) {
                if (object.isObject(a)) assign.merge(a);
                else assign[i + 1] = a
            });
            return this.replace(/\{(.+?)\}/g, function (m, key) {
                return hasOwnProperty(assign, key) ? assign[key] : m
            })
        }
    });
    extend(string, true, function (s) {
        return object.isRegExp(s)
    }, {
        "split": function (separator, limit) {
            var output = [];
            var lastLastIndex = 0;
            var separator = regexp(separator).addFlag("g");
            var separator2, match, lastIndex, lastLength;
            if (!regexp.NPCGSupport) separator2 = RegExp("^" + separator.source + "$(?!\\s)", separator.getFlags());
            if (isUndefined(limit) || limit < 0) limit = Infinity;
            else {
                limit = limit | 0;
                if (!limit) return []
            }
            while (match = separator.exec(this)) {
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(this.slice(lastLastIndex, match.index));
                    if (!regexp.NPCGSupport && match.length > 1) match[0].replace(separator2, function () {
                        for (var i = 1; i < arguments.length - 2; i++) if (isUndefined(arguments[i])) match[i] = Undefined
                    });
                    if (match.length > 1 && match.index < this.length) array.prototype.push.apply(output, match.slice(1));
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= limit) break
                }
                if (separator.lastIndex === match.index) separator.lastIndex++
            }
            if (lastLastIndex === this.length) {
                if (lastLength || !separator.test("")) output.push("")
            } else output.push(this.slice(lastLastIndex));
            return output.length > limit ? output.slice(0, limit) : output
        }
    });
    extend(string, true, false, {
        "insert": string.prototype.add
    });
    regexp.NPCGSupport = isUndefined(regexp("()??").exec("")[1]);

    function getFlags(reg, flag) {
        var flags = "";
        if (flag == "g" || reg.global) flags += "g";
        if (flag == "i" || reg.ignoreCase) flags += "i";
        if (flag == "m" || reg.multiline) flags += "m";
        if (flag == "y" || reg.sticky) flags += "y";
        return flags
    }
    extend(regexp, false, false, {
        "escape": function (str) {
            if (!object.isString(str)) str = String(str);
            return str.replace(/([\\/'*+?|()\[\]{}.^$])/g, "\\$1")
        }
    });
    extend(regexp, true, false, {
        "getFlags": function () {
            return getFlags(this)
        },
        "setFlags": function (flags) {
            return regexp(this.source, flags)
        },
        "addFlag": function (flag) {
            return this.setFlags(getFlags(this, flag))
        },
        "removeFlag": function (flag) {
            return this.setFlags(getFlags(this).replace(flag, ""))
        }
    });

    function setDelay(fn, ms, after, scope, args) {
        if (!fn.timers) fn.timers = [];
        fn.timers.push(setTimeout(function () {
            fn.timers.removeAt(index);
            after.apply(scope, args || [])
        }, ms));
        var index = fn.timers.length
    }
    function buildBind() {
        var support = false;
        if (Function.prototype.bind) {
            function F() {}
            var B = F.bind();
            support = new B instanceof B && !(new F instanceof B)
        }
        extend(Function, true, !support, {
            "bind": function (scope) {
                var fn = this,
                    args = getArgs(arguments, 1),
                    nop, bound;
                if (!object.isFunction(this)) throw new TypeError("Function.prototype.bind called on a non-function");
                bound = function () {
                    return fn.apply(fn.prototype && this instanceof fn ? this : scope, args.concat(getArgs(arguments)))
                };
                nop = function () {};
                nop.prototype = this.prototype;
                bound.prototype = new nop;
                return bound
            }
        })
    }
    function buildFunction() {
        buildBind()
    }
    extend(Function, true, false, {
        "lazy": function (ms, limit) {
            var fn = this,
                queue = [],
                lock = false,
                rounded, perExecution;
            ms = ms || 1;
            limit = limit || Infinity;
            rounded = ms.ceil();
            perExecution = round(rounded / ms);
            var execute = function () {
                    if (lock || queue.length == 0) return;
                    var max = Math.max(queue.length - perExecution, 0);
                    while (queue.length > max) Function.prototype.apply.apply(fn, queue.shift());
                    setDelay(lazy, rounded, function () {
                        lock = false;
                        execute()
                    });
                    lock = true
                };

            function lazy() {
                if (lock && queue.length > limit - 2) return;
                queue.push([this, arguments]);
                execute()
            }
            return lazy
        },
        "delay": function (ms) {
            var fn = this;
            if (!object.isNumber(ms)) ms = 0;
            var args = getArgs(arguments, 1);
            setDelay(fn, ms, fn, fn, args);
            return fn
        },
        "debounce": function (ms, wait) {
            var fn = this;
            if (wait === false) return this.lazy(ms, 1);
            else return function () {
                fn.cancel();
                setDelay(fn, ms, fn, this, arguments)
            }
        },
        "cancel": function () {
            if (object.isArray(this.timers)) while (this.timers.length > 0) clearTimeout(this.timers.shift());
            return this
        },
        "after": function (num) {
            var fn = this,
                counter = 0,
                storedArguments = [];
            if (!object.isNumber(num)) num = 1;
            else if (num === 0) {
                fn.call();
                return fn
            }
            return function () {
                var ret;
                storedArguments.push(Array.create(arguments));
                counter++;
                if (counter == num) {
                    ret = fn.call(this, storedArguments);
                    counter = 0;
                    storedArguments = [];
                    return ret
                }
            }
        },
        "once": function () {
            var fn = this;
            return function () {
                return hasOwnProperty(fn, "memo") ? fn["memo"] : fn["memo"] = fn.apply(this, arguments)
            }
        },
        "fill": function () {
            var fn = this,
                curried = getArgs(arguments);
            return function () {
                var args = getArgs(arguments);
                arrayEach(curried, function (arg, index) {
                    if (arg != null || index >= args.length) args.splice(index, 0, arg)
                });
                return fn.apply(this, args)
            }
        }
    });
    buildObject();
    buildString();
    buildFunction();
    buildArray();
    initializeClass(date);
    Object.initializeClass = initializeClass
})(Streak);
(function (Streak) {
    var Date = Streak.Date;
    var regexp = RegExp,
        object = Object,
        date = Date,
        number = Number,
        Undefined, English;

    function isDefined(o) {
        return o !== Undefined
    }
    function isUndefined(o) {
        return o === Undefined
    }
    var TimeFormat = ["hour", "minute", "second", "millisecond", "meridian", "utc", "offset_sign", "offset_hours", "offset_minutes"];
    var RequiredTime = "(\\d{1,2}):?(\\d{2})?:?(\\d{2})?(?:\\.(\\d{1,6}))?(am|pm)?(?:(Z)|(?:([+-])(\\d{2})(?::?(\\d{2}))?)?)?";
    var OptionalTime = "\\s*(?:(?:t|at |\\s+)" + RequiredTime + ")?";
    var LowerAsianDigits = "\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d";
    var UpperAsianDigits = "\u5341\u767e\u5343\u4e07";
    var AsianDigitReg = regexp("[" + LowerAsianDigits + UpperAsianDigits + "]", "g");
    var DateInputFormats = [];
    var DateArgumentUnits;
    var DateUnitsReversed;
    var StaticInputFormats = [{
        src: "(\\d{4})",
        to: ["year"]
    }, {
        src: "([+-])?(\\d{4})[-.]?({month})[-.]?(\\d{1,2})?",
        to: ["year_sign", "year", "month", "date"]
    }, {
        src: "(\\d{1,2})[-.\\/]({month})[-.\\/]?(\\d{2,4})?",
        to: ["month", "date", "year"],
        variant: true
    }, {
        src: "\\/Date\\((\\d+(?:\\+\\d{4})?)\\)\\/",
        to: ["timestamp"],
        time: false
    }];
    var DateOutputFormats = [{
        token: "f{1,4}|ms|milliseconds",
        format: function (d) {
            return d.getMilliseconds()
        }
    }, {
        token: "ss?|seconds",
        format: function (d, len) {
            return d.getSeconds()
        }
    }, {
        token: "mm?|minutes",
        format: function (d, len) {
            return d.getMinutes()
        }
    }, {
        token: "hh?|hours|12hr",
        format: function (d) {
            return getShortHour(d)
        }
    }, {
        token: "HH?|24hr",
        format: function (d) {
            return d.getHours()
        }
    }, {
        token: "dd?|date|day",
        format: function (d) {
            return d.getDate()
        }
    }, {
        token: "dow|weekday",
        word: true,
        format: function (d, loc, n, t) {
            return loc["weekdays"][d.getDay() + (n - 1) * 7]
        }
    }, {
        token: "MM?",
        format: function (d) {
            return d.getMonth() + 1
        }
    }, {
        token: "mon|month",
        word: true,
        format: function (d, loc, n, len) {
            return loc["months"][d.getMonth() + (n - 1) * 12]
        }
    }, {
        token: "y{2,4}|year",
        format: function (d) {
            return d.getFullYear()
        }
    }, {
        token: "[Tt]{1,2}",
        format: function (d, loc, n, format) {
            var m = getMeridian(d);
            if (format.length === 1) m = m.first();
            if (format.first() === "T") m = m.toUpperCase();
            return m
        }
    }, {
        token: "z{1,4}|tz|timezone",
        text: true,
        format: function (d, loc, n, format) {
            var tz = d.getUTCOffset();
            if (format == "z" || format == "zz") tz = tz.replace(/(\d{2})(\d{2})/, function (f, h, m) {
                return h.toNumber().pad(format.length)
            });
            return tz
        }
    }, {
        token: "iso(tz|timezone)",
        format: function (d) {
            return d.getUTCOffset(true)
        }
    }, {
        token: "ord",
        format: function (d) {
            return d.getDate().ordinalize()
        }
    }];
    var DateUnits = [{
        unit: "year",
        method: "FullYear",
        multiplier: function (d) {
            var adjust = d ? d.isLeapYear() ? 1 : 0 : 0.25;
            return (365 + adjust) * 24 * 60 * 60 * 1E3
        }
    }, {
        unit: "month",
        method: "Month",
        multiplier: function (d, ms) {
            var days = 30.4375,
                inMonth;
            if (d) {
                inMonth = d.daysInMonth();
                if (ms <= inMonth.days()) days = inMonth
            }
            return days * 24 * 60 * 60 * 1E3
        }
    }, {
        unit: "week",
        method: "Week",
        multiplier: function () {
            return 7 * 24 * 60 * 60 * 1E3
        }
    }, {
        unit: "day",
        method: "Date",
        multiplier: function () {
            return 24 * 60 * 60 * 1E3
        }
    }, {
        unit: "hour",
        method: "Hours",
        multiplier: function () {
            return 60 * 60 * 1E3
        }
    }, {
        unit: "minute",
        method: "Minutes",
        multiplier: function () {
            return 60 * 1E3
        }
    }, {
        unit: "second",
        method: "Seconds",
        multiplier: function () {
            return 1E3
        }
    }, {
        unit: "millisecond",
        method: "Milliseconds",
        multiplier: function () {
            return 1
        }
    }];
    var Localizations = {};
    var CommonLocales = {
        "en": "2;;January,February,March,April,May,June,July,August,September,October,November,December;Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday;millisecond:|s,second:|s,minute:|s,hour:|s,day:|s,week:|s,month:|s,year:|s;one,two,three,four,five,six,seven,eight,nine,ten;a,an,the;the,st|nd|rd|th,of;{num} {unit} {sign},{num} {unit=4-5} {sign} {day},{weekday?} {month} {date}{1} {year?} {time?},{date} {month} {year},{month} {year},{shift?} {weekday} {time?},{shift} week {weekday} {time?},{shift} {unit=5-7},{0} {edge} of {shift?} {unit=4-7?}{month?}{year?},{weekday} {2} {shift} week,{0} {date}{1} of {month},{0}{month?} {date?}{1} of {shift} {unit=6-7},{day} at {time?},{time} {day};{Month} {d}, {yyyy};,yesterday,today,tomorrow;,ago|before,,from now|after|from;,last,the|this,next;last day,end,,first day|beginning",
        "ja": "1;\u6708;;\u65e5\u66dc\u65e5,\u6708\u66dc\u65e5,\u706b\u66dc\u65e5,\u6c34\u66dc\u65e5,\u6728\u66dc\u65e5,\u91d1\u66dc\u65e5,\u571f\u66dc\u65e5;\u30df\u30ea\u79d2,\u79d2,\u5206,\u6642\u9593,\u65e5,\u9031\u9593|\u9031,\u30f6\u6708|\u30f5\u6708|\u6708,\u5e74;;;;{num}{unit}{sign},{shift}{unit=5-7}{weekday?},{year}\u5e74{month?}\u6708?{date?}\u65e5?,{month}\u6708{date?}\u65e5?,{date}\u65e5;{yyyy}\u5e74{M}\u6708{d}\u65e5;\u4e00\u6628\u65e5,\u6628\u65e5,\u4eca\u65e5,\u660e\u65e5,\u660e\u5f8c\u65e5;,\u524d,,\u5f8c;,\u53bb|\u5148,,\u6765",
        "ko": "1;\uc6d4;;\uc77c\uc694\uc77c,\uc6d4\uc694\uc77c,\ud654\uc694\uc77c,\uc218\uc694\uc77c,\ubaa9\uc694\uc77c,\uae08\uc694\uc77c,\ud1a0\uc694\uc77c;\ubc00\ub9ac\ucd08,\ucd08,\ubd84,\uc2dc\uac04,\uc77c,\uc8fc,\uac1c\uc6d4|\ub2ec,\ub144;\uc77c|\ud55c,\uc774,\uc0bc,\uc0ac,\uc624,\uc721,\uce60,\ud314,\uad6c,\uc2ed;;;{num}{unit} {sign},{shift} {unit=5-7},{shift} {unit=5?} {weekday},{year}\ub144{month?}\uc6d4?{date?}\uc77c?,{month}\uc6d4{date?}\uc77c?,{date}\uc77c;{yyyy}\ub144{M}\uc6d4{d}\uc77c;\uadf8\uc800\uaed8,\uc5b4\uc81c,\uc624\ub298,\ub0b4\uc77c,\ubaa8\ub808;,\uc804,,\ud6c4;,\uc9c0\ub09c|\uc791,\uc774\ubc88,\ub2e4\uc74c|\ub0b4",
        "ru": "4;;\u042f\u043d\u0432\u0430\u0440:\u044f|\u044c,\u0424\u0435\u0432\u0440\u0430\u043b:\u044f|\u044c,\u041c\u0430\u0440\u0442:\u0430|,\u0410\u043f\u0440\u0435\u043b:\u044f|\u044c,\u041c\u0430:\u044f|\u0439,\u0418\u044e\u043d:\u044f|\u044c,\u0418\u044e\u043b:\u044f|\u044c,\u0410\u0432\u0433\u0443\u0441\u0442:\u0430|,\u0421\u0435\u043d\u0442\u044f\u0431\u0440:\u044f|\u044c,\u041e\u043a\u0442\u044f\u0431\u0440:\u044f|\u044c,\u041d\u043e\u044f\u0431\u0440:\u044f|\u044c,\u0414\u0435\u043a\u0430\u0431\u0440:\u044f|\u044c;\u0412\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435,\u041f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a,\u0412\u0442\u043e\u0440\u043d\u0438\u043a,\u0421\u0440\u0435\u0434\u0430,\u0427\u0435\u0442\u0432\u0435\u0440\u0433,\u041f\u044f\u0442\u043d\u0438\u0446\u0430,\u0421\u0443\u0431\u0431\u043e\u0442\u0430;\u043c\u0438\u043b\u043b\u0438\u0441\u0435\u043a\u0443\u043d\u0434:\u0430|\u0443|\u044b|,\u0441\u0435\u043a\u0443\u043d\u0434:\u0430|\u0443|\u044b|,\u043c\u0438\u043d\u0443\u0442:\u0430|\u0443|\u044b|,\u0447\u0430\u0441:||\u0430|\u043e\u0432,\u0434\u0435\u043d\u044c|\u0434\u0435\u043d\u044c|\u0434\u043d\u044f|\u0434\u043d\u0435\u0439,\u043d\u0435\u0434\u0435\u043b:\u044f|\u044e|\u0438|\u044c|\u0435,\u043c\u0435\u0441\u044f\u0446:||\u0430|\u0435\u0432|\u0435,\u0433\u043e\u0434|\u0433\u043e\u0434|\u0433\u043e\u0434\u0430|\u043b\u0435\u0442|\u0433\u043e\u0434\u0443;\u043e\u0434:\u0438\u043d|\u043d\u0443,\u0434\u0432:\u0430|\u0435,\u0442\u0440\u0438,\u0447\u0435\u0442\u044b\u0440\u0435,\u043f\u044f\u0442\u044c,\u0448\u0435\u0441\u0442\u044c,\u0441\u0435\u043c\u044c,\u0432\u043e\u0441\u0435\u043c\u044c,\u0434\u0435\u0432\u044f\u0442\u044c,\u0434\u0435\u0441\u044f\u0442\u044c;;\u0432|\u043d\u0430,\u0433\u043e\u0434\u0430;{num} {unit} {sign},{sign} {num} {unit},{date} {month} {year?} {1},{month} {year},{0} {shift} {unit=5-7};{d} {month} {yyyy} \u0433\u043e\u0434\u0430;\u043f\u043e\u0437\u0430\u0432\u0447\u0435\u0440\u0430,\u0432\u0447\u0435\u0440\u0430,\u0441\u0435\u0433\u043e\u0434\u043d\u044f,\u0437\u0430\u0432\u0442\u0440\u0430,\u043f\u043e\u0441\u043b\u0435\u0437\u0430\u0432\u0442\u0440\u0430;,\u043d\u0430\u0437\u0430\u0434,,\u0447\u0435\u0440\u0435\u0437;,\u043f\u0440\u043e\u0448\u043b\u043e:\u0439|\u043c,,\u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435:\u0439|\u043c",
        "es": "6;;enero,febrero,marzo,abril,mayo,junio,julio,agosto,septiembre,octubre,noviembre,diciembre;domingo,lunes,martes,mi\u00e9rcoles|miercoles,jueves,viernes,s\u00e1bado|sabado;milisegundo:|s,segundo:|s,minuto:|s,hora:|s,d\u00eda|d\u00edas|dia|dias,semana:|s,mes:|es,a\u00f1o|a\u00f1os|ano|anos;uno,dos,tres,cuatro,cinco,seis,siete,ocho,nueve,diez;;el,de;{sign} {num} {unit},{num} {unit} {sign},{date?} {1} {month} {1} {year?},{0} {unit=5-7} {shift},{0} {shift} {unit=5-7};{d} de {month} de {yyyy};anteayer,ayer,hoy,ma\u00f1ana|manana;,hace,,de ahora;,pasad:o|a,,pr\u00f3ximo|pr\u00f3xima|proximo|proxima",
        "pt": "6;;janeiro,fevereiro,mar\u00e7o,abril,maio,junho,julho,agosto,setembro,outubro,novembro,dezembro;domingo,segunda-feira,ter\u00e7a-feira,quarta-feira,quinta-feira,sexta-feira,s\u00e1bado|sabado;milisegundo:|s,segundo:|s,minuto:|s,hora:|s,dia:|s,semana:|s,m\u00eas|m\u00eases|mes|meses,ano:|s;um,dois,tr\u00eas|tres,quatro,cinco,seis,sete,oito,nove,dez,uma,duas;;a,de;{num} {unit} {sign},{sign} {num} {unit},{date?} {1} {month} {1} {year?},{0} {unit=5-7} {shift},{0} {shift} {unit=5-7};{d} de {month} de {yyyy};anteontem,ontem,hoje,amanh:\u00e3|a;,atr\u00e1s|atras|h\u00e1|ha,,daqui a;,passad:o|a,,pr\u00f3ximo|pr\u00f3xima|proximo|proxima",
        "fr": "2;;janvier,f\u00e9vrier|fevrier,mars,avril,mai,juin,juillet,ao\u00fbt,septembre,octobre,novembre,d\u00e9cembre|decembre;dimanche,lundi,mardi,mercredi,jeudi,vendredi,samedi;milliseconde:|s,seconde:|s,minute:|s,heure:|s,jour:|s,semaine:|s,mois,an:|s|n\u00e9e|nee;un:|e,deux,trois,quatre,cinq,six,sept,huit,neuf,dix;;l'|la|le;{sign} {num} {unit},{sign} {num} {unit},{0} {date?} {month} {year?},{0} {unit=5-7} {shift};{d} {month} {yyyy};,hier,aujourd'hui,demain;,il y a,,dans|d'ici;,derni:er|\u00e8re|ere,,prochain:|e",
        "it": "2;;Gennaio,Febbraio,Marzo,Aprile,Maggio,Giugno,Luglio,Agosto,Settembre,Ottobre,Novembre,Dicembre;Domenica,Luned:\u00ec|i,Marted:\u00ec|i,Mercoled:\u00ec|i,Gioved:\u00ec|i,Venerd:\u00ec|i,Sabato;millisecond:o|i,second:o|i,minut:o|i,or:a|e,giorn:o|i,settiman:a|e,mes:e|i,ann:o|i;un:|'|a|o,due,tre,quattro,cinque,sei,sette,otto,nove,dieci;;l'|la|il;{num} {unit} {sign},{weekday?} {date?} {month} {year?},{0} {unit=5-7} {shift},{0} {shift} {unit=5-7};{d} {month} {yyyy};,ieri,oggi,domani,dopodomani;,fa,,da adesso;,scors:o|a,,prossim:o|a",
        "de": "2;;Januar,Februar,M\u00e4rz|Marz,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember;Sonntag,Montag,Dienstag,Mittwoch,Donnerstag,Freitag,Samstag;Millisekunde:|n,Sekunde:|n,Minute:|n,Stunde:|n,Tag:|en,Woche:|n,Monat:|en,Jahr:|en;ein:|e|er|em|en,zwei,drei,vier,fuenf,sechs,sieben,acht,neun,zehn;;der;{sign} {num} {unit},{num} {unit} {sign},{num} {unit} {sign},{sign} {num} {unit},{weekday?} {date?} {month} {year?},{shift} {unit=5-7};{d}. {Month} {yyyy};vorgestern,gestern,heute,morgen,\u00fcbermorgen|ubermorgen|uebermorgen;,vor:|her,,in;,letzte:|r|n|s,,n\u00e4chste:|r|n|s+naechste:|r|n|s",
        "zh-TW": "1;\u6708;;\u65e5,\u4e00,\u4e8c,\u4e09,\u56db,\u4e94,\u516d;\u6beb\u79d2,\u79d2\u9418,\u5206\u9418,\u5c0f\u6642,\u5929,\u500b\u661f\u671f|\u9031,\u500b\u6708,\u5e74;;;\u65e5|\u865f;{num}{unit}{sign},\u661f\u671f{weekday},{shift}{unit=5-7},{shift}{unit=5}{weekday},{year}\u5e74{month?}\u6708?{date?}{0},{month}\u6708{date?}{0},{date}{0};{yyyy}\u5e74{M}\u6708{d}\u65e5;\u524d\u5929,\u6628\u5929,\u4eca\u5929,\u660e\u5929,\u5f8c\u5929;,\u524d,,\u5f8c;,\u4e0a|\u53bb,\u9019,\u4e0b|\u660e",
        "zh-CN": "1;\u6708;;\u65e5,\u4e00,\u4e8c,\u4e09,\u56db,\u4e94,\u516d;\u6beb\u79d2,\u79d2\u949f,\u5206\u949f,\u5c0f\u65f6,\u5929,\u4e2a\u661f\u671f|\u5468,\u4e2a\u6708,\u5e74;;;\u65e5|\u53f7;{num}{unit}{sign},\u661f\u671f{weekday},{shift}{unit=5-7},{shift}{unit=5}{weekday},{year}\u5e74{month?}\u6708?{date?}{0},{month}\u6708{date?}{0},{date}{0};{yyyy}\u5e74{M}\u6708{d}\u65e5;\u524d\u5929,\u6628\u5929,\u4eca\u5929,\u660e\u5929,\u540e\u5929;,\u524d,,\u540e;,\u4e0a|\u53bb,\u8fd9,\u4e0b|\u660e"
    };

    function checkLocaleFormatsAdded(loc) {
        var code = loc["code"];
        if (loc.formatsAdded) return;
        addDateInputFormat("(" + loc["months"].compact().join("|") + ")", ["month"], code);
        addDateInputFormat("(" + loc["weekdays"].compact().join("|") + ")", ["weekday"], code);
        addDateInputFormat("(" + loc["modifiers"].filter(function (m) {
            return m.name === "day"
        }).map("src").join("|") + ")", ["day"], code);
        loc["formats"].each(function (src) {
            loc.addFormat(src, code, false)
        });
        loc.formatsAdded = true
    }
    function addDateInputFormat(format, match, locale, variant, method) {
        method = method || "push";
        DateInputFormats[method]({
            variant: variant,
            locale: locale,
            reg: regexp("^" + format + "$", "i"),
            to: match
        })
    }
    function getLocalization(code, fallback, set) {
        if (fallback && (!object.isString(code) || !code)) code = Date["currentLocale"];
        if (code && !Localizations[code] || set) initializeLocalization(code, set);
        return Localizations[code]
    }
    function initializeLocalization(code, set) {
        set = set || getCommonLocalization(code);
        if (!set) throw new Error("Invalid locale.");

        function eachAlternate(str, fn) {
            str = str.split("+").map(function (split) {
                return split.replace(/(.+):(.+)$/, function (full, base, suffixes) {
                    return suffixes.split("|").map(function (suffix) {
                        return base + suffix
                    }).join("|")
                })
            }).join("|");
            return str.split("|").each(fn)
        }
        function setArray(name, abbreviate, multiple) {
            var arr = [];
            if (!set[name]) return;
            set[name].forEach(function (el, i) {
                eachAlternate(el, function (str, j) {
                    arr[j * multiple + i] = str.toLowerCase()
                })
            });
            if (abbreviate) arr = arr.concat(set[name].map(function (str) {
                return str.slice(0, 3).toLowerCase()
            }));
            return set[name] = arr
        }
        function getDigit(start, stop) {
            var str = "[0-9\uff10-\uff19]" + (start ? "{" + start + "," + stop + "}" : "+");
            if (set["digits"]) str += "|[" + set["digits"] + "]+";
            return str
        }
        function getNum() {
            var arr = [getDigit()].concat(set["articles"]);
            if (!set["digits"]) arr = arr.concat(set["numbers"]);
            return arr.compact().join("|")
        }
        function setModifiers() {
            var arr = [];
            set.modifiersByName = {};
            set["modifiers"].each(function (modifier) {
                eachAlternate(modifier.src, function (t) {
                    set.modifiersByName[t] = modifier;
                    arr.push({
                        name: modifier.name,
                        src: t,
                        value: modifier.value
                    })
                })
            });
            arr.groupBy("name", function (name, group) {
                group = group.map("src");
                if (name === "day") group = group.concat(set["weekdays"]);
                set[name] = group.join("|")
            });
            set["modifiers"] = arr
        }
        setArray("months", true, 12);
        setArray("weekdays", true, 7);
        setArray("units", false, 8);
        setArray("numbers", false, 10);
        set["code"] = code;
        set["date"] = getDigit(1, 2);
        set["year"] = getDigit(4, 4);
        set["num"] = getNum();
        setModifiers();
        if (set["monthSuffix"]) {
            set["month"] = getDigit(1, 2);
            set["months"] = (1).upto(12).map(function (n) {
                return n + set["monthSuffix"]
            })
        }
        Localizations[code] = new Localization(set)
    }
    function getCommonLocalization(code) {
        if (code.slice(0, 3) == "en-") code = "en";
        if (!CommonLocales[code]) return null;
        var set = {
            "modifiers": []
        },
            pre = CommonLocales[code].split(";");

        function bool(n) {
            return !!(pre[0] & Math.pow(2, n - 1))
        }["months", "weekdays", "units", "numbers", "articles", "optionals", "formats"].each(function (name, i) {
            set[name] = pre[i + 2] ? pre[i + 2].split(",") : []
        });
        set["outputFormat"] = pre[9];
        ["day", "sign", "shift", "edge"].each(function (name, i) {
            if (!pre[i + 10]) return;
            pre[i + 10].split(",").each(function (t, j) {
                if (t) set["modifiers"].push({
                    name: name,
                    src: t,
                    value: j - 2
                })
            })
        });
        if (bool(1)) {
            set["digits"] = LowerAsianDigits + UpperAsianDigits;
            if (set["numbers"].length > 0) set["digits"] += set["numbers"].join("");
            else set["numbers"] = LowerAsianDigits.split("");
            set["monthSuffix"] = pre[1]
        }
        set["capitalizeUnit"] = code == "de";
        set["hasPlural"] = bool(2);
        set["pastRelativeFormat"] = set["formats"][0];
        set["futureRelativeFormat"] = set["formats"][bool(3) ? 1 : 0];
        set["durationFormat"] = set["formats"][0].replace(/\s*\{sign\}\s*/, "");
        return set
    }
    function getVariant(locale) {
        if (!locale) locale = Date["currentLocale"];
        return locale != "en" && locale != "en-US"
    }
    function Localization(l) {
        object.merge(this, l)
    }
    object.merge(Localization.prototype, {
        getMonth: function (n) {
            if (object.isNumber(n)) return n - 1;
            else return this["months"].findIndex(regexp(n, "i")) % 12
        },
        getWeekday: function (n) {
            return this["weekdays"].findIndex(regexp(n, "i")) % 7
        },
        getNumber: function (n) {
            var i;
            if (object.isNumber(n)) return n;
            else if (n && (i = this["numbers"].indexOf(n)) !== -1) return (i + 1) % 10;
            else return 1
        },
        getNumericDate: function (n) {
            var self = this;
            return n.replace(this["numbers"][9], "").each(function (d) {
                return self.getNumber(d)
            }).join("")
        },
        getEnglishUnit: function (n) {
            return English["units"][this["units"].indexOf(n) % 8]
        },
        relative: function (adu) {
            return this.convertAdjustedToFormat(adu, adu[2] > 0 ? "futureRelativeFormat" : "pastRelativeFormat")
        },
        duration: function (ms) {
            return this.convertAdjustedToFormat(getAdjustedUnit(ms), "durationFormat")
        },
        convertAdjustedToFormat: function (adu, format) {
            var num = adu[0],
                u = adu[1],
                ms = adu[2],
                sign, unit, last, mult;
            if (this["code"] == "ru") {
                last = num.toString().from(-1);
                switch (true) {
                case last == 1:
                    mult = 1;
                    break;
                case last >= 2 && last <= 4:
                    mult = 2;
                    break;
                default:
                    mult = 3
                }
            } else mult = this["hasPlural"] && num > 1 ? 1 : 0;
            unit = this["units"][mult * 8 + u] || this["units"][u];
            if (this["capitalizeUnit"]) unit = unit.capitalize();
            sign = this["modifiers"].find(function (m) {
                return m.name == "sign" && m.value == (ms > 0 ? 1 : -1)
            });
            return this[format].assign({
                "num": num,
                "unit": unit,
                "sign": sign.src
            })
        },
        addFormat: function (src, code, add) {
            var to = [],
                loc = this;
            if (add !== false) loc.formats.push(src);
            src = src.replace(/\s+/g, "[-,. ]*");
            src = src.replace(/\{(.+?)\}/g, function (all, k) {
                var opt = k.match(/\?$/),
                    slice = k.match(/(\d)(?:-(\d))?/),
                    nc = k.match(/^\d+$/),
                    key = k.replace(/[^a-z]+$/, ""),
                    value, arr;
                if (key === "time") {
                    to = to.concat(TimeFormat);
                    return opt ? OptionalTime : RequiredTime
                }
                if (nc) value = loc["optionals"][nc[0]];
                else if (loc[key]) value = loc[key];
                else if (loc[key + "s"]) {
                    value = loc[key + "s"];
                    if (slice) {
                        arr = [];
                        value.forEach(function (m, i) {
                            var mod = i % (loc["units"] ? 8 : value.length);
                            if (mod >= slice[1] && mod <= (slice[2] || slice[1])) arr.push(m)
                        });
                        value = arr
                    }
                    value = value.compact().join("|")
                }
                if (nc) return "(?:" + value + ")?";
                else {
                    to.push(key);
                    return "(" + value + ")" + (opt ? "?" : "")
                }
            });
            addDateInputFormat(src, to, code)
        }
    });

    function collectDateArguments(args) {
        var obj, arr;
        if (object.isObject(args[0])) return args;
        else if (args.length == 1 && object.isNumber(args[0])) return [args[0]];
        obj = {};
        DateArgumentUnits.each(function (u, i) {
            obj[u.unit] = args[i]
        });
        return [obj]
    }
    function convertAsianDigits(str, key) {
        if (key != "date" && key != "month" && key != "year") return str;
        return str.replace(AsianDigitReg, function (d) {
            var index = LowerAsianDigits.indexOf(d);
            return index + 1 || ""
        })
    }
    function getFormatMatch(match, arr) {
        var obj = {},
            value, num;
        arr.each(function (key, i) {
            value = match[i + 1];
            if (isUndefined(value) || value === "") return;
            value = convertAsianDigits(value.hankaku("n"), key);
            if (key === "year") obj.yearAsString = value;
            if (key === "millisecond") value = value * Math.pow(10, 3 - value.length);
            num = parseFloat(value);
            obj[key] = !isNaN(num) ? num : value.toLowerCase()
        });
        return obj
    }
    function getExtendedDate(f, locale) {
        var d = new date,
            relative = false,
            loc, variant, format, set, unit, num, tmp;
        if (object.isDate(f)) d = f;
        else if (object.isNumber(f)) d = new date(f);
        else if (object.isObject(f)) {
            d = (new date).set(f, true);
            set = f
        } else if (object.isString(f)) {
            checkLocaleFormatsAdded(getLocalization(locale, true));
            variant = getVariant(locale);
            f = f.trim().replace(/\.+$/, "").replace(/^now$/, "");
            DateInputFormats.each(function (dif) {
                var match = f.match(dif.reg);
                if (match) {
                    format = dif;
                    set = getFormatMatch(match, format.to);
                    loc = getLocalization(format.locale, true);
                    if (set.timestamp) {
                        d.setTime(0);
                        set = {
                            "milliseconds": set.timestamp
                        };
                        return false
                    }
                    if (format.variant && !object.isString(set["month"]) && (object.isString(set["date"]) || variant)) {
                        tmp = set["month"];
                        set["month"] = set["date"];
                        set["date"] = tmp
                    }
                    if (set["year"] && set.yearAsString.length === 2) set["year"] = getYearFromAbbreviation(set["year"]);
                    if (set["month"]) {
                        set["month"] = loc.getMonth(set["month"]);
                        if (set["shift"] && !set["unit"]) set["unit"] = "year"
                    }
                    if (set["weekday"] && set["date"]) delete set["weekday"];
                    else if (set["weekday"]) {
                        set["weekday"] = loc.getWeekday(set["weekday"]);
                        if (set["shift"] && !set["unit"]) set["unit"] = "week"
                    }
                    if (set["day"] && (tmp = loc.modifiersByName[set["day"]])) {
                        set["day"] = tmp.value;
                        d.resetTime();
                        relative = true
                    } else if (set["day"] && (tmp = loc.getWeekday(set["day"])) > -1) {
                        delete set["day"];
                        set["weekday"] = tmp
                    }
                    if (set["date"] && !object.isNumber(set["date"])) set["date"] = loc.getNumericDate(set["date"]);
                    if (set["meridian"]) if (set["meridian"] === "pm" && set["hour"] < 12) set["hour"] += 12;
                    if (set["offset_hours"] || set["offset_minutes"]) {
                        set["utc"] = true;
                        set["offset_minutes"] = set["offset_minutes"] || 0;
                        set["offset_minutes"] += set["offset_hours"] * 60;
                        if (set["offset_sign"] === "-") set["offset_minutes"] *= -1;
                        set["minute"] -= set["offset_minutes"]
                    }
                    if (set["unit"]) {
                        relative = true;
                        num = loc.getNumber(set["num"]);
                        unit = loc.getEnglishUnit(set["unit"]);
                        if (set["shift"] || set["edge"]) {
                            num *= (tmp = loc.modifiersByName[set["shift"]]) ? tmp.value : 0;
                            if (unit === "month" && isDefined(set["date"])) {
                                d.set({
                                    "day": set["date"]
                                }, true);
                                delete set["date"]
                            }
                            if (unit === "year" && isDefined(set["month"])) {
                                d.set({
                                    "month": set["month"],
                                    "day": set["date"]
                                }, true);
                                delete set["month"];
                                delete set["date"]
                            }
                        }
                        if (set["sign"] && (tmp = loc.modifiersByName[set["sign"]])) num *= tmp.value;
                        if (isDefined(set["weekday"])) {
                            d.set({
                                "weekday": set["weekday"]
                            }, true);
                            delete set["weekday"]
                        }
                        set[unit] = (set[unit] || 0) + num
                    }
                    if (set["year_sign"] === "-") set["year"] *= -1;
                    return false
                }
            });
            if (!format) d = f ? new date(f) : new date;
            else if (relative) d.advance(set);
            else if (set["utc"]) {
                d.resetTime();
                d.setUTC(set, true)
            } else d.set(set, true);
            if (set && set["edge"]) {
                tmp = loc.modifiersByName[set["edge"]];
                DateUnitsReversed.slice(4).each(function (u) {
                    if (isDefined(set[u.unit])) {
                        unit = u.unit;
                        return false
                    }
                });
                if (unit === "year") set.specificity = "month";
                else if (unit === "month" || unit === "week") set.specificity = "day";
                d[(tmp.value < 0 ? "endOf" : "beginningOf") + unit.capitalize()]();
                if (tmp.value === -2) d.resetTime()
            }
        }
        return {
            date: d,
            set: set
        }
    }
    function formatDate(date, f, relative, locale) {
        var adu, loc = getLocalization(locale, true),
            caps = regexp(/^[A-Z]/),
            value, l;
        if (!date.isValid()) return "Invalid Date";
        else if (Date[f]) f = Date[f];
        else if (object.isFunction(f)) {
            adu = getAdjustedUnit(date.millisecondsFromNow());
            f = f.apply(date, adu.concat(loc))
        }
        if (!f && !relative) f = loc["outputFormat"];
        else if (!f && relative) {
            adu = adu || getAdjustedUnit(date.millisecondsFromNow());
            if (adu[1] === 0) {
                adu[1] = 1;
                adu[0] = 1
            }
            return loc.relative(adu)
        }
        DateOutputFormats.each(function (dof) {
            f = f.replace(regexp("\\{(" + dof.token + ")(\\d)?\\}", dof.word ? "i" : ""), function (m, t, d) {
                var val = dof.format(date, loc, d || 1, t),
                    l = t.length,
                    one = t.match(/^(.)\1+$/);
                if (dof.word) {
                    if (l === 3) val = val.to(3);
                    if (one || t.match(caps)) val = val.capitalize()
                } else if (one && !dof.text) val = (object.isNumber(val) ? val.pad(l) : val.toString()).last(l);
                return val
            })
        });
        return f
    }
    function compareDate(d, find, buffer) {
        var p = getExtendedDate(find),
            accuracy = 0,
            loBuffer = 0,
            hiBuffer = 0,
            override;
        if (buffer > 0) {
            loBuffer = hiBuffer = buffer;
            override = true
        }
        if (!p.date.isValid()) return false;
        if (p.set && p.set.specificity) {
            DateUnits.each(function (u, i) {
                if (u.unit === p.set.specificity) accuracy = u.multiplier(p.date, d - p.date) - 1
            });
            if (p.set["edge"] || p.set["shift"]) p.date["beginningOf" + p.set.specificity.capitalize()]();
            if (!override && p.set["sign"] && p.set.specificity != "millisecond") {
                loBuffer = 50;
                hiBuffer = -50
            }
        }
        var t = d.getTime();
        var min = p.date.getTime();
        var max = min + accuracy;
        if (p.set && p.set.specificity == "week" && (new Date(max + 1)).getHours() != 0) max += date["DSTOffset"];
        return t >= min - loBuffer && t <= max + hiBuffer
    }
    function updateDate(date, params, reset, utc, advance) {
        if (object.isNumber(params) && advance) params = {
            "milliseconds": params
        };
        else if (object.isNumber(params)) {
            date.setTime(params);
            return date
        }
        if (params["date"]) params["day"] = params["date"];
        if (!advance && isUndefined(params["day"]) && isDefined(params["weekday"])) {
            callDateMethod(date, "set", utc, "Weekday", params["weekday"]);
            params["day"] = callDateMethod(date, "get", utc, "Date");
            delete params["weekday"]
        }
        DateUnitsReversed.each(function (u) {
            if (isDefined(params[u.unit]) || isDefined(params[u.unit + "s"])) {
                params.specificity = u.unit;
                return false
            } else if (reset && u.unit !== "week" && u.unit !== "year") callDateMethod(date, "set", utc, u.method, u.unit === "day" ? 1 : 0)
        });
        DateUnits.each(function (u, i) {
            var unit = u.unit;
            var method = u.method;
            var value = isDefined(params[unit]) ? params[unit] : params[unit + "s"];
            if (isUndefined(value)) return;
            if (advance) {
                if (unit === "week") {
                    value = (params["day"] || 0) + value * 7;
                    method = "Date"
                }
                value = value * advance + callDateMethod(date, "get", "", method)
            }
            callDateMethod(date, "set", utc, method, value);
            if (unit === "month") checkMonthTraversal(date, value)
        });
        return date
    }
    function callDateMethod(d, prefix, utc, method, value) {
        return d[prefix + (utc ? "UTC" : "") + method](value)
    }

    function getYearFromAbbreviation(year) {
        return ((new date).getFullYear() / 100).round() * 100 - (year / 100).round() * 100 + year
    }
    function getShortHour(d, utc) {
        var hours = callDateMethod(d, "get", utc, "Hours");
        return hours === 0 ? 12 : hours - (hours / 13 | 0) * 12
    }
    function getMeridian(d, utc) {
        var hours = callDateMethod(d, "get", utc, "Hours");
        return hours < 12 ? "am" : "pm"
    }
    function getWeekNumber(date) {
        var dow = date.getDay() || 7;
        date.addDays(4 - dow).resetTime();
        return 1 + (date.daysSince(date.clone().beginningOfYear()) / 7 | 0)
    }
    function getAdjustedUnit(ms) {
        var next, ams = ms.abs(),
            value = ams,
            unit = 0;
        DateUnitsReversed.from(1).each(function (u, i) {
            next = (ams / u.multiplier() * 10).round() / 10 | 0;
            if (next >= 1) {
                value = next;
                unit = i + 1
            }
        });
        return [value, unit, ms]
    }
    function checkMonthTraversal(date, targetMonth) {
        if (targetMonth < 0) targetMonth += 12;
        if (targetMonth % 12 != date.getMonth()) date.setDate(0)
    }
    function createDate(args) {
        var f;
        if (object.isNumber(args[1])) f = collectDateArguments(args)[0];
        else f = args[0];
        return getExtendedDate(f, args[1]).date
    }
    function buildDateMethods() {
        var methods = {};
        DateUnits.each(function (u, i) {
            var unit = u.unit;
            var caps = unit.capitalize();
            var multiplier = u.multiplier();
            var since = function (f, code) {
                    return ((this.getTime() - date.create(f, code).getTime()) / multiplier).round()
                };
            var until = function (f, code) {
                    return ((date.create(f, code).getTime() - this.getTime()) / multiplier).round()
                };
            methods[unit + "sAgo"] = until;
            methods[unit + "sUntil"] = until;
            methods[unit + "sSince"] = since;
            methods[unit + "sFromNow"] = since;
            methods["add" + caps + "s"] = function (num) {
                var set = {};
                set[unit] = num;
                return this.advance(set)
            };
            buildNumberToDateAlias(unit, multiplier);
            if (i < 3)["Last", "This", "Next"].each(function (shift) {
                methods["is" + shift + caps] = function () {
                    return this.is(shift + " " + unit)
                }
            });
            if (i < 4) {
                methods["beginningOf" + caps] = function () {
                    var set = {};
                    switch (unit) {
                    case "year":
                        set["year"] = this.getFullYear();
                        break;
                    case "month":
                        set["month"] = this.getMonth();
                        break;
                    case "day":
                        set["day"] = this.getDate();
                        break;
                    case "week":
                        set["weekday"] = 0;
                        break
                    }
                    return this.set(set, true)
                };
                methods["endOf" + caps] = function () {
                    var set = {
                        "hours": 23,
                        "minutes": 59,
                        "seconds": 59,
                        "milliseconds": 999
                    };
                    switch (unit) {
                    case "year":
                        set["month"] = 11;
                        set["day"] = 31;
                        break;
                    case "month":
                        set["day"] = this.daysInMonth();
                        break;
                    case "week":
                        set["weekday"] = 6;
                        break
                    }
                    return this.set(set, true)
                }
            }
        });
        date.extend(methods)
    }
    function buildDateInputFormats() {
        DateArgumentUnits = DateUnits.clone().removeAt(2);
        DateUnitsReversed = DateUnits.clone().reverse();
        var monthReg = "\\d{1,2}|" + English["months"].join("|");
        StaticInputFormats.each(function (f) {
            addDateInputFormat(f.src.replace(/\{month\}/, monthReg) + (f.time === false ? "" : OptionalTime), f.to.concat(TimeFormat), "en", f.variant)
        });
        addDateInputFormat(RequiredTime, TimeFormat)
    }
    function buildRelativeAliases() {
        var methods = {};
        var weekdays = English["weekdays"].slice(0, 7);
        var months = English["months"].slice(0, 12);
        ["today", "yesterday", "tomorrow", "weekday", "weekend", "future", "past"].concat(weekdays).concat(months).each(function (s) {
            methods["is" + s.capitalize()] = function () {
                return this.is(s)
            }
        });
        date.extend(methods)
    }
    function buildNumberToDateAlias(unit, multiplier) {
        var add = "add" + unit.capitalize() + "s",
            methods = {};

        function base() {
            return (this * multiplier).round()
        }
        function after() {
            return createDate(arguments)[add](this)
        }
        function before() {
            return createDate(arguments)[add](-this)
        }
        methods[unit] = base;
        methods[unit + "s"] = base;
        methods[unit + "Before"] = before;
        methods[unit + "sBefore"] = before;
        methods[unit + "Ago"] = before;
        methods[unit + "sAgo"] = before;
        methods[unit + "After"] = after;
        methods[unit + "sAfter"] = after;
        methods[unit + "FromNow"] = after;
        methods[unit + "sFromNow"] = after;
        number.extend(methods)
    }
    function setDateProperties() {
        date.extend({
            "DSTOffset": ((new date(2E3, 6, 1)).getTimezoneOffset() - (new date(2E3, 0, 1)).getTimezoneOffset()) * 60 * 1E3,
            "INTERNATIONAL_TIME": "{h}:{mm}:{ss}",
            "RFC1123": "{Dow}, {dd} {Mon} {yyyy} {HH}:{mm}:{ss} {tz}",
            "RFC1036": "{Weekday}, {dd}-{Mon}-{yy} {HH}:{mm}:{ss} {tz}",
            "ISO8601_DATE": "{yyyy}-{MM}-{dd}",
            "ISO8601_DATETIME": "{yyyy}-{MM}-{dd}T{HH}:{mm}:{ss}.{fff}{isotz}"
        }, false, false)
    }
    function buildISOString(name) {
        var d = new date(date.UTC(1999, 11, 31)),
            target = "1999-12-31T00:00:00.000Z",
            methods = {};
        if (!d[name] || d[name]() !== target) {
            methods[name] = function () {
                return formatDate(this.toUTC(), date["ISO8601_DATETIME"])
            };
            date.extend(methods, true)
        }
    }
    function buildDate() {
        English = date.setLocale("en");
        buildDateMethods();
        buildDateInputFormats();
        buildRelativeAliases();
        buildISOString("toISOString");
        buildISOString("toJSON");
        setDateProperties()
    }
    date.extend({
        "create": function () {
            return createDate(arguments)
        },
        "now": function () {
            return (new date).getTime()
        },
        "setLocale": function (code, set) {
            var loc = getLocalization(code, false, set);
            if (loc) {
                Date["currentLocale"] = code;
                checkLocaleFormatsAdded(loc);
                return loc
            }
        },
        "getLocale": function (code) {
            return getLocalization(code, true)
        },
        "addFormat": function (format, match, locale, variant) {
            addDateInputFormat(format, match, locale, variant, "unshift")
        },
        "addOutputFormat": function (format) {
            DateOutputFormats.push(format)
        }
    }, false, false);
    date.extend({
        "set": function () {
            var args = collectDateArguments(arguments);
            return updateDate(this, args[0], args[1])
        },
        "setUTC": function () {
            var args = collectDateArguments(arguments);
            return updateDate(this, args[0], args[1], true)
        },
        "setWeekday": function (dow) {
            if (isUndefined(dow)) return;
            this.setDate(this.getDate() + dow - this.getDay())
        },
        "setUTCWeekday": function (dow) {
            if (isUndefined(dow)) return;
            this.setDate(this.getUTCDate() + dow - this.getDay())
        },
        "setWeek": function (week) {
            if (isUndefined(week)) return;
            var date = this.getDate();
            this.setMonth(0);
            this.setDate(week * 7 + 1)
        },
        "setUTCWeek": function (week) {
            if (isUndefined(week)) return;
            var date = this.getUTCDate();
            this.setMonth(0);
            this.setUTCDate(week * 7 + 1)
        },
        "getWeek": function () {
            return getWeekNumber(this)
        },
        "getUTCWeek": function () {
            return getWeekNumber(this.toUTC())
        },
        "getUTCOffset": function (iso) {
            var offset = this.utc ? 0 : this.getTimezoneOffset();
            var colon = iso === true ? ":" : "";
            if (!offset && iso) return "Z";
            return (-offset / 60).round().pad(2, true) + colon + (offset % 60).pad(2)
        },
        "toUTC": function () {
            if (this.utc) return this;
            var d = this.clone().addMinutes(this.getTimezoneOffset());
            d.utc = true;
            return d
        },
        "isUTC": function () {
            return this.utc || this.getTimezoneOffset() === 0
        },
        "advance": function (params) {
            var args = collectDateArguments(arguments);
            return updateDate(this, args[0], false, false, 1, true)
        },
        "rewind": function (params) {
            var args = collectDateArguments(arguments);
            return updateDate(this, args[0], false, false, -1)
        },
        "isValid": function () {
            return !isNaN(this.getTime())
        },
        "isAfter": function (d, margin) {
            return this.getTime() > date.create(d).getTime() - (margin || 0)
        },
        "isBefore": function (d, margin) {
            return this.getTime() < date.create(d).getTime() + (margin || 0)
        },
        "isBetween": function (d1, d2, buffer) {
            var t = this.getTime();
            var t1 = date.create(d1).getTime();
            var t2 = date.create(d2).getTime();
            var lo = Math.min(t1, t2);
            var hi = Math.max(t1, t2);
            buffer = buffer || 0;
            return lo - buffer < t && hi + buffer > t
        },
        "isLeapYear": function () {
            var year = this.getFullYear();
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0
        },
        "daysInMonth": function () {
            return 32 - (new date(this.getFullYear(), this.getMonth(), 32)).getDate()
        },
        "format": function (f, locale) {
            return formatDate(this, f, false, locale)
        },
        "relative": function (f, locale) {
            if (object.isString(f)) {
                locale = f;
                f = null
            }
            return formatDate(this, f, true, locale)
        },
        "is": function (d, margin) {
            var tmp;
            if (object.isString(d)) {
                d = d.trim().toLowerCase();
                switch (true) {
                case d === "future":
                    return this.getTime() > (new date).getTime();
                case d === "past":
                    return this.getTime() < (new date).getTime();
                case d === "weekday":
                    return this.getDay() > 0 && this.getDay() < 6;
                case d === "weekend":
                    return this.getDay() === 0 || this.getDay() === 6;
                case (tmp = English["weekdays"].indexOf(d) % 7) > -1:
                    return this.getDay() === tmp;
                case (tmp = English["months"].indexOf(d) % 12) > -1:
                    return this.getMonth() === tmp
                }
            }
            return compareDate(this, d, margin)
        },
        "resetTime": function () {
            return this.set({
                "hour": 0,
                "minute": 0,
                "second": 0,
                "millisecond": 0
            })
        },
        "clone": function () {
            return new date(this.getTime())
        }
    });
    date.extend({
        "iso": function () {
            return this.toISOString()
        },
        "getWeekday": date.prototype.getDay,
        "getUTCWeekday": date.prototype.getUTCDay
    });
    number.extend({
        "duration": function (code) {
            return Date.getLocale(code).duration(this)
        }
    });
    buildDate()
})(Streak);
(function () {
    var root = this;
    var breaker = {};
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;
    var push = ArrayProto.push,
        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        unshift = ArrayProto.unshift,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;
    var nativeForEach = ArrayProto.forEach,
        nativeMap = ArrayProto.map,
        nativeReduce = ArrayProto.reduce,
        nativeReduceRight = ArrayProto.reduceRight,
        nativeFilter = ArrayProto.filter,
        nativeEvery = ArrayProto.every,
        nativeSome = ArrayProto.some,
        nativeIndexOf = ArrayProto.indexOf,
        nativeLastIndexOf = ArrayProto.lastIndexOf,
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind;
    var _ = function (obj) {
            if (obj instanceof _) return obj;
            if (!(this instanceof _)) return new _(obj);
            this._wrapped = obj
        };
    root["_underscore"] = _;
    _.VERSION = "1.3.3";
    var each = _.each = _.forEach = function (obj, iterator, context) {
            if (obj == null) return;
            if (nativeForEach && obj.forEach === nativeForEach) obj.forEach(iterator, context);
            else if (obj.length === +obj.length) for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return
            } else for (var key in obj) if (_.has(obj, key)) if (iterator.call(context, obj[key], key, obj) === breaker) return
        };
    _.map = _.collect = function (obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function (value, index, list) {
            results[results.length] = iterator.call(context, value, index, list)
        });
        return results
    };
    _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator)
        }
        each(obj, function (value, index, list) {
            if (!initial) {
                memo = value;
                initial = true
            } else memo = iterator.call(context, memo, value, index, list)
        });
        if (!initial) throw new TypeError("Reduce of empty array with no initial value");
        return memo
    };
    _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator)
        }
        var reversed = _.toArray(obj).reverse();
        if (context && !initial) iterator = _.bind(iterator, context);
        return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator)
    };
    _.find = _.detect = function (obj, iterator, context) {
        var result;
        any(obj, function (value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true
            }
        });
        return result
    };
    _.filter = _.select = function (obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        each(obj, function (value, index, list) {
            if (iterator.call(context, value, index, list)) results[results.length] = value
        });
        return results
    };
    _.reject = function (obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        each(obj, function (value, index, list) {
            if (!iterator.call(context, value, index, list)) results[results.length] = value
        });
        return results
    };
    _.every = _.all = function (obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = true;
        if (obj == null) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
        each(obj, function (value, index, list) {
            if (!(result = result && iterator.call(context, value, index, list))) return breaker
        });
        return !!result
    };
    var any = _.some = _.any = function (obj, iterator, context) {
            iterator || (iterator = _.identity);
            var result = false;
            if (obj == null) return result;
            if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
            each(obj, function (value, index, list) {
                if (result || (result = iterator.call(context, value, index, list))) return breaker
            });
            return !!result
        };
    _.include = _.contains = function (obj, target) {
        var found = false;
        if (obj == null) return found;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
        found = any(obj, function (value) {
            return value === target
        });
        return found
    };
    _.invoke = function (obj, method) {
        var args = slice.call(arguments, 2);
        return _.map(obj, function (value) {
            return (_.isFunction(method) ? method : value[method]).apply(value, args)
        })
    };
    _.pluck = function (obj, key) {
        return _.map(obj, function (value) {
            return value[key]
        })
    };
    _.max = function (obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) return Math.max.apply(Math, obj);
        if (!iterator && _.isEmpty(obj)) return -Infinity;
        var result = {
            computed: -Infinity
        };
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed >= result.computed && (result = {
                value: value,
                computed: computed
            })
        });
        return result.value
    };
    _.min = function (obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) return Math.min.apply(Math, obj);
        if (!iterator && _.isEmpty(obj)) return Infinity;
        var result = {
            computed: Infinity
        };
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = {
                value: value,
                computed: computed
            })
        });
        return result.value
    };
    _.shuffle = function (obj) {
        var rand;
        var index = 0;
        var shuffled = [];
        each(obj, function (value) {
            rand = Math.floor(Math.random() * ++index);
            shuffled[index - 1] = shuffled[rand];
            shuffled[rand] = value
        });
        return shuffled
    };
    _.sortBy = function (obj, val, context) {
        var iterator = lookupIterator(obj, val);
        return _.pluck(_.map(obj, function (value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iterator.call(context, value, index, list)
            }
        }).sort(function (left, right) {
            var a = left.criteria,
                b = right.criteria;
            var ai = left.index,
                bi = right.index;
            if (a === b) return ai < bi ? -1 : 1;
            if (a === void 0) return 1;
            if (b === void 0) return -1;
            return a < b ? -1 : a > b ? 1 : ai < bi ? -1 : 1
        }), "value")
    };
    var lookupIterator = function (obj, val) {
            return _.isFunction(val) ? val : function (obj) {
                return obj[val]
            }
        };
    var group = function (obj, val, behavior) {
            var result = {};
            var iterator = lookupIterator(obj, val);
            each(obj, function (value, index) {
                var key = iterator(value, index);
                behavior(result, key, value)
            });
            return result
        };
    _.groupBy = function (obj, val) {
        return group(obj, val, function (result, key, value) {
            (result[key] || (result[key] = [])).push(value)
        })
    };
    _.countBy = function (obj, val) {
        return group(obj, val, function (result, key, value) {
            result[key] || (result[key] = 0);
            result[key]++
        })
    };
    _.sortedIndex = function (array, obj, iterator) {
        iterator || (iterator = _.identity);
        var value = iterator(obj);
        var low = 0,
            high = array.length;
        while (low < high) {
            var mid = low + high >> 1;
            iterator(array[mid]) < value ? low = mid + 1 : high = mid
        }
        return low
    };
    _.toArray = function (obj) {
        if (!obj) return [];
        if (obj.length === +obj.length) return slice.call(obj);
        return _.values(obj)
    };
    _.size = function (obj) {
        return obj.length === +obj.length ? obj.length : _.keys(obj).length
    };
    _.first = _.head = _.take = function (array, n, guard) {
        return n != null && !guard ? slice.call(array, 0, n) : array[0]
    };
    _.initial = function (array, n, guard) {
        return slice.call(array, 0, array.length - (n == null || guard ? 1 : n))
    };
    _.last = function (array, n, guard) {
        if (n != null && !guard) return slice.call(array, Math.max(array.length - n, 0));
        else return array[array.length - 1]
    };
    _.rest = _.tail = _.drop = function (array, n, guard) {
        return slice.call(array, n == null || guard ? 1 : n)
    };
    _.compact = function (array) {
        return _.filter(array, function (value) {
            return !!value
        })
    };
    var flatten = function (input, shallow, output) {
            each(input, function (value) {
                if (_.isArray(value)) shallow ? push.apply(output, value) : flatten(value, shallow, output);
                else output.push(value)
            });
            return output
        };
    _.flatten = function (array, shallow) {
        return flatten(array, shallow, [])
    };
    _.without = function (array) {
        return _.difference(array, slice.call(arguments, 1))
    };
    _.uniq = _.unique = function (array, isSorted, iterator) {
        var initial = iterator ? _.map(array, iterator) : array;
        var results = [];
        var seen = [];
        each(initial, function (value, index) {
            if (isSorted ? !index || seen[seen.length - 1] !== value : !_.include(seen, value)) {
                seen.push(value);
                results.push(array[index])
            }
        });
        return results
    };
    _.union = function () {
        return _.uniq(concat.apply(ArrayProto, arguments))
    };
    _.intersection = function (array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function (item) {
            return _.every(rest, function (other) {
                return _.indexOf(other, item) >= 0
            })
        })
    };
    _.difference = function (array) {
        var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
        return _.filter(array, function (value) {
            return !_.include(rest, value)
        })
    };
    _.zip = function () {
        var args = slice.call(arguments);
        var length = _.max(_.pluck(args, "length"));
        var results = new Array(length);
        for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
        return results
    };
    _.object = function (list, values) {
        var result = {};
        for (var i = 0, l = list.length; i < l; i++) if (values) result[list[i]] = values[i];
        else result[list[i][0]] = list[i][1];
        return result
    };
    _.indexOf = function (array, item, isSorted) {
        if (array == null) return -1;
        var i, l;
        if (isSorted) {
            i = _.sortedIndex(array, item);
            return array[i] === item ? i : -1
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
        for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
        return -1
    };
    _.lastIndexOf = function (array, item) {
        if (array == null) return -1;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
        var i = array.length;
        while (i--) if (array[i] === item) return i;
        return -1
    };
    _.range = function (start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0
        }
        step = arguments[2] || 1;
        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);
        while (idx < len) {
            range[idx++] = start;
            start += step
        }
        return range
    };
    var ctor = function () {};
    _.bind = function bind(func, context) {
        var bound, args;
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func)) throw new TypeError;
        args = slice.call(arguments, 2);
        return bound = function () {
            if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
            ctor.prototype = func.prototype;
            var self = new ctor;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) return result;
            return self
        }
    };
    _.bindAll = function (obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length == 0) funcs = _.functions(obj);
        each(funcs, function (f) {
            obj[f] = _.bind(obj[f], obj)
        });
        return obj
    };
    _.memoize = function (func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function () {
            var key = hasher.apply(this, arguments);
            return _.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments)
        }
    };
    _.delay = function (func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function () {
            return func.apply(null, args)
        }, wait)
    };
    _.defer = function (func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)))
    };
    _.throttle = function (func, wait) {
        var context, args, timeout, throttling, more, result;
        var whenDone = _.debounce(function () {
            more = throttling = false
        }, wait);
        return function () {
            context = this;
            args = arguments;
            var later = function () {
                    timeout = null;
                    if (more) result = func.apply(context, args);
                    whenDone()
                };
            if (!timeout) timeout = setTimeout(later, wait);
            if (throttling) more = true;
            else {
                throttling = true;
                result = func.apply(context, args)
            }
            whenDone();
            return result
        }
    };
    _.debounce = function (func, wait, immediate) {
        var timeout, result;
        return function () {
            var context = this,
                args = arguments;
            var later = function () {
                    timeout = null;
                    if (!immediate) result = func.apply(context, args)
                };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(context, args);
            return result
        }
    };
    _.once = function (func) {
        var ran = false,
            memo;
        return function () {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo
        }
    };
    _.wrap = function (func, wrapper) {
        return function () {
            var args = [func];
            push.apply(args, arguments);
            return wrapper.apply(this, args)
        }
    };
    _.compose = function () {
        var funcs = arguments;
        return function () {
            var args = arguments;
            for (var i = funcs.length - 1; i >= 0; i--) args = [funcs[i].apply(this, args)];
            return args[0]
        }
    };
    _.after = function (times, func) {
        if (times <= 0) return func();
        return function () {
            if (--times < 1) return func.apply(this, arguments)
        }
    };
    _.keys = nativeKeys ||
    function (obj) {
        if (obj !== Object(obj)) throw new TypeError("Invalid object");
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
        return keys
    };
    _.values = function (obj) {
        return _.map(obj, _.identity)
    };
    _.pairs = function (obj) {
        return _.map(obj, function (value, key) {
            return [key, value]
        })
    };
    _.invert = function (obj) {
        return _.reduce(obj, function (memo, value, key) {
            memo[value] = key;
            return memo
        }, {})
    };
    _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) if (_.isFunction(obj[key])) names.push(key);
        return names.sort()
    };
    _.extend = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            for (var prop in source) obj[prop] = source[prop]
        });
        return obj
    };
    _.pick = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        each(keys, function (key) {
            if (key in obj) copy[key] = obj[key]
        });
        return copy
    };
    _.omit = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        for (var key in obj) if (!_.include(keys, key)) copy[key] = obj[key];
        return copy
    };
    _.defaults = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            for (var prop in source) if (obj[prop] == null) obj[prop] = source[prop]
        });
        return obj
    };
    _.clone = function (obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
    };
    _.tap = function (obj, interceptor) {
        interceptor(obj);
        return obj
    };
    var eq = function (a, b, aStack, bStack) {
            if (a === b) return a !== 0 || 1 / a == 1 / b;
            if (a == null || b == null) return a === b;
            if (a instanceof _) a = a._wrapped;
            if (b instanceof _) b = b._wrapped;
            var className = toString.call(a);
            if (className != toString.call(b)) return false;
            switch (className) {
            case "[object String]":
                return a == String(b);
            case "[object Number]":
                return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
            case "[object Date]":
            case "[object Boolean]":
                return +a == +b;
            case "[object RegExp]":
                return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase
            }
            if (typeof a != "object" || typeof b != "object") return false;
            var length = aStack.length;
            while (length--) if (aStack[length] == a) return bStack[length] == b;
            aStack.push(a);
            bStack.push(b);
            var size = 0,
                result = true;
            if (className == "[object Array]") {
                size = a.length;
                result = size == b.length;
                if (result) while (size--) if (!(result = eq(a[size], b[size], aStack, bStack))) break
            } else {
                if ("constructor" in a != "constructor" in b || a.constructor != b.constructor) return false;
                for (var key in a) if (_.has(a, key)) {
                    size++;
                    if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break
                }
                if (result) {
                    for (key in b) if (_.has(b, key) && !size--) break;
                    result = !size
                }
            }
            aStack.pop();
            bStack.pop();
            return result
        };
    _.isEqual = function (a, b) {
        return eq(a, b, [], [])
    };
    _.isEmpty = function (obj) {
        if (obj == null) return true;
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj) if (_.has(obj, key)) return false;
        return true
    };
    _.isElement = function (obj) {
        return !!(obj && obj.nodeType == 1)
    };
    _.isArray = nativeIsArray ||
    function (obj) {
        return toString.call(obj) == "[object Array]"
    };
    _.isObject = function (obj) {
        return obj === Object(obj)
    };
    each(["Arguments", "Function", "String", "Number", "Date", "RegExp"], function (name) {
        _["is" + name] = function (obj) {
            return toString.call(obj) == "[object " + name + "]"
        }
    });
    if (!_.isArguments(arguments)) _.isArguments = function (obj) {
        return !!(obj && _.has(obj, "callee"))
    };
    _.isFinite = function (obj) {
        return _.isNumber(obj) && isFinite(obj)
    };
    _.isNaN = function (obj) {
        return _.isNumber(obj) && obj != +obj
    };
    _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) == "[object Boolean]"
    };
    _.isNull = function (obj) {
        return obj === null
    };
    _.isUndefined = function (obj) {
        return obj === void 0
    };
    _.has = function (obj, key) {
        return hasOwnProperty.call(obj, key)
    };
    _.identity = function (value) {
        return value
    };
    _.times = function (n, iterator, context) {
        for (var i = 0; i < n; i++) iterator.call(context, i)
    };
    _.random = function (min, max) {
        return min + (0 | Math.random() * (max - min + 1))
    };
    var entityMap = {
        escape: {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "/": "&#x2F;"
        }
    };
    entityMap.unescape = _.invert(entityMap.escape);
    var entityRegexes = {
        escape: new RegExp("[" + _.keys(entityMap.escape).join("") + "]", "g"),
        unescape: new RegExp("(" + _.keys(entityMap.unescape).join("|") + ")", "g")
    };
    _.each(["escape", "unescape"], function (method) {
        _[method] = function (string) {
            if (string == null) return "";
            return ("" + string).replace(entityRegexes[method], function (match) {
                return entityMap[method][match]
            })
        }
    });
    _.result = function (object, property) {
        if (object == null) return null;
        var value = object[property];
        return _.isFunction(value) ? value.call(object) : value
    };
    _.mixin = function (obj) {
        each(_.functions(obj), function (name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function () {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result.call(this, func.apply(_, args))
            }
        })
    };
    var idCounter = 0;
    _.uniqueId = function (prefix) {
        var id = idCounter++;
        return prefix ? prefix + id : id
    };
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    var noMatch = /.^/;
    var escapes = {
        "\\": "\\",
        "'": "'",
        r: "\r",
        n: "\n",
        t: "\t",
        u2028: "\u2028",
        u2029: "\u2029"
    };
    for (var key in escapes) escapes[escapes[key]] = key;
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;
    var unescape = function (code) {
            return code.replace(unescaper, function (match, escape) {
                return escapes[escape]
            })
        };
    _.template = function (text, data, settings) {
        settings = _.defaults({}, settings, _.templateSettings);
        var source = "__p+='" + text.replace(escaper, function (match) {
            return "\\" + escapes[match]
        }).replace(settings.escape || noMatch, function (match, code) {
            return "'+\n((__t=(" + unescape(code) + "))==null?'':_.escape(__t))+\n'"
        }).replace(settings.interpolate || noMatch, function (match, code) {
            return "'+\n((__t=(" + unescape(code) + "))==null?'':__t)+\n'"
        }).replace(settings.evaluate || noMatch, function (match, code) {
            return "';\n" + unescape(code) + "\n__p+='"
        }) + "';\n";
        if (!settings.variable) source = "with(obj||{}){\n" + source + "}\n";
        source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
        try {
            var render = new Function(settings.variable || "obj", "_", source)
        } catch (e) {
            e.source = source;
            throw e;
        }
        if (data) return render(data, _);
        var template = function (data) {
                return render.call(this, data, _)
            };
        template.source = "function(" + (settings.variable || "obj") + "){\n" + source + "}";
        return template
    };
    _.chain = function (obj) {
        return _(obj).chain()
    };
    var result = function (obj) {
            return this._chain ? _(obj).chain() : obj
        };
    _.mixin(_);
    each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name == "shift" || name == "splice") && obj.length === 0) delete obj[0];
            return result.call(this, obj)
        }
    });
    each(["concat", "join", "slice"], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            return result.call(this, method.apply(this._wrapped, arguments))
        }
    });
    _.extend(_.prototype, {
        chain: function () {
            this._chain = true;
            return this
        },
        value: function () {
            return this._wrapped
        }
    })
}).call(Streak);
Streak._ = Streak._underscore;
delete Streak._underscore;
(function (Streak, window) {
    var _ = Streak._;
    var Eventer = function () {
            var eventCBs = {},
                _isReady = false,
                _unReady = false,
                _readyFuncs = [],
                _readyFuncMap = {},
                _isLoaded = false,
                _loadedFuncs = [],
                _loadedFuncMap = {},
                _triggerActive = true,
                isReady = function () {
                    return _isReady
                },
                unReady = function () {
                    _isReady = false;
                    _unReady = true
                },
                ready = function (cb, id) {
                    if (_unReady) return;
                    if (_isReady) cb();
                    else if (id) {
                        var oldCB = _readyFuncMap[id];
                        if (oldCB) _readyFuncs[_readyFuncs.indexOf(oldCB)] = cb;
                        else _readyFuncs.push(cb);
                        _readyFuncMap[id] = cb
                    } else _readyFuncs.push(cb)
                },
                _runReady = function () {
                    _isReady = true;
                    _unReady = false;
                    for (var i = 0; _readyFuncs[i]; i++) _readyFuncs[i]();
                    _readyFuncs = []
                },
                isLoaded = function () {
                    return _isLoaded
                },
                onLoad = function (cb, id) {
                    if (_isLoaded) cb();
                    else if (id) {
                        var oldCB = _loadedFuncMap[id];
                        if (oldCB) _loadedFuncs[_loadedFuncs.indexOf(oldCB)] = cb;
                        else _loadedFuncs.push(cb);
                        _loadedFuncMap[id] = cb
                    } else _loadedFuncs.push(cb)
                },
                _runLoad = function () {
                    _isLoaded = true;
                    for (var i = 0; _loadedFuncs[i]; i++) _loadedFuncs[i]();
                    _loadedFuncs = []
                },
                bind = function (event, cb) {
                    if (!eventCBs[event]) eventCBs[event] = [];
                    eventCBs[event].push(cb)
                },
                unbind = function (event, cb) {
                    if (eventCBs[event] && eventCBs[event].length > 0) eventCBs[event].removeVal(cb)
                },
                trigger = function (event) {
                    if (event === "ready") _runReady();
                    if (event === "load") _runLoad();
                    if (_triggerActive) if (eventCBs[event]) {
                        var args = _.toArray(arguments).slice(1);
                        var cbs = _.clone(eventCBs[event]);
                        eventCBs[event].length = 0;
                        for (var i = 0; i < cbs.length; i++) try {
                            var cb = cbs[i];
                            if (cb) if (!cb.apply(this, args)) eventCBs[event].push(cb)
                        } catch (err) {
                            var msg = "Error in event";
                            msg += "\n event: " + event;
                            Streak.BentoBox.logError(msg, err)
                        }
                    }
                },
                toggleTriggerState = function (state) {
                    if (state) _triggerActive = state;
                    else _triggerActive = !_triggerActive
                };
            return {
                isReady: isReady,
                unReady: unReady,
                ready: ready,
                isLoaded: isLoaded,
                onLoad: onLoad,
                bind: bind,
                trigger: trigger,
                toggleTriggerState: toggleTriggerState
            }
        };
    Eventer.create = function (obj) {
        if (!obj) obj = {};
        var eve = new Eventer;
        _.extend(eve, obj);
        return eve
    };
    Streak.Eventer = Eventer
})(Streak, window);
(function (window, Streak, undefined) {
    var document = window.document,
        navigator = window.navigator,
        location = window.location;
    var jQuery = function () {
            var jQuery = function (selector, context) {
                    return new jQuery.fn.init(selector, context, rootjQuery)
                },
                _jQuery = window.jQuery,
                _$ = window.$,
                rootjQuery, quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
                rnotwhite = /\S/,
                trimLeft = /^\s+/,
                trimRight = /\s+$/,
                rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
                rvalidchars = /^[\],:{}\s]*$/,
                rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
                rwebkit = /(webkit)[ \/]([\w.]+)/,
                ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
                rmsie = /(msie) ([\w.]+)/,
                rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
                rdashAlpha = /-([a-z]|[0-9])/ig,
                rmsPrefix = /^-ms-/,
                fcamelCase = function (all, letter) {
                    return (letter + "").toUpperCase()
                },
                userAgent = navigator.userAgent,
                browserMatch, readyList, DOMContentLoaded, toString = Object.prototype.toString,
                hasOwn = Object.prototype.hasOwnProperty,
                push = Array.prototype.push,
                slice = Array.prototype.slice,
                trim = String.prototype.trim,
                indexOf = Array.prototype.indexOf,
                class2type = {};
            jQuery.fn = jQuery.prototype = {
                constructor: jQuery,
                init: function (selector, context, rootjQuery) {
                    var match, elem, ret, doc;
                    if (!selector) return this;
                    if (selector.nodeType) {
                        this.context = this[0] = selector;
                        this.length = 1;
                        return this
                    }
                    if (selector === "body" && !context && document.body) {
                        this.context = document;
                        this[0] = document.body;
                        this.selector = selector;
                        this.length = 1;
                        return this
                    }
                    if (typeof selector === "string") {
                        if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) match = [null, selector, null];
                        else match = quickExpr.exec(selector);
                        if (match && (match[1] || !context)) if (match[1]) {
                            context = context instanceof jQuery ? context[0] : context;
                            doc = context ? context.ownerDocument || context : document;
                            ret = rsingleTag.exec(selector);
                            if (ret) if (jQuery.isPlainObject(context)) {
                                selector = [document.createElement(ret[1])];
                                jQuery.fn.attr.call(selector, context, true)
                            } else selector = [doc.createElement(ret[1])];
                            else {
                                ret = jQuery.buildFragment([match[1]], [doc]);
                                selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes
                            }
                            return jQuery.merge(this, selector)
                        } else {
                            elem = document.getElementById(match[2]);
                            if (elem && elem.parentNode) {
                                if (elem.id !== match[2]) return rootjQuery.find(selector);
                                this.length = 1;
                                this[0] = elem
                            }
                            this.context = document;
                            this.selector = selector;
                            return this
                        } else if (!context || context.jquery) return (context || rootjQuery).find(selector);
                        else return this.constructor(context).find(selector)
                    } else if (jQuery.isFunction(selector)) return rootjQuery.ready(selector);
                    if (selector.selector !== undefined) {
                        this.selector = selector.selector;
                        this.context = selector.context
                    }
                    return jQuery.makeArray(selector, this)
                },
                selector: "",
                jquery: "1.7.1",
                length: 0,
                size: function () {
                    return this.length
                },
                toArray: function () {
                    return slice.call(this, 0)
                },
                get: function (num) {
                    return num == null ? this.toArray() : num < 0 ? this[this.length + num] : this[num]
                },
                pushStack: function (elems, name, selector) {
                    var ret = this.constructor();
                    if (jQuery.isArray(elems)) push.apply(ret, elems);
                    else jQuery.merge(ret, elems);
                    ret.prevObject = this;
                    ret.context = this.context;
                    if (name === "find") ret.selector = this.selector + (this.selector ? " " : "") + selector;
                    else if (name) ret.selector = this.selector + "." + name + "(" + selector + ")";
                    return ret
                },
                each: function (callback, args) {
                    return jQuery.each(this, callback, args)
                },
                ready: function (fn) {
                    jQuery.bindReady();
                    readyList.add(fn);
                    return this
                },
                eq: function (i) {
                    i = +i;
                    return i === -1 ? this.slice(i) : this.slice(i, i + 1)
                },
                first: function () {
                    return this.eq(0)
                },
                last: function () {
                    return this.eq(-1)
                },
                slice: function () {
                    return this.pushStack(slice.apply(this, arguments), "slice", slice.call(arguments).join(","))
                },
                map: function (callback) {
                    return this.pushStack(jQuery.map(this, function (elem, i) {
                        return callback.call(elem, i, elem)
                    }))
                },
                end: function () {
                    return this.prevObject || this.constructor(null)
                },
                push: push,
                sort: [].sort,
                splice: [].splice
            };
            jQuery.fn.init.prototype = jQuery.fn;
            jQuery.extend = jQuery.fn.extend = function () {
                var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = false;
                if (typeof target === "boolean") {
                    deep = target;
                    target = arguments[1] || {};
                    i = 2
                }
                if (typeof target !== "object" && !jQuery.isFunction(target)) target = {};
                if (length === i) {
                    target = this;
                    --i
                }
                for (; i < length; i++) if ((options = arguments[i]) != null) for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) continue;
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : []
                        } else clone = src && jQuery.isPlainObject(src) ? src : {};
                        target[name] = jQuery.extend(deep, clone, copy)
                    } else if (copy !== undefined) target[name] = copy
                }
                return target
            };
            jQuery.extend({
                noConflict: function (deep) {
                    if (window.$ === jQuery) window.$ = _$;
                    if (deep && window.jQuery === jQuery) window.jQuery = _jQuery;
                    return jQuery
                },
                isReady: false,
                readyWait: 1,
                holdReady: function (hold) {
                    if (hold) jQuery.readyWait++;
                    else jQuery.ready(true)
                },
                ready: function (wait) {
                    if (wait === true && !--jQuery.readyWait || wait !== true && !jQuery.isReady) {
                        if (!document.body) return setTimeout(jQuery.ready, 1);
                        jQuery.isReady = true;
                        if (wait !== true && --jQuery.readyWait > 0) return;
                        readyList.fireWith(document, [jQuery]);
                        if (jQuery.fn.trigger) jQuery(document).trigger("ready").off("ready")
                    }
                },
                bindReady: function () {
                    if (readyList) return;
                    readyList = jQuery.Callbacks("once memory");
                    if (document.readyState === "complete") return setTimeout(jQuery.ready, 1);
                    if (document.addEventListener) {
                        document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
                        window.addEventListener("load", jQuery.ready, false)
                    } else if (document.attachEvent) {
                        document.attachEvent("onreadystatechange", DOMContentLoaded);
                        window.attachEvent("onload", jQuery.ready);
                        var toplevel = false;
                        try {
                            toplevel = window.frameElement == null
                        } catch (e) {}
                        if (document.documentElement.doScroll && toplevel) doScrollCheck()
                    }
                },
                isFunction: function (obj) {
                    return jQuery.type(obj) === "function"
                },
                isArray: Array.isArray ||
                function (obj) {
                    return jQuery.type(obj) === "array"
                },
                isWindow: function (obj) {
                    return obj && typeof obj === "object" && "setInterval" in obj
                },
                isNumeric: function (obj) {
                    return !isNaN(parseFloat(obj)) && isFinite(obj)
                },
                type: function (obj) {
                    return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
                },
                isPlainObject: function (obj) {
                    if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) return false;
                    try {
                        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) return false
                    } catch (e) {
                        return false
                    }
                    var key;
                    for (key in obj);
                    return key === undefined || hasOwn.call(obj, key)
                },
                isEmptyObject: function (obj) {
                    for (var name in obj) return false;
                    return true
                },
                error: function (msg) {
                    throw new Error(msg);
                },
                parseJSON: function (data) {
                    if (typeof data !== "string" || !data) return null;
                    data = jQuery.trim(data);
                    if (window.JSON && window.JSON.parse) return window.JSON.parse(data);
                    if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) return (new Function("return " + data))();
                    jQuery.error("Invalid JSON: " + data)
                },
                parseXML: function (data) {
                    var xml, tmp;
                    try {
                        if (window.DOMParser) {
                            tmp = new DOMParser;
                            xml = tmp.parseFromString(data, "text/xml")
                        } else {
                            xml = new ActiveXObject("Microsoft.XMLDOM");
                            xml.async = "false";
                            xml.loadXML(data)
                        }
                    } catch (e) {
                        xml = undefined
                    }
                    if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) jQuery.error("Invalid XML: " + data);
                    return xml
                },
                noop: function () {},
                globalEval: function (data) {
                    if (data && rnotwhite.test(data))(window.execScript ||
                    function (data) {
                        window["eval"].call(window, data)
                    })(data)
                },
                camelCase: function (string) {
                    return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase)
                },
                nodeName: function (elem, name) {
                    return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase()
                },
                each: function (object, callback, args) {
                    var name, i = 0,
                        length = object.length,
                        isObj = length === undefined || jQuery.isFunction(object);
                    if (args) if (isObj) for (name in object) {
                        if (callback.apply(object[name], args) === false) break
                    } else for (; i < length;) {
                        if (callback.apply(object[i++], args) === false) break
                    } else if (isObj) for (name in object) {
                        if (callback.call(object[name], name, object[name]) === false) break
                    } else for (; i < length;) if (callback.call(object[i], i, object[i++]) === false) break;
                    return object
                },
                trim: trim ?
                function (text) {
                    return text == null ? "" : trim.call(text)
                } : function (text) {
                    return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, "")
                },
                makeArray: function (array, results) {
                    var ret = results || [];
                    if (array != null) {
                        var type = jQuery.type(array);
                        if (array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow(array)) push.call(ret, array);
                        else jQuery.merge(ret, array)
                    }
                    return ret
                },
                inArray: function (elem, array, i) {
                    var len;
                    if (array) {
                        if (indexOf) return indexOf.call(array, elem, i);
                        len = array.length;
                        i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
                        for (; i < len; i++) if (i in array && array[i] === elem) return i
                    }
                    return -1
                },
                merge: function (first, second) {
                    var i = first.length,
                        j = 0;
                    if (typeof second.length === "number") for (var l = second.length; j < l; j++) first[i++] = second[j];
                    else while (second[j] !== undefined) first[i++] = second[j++];
                    first.length = i;
                    return first
                },
                grep: function (elems, callback, inv) {
                    var ret = [],
                        retVal;
                    inv = !! inv;
                    for (var i = 0, length = elems.length; i < length; i++) {
                        retVal = !! callback(elems[i], i);
                        if (inv !== retVal) ret.push(elems[i])
                    }
                    return ret
                },
                map: function (elems, callback, arg) {
                    var value, key, ret = [],
                        i = 0,
                        length = elems.length,
                        isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && (length > 0 && elems[0] && elems[length - 1] || length === 0 || jQuery.isArray(elems));
                    if (isArray) for (; i < length; i++) {
                        value = callback(elems[i], i, arg);
                        if (value != null) ret[ret.length] = value
                    } else for (key in elems) {
                        value = callback(elems[key], key, arg);
                        if (value != null) ret[ret.length] = value
                    }
                    return ret.concat.apply([], ret)
                },
                guid: 1,
                proxy: function (fn, context) {
                    if (typeof context === "string") {
                        var tmp = fn[context];
                        context = fn;
                        fn = tmp
                    }
                    if (!jQuery.isFunction(fn)) return undefined;
                    var args = slice.call(arguments, 2),
                        proxy = function () {
                            return fn.apply(context, args.concat(slice.call(arguments)))
                        };
                    proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
                    return proxy
                },
                access: function (elems, key, value, exec, fn, pass) {
                    var length = elems.length;
                    if (typeof key === "object") {
                        for (var k in key) jQuery.access(elems, k, key[k], exec, fn, value);
                        return elems
                    }
                    if (value !== undefined) {
                        exec = !pass && exec && jQuery.isFunction(value);
                        for (var i = 0; i < length; i++) fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
                        return elems
                    }
                    return length ? fn(elems[0], key) : undefined
                },
                now: function () {
                    return (new Date).getTime()
                },
                uaMatch: function (ua) {
                    ua = ua.toLowerCase();
                    var match = rwebkit.exec(ua) || ropera.exec(ua) || rmsie.exec(ua) || ua.indexOf("compatible") < 0 && rmozilla.exec(ua) || [];
                    return {
                        browser: match[1] || "",
                        version: match[2] || "0"
                    }
                },
                sub: function () {
                    function jQuerySub(selector, context) {
                        return new jQuerySub.fn.init(selector, context)
                    }
                    jQuery.extend(true, jQuerySub, this);
                    jQuerySub.superclass = this;
                    jQuerySub.fn = jQuerySub.prototype = this();
                    jQuerySub.fn.constructor = jQuerySub;
                    jQuerySub.sub = this.sub;
                    jQuerySub.fn.init = function init(selector, context) {
                        if (context && context instanceof jQuery && !(context instanceof jQuerySub)) context = jQuerySub(context);
                        return jQuery.fn.init.call(this, selector, context, rootjQuerySub)
                    };
                    jQuerySub.fn.init.prototype = jQuerySub.fn;
                    var rootjQuerySub = jQuerySub(document);
                    return jQuerySub
                },
                browser: {}
            });
            jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
                class2type["[object " + name + "]"] = name.toLowerCase()
            });
            browserMatch = jQuery.uaMatch(userAgent);
            if (browserMatch.browser) {
                jQuery.browser[browserMatch.browser] = true;
                jQuery.browser.version = browserMatch.version
            }
            if (jQuery.browser.webkit) jQuery.browser.safari = true;
            if (rnotwhite.test("\u00a0")) {
                trimLeft = /^[\s\xA0]+/;
                trimRight = /[\s\xA0]+$/
            }
            rootjQuery = jQuery(document);
            if (document.addEventListener) DOMContentLoaded = function () {
                document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                jQuery.ready()
            };
            else if (document.attachEvent) DOMContentLoaded = function () {
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    jQuery.ready()
                }
            };

            function doScrollCheck() {
                if (jQuery.isReady) return;
                try {
                    document.documentElement.doScroll("left")
                } catch (e) {
                    setTimeout(doScrollCheck, 1);
                    return
                }
                jQuery.ready()
            }
            return jQuery
        }();
    var flagsCache = {};

    function createFlags(flags) {
        var object = flagsCache[flags] = {},
            i, length;
        flags = flags.split(/\s+/);
        for (i = 0, length = flags.length; i < length; i++) object[flags[i]] = true;
        return object
    }
    jQuery.Callbacks = function (flags) {
        flags = flags ? flagsCache[flags] || createFlags(flags) : {};
        var list = [],
            stack = [],
            memory, firing, firingStart, firingLength, firingIndex, add = function (args) {
                var i, length, elem, type, actual;
                for (i = 0, length = args.length; i < length; i++) {
                    elem = args[i];
                    type = jQuery.type(elem);
                    if (type === "array") add(elem);
                    else if (type === "function") if (!flags.unique || !self.has(elem)) list.push(elem)
                }
            },
            fire = function (context, args) {
                args = args || [];
                memory = !flags.memory || [context, args];
                firing = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                for (; list && firingIndex < firingLength; firingIndex++) if (list[firingIndex].apply(context, args) === false && flags.stopOnFalse) {
                    memory = true;
                    break
                }
                firing = false;
                if (list) if (!flags.once) {
                    if (stack && stack.length) {
                        memory = stack.shift();
                        self.fireWith(memory[0], memory[1])
                    }
                } else if (memory === true) self.disable();
                else list = []
            },
            self = {
                add: function () {
                    if (list) {
                        var length = list.length;
                        add(arguments);
                        if (firing) firingLength = list.length;
                        else if (memory && memory !== true) {
                            firingStart = length;
                            fire(memory[0], memory[1])
                        }
                    }
                    return this
                },
                remove: function () {
                    if (list) {
                        var args = arguments,
                            argIndex = 0,
                            argLength = args.length;
                        for (; argIndex < argLength; argIndex++) for (var i = 0; i < list.length; i++) if (args[argIndex] === list[i]) {
                            if (firing) if (i <= firingLength) {
                                firingLength--;
                                if (i <= firingIndex) firingIndex--
                            }
                            list.splice(i--, 1);
                            if (flags.unique) break
                        }
                    }
                    return this
                },
                has: function (fn) {
                    if (list) {
                        var i = 0,
                            length = list.length;
                        for (; i < length; i++) if (fn === list[i]) return true
                    }
                    return false
                },
                empty: function () {
                    list = [];
                    return this
                },
                disable: function () {
                    list = stack = memory = undefined;
                    return this
                },
                disabled: function () {
                    return !list
                },
                lock: function () {
                    stack = undefined;
                    if (!memory || memory === true) self.disable();
                    return this
                },
                locked: function () {
                    return !stack
                },
                fireWith: function (context, args) {
                    if (stack) if (firing) {
                        if (!flags.once) stack.push([context, args])
                    } else if (!(flags.once && memory)) fire(context, args);
                    return this
                },
                fire: function () {
                    self.fireWith(this, arguments);
                    return this
                },
                fired: function () {
                    return !!memory
                }
            };
        return self
    };
    var sliceDeferred = [].slice;
    jQuery.extend({
        Deferred: function (func) {
            var doneList = jQuery.Callbacks("once memory"),
                failList = jQuery.Callbacks("once memory"),
                progressList = jQuery.Callbacks("memory"),
                state = "pending",
                lists = {
                    resolve: doneList,
                    reject: failList,
                    notify: progressList
                },
                promise = {
                    done: doneList.add,
                    fail: failList.add,
                    progress: progressList.add,
                    state: function () {
                        return state
                    },
                    isResolved: doneList.fired,
                    isRejected: failList.fired,
                    then: function (doneCallbacks, failCallbacks, progressCallbacks) {
                        deferred.done(doneCallbacks).fail(failCallbacks).progress(progressCallbacks);
                        return this
                    },
                    always: function () {
                        deferred.done.apply(deferred, arguments).fail.apply(deferred, arguments);
                        return this
                    },
                    pipe: function (fnDone, fnFail, fnProgress) {
                        return jQuery.Deferred(function (newDefer) {
                            jQuery.each({
                                done: [fnDone, "resolve"],
                                fail: [fnFail, "reject"],
                                progress: [fnProgress, "notify"]
                            }, function (handler, data) {
                                var fn = data[0],
                                    action = data[1],
                                    returned;
                                if (jQuery.isFunction(fn)) deferred[handler](function () {
                                    returned = fn.apply(this, arguments);
                                    if (returned && jQuery.isFunction(returned.promise)) returned.promise().then(newDefer.resolve, newDefer.reject, newDefer.notify);
                                    else newDefer[action + "With"](this === deferred ? newDefer : this, [returned])
                                });
                                else deferred[handler](newDefer[action])
                            })
                        }).promise()
                    },
                    promise: function (obj) {
                        if (obj == null) obj = promise;
                        else for (var key in promise) obj[key] = promise[key];
                        return obj
                    }
                },
                deferred = promise.promise({}),
                key;
            for (key in lists) {
                deferred[key] = lists[key].fire;
                deferred[key + "With"] = lists[key].fireWith
            }
            deferred.done(function () {
                state = "resolved"
            }, failList.disable, progressList.lock).fail(function () {
                state = "rejected"
            }, doneList.disable, progressList.lock);
            if (func) func.call(deferred, deferred);
            return deferred
        },
        when: function (firstParam) {
            var args = sliceDeferred.call(arguments, 0),
                i = 0,
                length = args.length,
                pValues = new Array(length),
                count = length,
                pCount = length,
                deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise) ? firstParam : jQuery.Deferred(),
                promise = deferred.promise();

            function resolveFunc(i) {
                return function (value) {
                    args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                    if (!--count) deferred.resolveWith(deferred, args)
                }
            }
            function progressFunc(i) {
                return function (value) {
                    pValues[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                    deferred.notifyWith(promise, pValues)
                }
            }
            if (length > 1) {
                for (; i < length; i++) if (args[i] && args[i].promise && jQuery.isFunction(args[i].promise)) args[i].promise().then(resolveFunc(i), deferred.reject, progressFunc(i));
                else--count;
                if (!count) deferred.resolveWith(deferred, args)
            } else if (deferred !== firstParam) deferred.resolveWith(deferred, length ? [firstParam] : []);
            return promise
        }
    });
    jQuery.support = function () {
        var support, all, a, select, opt, input, marginDiv, fragment, tds, events, eventName, i, isSupported, div = document.createElement("div"),
            documentElement = document.documentElement;
        div.setAttribute("className", "t");
        div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
        all = div.getElementsByTagName("*");
        a = div.getElementsByTagName("a")[0];
        if (!all || !all.length || !a) return {};
        select = document.createElement("select");
        opt = select.appendChild(document.createElement("option"));
        input = div.getElementsByTagName("input")[0];
        support = {
            leadingWhitespace: div.firstChild.nodeType === 3,
            tbody: !div.getElementsByTagName("tbody").length,
            htmlSerialize: !! div.getElementsByTagName("link").length,
            style: /top/.test(a.getAttribute("style")),
            hrefNormalized: a.getAttribute("href") === "/a",
            opacity: /^0.55/.test(a.style.opacity),
            cssFloat: !! a.style.cssFloat,
            checkOn: input.value === "on",
            optSelected: opt.selected,
            getSetAttribute: div.className !== "t",
            enctype: !! document.createElement("form").enctype,
            html5Clone: document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>",
            submitBubbles: true,
            changeBubbles: true,
            focusinBubbles: false,
            deleteExpando: true,
            noCloneEvent: true,
            inlineBlockNeedsLayout: false,
            shrinkWrapBlocks: false,
            reliableMarginRight: true
        };
        input.checked = true;
        support.noCloneChecked = input.cloneNode(true).checked;
        select.disabled = true;
        support.optDisabled = !opt.disabled;
        try {
            delete div.test
        } catch (e) {
            support.deleteExpando = false
        }
        if (!div.addEventListener && div.attachEvent && div.fireEvent) {
            div.attachEvent("onclick", function () {
                support.noCloneEvent = false
            });
            div.cloneNode(true).fireEvent("onclick")
        }
        input = document.createElement("input");
        input.value = "t";
        input.setAttribute("type", "radio");
        support.radioValue = input.value === "t";
        input.setAttribute("checked", "checked");
        div.appendChild(input);
        fragment = document.createDocumentFragment();
        fragment.appendChild(div.lastChild);
        support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;
        support.appendChecked = input.checked;
        fragment.removeChild(input);
        fragment.appendChild(div);
        div.innerHTML = "";
        if (window.getComputedStyle) {
            marginDiv = document.createElement("div");
            marginDiv.style.width = "0";
            marginDiv.style.marginRight = "0";
            div.style.width = "2px";
            div.appendChild(marginDiv);
            support.reliableMarginRight = (parseInt((window.getComputedStyle(marginDiv, null) || {
                marginRight: 0
            }).marginRight, 10) || 0) === 0
        }
        if (div.attachEvent) for (i in {
            submit: 1,
            change: 1,
            focusin: 1
        }) {
            eventName = "on" + i;
            isSupported = eventName in div;
            if (!isSupported) {
                div.setAttribute(eventName, "return;");
                isSupported = typeof div[eventName] === "function"
            }
            support[i + "Bubbles"] = isSupported
        }
        fragment.removeChild(div);
        fragment = select = opt = marginDiv = div = input = null;
        jQuery(function () {
            var container, outer, inner, table, td, offsetSupport, conMarginTop, ptlm, vb, style, html, body = document.getElementsByTagName("body")[0];
            if (!body) return;
            conMarginTop = 1;
            ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;";
            vb = "visibility:hidden;border:0;";
            style = "style='" + ptlm + "border:5px solid #000;padding:0;'";
            html = "<div " + style + "><div></div></div>" + "<table " + style + " cellpadding='0' cellspacing='0'>" + "<tr><td></td></tr></table>";
            container = document.createElement("div");
            container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
            body.insertBefore(container, body.firstChild);
            div = document.createElement("div");
            container.appendChild(div);
            div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
            tds = div.getElementsByTagName("td");
            isSupported = tds[0].offsetHeight === 0;
            tds[0].style.display = "";
            tds[1].style.display = "none";
            support.reliableHiddenOffsets = isSupported && tds[0].offsetHeight === 0;
            div.innerHTML = "";
            div.style.width = div.style.paddingLeft = "1px";
            jQuery.boxModel = support.boxModel = div.offsetWidth === 2;
            if (typeof div.style.zoom !== "undefined") {
                div.style.display = "inline";
                div.style.zoom = 1;
                support.inlineBlockNeedsLayout = div.offsetWidth === 2;
                div.style.display = "";
                div.innerHTML = "<div style='width:4px;'></div>";
                support.shrinkWrapBlocks = div.offsetWidth !== 2
            }
            div.style.cssText = ptlm + vb;
            div.innerHTML = html;
            outer = div.firstChild;
            inner = outer.firstChild;
            td = outer.nextSibling.firstChild.firstChild;
            offsetSupport = {
                doesNotAddBorder: inner.offsetTop !== 5,
                doesAddBorderForTableAndCells: td.offsetTop === 5
            };
            inner.style.position = "fixed";
            inner.style.top = "20px";
            offsetSupport.fixedPosition = inner.offsetTop === 20 || inner.offsetTop === 15;
            inner.style.position = inner.style.top = "";
            outer.style.overflow = "hidden";
            outer.style.position = "relative";
            offsetSupport.subtractsBorderForOverflowNotVisible = inner.offsetTop === -5;
            offsetSupport.doesNotIncludeMarginInBodyOffset = body.offsetTop !== conMarginTop;
            body.removeChild(container);
            div = container = null;
            jQuery.extend(support, offsetSupport)
        });
        return support
    }();
    var rbrace = /^(?:\{.*\}|\[.*\])$/,
        rmultiDash = /([A-Z])/g;
    jQuery.extend({
        cache: {},
        uuid: 0,
        expando: "jQuery" + (jQuery.fn.jquery + Math.random()).replace(/\D/g, ""),
        noData: {
            "embed": true,
            "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            "applet": true
        },
        hasData: function (elem) {
            elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
            return !!elem && !isEmptyDataObject(elem)
        },
        data: function (elem, name, data, pvt) {
            if (!jQuery.acceptData(elem)) return;
            var privateCache, thisCache, ret, internalKey = jQuery.expando,
                getByName = typeof name === "string",
                isNode = elem.nodeType,
                cache = isNode ? jQuery.cache : elem,
                id = isNode ? elem[internalKey] : elem[internalKey] && internalKey,
                isEvents = name === "events";
            if ((!id || !cache[id] || !isEvents && !pvt && !cache[id].data) && getByName && data === undefined) return;
            if (!id) if (isNode) elem[internalKey] = id = ++jQuery.uuid;
            else id = internalKey;
            if (!cache[id]) {
                cache[id] = {};
                if (!isNode) cache[id].toJSON = jQuery.noop
            }
            if (typeof name === "object" || typeof name === "function") if (pvt) cache[id] = jQuery.extend(cache[id], name);
            else cache[id].data = jQuery.extend(cache[id].data, name);
            privateCache = thisCache = cache[id];
            if (!pvt) {
                if (!thisCache.data) thisCache.data = {};
                thisCache = thisCache.data
            }
            if (data !== undefined) thisCache[jQuery.camelCase(name)] = data;
            if (isEvents && !thisCache[name]) return privateCache.events;
            if (getByName) {
                ret = thisCache[name];
                if (ret == null) ret = thisCache[jQuery.camelCase(name)]
            } else ret = thisCache;
            return ret
        },
        removeData: function (elem, name, pvt) {
            if (!jQuery.acceptData(elem)) return;
            var thisCache, i, l, internalKey = jQuery.expando,
                isNode = elem.nodeType,
                cache = isNode ? jQuery.cache : elem,
                id = isNode ? elem[internalKey] : internalKey;
            if (!cache[id]) return;
            if (name) {
                thisCache = pvt ? cache[id] : cache[id].data;
                if (thisCache) {
                    if (!jQuery.isArray(name)) if (name in thisCache) name = [name];
                    else {
                        name = jQuery.camelCase(name);
                        if (name in thisCache) name = [name];
                        else name = name.split(" ")
                    }
                    for (i = 0, l = name.length; i < l; i++) delete thisCache[name[i]];
                    if (!(pvt ? isEmptyDataObject : jQuery.isEmptyObject)(thisCache)) return
                }
            }
            if (!pvt) {
                delete cache[id].data;
                if (!isEmptyDataObject(cache[id])) return
            }
            if (jQuery.support.deleteExpando || !cache.setInterval) delete cache[id];
            else cache[id] = null;
            if (isNode) if (jQuery.support.deleteExpando) delete elem[internalKey];
            else if (elem.removeAttribute) elem.removeAttribute(internalKey);
            else elem[internalKey] = null
        },
        _data: function (elem, name, data) {
            return jQuery.data(elem, name, data, true)
        },
        acceptData: function (elem) {
            if (elem.nodeName) {
                var match = jQuery.noData[elem.nodeName.toLowerCase()];
                if (match) return !(match === true || elem.getAttribute("classid") !== match)
            }
            return true
        }
    });
    jQuery.fn.extend({
        data: function (key, value) {
            var parts, attr, name, data = null;
            if (typeof key === "undefined") {
                if (this.length) {
                    data = jQuery.data(this[0]);
                    if (this[0].nodeType === 1 && !jQuery._data(this[0], "parsedAttrs")) {
                        attr = this[0].attributes;
                        for (var i = 0, l = attr.length; i < l; i++) {
                            name = attr[i].name;
                            if (name.indexOf("data-") === 0) {
                                name = jQuery.camelCase(name.substring(5));
                                dataAttr(this[0], name, data[name])
                            }
                        }
                        jQuery._data(this[0], "parsedAttrs", true)
                    }
                }
                return data
            } else if (typeof key === "object") return this.each(function () {
                jQuery.data(this, key)
            });
            parts = key.split(".");
            parts[1] = parts[1] ? "." + parts[1] : "";
            if (value === undefined) {
                data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);
                if (data === undefined && this.length) {
                    data = jQuery.data(this[0], key);
                    data = dataAttr(this[0], key, data)
                }
                return data === undefined && parts[1] ? this.data(parts[0]) : data
            } else return this.each(function () {
                var self = jQuery(this),
                    args = [parts[0], value];
                self.triggerHandler("setData" + parts[1] + "!", args);
                jQuery.data(this, key, value);
                self.triggerHandler("changeData" + parts[1] + "!", args)
            })
        },
        removeData: function (key) {
            return this.each(function () {
                jQuery.removeData(this, key)
            })
        }
    });

    function dataAttr(elem, key, data) {
        if (data === undefined && elem.nodeType === 1) {
            var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
            data = elem.getAttribute(name);
            if (typeof data === "string") {
                try {
                    data = data === "true" ? true : data === "false" ? false : data === "null" ? null : jQuery.isNumeric(data) ? parseFloat(data) : rbrace.test(data) ? jQuery.parseJSON(data) : data
                } catch (e) {}
                jQuery.data(elem, key, data)
            } else data = undefined
        }
        return data
    }
    function isEmptyDataObject(obj) {
        for (var name in obj) {
            if (name === "data" && jQuery.isEmptyObject(obj[name])) continue;
            if (name !== "toJSON") return false
        }
        return true
    }
    function handleQueueMarkDefer(elem, type, src) {
        var deferDataKey = type + "defer",
            queueDataKey = type + "queue",
            markDataKey = type + "mark",
            defer = jQuery._data(elem, deferDataKey);
        if (defer && (src === "queue" || !jQuery._data(elem, queueDataKey)) && (src === "mark" || !jQuery._data(elem, markDataKey))) setTimeout(function () {
            if (!jQuery._data(elem, queueDataKey) && !jQuery._data(elem, markDataKey)) {
                jQuery.removeData(elem, deferDataKey, true);
                defer.fire()
            }
        }, 0)
    }
    jQuery.extend({
        _mark: function (elem, type) {
            if (elem) {
                type = (type || "fx") + "mark";
                jQuery._data(elem, type, (jQuery._data(elem, type) || 0) + 1)
            }
        },
        _unmark: function (force, elem, type) {
            if (force !== true) {
                type = elem;
                elem = force;
                force = false
            }
            if (elem) {
                type = type || "fx";
                var key = type + "mark",
                    count = force ? 0 : (jQuery._data(elem, key) || 1) - 1;
                if (count) jQuery._data(elem, key, count);
                else {
                    jQuery.removeData(elem, key, true);
                    handleQueueMarkDefer(elem, type, "mark")
                }
            }
        },
        queue: function (elem, type, data) {
            var q;
            if (elem) {
                type = (type || "fx") + "queue";
                q = jQuery._data(elem, type);
                if (data) if (!q || jQuery.isArray(data)) q = jQuery._data(elem, type, jQuery.makeArray(data));
                else q.push(data);
                return q || []
            }
        },
        dequeue: function (elem, type) {
            type = type || "fx";
            var queue = jQuery.queue(elem, type),
                fn = queue.shift(),
                hooks = {};
            if (fn === "inprogress") fn = queue.shift();
            if (fn) {
                if (type === "fx") queue.unshift("inprogress");
                jQuery._data(elem, type + ".run", hooks);
                fn.call(elem, function () {
                    jQuery.dequeue(elem, type)
                }, hooks)
            }
            if (!queue.length) {
                jQuery.removeData(elem, type + "queue " + type + ".run", true);
                handleQueueMarkDefer(elem, type, "queue")
            }
        }
    });
    jQuery.fn.extend({
        queue: function (type, data) {
            if (typeof type !== "string") {
                data = type;
                type = "fx"
            }
            if (data === undefined) return jQuery.queue(this[0], type);
            return this.each(function () {
                var queue = jQuery.queue(this, type, data);
                if (type === "fx" && queue[0] !== "inprogress") jQuery.dequeue(this, type)
            })
        },
        dequeue: function (type) {
            return this.each(function () {
                jQuery.dequeue(this, type)
            })
        },
        delay: function (time, type) {
            time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
            type = type || "fx";
            return this.queue(type, function (next, hooks) {
                var timeout = setTimeout(next, time);
                hooks.stop = function () {
                    clearTimeout(timeout)
                }
            })
        },
        clearQueue: function (type) {
            return this.queue(type || "fx", [])
        },
        promise: function (type, object) {
            if (typeof type !== "string") {
                object = type;
                type = undefined
            }
            type = type || "fx";
            var defer = jQuery.Deferred(),
                elements = this,
                i = elements.length,
                count = 1,
                deferDataKey = type + "defer",
                queueDataKey = type + "queue",
                markDataKey = type + "mark",
                tmp;

            function resolve() {
                if (!--count) defer.resolveWith(elements, [elements])
            }
            while (i--) if (tmp = jQuery.data(elements[i], deferDataKey, undefined, true) || (jQuery.data(elements[i], queueDataKey, undefined, true) || jQuery.data(elements[i], markDataKey, undefined, true)) && jQuery.data(elements[i], deferDataKey, jQuery.Callbacks("once memory"), true)) {
                count++;
                tmp.add(resolve)
            }
            resolve();
            return defer.promise()
        }
    });
    var rclass = /[\n\t\r]/g,
        rspace = /\s+/,
        rreturn = /\r/g,
        rtype = /^(?:button|input)$/i,
        rfocusable = /^(?:button|input|object|select|textarea)$/i,
        rclickable = /^a(?:rea)?$/i,
        rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
        getSetAttribute = jQuery.support.getSetAttribute,
        nodeHook, boolHook, fixSpecified;
    jQuery.fn.extend({
        attr: function (name, value) {
            return jQuery.access(this, name, value, true, jQuery.attr)
        },
        removeAttr: function (name) {
            return this.each(function () {
                jQuery.removeAttr(this, name)
            })
        },
        prop: function (name, value) {
            return jQuery.access(this, name, value, true, jQuery.prop)
        },
        removeProp: function (name) {
            name = jQuery.propFix[name] || name;
            return this.each(function () {
                try {
                    this[name] = undefined;
                    delete this[name]
                } catch (e) {}
            })
        },
        addClass: function (value) {
            var classNames, i, l, elem, setClass, c, cl;
            if (jQuery.isFunction(value)) return this.each(function (j) {
                jQuery(this).addClass(value.call(this, j, this.className))
            });
            if (value && typeof value === "string") {
                classNames = value.split(rspace);
                for (i = 0, l = this.length; i < l; i++) {
                    elem = this[i];
                    if (elem.nodeType === 1) if (!elem.className && classNames.length === 1) elem.className = value;
                    else {
                        setClass = " " + elem.className + " ";
                        for (c = 0, cl = classNames.length; c < cl; c++) if (!~setClass.indexOf(" " + classNames[c] + " ")) setClass += classNames[c] + " ";
                        elem.className = jQuery.trim(setClass)
                    }
                }
            }
            return this
        },
        removeClass: function (value) {
            var classNames, i, l, elem, className, c, cl;
            if (jQuery.isFunction(value)) return this.each(function (j) {
                jQuery(this).removeClass(value.call(this, j, this.className))
            });
            if (value && typeof value === "string" || value === undefined) {
                classNames = (value || "").split(rspace);
                for (i = 0, l = this.length; i < l; i++) {
                    elem = this[i];
                    if (elem.nodeType === 1 && elem.className) if (value) {
                        className = (" " + elem.className + " ").replace(rclass, " ");
                        for (c = 0, cl = classNames.length; c < cl; c++) className = className.replace(" " + classNames[c] + " ", " ");
                        elem.className = jQuery.trim(className)
                    } else elem.className = ""
                }
            }
            return this
        },
        toggleClass: function (value, stateVal) {
            var type = typeof value,
                isBool = typeof stateVal === "boolean";
            if (jQuery.isFunction(value)) return this.each(function (i) {
                jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal)
            });
            return this.each(function () {
                if (type === "string") {
                    var className, i = 0,
                        self = jQuery(this),
                        state = stateVal,
                        classNames = value.split(rspace);
                    while (className = classNames[i++]) {
                        state = isBool ? state : !self.hasClass(className);
                        self[state ? "addClass" : "removeClass"](className)
                    }
                } else if (type === "undefined" || type === "boolean") {
                    if (this.className) jQuery._data(this, "__className__", this.className);
                    this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || ""
                }
            })
        },
        hasClass: function (selector) {
            var className = " " + selector + " ",
                i = 0,
                l = this.length;
            for (; i < l; i++) if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) > -1) return true;
            return false
        },
        val: function (value) {
            var hooks, ret, isFunction, elem = this[0];
            if (!arguments.length) {
                if (elem) {
                    hooks = jQuery.valHooks[elem.nodeName.toLowerCase()] || jQuery.valHooks[elem.type];
                    if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) return ret;
                    ret = elem.value;
                    return typeof ret === "string" ? ret.replace(rreturn, "") : ret == null ? "" : ret
                }
                return
            }
            isFunction = jQuery.isFunction(value);
            return this.each(function (i) {
                var self = jQuery(this),
                    val;
                if (this.nodeType !== 1) return;
                if (isFunction) val = value.call(this, i, self.val());
                else val = value;
                if (val == null) val = "";
                else if (typeof val === "number") val += "";
                else if (jQuery.isArray(val)) val = jQuery.map(val, function (value) {
                    return value == null ? "" : value + ""
                });
                hooks = jQuery.valHooks[this.nodeName.toLowerCase()] || jQuery.valHooks[this.type];
                if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) this.value = val
            })
        }
    });
    jQuery.extend({
        valHooks: {
            option: {
                get: function (elem) {
                    var val = elem.attributes.value;
                    return !val || val.specified ? elem.value : elem.text
                }
            },
            select: {
                get: function (elem) {
                    var value, i, max, option, index = elem.selectedIndex,
                        values = [],
                        options = elem.options,
                        one = elem.type === "select-one";
                    if (index < 0) return null;
                    i = one ? index : 0;
                    max = one ? index + 1 : options.length;
                    for (; i < max; i++) {
                        option = options[i];
                        if (option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
                            value = jQuery(option).val();
                            if (one) return value;
                            values.push(value)
                        }
                    }
                    if (one && !values.length && options.length) return jQuery(options[index]).val();
                    return values
                },
                set: function (elem, value) {
                    var values = jQuery.makeArray(value);
                    jQuery(elem).find("option").each(function () {
                        this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0
                    });
                    if (!values.length) elem.selectedIndex = -1;
                    return values
                }
            }
        },
        attrFn: {
            val: true,
            css: true,
            html: true,
            text: true,
            data: true,
            width: true,
            height: true,
            offset: true
        },
        attr: function (elem, name, value, pass) {
            var ret, hooks, notxml, nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) return;
            if (pass && name in jQuery.attrFn) return jQuery(elem)[name](value);
            if (typeof elem.getAttribute === "undefined") return jQuery.prop(elem, name, value);
            notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
            if (notxml) {
                name = name.toLowerCase();
                hooks = jQuery.attrHooks[name] || (rboolean.test(name) ? boolHook : nodeHook)
            }
            if (value !== undefined) if (value === null) {
                jQuery.removeAttr(elem, name);
                return
            } else if (hooks && "set" in hooks && notxml && (ret = hooks.set(elem, value, name)) !== undefined) return ret;
            else {
                elem.setAttribute(name, "" + value);
                return value
            } else if (hooks && "get" in hooks && notxml && (ret = hooks.get(elem, name)) !== null) return ret;
            else {
                ret = elem.getAttribute(name);
                return ret === null ? undefined : ret
            }
        },
        removeAttr: function (elem, value) {
            var propName, attrNames, name, l, i = 0;
            if (value && elem.nodeType === 1) {
                attrNames = value.toLowerCase().split(rspace);
                l = attrNames.length;
                for (; i < l; i++) {
                    name = attrNames[i];
                    if (name) {
                        propName = jQuery.propFix[name] || name;
                        jQuery.attr(elem, name, "");
                        elem.removeAttribute(getSetAttribute ? name : propName);
                        if (rboolean.test(name) && propName in elem) elem[propName] = false
                    }
                }
            }
        },
        attrHooks: {
            type: {
                set: function (elem, value) {
                    if (rtype.test(elem.nodeName) && elem.parentNode) jQuery.error("type property can't be changed");
                    else if (!jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
                        var val = elem.value;
                        elem.setAttribute("type", value);
                        if (val) elem.value = val;
                        return value
                    }
                }
            },
            value: {
                get: function (elem, name) {
                    if (nodeHook && jQuery.nodeName(elem, "button")) return nodeHook.get(elem, name);
                    return name in elem ? elem.value : null
                },
                set: function (elem, value, name) {
                    if (nodeHook && jQuery.nodeName(elem, "button")) return nodeHook.set(elem, value, name);
                    elem.value = value
                }
            }
        },
        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },
        prop: function (elem, name, value) {
            var ret, hooks, notxml, nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) return;
            notxml = nType !== 1 || !jQuery.isXMLDoc(elem);
            if (notxml) {
                name = jQuery.propFix[name] || name;
                hooks = jQuery.propHooks[name]
            }
            if (value !== undefined) if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) return ret;
            else return elem[name] = value;
            else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) return ret;
            else return elem[name]
        },
        propHooks: {
            tabIndex: {
                get: function (elem) {
                    var attributeNode = elem.getAttributeNode("tabindex");
                    return attributeNode && attributeNode.specified ? parseInt(attributeNode.value, 10) : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : undefined
                }
            }
        }
    });
    jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;
    boolHook = {
        get: function (elem, name) {
            var attrNode, property = jQuery.prop(elem, name);
            return property === true || typeof property !== "boolean" && (attrNode = elem.getAttributeNode(name)) && attrNode.nodeValue !== false ? name.toLowerCase() : undefined
        },
        set: function (elem, value, name) {
            var propName;
            if (value === false) jQuery.removeAttr(elem, name);
            else {
                propName = jQuery.propFix[name] || name;
                if (propName in elem) elem[propName] = true;
                elem.setAttribute(name, name.toLowerCase())
            }
            return name
        }
    };
    if (!getSetAttribute) {
        fixSpecified = {
            name: true,
            id: true
        };
        nodeHook = jQuery.valHooks.button = {
            get: function (elem, name) {
                var ret;
                ret = elem.getAttributeNode(name);
                return ret && (fixSpecified[name] ? ret.nodeValue !== "" : ret.specified) ? ret.nodeValue : undefined
            },
            set: function (elem, value, name) {
                var ret = elem.getAttributeNode(name);
                if (!ret) {
                    ret = document.createAttribute(name);
                    elem.setAttributeNode(ret)
                }
                return ret.nodeValue = value + ""
            }
        };
        jQuery.attrHooks.tabindex.set = nodeHook.set;
        jQuery.each(["width", "height"], function (i, name) {
            jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
                set: function (elem, value) {
                    if (value === "") {
                        elem.setAttribute(name, "auto");
                        return value
                    }
                }
            })
        });
        jQuery.attrHooks.contenteditable = {
            get: nodeHook.get,
            set: function (elem, value, name) {
                if (value === "") value = "false";
                nodeHook.set(elem, value, name)
            }
        }
    }
    if (!jQuery.support.hrefNormalized) jQuery.each(["href", "src", "width", "height"], function (i, name) {
        jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
            get: function (elem) {
                var ret = elem.getAttribute(name, 2);
                return ret === null ? undefined : ret
            }
        })
    });
    if (!jQuery.support.style) jQuery.attrHooks.style = {
        get: function (elem) {
            return elem.style.cssText.toLowerCase() || undefined
        },
        set: function (elem, value) {
            return elem.style.cssText = "" + value
        }
    };
    if (!jQuery.support.optSelected) jQuery.propHooks.selected = jQuery.extend(jQuery.propHooks.selected, {
        get: function (elem) {
            var parent = elem.parentNode;
            if (parent) {
                parent.selectedIndex;
                if (parent.parentNode) parent.parentNode.selectedIndex
            }
            return null
        }
    });
    if (!jQuery.support.enctype) jQuery.propFix.enctype = "encoding";
    if (!jQuery.support.checkOn) jQuery.each(["radio", "checkbox"], function () {
        jQuery.valHooks[this] = {
            get: function (elem) {
                return elem.getAttribute("value") === null ? "on" : elem.value
            }
        }
    });
    jQuery.each(["radio", "checkbox"], function () {
        jQuery.valHooks[this] = jQuery.extend(jQuery.valHooks[this], {
            set: function (elem, value) {
                if (jQuery.isArray(value)) return elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0
            }
        })
    });
    var rformElems = /^(?:textarea|input|select)$/i,
        rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
        rhoverHack = /\bhover(\.\S+)?\b/,
        rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|contextmenu)|click/,
        rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
        rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
        quickParse = function (selector) {
            var quick = rquickIs.exec(selector);
            if (quick) {
                quick[1] = (quick[1] || "").toLowerCase();
                quick[3] = quick[3] && new RegExp("(?:^|\\s)" + quick[3] + "(?:\\s|$)")
            }
            return quick
        },
        quickIs = function (elem, m) {
            var attrs = elem.attributes || {};
            return (!m[1] || elem.nodeName.toLowerCase() === m[1]) && (!m[2] || (attrs.id || {}).value === m[2]) && (!m[3] || m[3].test((attrs["class"] || {}).value))
        },
        hoverHack = function (events) {
            return jQuery.event.special.hover ? events : events.replace(rhoverHack, "mouseenter$1 mouseleave$1")
        };
    jQuery.event = {
        add: function (elem, types, handler, data, selector) {
            var elemData, eventHandle, events, t, tns, type, namespaces, handleObj, handleObjIn, quick, handlers, special;
            if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data(elem))) return;
            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.handler
            }
            if (!handler.guid) handler.guid = jQuery.guid++;
            events = elemData.events;
            if (!events) elemData.events = events = {};
            eventHandle = elemData.handle;
            if (!eventHandle) {
                elemData.handle = eventHandle = function (e) {
                    return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ? jQuery.event.dispatch.apply(eventHandle.elem, arguments) : undefined
                };
                eventHandle.elem = elem
            }
            types = jQuery.trim(hoverHack(types)).split(" ");
            for (t = 0; t < types.length; t++) {
                tns = rtypenamespace.exec(types[t]) || [];
                type = tns[1];
                namespaces = (tns[2] || "").split(".").sort();
                special = jQuery.event.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                special = jQuery.event.special[type] || {};
                handleObj = jQuery.extend({
                    type: type,
                    origType: tns[1],
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    quick: quickParse(selector),
                    namespace: namespaces.join(".")
                }, handleObjIn);
                handlers = events[type];
                if (!handlers) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;
                    if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) if (elem.addEventListener) elem.addEventListener(type, eventHandle, false);
                    else if (elem.attachEvent) elem.attachEvent("on" + type, eventHandle)
                }
                if (special.add) {
                    special.add.call(elem, handleObj);
                    if (!handleObj.handler.guid) handleObj.handler.guid = handler.guid
                }
                if (selector) handlers.splice(handlers.delegateCount++, 0, handleObj);
                else handlers.push(handleObj);
                jQuery.event.global[type] = true
            }
            elem = null
        },
        global: {},
        remove: function (elem, types, handler, selector, mappedTypes) {
            var elemData = jQuery.hasData(elem) && jQuery._data(elem),
                t, tns, type, origType, namespaces, origCount, j, events, special, handle, eventType, handleObj;
            if (!elemData || !(events = elemData.events)) return;
            types = jQuery.trim(hoverHack(types || "")).split(" ");
            for (t = 0; t < types.length; t++) {
                tns = rtypenamespace.exec(types[t]) || [];
                type = origType = tns[1];
                namespaces = tns[2];
                if (!type) {
                    for (type in events) jQuery.event.remove(elem, type + types[t], handler, selector, true);
                    continue
                }
                special = jQuery.event.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                eventType = events[type] || [];
                origCount = eventType.length;
                namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
                for (j = 0; j < eventType.length; j++) {
                    handleObj = eventType[j];
                    if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!namespaces || namespaces.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                        eventType.splice(j--, 1);
                        if (handleObj.selector) eventType.delegateCount--;
                        if (special.remove) special.remove.call(elem, handleObj)
                    }
                }
                if (eventType.length === 0 && origCount !== eventType.length) {
                    if (!special.teardown || special.teardown.call(elem, namespaces) === false) jQuery.removeEvent(elem, type, elemData.handle);
                    delete events[type]
                }
            }
            if (jQuery.isEmptyObject(events)) {
                handle = elemData.handle;
                if (handle) handle.elem = null;
                jQuery.removeData(elem, ["events", "handle"], true)
            }
        },
        customEvent: {
            "getData": true,
            "setData": true,
            "changeData": true
        },
        trigger: function (event, data, elem, onlyHandlers) {
            if (elem && (elem.nodeType === 3 || elem.nodeType === 8)) return;
            var type = event.type || event,
                namespaces = [],
                cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;
            if (rfocusMorph.test(type + jQuery.event.triggered)) return;
            if (type.indexOf("!") >= 0) {
                type = type.slice(0, -1);
                exclusive = true
            }
            if (type.indexOf(".") >= 0) {
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort()
            }
            if ((!elem || jQuery.event.customEvent[type]) && !jQuery.event.global[type]) return;
            event = typeof event === "object" ? event[jQuery.expando] ? event : new jQuery.Event(type, event) : new jQuery.Event(type);
            event.type = type;
            event.isTrigger = true;
            event.exclusive = exclusive;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
            ontype = type.indexOf(":") < 0 ? "on" + type : "";
            if (!elem) {
                cache = jQuery.cache;
                for (i in cache) if (cache[i].events && cache[i].events[type]) jQuery.event.trigger(event, data, cache[i].handle.elem, true);
                return
            }
            event.result = undefined;
            if (!event.target) event.target = elem;
            data = data != null ? jQuery.makeArray(data) : [];
            data.unshift(event);
            special = jQuery.event.special[type] || {};
            if (special.trigger && special.trigger.apply(elem, data) === false) return;
            eventPath = [
                [elem, special.bindType || type]
            ];
            if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
                bubbleType = special.delegateType || type;
                cur = rfocusMorph.test(bubbleType + type) ? elem : elem.parentNode;
                old = null;
                for (; cur; cur = cur.parentNode) {
                    eventPath.push([cur, bubbleType]);
                    old = cur
                }
                if (old && old === elem.ownerDocument) eventPath.push([old.defaultView || old.parentWindow || window, bubbleType])
            }
            for (i = 0; i < eventPath.length && !event.isPropagationStopped(); i++) {
                cur = eventPath[i][0];
                event.type = eventPath[i][1];
                handle = (jQuery._data(cur, "events") || {})[event.type] && jQuery._data(cur, "handle");
                if (handle) handle.apply(cur, data);
                handle = ontype && cur[ontype];
                if (handle && jQuery.acceptData(cur) && handle.apply(cur, data) === false) event.preventDefault()
            }
            event.type = type;
            if (!onlyHandlers && !event.isDefaultPrevented()) if ((!special._default || special._default.apply(elem.ownerDocument, data) === false) && !(type === "click" && jQuery.nodeName(elem, "a")) && jQuery.acceptData(elem)) if (ontype && elem[type] && (type !== "focus" && type !== "blur" || event.target.offsetWidth !== 0) && !jQuery.isWindow(elem)) {
                old = elem[ontype];
                if (old) elem[ontype] = null;
                jQuery.event.triggered = type;
                elem[type]();
                jQuery.event.triggered = undefined;
                if (old) elem[ontype] = old
            }
            return event.result
        },
        dispatch: function (event) {
            event = jQuery.event.fix(event || window.event);
            var handlers = (jQuery._data(this, "events") || {})[event.type] || [],
                delegateCount = handlers.delegateCount,
                args = [].slice.call(arguments, 0),
                run_all = !event.exclusive && !event.namespace,
                handlerQueue = [],
                i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;
            args[0] = event;
            event.delegateTarget = this;
            if (delegateCount && !event.target.disabled && !(event.button && event.type === "click")) {
                jqcur = jQuery(this);
                jqcur.context = this.ownerDocument || this;
                for (cur = event.target; cur != this; cur = cur.parentNode || this) {
                    selMatch = {};
                    matches = [];
                    jqcur[0] = cur;
                    for (i = 0; i < delegateCount; i++) {
                        handleObj = handlers[i];
                        sel = handleObj.selector;
                        if (selMatch[sel] === undefined) selMatch[sel] = handleObj.quick ? quickIs(cur, handleObj.quick) : jqcur.is(sel);
                        if (selMatch[sel]) matches.push(handleObj)
                    }
                    if (matches.length) handlerQueue.push({
                        elem: cur,
                        matches: matches
                    })
                }
            }
            if (handlers.length > delegateCount) handlerQueue.push({
                elem: this,
                matches: handlers.slice(delegateCount)
            });
            for (i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++) {
                matched = handlerQueue[i];
                event.currentTarget = matched.elem;
                for (j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++) {
                    handleObj = matched.matches[j];
                    if (run_all || !event.namespace && !handleObj.namespace || event.namespace_re && event.namespace_re.test(handleObj.namespace)) {
                        event.data = handleObj.data;
                        event.handleObj = handleObj;
                        ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                        if (ret !== undefined) {
                            event.result = ret;
                            if (ret === false) {
                                event.preventDefault();
                                event.stopPropagation()
                            }
                        }
                    }
                }
            }
            return event.result
        },
        props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function (event, original) {
                if (event.which == null) event.which = original.charCode != null ? original.charCode : original.keyCode;
                return event
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function (event, original) {
                var eventDoc, doc, body, button = original.button,
                    fromElement = original.fromElement;
                if (event.pageX == null && original.clientX != null) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;
                    event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)
                }
                if (!event.relatedTarget && fromElement) event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
                if (!event.which && button !== undefined) event.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
                return event
            }
        },
        fix: function (event) {
            if (event[jQuery.expando]) return event;
            var i, prop, originalEvent = event,
                fixHook = jQuery.event.fixHooks[event.type] || {},
                copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
            event = jQuery.Event(originalEvent);
            for (i = copy.length; i;) {
                prop = copy[--i];
                event[prop] = originalEvent[prop]
            }
            if (!event.target) event.target = originalEvent.srcElement || document;
            if (event.target.nodeType === 3) event.target = event.target.parentNode;
            if (event.metaKey === undefined) event.metaKey = event.ctrlKey;
            return fixHook.filter ? fixHook.filter(event, originalEvent) : event
        },
        special: {
            ready: {
                setup: jQuery.bindReady
            },
            load: {
                noBubble: true
            },
            focus: {
                delegateType: "focusin"
            },
            blur: {
                delegateType: "focusout"
            },
            beforeunload: {
                setup: function (data, namespaces, eventHandle) {
                    if (jQuery.isWindow(this)) this.onbeforeunload = eventHandle
                },
                teardown: function (namespaces, eventHandle) {
                    if (this.onbeforeunload === eventHandle) this.onbeforeunload = null
                }
            }
        },
        simulate: function (type, elem, event, bubble) {
            var e = jQuery.extend(new jQuery.Event, event, {
                type: type,
                isSimulated: true,
                originalEvent: {}
            });
            if (bubble) jQuery.event.trigger(e, null, elem);
            else jQuery.event.dispatch.call(elem, e);
            if (e.isDefaultPrevented()) event.preventDefault()
        }
    };
    jQuery.event.handle = jQuery.event.dispatch;
    jQuery.removeEvent = document.removeEventListener ?
    function (elem, type, handle) {
        if (elem.removeEventListener) elem.removeEventListener(type, handle, false)
    } : function (elem, type, handle) {
        if (elem.detachEvent) elem.detachEvent("on" + type, handle)
    };
    jQuery.Event = function (src, props) {
        if (!(this instanceof jQuery.Event)) return new jQuery.Event(src, props);
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            this.isDefaultPrevented = src.defaultPrevented || src.returnValue === false || src.getPreventDefault && src.getPreventDefault() ? returnTrue : returnFalse
        } else this.type = src;
        if (props) jQuery.extend(this, props);
        this.timeStamp = src && src.timeStamp || jQuery.now();
        this[jQuery.expando] = true
    };

    function returnFalse() {
        return false
    }
    function returnTrue() {
        return true
    }
    jQuery.Event.prototype = {
        preventDefault: function () {
            this.isDefaultPrevented = returnTrue;
            var e = this.originalEvent;
            if (!e) return;
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false
        },
        stopPropagation: function () {
            this.isPropagationStopped = returnTrue;
            var e = this.originalEvent;
            if (!e) return;
            if (e.stopPropagation) e.stopPropagation();
            e.cancelBubble = true
        },
        stopImmediatePropagation: function () {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation()
        },
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse
    };
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function (orig, fix) {
        jQuery.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function (event) {
                var target = this,
                    related = event.relatedTarget,
                    handleObj = event.handleObj,
                    selector = handleObj.selector,
                    ret;
                if (!related || related !== target && !jQuery.contains(target, related)) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    event.type = fix
                }
                return ret
            }
        }
    });
    if (!jQuery.support.submitBubbles) jQuery.event.special.submit = {
        setup: function () {
            if (jQuery.nodeName(this, "form")) return false;
            jQuery.event.add(this, "click._submit keypress._submit", function (e) {
                var elem = e.target,
                    form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
                if (form && !form._submit_attached) {
                    jQuery.event.add(form, "submit._submit", function (event) {
                        if (this.parentNode && !event.isTrigger) jQuery.event.simulate("submit", this.parentNode, event, true)
                    });
                    form._submit_attached = true
                }
            })
        },
        teardown: function () {
            if (jQuery.nodeName(this, "form")) return false;
            jQuery.event.remove(this, "._submit")
        }
    };
    if (!jQuery.support.changeBubbles) jQuery.event.special.change = {
        setup: function () {
            if (rformElems.test(this.nodeName)) {
                if (this.type === "checkbox" || this.type === "radio") {
                    jQuery.event.add(this, "propertychange._change", function (event) {
                        if (event.originalEvent.propertyName === "checked") this._just_changed = true
                    });
                    jQuery.event.add(this, "click._change", function (event) {
                        if (this._just_changed && !event.isTrigger) {
                            this._just_changed = false;
                            jQuery.event.simulate("change", this, event, true)
                        }
                    })
                }
                return false
            }
            jQuery.event.add(this, "beforeactivate._change", function (e) {
                var elem = e.target;
                if (rformElems.test(elem.nodeName) && !elem._change_attached) {
                    jQuery.event.add(elem, "change._change", function (event) {
                        if (this.parentNode && !event.isSimulated && !event.isTrigger) jQuery.event.simulate("change", this.parentNode, event, true)
                    });
                    elem._change_attached = true
                }
            })
        },
        handle: function (event) {
            var elem = event.target;
            if (this !== elem || event.isSimulated || event.isTrigger || elem.type !== "radio" && elem.type !== "checkbox") return event.handleObj.handler.apply(this, arguments)
        },
        teardown: function () {
            jQuery.event.remove(this, "._change");
            return rformElems.test(this.nodeName)
        }
    };
    if (!jQuery.support.focusinBubbles) jQuery.each({
        focus: "focusin",
        blur: "focusout"
    }, function (orig, fix) {
        var attaches = 0,
            handler = function (event) {
                jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true)
            };
        jQuery.event.special[fix] = {
            setup: function () {
                if (attaches++ === 0) document.addEventListener(orig, handler, true)
            },
            teardown: function () {
                if (--attaches === 0) document.removeEventListener(orig, handler, true)
            }
        }
    });
    jQuery.fn.extend({
        on: function (types, selector, data, fn, one) {
            var origFn, type;
            if (typeof types === "object") {
                if (typeof selector !== "string") {
                    data = selector;
                    selector = undefined
                }
                for (type in types) this.on(type, selector, data, types[type], one);
                return this
            }
            if (data == null && fn == null) {
                fn = selector;
                data = selector = undefined
            } else if (fn == null) if (typeof selector === "string") {
                fn = data;
                data = undefined
            } else {
                fn = data;
                data = selector;
                selector = undefined
            }
            if (fn === false) fn = returnFalse;
            else if (!fn) return this;
            if (one === 1) {
                origFn = fn;
                fn = function (event) {
                    jQuery().off(event);
                    return origFn.apply(this, arguments)
                };
                fn.guid = origFn.guid || (origFn.guid = jQuery.guid++)
            }
            return this.each(function () {
                jQuery.event.add(this, types, fn, data, selector)
            })
        },
        one: function (types, selector, data, fn) {
            return this.on.call(this, types, selector, data, fn, 1)
        },
        off: function (types, selector, fn) {
            if (types && types.preventDefault && types.handleObj) {
                var handleObj = types.handleObj;
                jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.type + "." + handleObj.namespace : handleObj.type, handleObj.selector, handleObj.handler);
                return this
            }
            if (typeof types === "object") {
                for (var type in types) this.off(type, selector, types[type]);
                return this
            }
            if (selector === false || typeof selector === "function") {
                fn = selector;
                selector = undefined
            }
            if (fn === false) fn = returnFalse;
            return this.each(function () {
                jQuery.event.remove(this, types, fn, selector)
            })
        },
        bind: function (types, data, fn) {
            return this.on(types, null, data, fn)
        },
        unbind: function (types, fn) {
            return this.off(types, null, fn)
        },
        live: function (types, data, fn) {
            jQuery(this.context).on(types, this.selector, data, fn);
            return this
        },
        die: function (types, fn) {
            jQuery(this.context).off(types, this.selector || "**", fn);
            return this
        },
        delegate: function (selector, types, data, fn) {
            return this.on(types, selector, data, fn)
        },
        undelegate: function (selector, types, fn) {
            return arguments.length == 1 ? this.off(selector, "**") : this.off(types, selector, fn)
        },
        trigger: function (type, data) {
            return this.each(function () {
                jQuery.event.trigger(type, data, this)
            })
        },
        triggerHandler: function (type, data) {
            if (this[0]) return jQuery.event.trigger(type, data, this[0], true)
        },
        toggle: function (fn) {
            var args = arguments,
                guid = fn.guid || jQuery.guid++,
                i = 0,
                toggler = function (event) {
                    var lastToggle = (jQuery._data(this, "lastToggle" + fn.guid) || 0) % i;
                    jQuery._data(this, "lastToggle" + fn.guid, lastToggle + 1);
                    event.preventDefault();
                    return args[lastToggle].apply(this, arguments) || false
                };
            toggler.guid = guid;
            while (i < args.length) args[i++].guid = guid;
            return this.click(toggler)
        },
        hover: function (fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver)
        }
    });
    jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error contextmenu").split(" "), function (i, name) {
        jQuery.fn[name] = function (data, fn) {
            if (fn == null) {
                fn = data;
                data = null
            }
            return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name)
        };
        if (jQuery.attrFn) jQuery.attrFn[name] = true;
        if (rkeyEvent.test(name)) jQuery.event.fixHooks[name] = jQuery.event.keyHooks;
        if (rmouseEvent.test(name)) jQuery.event.fixHooks[name] = jQuery.event.mouseHooks
    });
    (function () {
        var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            expando = "sizcache" + (Math.random() + "").replace(".", ""),
            done = 0,
            toString = Object.prototype.toString,
            hasDuplicate = false,
            baseHasDuplicate = true,
            rBackslash = /\\/g,
            rReturn = /\r\n/g,
            rNonWord = /\W/;
        [0, 0].sort(function () {
            baseHasDuplicate = false;
            return 0
        });
        var Sizzle = function (selector, context, results, seed) {
                results = results || [];
                context = context || document;
                var origContext = context;
                if (context.nodeType !== 1 && context.nodeType !== 9) return [];
                if (!selector || typeof selector !== "string") return results;
                var m, set, checkSet, extra, ret, cur, pop, i, prune = true,
                    contextXML = Sizzle.isXML(context),
                    parts = [],
                    soFar = selector;
                do {
                    chunker.exec("");
                    m = chunker.exec(soFar);
                    if (m) {
                        soFar = m[3];
                        parts.push(m[1]);
                        if (m[2]) {
                            extra = m[3];
                            break
                        }
                    }
                } while (m);
                if (parts.length > 1 && origPOS.exec(selector)) if (parts.length === 2 && Expr.relative[parts[0]]) set = posProcess(parts[0] + parts[1], context, seed);
                else {
                    set = Expr.relative[parts[0]] ? [context] : Sizzle(parts.shift(), context);
                    while (parts.length) {
                        selector = parts.shift();
                        if (Expr.relative[selector]) selector += parts.shift();
                        set = posProcess(selector, set, seed)
                    }
                } else {
                    if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {
                        ret = Sizzle.find(parts.shift(), context, contextXML);
                        context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0]
                    }
                    if (context) {
                        ret = seed ? {
                            expr: parts.pop(),
                            set: makeArray(seed)
                        } : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
                        set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
                        if (parts.length > 0) checkSet = makeArray(set);
                        else prune = false;
                        while (parts.length) {
                            cur = parts.pop();
                            pop = cur;
                            if (!Expr.relative[cur]) cur = "";
                            else pop = parts.pop();
                            if (pop == null) pop = context;
                            Expr.relative[cur](checkSet, pop, contextXML)
                        }
                    } else checkSet = parts = []
                }
                if (!checkSet) checkSet = set;
                if (!checkSet) Sizzle.error(cur || selector);
                if (toString.call(checkSet) === "[object Array]") if (!prune) results.push.apply(results, checkSet);
                else if (context && context.nodeType === 1) for (i = 0; checkSet[i] != null; i++) {
                    if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) results.push(set[i])
                } else for (i = 0; checkSet[i] != null; i++) {
                    if (checkSet[i] && checkSet[i].nodeType === 1) results.push(set[i])
                } else makeArray(checkSet, results);
                if (extra) {
                    Sizzle(extra, origContext, results, seed);
                    Sizzle.uniqueSort(results)
                }
                return results
            };
        Sizzle.uniqueSort = function (results) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                results.sort(sortOrder);
                if (hasDuplicate) for (var i = 1; i < results.length; i++) if (results[i] === results[i - 1]) results.splice(i--, 1)
            }
            return results
        };
        Sizzle.matches = function (expr, set) {
            return Sizzle(expr, null, null, set)
        };
        Sizzle.matchesSelector = function (node, expr) {
            return Sizzle(expr, null, null, [node]).length > 0
        };
        Sizzle.find = function (expr, context, isXML) {
            var set, i, len, match, type, left;
            if (!expr) return [];
            for (i = 0, len = Expr.order.length; i < len; i++) {
                type = Expr.order[i];
                if (match = Expr.leftMatch[type].exec(expr)) {
                    left = match[1];
                    match.splice(1, 1);
                    if (left.substr(left.length - 1) !== "\\") {
                        match[1] = (match[1] || "").replace(rBackslash, "");
                        set = Expr.find[type](match, context, isXML);
                        if (set != null) {
                            expr = expr.replace(Expr.match[type], "");
                            break
                        }
                    }
                }
            }
            if (!set) set = typeof context.getElementsByTagName !== "undefined" ? context.getElementsByTagName("*") : [];
            return {
                set: set,
                expr: expr
            }
        };
        Sizzle.filter = function (expr, set, inplace, not) {
            var match, anyFound, type, found, item, filter, left, i, pass, old = expr,
                result = [],
                curLoop = set,
                isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);
            while (expr && set.length) {
                for (type in Expr.filter) if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
                    filter = Expr.filter[type];
                    left = match[1];
                    anyFound = false;
                    match.splice(1, 1);
                    if (left.substr(left.length - 1) === "\\") continue;
                    if (curLoop === result) result = [];
                    if (Expr.preFilter[type]) {
                        match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);
                        if (!match) anyFound = found = true;
                        else if (match === true) continue
                    }
                    if (match) for (i = 0;
                    (item = curLoop[i]) != null; i++) if (item) {
                        found = filter(item, match, i, curLoop);
                        pass = not ^ found;
                        if (inplace && found != null) if (pass) anyFound = true;
                        else curLoop[i] = false;
                        else if (pass) {
                            result.push(item);
                            anyFound = true
                        }
                    }
                    if (found !== undefined) {
                        if (!inplace) curLoop = result;
                        expr = expr.replace(Expr.match[type], "");
                        if (!anyFound) return [];
                        break
                    }
                }
                if (expr === old) if (anyFound == null) Sizzle.error(expr);
                else break;
                old = expr
            }
            return curLoop
        };
        Sizzle.error = function (msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
        };
        var getText = Sizzle.getText = function (elem) {
                var i, node, nodeType = elem.nodeType,
                    ret = "";
                if (nodeType) if (nodeType === 1 || nodeType === 9) if (typeof elem.textContent === "string") return elem.textContent;
                else if (typeof elem.innerText === "string") return elem.innerText.replace(rReturn, "");
                else for (elem = elem.firstChild; elem; elem = elem.nextSibling) ret += getText(elem);
                else {
                    if (nodeType === 3 || nodeType === 4) return elem.nodeValue
                } else for (i = 0; node = elem[i]; i++) if (node.nodeType !== 8) ret += getText(node);
                return ret
            };
        var Expr = Sizzle.selectors = {
            order: ["ID", "NAME", "TAG"],
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
            },
            leftMatch: {},
            attrMap: {
                "class": "className",
                "for": "htmlFor"
            },
            attrHandle: {
                href: function (elem) {
                    return elem.getAttribute("href")
                },
                type: function (elem) {
                    return elem.getAttribute("type")
                }
            },
            relative: {
                "+": function (checkSet, part) {
                    var isPartStr = typeof part === "string",
                        isTag = isPartStr && !rNonWord.test(part),
                        isPartStrNotTag = isPartStr && !isTag;
                    if (isTag) part = part.toLowerCase();
                    for (var i = 0, l = checkSet.length, elem; i < l; i++) if (elem = checkSet[i]) {
                        while ((elem = elem.previousSibling) && elem.nodeType !== 1);
                        checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ? elem || false : elem === part
                    }
                    if (isPartStrNotTag) Sizzle.filter(part, checkSet, true)
                },
                ">": function (checkSet, part) {
                    var elem, isPartStr = typeof part === "string",
                        i = 0,
                        l = checkSet.length;
                    if (isPartStr && !rNonWord.test(part)) {
                        part = part.toLowerCase();
                        for (; i < l; i++) {
                            elem = checkSet[i];
                            if (elem) {
                                var parent = elem.parentNode;
                                checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false
                            }
                        }
                    } else {
                        for (; i < l; i++) {
                            elem = checkSet[i];
                            if (elem) checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part
                        }
                        if (isPartStr) Sizzle.filter(part, checkSet, true)
                    }
                },
                "": function (checkSet, part, isXML) {
                    var nodeCheck, doneName = done++,
                        checkFn = dirCheck;
                    if (typeof part === "string" && !rNonWord.test(part)) {
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck
                    }
                    checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML)
                },
                "~": function (checkSet, part, isXML) {
                    var nodeCheck, doneName = done++,
                        checkFn = dirCheck;
                    if (typeof part === "string" && !rNonWord.test(part)) {
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck
                    }
                    checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML)
                }
            },
            find: {
                ID: function (match, context, isXML) {
                    if (typeof context.getElementById !== "undefined" && !isXML) {
                        var m = context.getElementById(match[1]);
                        return m && m.parentNode ? [m] : []
                    }
                },
                NAME: function (match, context) {
                    if (typeof context.getElementsByName !== "undefined") {
                        var ret = [],
                            results = context.getElementsByName(match[1]);
                        for (var i = 0, l = results.length; i < l; i++) if (results[i].getAttribute("name") === match[1]) ret.push(results[i]);
                        return ret.length === 0 ? null : ret
                    }
                },
                TAG: function (match, context) {
                    if (typeof context.getElementsByTagName !== "undefined") return context.getElementsByTagName(match[1])
                }
            },
            preFilter: {
                CLASS: function (match, curLoop, inplace, result, not, isXML) {
                    match = " " + match[1].replace(rBackslash, "") + " ";
                    if (isXML) return match;
                    for (var i = 0, elem;
                    (elem = curLoop[i]) != null; i++) if (elem) if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0)) {
                        if (!inplace) result.push(elem)
                    } else if (inplace) curLoop[i] = false;
                    return false
                },
                ID: function (match) {
                    return match[1].replace(rBackslash, "")
                },
                TAG: function (match, curLoop) {
                    return match[1].replace(rBackslash, "").toLowerCase()
                },
                CHILD: function (match) {
                    if (match[1] === "nth") {
                        if (!match[2]) Sizzle.error(match[0]);
                        match[2] = match[2].replace(/^\+|\s*/g, "");
                        var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);
                        match[2] = test[1] + (test[2] || 1) - 0;
                        match[3] = test[3] - 0
                    } else if (match[2]) Sizzle.error(match[0]);
                    match[0] = done++;
                    return match
                },
                ATTR: function (match, curLoop, inplace, result, not, isXML) {
                    var name = match[1] = match[1].replace(rBackslash, "");
                    if (!isXML && Expr.attrMap[name]) match[1] = Expr.attrMap[name];
                    match[4] = (match[4] || match[5] || "").replace(rBackslash, "");
                    if (match[2] === "~=") match[4] = " " + match[4] + " ";
                    return match
                },
                PSEUDO: function (match, curLoop, inplace, result, not) {
                    if (match[1] === "not") if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) match[3] = Sizzle(match[3], null, null, curLoop);
                    else {
                        var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
                        if (!inplace) result.push.apply(result, ret);
                        return false
                    } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) return true;
                    return match
                },
                POS: function (match) {
                    match.unshift(true);
                    return match
                }
            },
            filters: {
                enabled: function (elem) {
                    return elem.disabled === false && elem.type !== "hidden"
                },
                disabled: function (elem) {
                    return elem.disabled === true
                },
                checked: function (elem) {
                    return elem.checked === true
                },
                selected: function (elem) {
                    if (elem.parentNode) elem.parentNode.selectedIndex;
                    return elem.selected === true
                },
                parent: function (elem) {
                    return !!elem.firstChild
                },
                empty: function (elem) {
                    return !elem.firstChild
                },
                has: function (elem, i, match) {
                    return !!Sizzle(match[3], elem).length
                },
                header: function (elem) {
                    return /h\d/i.test(elem.nodeName)
                },
                text: function (elem) {
                    var attr = elem.getAttribute("type"),
                        type = elem.type;
                    return elem.nodeName.toLowerCase() === "input" && "text" === type && (attr === type || attr === null)
                },
                radio: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type
                },
                checkbox: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type
                },
                file: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "file" === elem.type
                },
                password: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "password" === elem.type
                },
                submit: function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return (name === "input" || name === "button") && "submit" === elem.type
                },
                image: function (elem) {
                    return elem.nodeName.toLowerCase() === "input" && "image" === elem.type
                },
                reset: function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return (name === "input" || name === "button") && "reset" === elem.type
                },
                button: function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return name === "input" && "button" === elem.type || name === "button"
                },
                input: function (elem) {
                    return /input|select|textarea|button/i.test(elem.nodeName)
                },
                focus: function (elem) {
                    return elem === elem.ownerDocument.activeElement
                }
            },
            setFilters: {
                first: function (elem, i) {
                    return i === 0
                },
                last: function (elem, i, match, array) {
                    return i === array.length - 1
                },
                even: function (elem, i) {
                    return i % 2 === 0
                },
                odd: function (elem, i) {
                    return i % 2 === 1
                },
                lt: function (elem, i, match) {
                    return i < match[3] - 0
                },
                gt: function (elem, i, match) {
                    return i > match[3] - 0
                },
                nth: function (elem, i, match) {
                    return match[3] - 0 === i
                },
                eq: function (elem, i, match) {
                    return match[3] - 0 === i
                }
            },
            filter: {
                PSEUDO: function (elem, match, i, array) {
                    var name = match[1],
                        filter = Expr.filters[name];
                    if (filter) return filter(elem, i, match, array);
                    else if (name === "contains") return (elem.textContent || elem.innerText || getText([elem]) || "").indexOf(match[3]) >= 0;
                    else if (name === "not") {
                        var not = match[3];
                        for (var j = 0, l = not.length; j < l; j++) if (not[j] === elem) return false;
                        return true
                    } else Sizzle.error(name)
                },
                CHILD: function (elem, match) {
                    var first, last, doneName, parent, cache, count, diff, type = match[1],
                        node = elem;
                    switch (type) {
                    case "only":
                    case "first":
                        while (node = node.previousSibling) if (node.nodeType === 1) return false;
                        if (type === "first") return true;
                        node = elem;
                    case "last":
                        while (node = node.nextSibling) if (node.nodeType === 1) return false;
                        return true;
                    case "nth":
                        first = match[2];
                        last = match[3];
                        if (first === 1 && last === 0) return true;
                        doneName = match[0];
                        parent = elem.parentNode;
                        if (parent && (parent[expando] !== doneName || !elem.nodeIndex)) {
                            count = 0;
                            for (node = parent.firstChild; node; node = node.nextSibling) if (node.nodeType === 1) node.nodeIndex = ++count;
                            parent[expando] = doneName
                        }
                        diff = elem.nodeIndex - last;
                        if (first === 0) return diff === 0;
                        else return diff % first === 0 && diff / first >= 0
                    }
                },
                ID: function (elem, match) {
                    return elem.nodeType === 1 && elem.getAttribute("id") === match
                },
                TAG: function (elem, match) {
                    return match === "*" && elem.nodeType === 1 || !! elem.nodeName && elem.nodeName.toLowerCase() === match
                },
                CLASS: function (elem, match) {
                    return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1
                },
                ATTR: function (elem, match) {
                    var name = match[1],
                        result = Sizzle.attr ? Sizzle.attr(elem, name) : Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name),
                        value = result + "",
                        type = match[2],
                        check = match[4];
                    return result == null ? type === "!=" : !type && Sizzle.attr ? result != null : type === "=" ? value === check : type === "*=" ? value.indexOf(check) >= 0 : type === "~=" ? (" " + value + " ").indexOf(check) >= 0 : !check ? value && result !== false : type === "!=" ? value !== check : type === "^=" ? value.indexOf(check) === 0 : type === "$=" ? value.substr(value.length - check.length) === check : type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" : false
                },
                POS: function (elem, match, i, array) {
                    var name = match[2],
                        filter = Expr.setFilters[name];
                    if (filter) return filter(elem, i, match, array)
                }
            }
        };
        var origPOS = Expr.match.POS,
            fescape = function (all, num) {
                return "\\" + (num - 0 + 1)
            };
        for (var type in Expr.match) {
            Expr.match[type] = new RegExp(Expr.match[type].source + /(?![^\[]*\])(?![^\(]*\))/.source);
            Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape))
        }
        var makeArray = function (array, results) {
                array = Array.prototype.slice.call(array, 0);
                if (results) {
                    results.push.apply(results, array);
                    return results
                }
                return array
            };
        try {
            Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType
        } catch (e) {
            makeArray = function (array, results) {
                var i = 0,
                    ret = results || [];
                if (toString.call(array) === "[object Array]") Array.prototype.push.apply(ret, array);
                else if (typeof array.length === "number") for (var l = array.length; i < l; i++) ret.push(array[i]);
                else for (; array[i]; i++) ret.push(array[i]);
                return ret
            }
        }
        var sortOrder, siblingCheck;
        if (document.documentElement.compareDocumentPosition) sortOrder = function (a, b) {
            if (a === b) {
                hasDuplicate = true;
                return 0
            }
            if (!a.compareDocumentPosition || !b.compareDocumentPosition) return a.compareDocumentPosition ? -1 : 1;
            return a.compareDocumentPosition(b) & 4 ? -1 : 1
        };
        else {
            sortOrder = function (a, b) {
                if (a === b) {
                    hasDuplicate = true;
                    return 0
                } else if (a.sourceIndex && b.sourceIndex) return a.sourceIndex - b.sourceIndex;
                var al, bl, ap = [],
                    bp = [],
                    aup = a.parentNode,
                    bup = b.parentNode,
                    cur = aup;
                if (aup === bup) return siblingCheck(a, b);
                else if (!aup) return -1;
                else if (!bup) return 1;
                while (cur) {
                    ap.unshift(cur);
                    cur = cur.parentNode
                }
                cur = bup;
                while (cur) {
                    bp.unshift(cur);
                    cur = cur.parentNode
                }
                al = ap.length;
                bl = bp.length;
                for (var i = 0; i < al && i < bl; i++) if (ap[i] !== bp[i]) return siblingCheck(ap[i], bp[i]);
                return i === al ? siblingCheck(a, bp[i], -1) : siblingCheck(ap[i], b, 1)
            };
            siblingCheck = function (a, b, ret) {
                if (a === b) return ret;
                var cur = a.nextSibling;
                while (cur) {
                    if (cur === b) return -1;
                    cur = cur.nextSibling
                }
                return 1
            }
        }(function () {
            var form = document.createElement("div"),
                id = "script" + (new Date).getTime(),
                root = document.documentElement;
            form.innerHTML = "<a name='" + id + "'/>";
            root.insertBefore(form, root.firstChild);
            if (document.getElementById(id)) {
                Expr.find.ID = function (match, context, isXML) {
                    if (typeof context.getElementById !== "undefined" && !isXML) {
                        var m = context.getElementById(match[1]);
                        return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : []
                    }
                };
                Expr.filter.ID = function (elem, match) {
                    var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                    return elem.nodeType === 1 && node && node.nodeValue === match
                }
            }
            root.removeChild(form);
            root = form = null
        })();
        (function () {
            var div = document.createElement("div");
            div.appendChild(document.createComment(""));
            if (div.getElementsByTagName("*").length > 0) Expr.find.TAG = function (match, context) {
                var results = context.getElementsByTagName(match[1]);
                if (match[1] === "*") {
                    var tmp = [];
                    for (var i = 0; results[i]; i++) if (results[i].nodeType === 1) tmp.push(results[i]);
                    results = tmp
                }
                return results
            };
            div.innerHTML = "<a href='#'></a>";
            if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#") Expr.attrHandle.href = function (elem) {
                return elem.getAttribute("href", 2)
            };
            div = null
        })();
        if (document.querySelectorAll)(function () {
            var oldSizzle = Sizzle,
                div = document.createElement("div"),
                id = "__sizzle__";
            div.innerHTML = "<p class='TEST'></p>";
            if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) return;
            Sizzle = function (query, context, extra, seed) {
                context = context || document;
                if (!seed && !Sizzle.isXML(context)) {
                    var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);
                    if (match && (context.nodeType === 1 || context.nodeType === 9)) if (match[1]) return makeArray(context.getElementsByTagName(query), extra);
                    else if (match[2] && Expr.find.CLASS && context.getElementsByClassName) return makeArray(context.getElementsByClassName(match[2]), extra);
                    if (context.nodeType === 9) {
                        if (query === "body" && context.body) return makeArray([context.body], extra);
                        else if (match && match[3]) {
                            var elem = context.getElementById(match[3]);
                            if (elem && elem.parentNode) {
                                if (elem.id === match[3]) return makeArray([elem], extra)
                            } else return makeArray([], extra)
                        }
                        try {
                            return makeArray(context.querySelectorAll(query), extra)
                        } catch (qsaError) {}
                    } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                        var oldContext = context,
                            old = context.getAttribute("id"),
                            nid = old || id,
                            hasParent = context.parentNode,
                            relativeHierarchySelector = /^\s*[+~]/.test(query);
                        if (!old) context.setAttribute("id", nid);
                        else nid = nid.replace(/'/g, "\\$&");
                        if (relativeHierarchySelector && hasParent) context = context.parentNode;
                        try {
                            if (!relativeHierarchySelector || hasParent) return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra)
                        } catch (pseudoError) {} finally {
                            if (!old) oldContext.removeAttribute("id")
                        }
                    }
                }
                return oldSizzle(query, context, extra, seed)
            };
            for (var prop in oldSizzle) Sizzle[prop] = oldSizzle[prop];
            div = null
        })();
        (function () {
            var html = document.documentElement,
                matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;
            if (matches) {
                var disconnectedMatch = !matches.call(document.createElement("div"), "div"),
                    pseudoWorks = false;
                try {
                    matches.call(document.documentElement, "[test!='']:sizzle")
                } catch (pseudoError) {
                    pseudoWorks = true
                }
                Sizzle.matchesSelector = function (node, expr) {
                    expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
                    if (!Sizzle.isXML(node)) try {
                        if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)) {
                            var ret = matches.call(node, expr);
                            if (ret || !disconnectedMatch || node.document && node.document.nodeType !== 11) return ret
                        }
                    } catch (e) {}
                    return Sizzle(expr, null, null, [node]).length > 0
                }
            }
        })();
        (function () {
            var div = document.createElement("div");
            div.innerHTML = "<div class='test e'></div><div class='test'></div>";
            if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) return;
            div.lastChild.className = "e";
            if (div.getElementsByClassName("e").length === 1) return;
            Expr.order.splice(1, 0, "CLASS");
            Expr.find.CLASS = function (match, context, isXML) {
                if (typeof context.getElementsByClassName !== "undefined" && !isXML) return context.getElementsByClassName(match[1])
            };
            div = null
        })();

        function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
            for (var i = 0, l = checkSet.length; i < l; i++) {
                var elem = checkSet[i];
                if (elem) {
                    var match = false;
                    elem = elem[dir];
                    while (elem) {
                        if (elem[expando] === doneName) {
                            match = checkSet[elem.sizset];
                            break
                        }
                        if (elem.nodeType === 1 && !isXML) {
                            elem[expando] = doneName;
                            elem.sizset = i
                        }
                        if (elem.nodeName.toLowerCase() === cur) {
                            match = elem;
                            break
                        }
                        elem = elem[dir]
                    }
                    checkSet[i] = match
                }
            }
        }
        function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
            for (var i = 0, l = checkSet.length; i < l; i++) {
                var elem = checkSet[i];
                if (elem) {
                    var match = false;
                    elem = elem[dir];
                    while (elem) {
                        if (elem[expando] === doneName) {
                            match = checkSet[elem.sizset];
                            break
                        }
                        if (elem.nodeType === 1) {
                            if (!isXML) {
                                elem[expando] = doneName;
                                elem.sizset = i
                            }
                            if (typeof cur !== "string") {
                                if (elem === cur) {
                                    match = true;
                                    break
                                }
                            } else if (Sizzle.filter(cur, [elem]).length > 0) {
                                match = elem;
                                break
                            }
                        }
                        elem = elem[dir]
                    }
                    checkSet[i] = match
                }
            }
        }
        if (document.documentElement.contains) Sizzle.contains = function (a, b) {
            return a !== b && (a.contains ? a.contains(b) : true)
        };
        else if (document.documentElement.compareDocumentPosition) Sizzle.contains = function (a, b) {
            return !!(a.compareDocumentPosition(b) & 16)
        };
        else Sizzle.contains = function () {
            return false
        };
        Sizzle.isXML = function (elem) {
            var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false
        };
        var posProcess = function (selector, context, seed) {
                var match, tmpSet = [],
                    later = "",
                    root = context.nodeType ? [context] : context;
                while (match = Expr.match.PSEUDO.exec(selector)) {
                    later += match[0];
                    selector = selector.replace(Expr.match.PSEUDO, "")
                }
                selector = Expr.relative[selector] ? selector + "*" : selector;
                for (var i = 0, l = root.length; i < l; i++) Sizzle(selector, root[i], tmpSet, seed);
                return Sizzle.filter(later, tmpSet)
            };
        Sizzle.attr = jQuery.attr;
        Sizzle.selectors.attrMap = {};
        jQuery.find = Sizzle;
        jQuery.expr = Sizzle.selectors;
        jQuery.expr[":"] = jQuery.expr.filters;
        jQuery.unique = Sizzle.uniqueSort;
        jQuery.text = Sizzle.getText;
        jQuery.isXMLDoc = Sizzle.isXML;
        jQuery.contains = Sizzle.contains
    })();
    var runtil = /Until$/,
        rparentsprev = /^(?:parents|prevUntil|prevAll)/,
        rmultiselector = /,/,
        isSimple = /^.[^:#\[\.,]*$/,
        slice = Array.prototype.slice,
        POS = jQuery.expr.match.POS,
        guaranteedUnique = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };
    jQuery.fn.extend({
        find: function (selector) {
            var self = this,
                i, l;
            if (typeof selector !== "string") return jQuery(selector).filter(function () {
                for (i = 0, l = self.length; i < l; i++) if (jQuery.contains(self[i], this)) return true
            });
            var ret = this.pushStack("", "find", selector),
                length, n, r;
            for (i = 0, l = this.length; i < l; i++) {
                length = ret.length;
                jQuery.find(selector, this[i], ret);
                if (i > 0) for (n = length; n < ret.length; n++) for (r = 0; r < length; r++) if (ret[r] === ret[n]) {
                    ret.splice(n--, 1);
                    break
                }
            }
            return ret
        },
        has: function (target) {
            var targets = jQuery(target);
            return this.filter(function () {
                for (var i = 0, l = targets.length; i < l; i++) if (jQuery.contains(this, targets[i])) return true
            })
        },
        not: function (selector) {
            return this.pushStack(winnow(this, selector, false), "not", selector)
        },
        filter: function (selector) {
            return this.pushStack(winnow(this, selector, true), "filter", selector)
        },
        is: function (selector) {
            return !!selector && (typeof selector === "string" ? POS.test(selector) ? jQuery(selector, this.context).index(this[0]) >= 0 : jQuery.filter(selector, this).length > 0 : this.filter(selector).length > 0)
        },
        closest: function (selectors, context) {
            var ret = [],
                i, l, cur = this[0];
            if (jQuery.isArray(selectors)) {
                var level = 1;
                while (cur && cur.ownerDocument && cur !== context) {
                    for (i = 0; i < selectors.length; i++) if (jQuery(cur).is(selectors[i])) ret.push({
                        selector: selectors[i],
                        elem: cur,
                        level: level
                    });
                    cur = cur.parentNode;
                    level++
                }
                return ret
            }
            var pos = POS.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context || this.context) : 0;
            for (i = 0, l = this.length; i < l; i++) {
                cur = this[i];
                while (cur) if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors)) {
                    ret.push(cur);
                    break
                } else {
                    cur = cur.parentNode;
                    if (!cur || !cur.ownerDocument || cur === context || cur.nodeType === 11) break
                }
            }
            ret = ret.length > 1 ? jQuery.unique(ret) : ret;
            return this.pushStack(ret, "closest", selectors)
        },
        index: function (elem) {
            if (!elem) return this[0] && this[0].parentNode ? this.prevAll().length : -1;
            if (typeof elem === "string") return jQuery.inArray(this[0], jQuery(elem));
            return jQuery.inArray(elem.jquery ? elem[0] : elem, this)
        },
        add: function (selector, context) {
            var set = typeof selector === "string" ? jQuery(selector, context) : jQuery.makeArray(selector && selector.nodeType ? [selector] : selector),
                all = jQuery.merge(this.get(), set);
            return this.pushStack(isDisconnected(set[0]) || isDisconnected(all[0]) ? all : jQuery.unique(all))
        },
        andSelf: function () {
            return this.add(this.prevObject)
        }
    });

    function isDisconnected(node) {
        return !node || !node.parentNode || node.parentNode.nodeType === 11
    }
    jQuery.each({
        parent: function (elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null
        },
        parents: function (elem) {
            return jQuery.dir(elem, "parentNode")
        },
        parentsUntil: function (elem, i, until) {
            return jQuery.dir(elem, "parentNode", until)
        },
        next: function (elem) {
            return jQuery.nth(elem, 2, "nextSibling")
        },
        prev: function (elem) {
            return jQuery.nth(elem, 2, "previousSibling")
        },
        nextAll: function (elem) {
            return jQuery.dir(elem, "nextSibling")
        },
        prevAll: function (elem) {
            return jQuery.dir(elem, "previousSibling")
        },
        nextUntil: function (elem, i, until) {
            return jQuery.dir(elem, "nextSibling", until)
        },
        prevUntil: function (elem, i, until) {
            return jQuery.dir(elem, "previousSibling", until)
        },
        siblings: function (elem) {
            return jQuery.sibling(elem.parentNode.firstChild, elem)
        },
        children: function (elem) {
            return jQuery.sibling(elem.firstChild)
        },
        contents: function (elem) {
            return jQuery.nodeName(elem, "iframe") ? elem.contentDocument || elem.contentWindow.document : jQuery.makeArray(elem.childNodes)
        }
    }, function (name, fn) {
        jQuery.fn[name] = function (until, selector) {
            var ret = jQuery.map(this, fn, until);
            if (!runtil.test(name)) selector = until;
            if (selector && typeof selector === "string") ret = jQuery.filter(selector, ret);
            ret = this.length > 1 && !guaranteedUnique[name] ? jQuery.unique(ret) : ret;
            if ((this.length > 1 || rmultiselector.test(selector)) && rparentsprev.test(name)) ret = ret.reverse();
            return this.pushStack(ret, name, slice.call(arguments).join(","))
        }
    });
    jQuery.extend({
        filter: function (expr, elems, not) {
            if (not) expr = ":not(" + expr + ")";
            return elems.length === 1 ? jQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [] : jQuery.find.matches(expr, elems)
        },
        dir: function (elem, dir, until) {
            var matched = [],
                cur = elem[dir];
            while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
                if (cur.nodeType === 1) matched.push(cur);
                cur = cur[dir]
            }
            return matched
        },
        nth: function (cur, result, dir, elem) {
            result = result || 1;
            var num = 0;
            for (; cur; cur = cur[dir]) if (cur.nodeType === 1 && ++num === result) break;
            return cur
        },
        sibling: function (n, elem) {
            var r = [];
            for (; n; n = n.nextSibling) if (n.nodeType === 1 && n !== elem) r.push(n);
            return r
        }
    });

    function winnow(elements, qualifier, keep) {
        qualifier = qualifier || 0;
        if (jQuery.isFunction(qualifier)) return jQuery.grep(elements, function (elem, i) {
            var retVal = !! qualifier.call(elem, i, elem);
            return retVal === keep
        });
        else if (qualifier.nodeType) return jQuery.grep(elements, function (elem, i) {
            return elem === qualifier === keep
        });
        else if (typeof qualifier === "string") {
            var filtered = jQuery.grep(elements, function (elem) {
                return elem.nodeType === 1
            });
            if (isSimple.test(qualifier)) return jQuery.filter(qualifier, filtered, !keep);
            else qualifier = jQuery.filter(qualifier, filtered)
        }
        return jQuery.grep(elements, function (elem, i) {
            return jQuery.inArray(elem, qualifier) >= 0 === keep
        })
    }
    function createSafeFragment(document) {
        var list = nodeNames.split("|"),
            safeFrag = document.createDocumentFragment();
        if (safeFrag.createElement) while (list.length) safeFrag.createElement(list.pop());
        return safeFrag
    }
    var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" + "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
        rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
        rleadingWhitespace = /^\s+/,
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rtagName = /<([\w:]+)/,
        rtbody = /<tbody/i,
        rhtml = /<|&#?\w+;/,
        rnoInnerhtml = /<(?:script|style)/i,
        rnocache = /<(?:script|object|embed|option|style)/i,
        rnoshimcache = new RegExp("<(?:" + nodeNames + ")", "i"),
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /\/(java|ecma)script/i,
        rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
        wrapMap = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            area: [1, "<map>", "</map>"],
            _default: [0, "", ""]
        },
        safeFragment = createSafeFragment(document);
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    if (!jQuery.support.htmlSerialize) wrapMap._default = [1, "div<div>", "</div>"];
    jQuery.fn.extend({
        text: function (text) {
            if (jQuery.isFunction(text)) return this.each(function (i) {
                var self = jQuery(this);
                self.text(text.call(this, i, self.text()))
            });
            if (typeof text !== "object" && text !== undefined) return this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(text));
            return jQuery.text(this)
        },
        wrapAll: function (html) {
            if (jQuery.isFunction(html)) return this.each(function (i) {
                jQuery(this).wrapAll(html.call(this, i))
            });
            if (this[0]) {
                var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
                if (this[0].parentNode) wrap.insertBefore(this[0]);
                wrap.map(function () {
                    var elem = this;
                    while (elem.firstChild && elem.firstChild.nodeType === 1) elem = elem.firstChild;
                    return elem
                }).append(this)
            }
            return this
        },
        wrapInner: function (html) {
            if (jQuery.isFunction(html)) return this.each(function (i) {
                jQuery(this).wrapInner(html.call(this, i))
            });
            return this.each(function () {
                var self = jQuery(this),
                    contents = self.contents();
                if (contents.length) contents.wrapAll(html);
                else self.append(html)
            })
        },
        wrap: function (html) {
            var isFunction = jQuery.isFunction(html);
            return this.each(function (i) {
                jQuery(this).wrapAll(isFunction ? html.call(this, i) : html)
            })
        },
        unwrap: function () {
            return this.parent().each(function () {
                if (!jQuery.nodeName(this, "body")) jQuery(this).replaceWith(this.childNodes)
            }).end()
        },
        append: function () {
            return this.domManip(arguments, true, function (elem) {
                if (this.nodeType === 1) this.appendChild(elem)
            })
        },
        prepend: function () {
            return this.domManip(arguments, true, function (elem) {
                if (this.nodeType === 1) this.insertBefore(elem, this.firstChild)
            })
        },
        before: function () {
            if (this[0] && this[0].parentNode) return this.domManip(arguments, false, function (elem) {
                this.parentNode.insertBefore(elem, this)
            });
            else if (arguments.length) {
                var set = jQuery.clean(arguments);
                set.push.apply(set, this.toArray());
                return this.pushStack(set, "before", arguments)
            }
        },
        after: function () {
            if (this[0] && this[0].parentNode) return this.domManip(arguments, false, function (elem) {
                this.parentNode.insertBefore(elem, this.nextSibling)
            });
            else if (arguments.length) {
                var set = this.pushStack(this, "after", arguments);
                set.push.apply(set, jQuery.clean(arguments));
                return set
            }
        },
        remove: function (selector, keepData) {
            for (var i = 0, elem;
            (elem = this[i]) != null; i++) if (!selector || jQuery.filter(selector, [elem]).length) {
                if (!keepData && elem.nodeType === 1) {
                    jQuery.cleanData(elem.getElementsByTagName("*"));
                    jQuery.cleanData([elem])
                }
                if (elem.parentNode) elem.parentNode.removeChild(elem)
            }
            return this
        },
        empty: function () {
            for (var i = 0, elem;
            (elem = this[i]) != null; i++) {
                if (elem.nodeType === 1) jQuery.cleanData(elem.getElementsByTagName("*"));
                while (elem.firstChild) elem.removeChild(elem.firstChild)
            }
            return this
        },
        clone: function (dataAndEvents, deepDataAndEvents) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
            return this.map(function () {
                return jQuery.clone(this, dataAndEvents, deepDataAndEvents)
            })
        },
        html: function (value) {
            if (value === undefined) return this[0] && this[0].nodeType === 1 ? this[0].innerHTML.replace(rinlinejQuery, "") : null;
            else if (typeof value === "string" && !rnoInnerhtml.test(value) && (jQuery.support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {
                value = value.replace(rxhtmlTag, "<$1></$2>");
                try {
                    for (var i = 0, l = this.length; i < l; i++) if (this[i].nodeType === 1) {
                        jQuery.cleanData(this[i].getElementsByTagName("*"));
                        this[i].innerHTML = value
                    }
                } catch (e) {
                    this.empty().append(value)
                }
            } else if (jQuery.isFunction(value)) this.each(function (i) {
                var self = jQuery(this);
                self.html(value.call(this, i, self.html()))
            });
            else this.empty().append(value);
            return this
        },
        replaceWith: function (value) {
            if (this[0] && this[0].parentNode) {
                if (jQuery.isFunction(value)) return this.each(function (i) {
                    var self = jQuery(this),
                        old = self.html();
                    self.replaceWith(value.call(this, i, old))
                });
                if (typeof value !== "string") value = jQuery(value).detach();
                return this.each(function () {
                    var next = this.nextSibling,
                        parent = this.parentNode;
                    jQuery(this).remove();
                    if (next) jQuery(next).before(value);
                    else jQuery(parent).append(value)
                })
            } else return this.length ? this.pushStack(jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value) : this
        },
        detach: function (selector) {
            return this.remove(selector, true)
        },
        domManip: function (args, table, callback) {
            var results, first, fragment, parent, value = args[0],
                scripts = [];
            if (!jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test(value)) return this.each(function () {
                jQuery(this).domManip(args, table, callback, true)
            });
            if (jQuery.isFunction(value)) return this.each(function (i) {
                var self = jQuery(this);
                args[0] = value.call(this, i, table ? self.html() : undefined);
                self.domManip(args, table, callback)
            });
            if (this[0]) {
                parent = value && value.parentNode;
                if (jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length) results = {
                    fragment: parent
                };
                else results = jQuery.buildFragment(args, this, scripts);
                fragment = results.fragment;
                if (fragment.childNodes.length === 1) first = fragment = fragment.firstChild;
                else first = fragment.firstChild;
                if (first) {
                    table = table && jQuery.nodeName(first, "tr");
                    for (var i = 0, l = this.length, lastIndex = l - 1; i < l; i++) callback.call(table ? root(this[i], first) : this[i], results.cacheable || l > 1 && i < lastIndex ? jQuery.clone(fragment, true, true) : fragment)
                }
                if (scripts.length) jQuery.each(scripts, evalScript)
            }
            return this
        }
    });

    function root(elem, cur) {
        return jQuery.nodeName(elem, "table") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem
    }
    function cloneCopyEvent(src, dest) {
        if (dest.nodeType !== 1 || !jQuery.hasData(src)) return;
        var type, i, l, oldData = jQuery._data(src),
            curData = jQuery._data(dest, oldData),
            events = oldData.events;
        if (events) {
            delete curData.handle;
            curData.events = {};
            for (type in events) for (i = 0, l = events[type].length; i < l; i++) jQuery.event.add(dest, type + (events[type][i].namespace ? "." : "") + events[type][i].namespace, events[type][i], events[type][i].data)
        }
        if (curData.data) curData.data = jQuery.extend({}, curData.data)
    }
    function cloneFixAttributes(src, dest) {
        var nodeName;
        if (dest.nodeType !== 1) return;
        if (dest.clearAttributes) dest.clearAttributes();
        if (dest.mergeAttributes) dest.mergeAttributes(src);
        nodeName = dest.nodeName.toLowerCase();
        if (nodeName === "object") dest.outerHTML = src.outerHTML;
        else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
            if (src.checked) dest.defaultChecked = dest.checked = src.checked;
            if (dest.value !== src.value) dest.value = src.value
        } else if (nodeName === "option") dest.selected = src.defaultSelected;
        else if (nodeName === "input" || nodeName === "textarea") dest.defaultValue = src.defaultValue;
        dest.removeAttribute(jQuery.expando)
    }
    jQuery.buildFragment = function (args, nodes, scripts) {
        var fragment, cacheable, cacheresults, doc, first = args[0];
        if (nodes && nodes[0]) doc = nodes[0].ownerDocument || nodes[0];
        if (!doc.createDocumentFragment) doc = document;
        if (args.length === 1 && typeof first === "string" && first.length < 512 && doc === document && first.charAt(0) === "<" && !rnocache.test(first) && (jQuery.support.checkClone || !rchecked.test(first)) && (jQuery.support.html5Clone || !rnoshimcache.test(first))) {
            cacheable = true;
            cacheresults = jQuery.fragments[first];
            if (cacheresults && cacheresults !== 1) fragment = cacheresults
        }
        if (!fragment) {
            fragment = doc.createDocumentFragment();
            jQuery.clean(args, doc, fragment, scripts)
        }
        if (cacheable) jQuery.fragments[first] = cacheresults ? fragment : 1;
        return {
            fragment: fragment,
            cacheable: cacheable
        }
    };
    jQuery.fragments = {};
    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function (name, original) {
        jQuery.fn[name] = function (selector) {
            var ret = [],
                insert = jQuery(selector),
                parent = this.length === 1 && this[0].parentNode;
            if (parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1) {
                insert[original](this[0]);
                return this
            } else {
                for (var i = 0, l = insert.length; i < l; i++) {
                    var elems = (i > 0 ? this.clone(true) : this).get();
                    jQuery(insert[i])[original](elems);
                    ret = ret.concat(elems)
                }
                return this.pushStack(ret, name, insert.selector)
            }
        }
    });

    function getAll(elem) {
        if (typeof elem.getElementsByTagName !== "undefined") return elem.getElementsByTagName("*");
        else if (typeof elem.querySelectorAll !== "undefined") return elem.querySelectorAll("*");
        else return []
    }
    function fixDefaultChecked(elem) {
        if (elem.type === "checkbox" || elem.type === "radio") elem.defaultChecked = elem.checked
    }
    function findInputs(elem) {
        var nodeName = (elem.nodeName || "").toLowerCase();
        if (nodeName === "input") fixDefaultChecked(elem);
        else if (nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined") jQuery.grep(elem.getElementsByTagName("input"), fixDefaultChecked)
    }
    function shimCloneNode(elem) {
        var div = document.createElement("div");
        safeFragment.appendChild(div);
        div.innerHTML = elem.outerHTML;
        return div.firstChild
    }
    jQuery.extend({
        clone: function (elem, dataAndEvents, deepDataAndEvents) {
            var srcElements, destElements, i, clone = jQuery.support.html5Clone || !rnoshimcache.test("<" + elem.nodeName) ? elem.cloneNode(true) : shimCloneNode(elem);
            if ((!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
                cloneFixAttributes(elem, clone);
                srcElements = getAll(elem);
                destElements = getAll(clone);
                for (i = 0; srcElements[i]; ++i) if (destElements[i]) cloneFixAttributes(srcElements[i], destElements[i])
            }
            if (dataAndEvents) {
                cloneCopyEvent(elem, clone);
                if (deepDataAndEvents) {
                    srcElements = getAll(elem);
                    destElements = getAll(clone);
                    for (i = 0; srcElements[i]; ++i) cloneCopyEvent(srcElements[i], destElements[i])
                }
            }
            srcElements = destElements = null;
            return clone
        },
        clean: function (elems, context, fragment, scripts) {
            var checkScriptType;
            context = context || document;
            if (typeof context.createElement === "undefined") context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
            var ret = [],
                j;
            for (var i = 0, elem;
            (elem = elems[i]) != null; i++) {
                if (typeof elem === "number") elem += "";
                if (!elem) continue;
                if (typeof elem === "string") if (!rhtml.test(elem)) elem = context.createTextNode(elem);
                else {
                    elem = elem.replace(rxhtmlTag, "<$1></$2>");
                    var tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase(),
                        wrap = wrapMap[tag] || wrapMap._default,
                        depth = wrap[0],
                        div = context.createElement("div");
                    if (context === document) safeFragment.appendChild(div);
                    else createSafeFragment(context).appendChild(div);
                    div.innerHTML = wrap[1] + elem + wrap[2];
                    while (depth--) div = div.lastChild;
                    if (!jQuery.support.tbody) {
                        var hasBody = rtbody.test(elem),
                            tbody = tag === "table" && !hasBody ? div.firstChild && div.firstChild.childNodes : wrap[1] === "<table>" && !hasBody ? div.childNodes : [];
                        for (j = tbody.length - 1; j >= 0; --j) if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) tbody[j].parentNode.removeChild(tbody[j])
                    }
                    if (!jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem)) div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                    elem = div.childNodes
                }
                var len;
                if (!jQuery.support.appendChecked) if (elem[0] && typeof (len = elem.length) === "number") for (j = 0; j < len; j++) findInputs(elem[j]);
                else findInputs(elem);
                if (elem.nodeType) ret.push(elem);
                else ret = jQuery.merge(ret, elem)
            }
            if (fragment) {
                checkScriptType = function (elem) {
                    return !elem.type || rscriptType.test(elem.type)
                };
                for (i = 0; ret[i]; i++) if (scripts && jQuery.nodeName(ret[i], "script") && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript")) scripts.push(ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i]);
                else {
                    if (ret[i].nodeType === 1) {
                        var jsTags = jQuery.grep(ret[i].getElementsByTagName("script"), checkScriptType);
                        ret.splice.apply(ret, [i + 1, 0].concat(jsTags))
                    }
                    fragment.appendChild(ret[i])
                }
            }
            return ret
        },
        cleanData: function (elems) {
            var data, id, cache = jQuery.cache,
                special = jQuery.event.special,
                deleteExpando = jQuery.support.deleteExpando;
            for (var i = 0, elem;
            (elem = elems[i]) != null; i++) {
                if (elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) continue;
                id = elem[jQuery.expando];
                if (id) {
                    data = cache[id];
                    if (data && data.events) {
                        for (var type in data.events) if (special[type]) jQuery.event.remove(elem, type);
                        else jQuery.removeEvent(elem, type, data.handle);
                        if (data.handle) data.handle.elem = null
                    }
                    if (deleteExpando) delete elem[jQuery.expando];
                    else if (elem.removeAttribute) elem.removeAttribute(jQuery.expando);
                    delete cache[id]
                }
            }
        }
    });

    function evalScript(i, elem) {
        if (elem.src) jQuery.ajax({
            url: elem.src,
            async: false,
            dataType: "script"
        });
        else jQuery.globalEval((elem.text || elem.textContent || elem.innerHTML || "").replace(rcleanScript, "/*$0*/"));
        if (elem.parentNode) elem.parentNode.removeChild(elem)
    }
    var ralpha = /alpha\([^)]*\)/i,
        ropacity = /opacity=([^)]*)/,
        rupper = /([A-Z]|^ms)/g,
        rnumpx = /^-?\d+(?:px)?$/i,
        rnum = /^-?\d/,
        rrelNum = /^([\-+])=([\-+.\de]+)/,
        cssShow = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        cssWidth = ["Left", "Right"],
        cssHeight = ["Top", "Bottom"],
        curCSS, getComputedStyle, currentStyle;
    jQuery.fn.css = function (name, value) {
        if (arguments.length === 2 && value === undefined) return this;
        return jQuery.access(this, name, value, true, function (elem, name, value) {
            return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name)
        })
    };
    jQuery.extend({
        cssHooks: {
            opacity: {
                get: function (elem, computed) {
                    if (computed) {
                        var ret = curCSS(elem, "opacity", "opacity");
                        return ret === "" ? "1" : ret
                    } else return elem.style.opacity
                }
            }
        },
        cssNumber: {
            "fillOpacity": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        },
        cssProps: {
            "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function (elem, name, value, extra) {
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) return;
            var ret, type, origName = jQuery.camelCase(name),
                style = elem.style,
                hooks = jQuery.cssHooks[origName];
            name = jQuery.cssProps[origName] || origName;
            if (value !== undefined) {
                type = typeof value;
                if (type === "string" && (ret = rrelNum.exec(value))) {
                    value = +(ret[1] + 1) * +ret[2] + parseFloat(jQuery.css(elem, name));
                    type = "number"
                }
                if (value == null || type === "number" && isNaN(value)) return;
                if (type === "number" && !jQuery.cssNumber[origName]) value += "px";
                if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined) try {
                    style[name] = value
                } catch (e) {}
            } else {
                if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) return ret;
                return style[name]
            }
        },
        css: function (elem, name, extra) {
            var ret, hooks;
            name = jQuery.camelCase(name);
            hooks = jQuery.cssHooks[name];
            name = jQuery.cssProps[name] || name;
            if (name === "cssFloat") name = "float";
            if (hooks && "get" in hooks && (ret = hooks.get(elem, true, extra)) !== undefined) return ret;
            else if (curCSS) return curCSS(elem, name)
        },
        swap: function (elem, options, callback) {
            var old = {};
            for (var name in options) {
                old[name] = elem.style[name];
                elem.style[name] = options[name]
            }
            callback.call(elem);
            for (name in options) elem.style[name] = old[name]
        }
    });
    jQuery.curCSS = jQuery.css;
    jQuery.each(["height", "width"], function (i, name) {
        jQuery.cssHooks[name] = {
            get: function (elem, computed, extra) {
                var val;
                if (computed) {
                    if (elem.offsetWidth !== 0) return getWH(elem, name, extra);
                    else jQuery.swap(elem, cssShow, function () {
                        val = getWH(elem, name, extra)
                    });
                    return val
                }
            },
            set: function (elem, value) {
                if (rnumpx.test(value)) {
                    value = parseFloat(value);
                    if (value >= 0) return value + "px"
                } else return value
            }
        }
    });
    if (!jQuery.support.opacity) jQuery.cssHooks.opacity = {
        get: function (elem, computed) {
            return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ? parseFloat(RegExp.$1) / 100 + "" : computed ? "1" : ""
        },
        set: function (elem, value) {
            var style = elem.style,
                currentStyle = elem.currentStyle,
                opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + value * 100 + ")" : "",
                filter = currentStyle && currentStyle.filter || style.filter || "";
            style.zoom = 1;
            if (value >= 1 && jQuery.trim(filter.replace(ralpha, "")) === "") {
                style.removeAttribute("filter");
                if (currentStyle && !currentStyle.filter) return
            }
            style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + " " + opacity
        }
    };
    jQuery(function () {
        if (!jQuery.support.reliableMarginRight) jQuery.cssHooks.marginRight = {
            get: function (elem, computed) {
                var ret;
                jQuery.swap(elem, {
                    "display": "inline-block"
                }, function () {
                    if (computed) ret = curCSS(elem, "margin-right", "marginRight");
                    else ret = elem.style.marginRight
                });
                return ret
            }
        }
    });
    if (document.defaultView && document.defaultView.getComputedStyle) getComputedStyle = function (elem, name) {
        var ret, defaultView, computedStyle;
        name = name.replace(rupper, "-$1").toLowerCase();
        if ((defaultView = elem.ownerDocument.defaultView) && (computedStyle = defaultView.getComputedStyle(elem, null))) {
            ret = computedStyle.getPropertyValue(name);
            if (ret === "" && !jQuery.contains(elem.ownerDocument.documentElement, elem)) ret = jQuery.style(elem, name)
        }
        return ret
    };
    if (document.documentElement.currentStyle) currentStyle = function (elem, name) {
        var left, rsLeft, uncomputed, ret = elem.currentStyle && elem.currentStyle[name],
            style = elem.style;
        if (ret === null && style && (uncomputed = style[name])) ret = uncomputed;
        if (!rnumpx.test(ret) && rnum.test(ret)) {
            left = style.left;
            rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;
            if (rsLeft) elem.runtimeStyle.left = elem.currentStyle.left;
            style.left = name === "fontSize" ? "1em" : ret || 0;
            ret = style.pixelLeft + "px";
            style.left = left;
            if (rsLeft) elem.runtimeStyle.left = rsLeft
        }
        return ret === "" ? "auto" : ret
    };
    curCSS = getComputedStyle || currentStyle;

    function getWH(elem, name, extra) {
        var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            which = name === "width" ? cssWidth : cssHeight,
            i = 0,
            len = which.length;
        if (val > 0) {
            if (extra !== "border") for (; i < len; i++) {
                if (!extra) val -= parseFloat(jQuery.css(elem, "padding" + which[i])) || 0;
                if (extra === "margin") val += parseFloat(jQuery.css(elem, extra + which[i])) || 0;
                else val -= parseFloat(jQuery.css(elem, "border" + which[i] + "Width")) || 0
            }
            return val + "px"
        }
        val = curCSS(elem, name, name);
        if (val < 0 || val == null) val = elem.style[name] || 0;
        val = parseFloat(val) || 0;
        if (extra) for (; i < len; i++) {
            val += parseFloat(jQuery.css(elem, "padding" + which[i])) || 0;
            if (extra !== "padding") val += parseFloat(jQuery.css(elem, "border" + which[i] + "Width")) || 0;
            if (extra === "margin") val += parseFloat(jQuery.css(elem, extra + which[i])) || 0
        }
        return val + "px"
    }
    if (jQuery.expr && jQuery.expr.filters) {
        jQuery.expr.filters.hidden = function (elem) {
            var width = elem.offsetWidth,
                height = elem.offsetHeight;
            return width === 0 && height === 0 || !jQuery.support.reliableHiddenOffsets && (elem.style && elem.style.display || jQuery.css(elem, "display")) === "none"
        };
        jQuery.expr.filters.visible = function (elem) {
            return !jQuery.expr.filters.hidden(elem)
        }
    }
    var r20 = /%20/g,
        rbracket = /\[\]$/,
        rCRLF = /\r?\n/g,
        rhash = /#.*$/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
        rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
        rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
        rnoContent = /^(?:GET|HEAD)$/,
        rprotocol = /^\/\//,
        rquery = /\?/,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        rselectTextarea = /^(?:select|textarea)/i,
        rspacesAjax = /\s+/,
        rts = /([?&])_=[^&]*/,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        _load = jQuery.fn.load,
        prefilters = {},
        transports = {},
        ajaxLocation, ajaxLocParts, allTypes = ["*/"] + ["*"];
    try {
        ajaxLocation = location.href
    } catch (e) {
        ajaxLocation = document.createElement("a");
        ajaxLocation.href = "";
        ajaxLocation = ajaxLocation.href
    }
    ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

    function addToPrefiltersOrTransports(structure) {
        return function (dataTypeExpression, func) {
            if (typeof dataTypeExpression !== "string") {
                func = dataTypeExpression;
                dataTypeExpression = "*"
            }
            if (jQuery.isFunction(func)) {
                var dataTypes = dataTypeExpression.toLowerCase().split(rspacesAjax),
                    i = 0,
                    length = dataTypes.length,
                    dataType, list, placeBefore;
                for (; i < length; i++) {
                    dataType = dataTypes[i];
                    placeBefore = /^\+/.test(dataType);
                    if (placeBefore) dataType = dataType.substr(1) || "*";
                    list = structure[dataType] = structure[dataType] || [];
                    list[placeBefore ? "unshift" : "push"](func)
                }
            }
        }
    }
    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, dataType, inspected) {
        dataType = dataType || options.dataTypes[0];
        inspected = inspected || {};
        inspected[dataType] = true;
        var list = structure[dataType],
            i = 0,
            length = list ? list.length : 0,
            executeOnly = structure === prefilters,
            selection;
        for (; i < length && (executeOnly || !selection); i++) {
            selection = list[i](options, originalOptions, jqXHR);
            if (typeof selection === "string") if (!executeOnly || inspected[selection]) selection = undefined;
            else {
                options.dataTypes.unshift(selection);
                selection = inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, selection, inspected)
            }
        }
        if ((executeOnly || !selection) && !inspected["*"]) selection = inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR, "*", inspected);
        return selection
    }
    function ajaxExtend(target, src) {
        var key, deep, flatOptions = jQuery.ajaxSettings.flatOptions || {};
        for (key in src) if (src[key] !== undefined)(flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
        if (deep) jQuery.extend(true, target, deep)
    }
    jQuery.fn.extend({
        load: function (url, params, callback) {
            if (typeof url !== "string" && _load) return _load.apply(this, arguments);
            else if (!this.length) return this;
            var off = url.indexOf(" ");
            if (off >= 0) {
                var selector = url.slice(off, url.length);
                url = url.slice(0, off)
            }
            var type = "GET";
            if (params) if (jQuery.isFunction(params)) {
                callback = params;
                params = undefined
            } else if (typeof params === "object") {
                params = jQuery.param(params, jQuery.ajaxSettings.traditional);
                type = "POST"
            }
            var self = this;
            jQuery.ajax({
                url: url,
                type: type,
                dataType: "html",
                data: params,
                complete: function (jqXHR, status, responseText) {
                    responseText = jqXHR.responseText;
                    if (jqXHR.isResolved()) {
                        jqXHR.done(function (r) {
                            responseText = r
                        });
                        self.html(selector ? jQuery("<div>").append(responseText.replace(rscript, "")).find(selector) : responseText)
                    }
                    if (callback) self.each(callback, [responseText, status, jqXHR])
                }
            });
            return this
        },
        serialize: function () {
            return jQuery.param(this.serializeArray())
        },
        serializeArray: function () {
            return this.map(function () {
                return this.elements ? jQuery.makeArray(this.elements) : this
            }).filter(function () {
                return this.name && !this.disabled && (this.checked || rselectTextarea.test(this.nodeName) || rinput.test(this.type))
            }).map(function (i, elem) {
                var val = jQuery(this).val();
                return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function (val, i) {
                    return {
                        name: elem.name,
                        value: val.replace(rCRLF, "\r\n")
                    }
                }) : {
                    name: elem.name,
                    value: val.replace(rCRLF, "\r\n")
                }
            }).get()
        }
    });
    jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function (i, o) {
        jQuery.fn[o] = function (f) {
            return this.on(o, f)
        }
    });
    jQuery.each(["get", "post"], function (i, method) {
        jQuery[method] = function (url, data, callback, type) {
            if (jQuery.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined
            }
            return jQuery.ajax({
                type: method,
                url: url,
                data: data,
                success: callback,
                dataType: type
            })
        }
    });
    jQuery.extend({
        getScript: function (url, callback) {
            return jQuery.get(url, undefined, callback, "script")
        },
        getJSON: function (url, data, callback) {
            return jQuery.get(url, data, callback, "json")
        },
        ajaxSetup: function (target, settings) {
            if (settings) ajaxExtend(target, jQuery.ajaxSettings);
            else {
                settings = target;
                target = jQuery.ajaxSettings
            }
            ajaxExtend(target, settings);
            return target
        },
        ajaxSettings: {
            url: ajaxLocation,
            isLocal: rlocalProtocol.test(ajaxLocParts[1]),
            global: true,
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": allTypes
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },
            converters: {
                "* text": window.String,
                "text html": true,
                "text json": jQuery.parseJSON,
                "text xml": jQuery.parseXML
            },
            flatOptions: {
                context: true,
                url: true
            }
        },
        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
        ajaxTransport: addToPrefiltersOrTransports(transports),
        ajax: function (url, options) {
            if (typeof url === "object") {
                options = url;
                url = undefined
            }
            options = options || {};
            var s = jQuery.ajaxSetup({}, options),
                callbackContext = s.context || s,
                globalEventContext = callbackContext !== s && (callbackContext.nodeType || callbackContext instanceof jQuery) ? jQuery(callbackContext) : jQuery.event,
                deferred = jQuery.Deferred(),
                completeDeferred = jQuery.Callbacks("once memory"),
                statusCode = s.statusCode || {},
                ifModifiedKey, requestHeaders = {},
                requestHeadersNames = {},
                responseHeadersString, responseHeaders, transport, timeoutTimer, parts, state = 0,
                fireGlobals, i, jqXHR = {
                    readyState: 0,
                    setRequestHeader: function (name, value) {
                        if (!state) {
                            var lname = name.toLowerCase();
                            name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                            requestHeaders[name] = value
                        }
                        return this
                    },
                    getAllResponseHeaders: function () {
                        return state === 2 ? responseHeadersString : null
                    },
                    getResponseHeader: function (key) {
                        var match;
                        if (state === 2) {
                            if (!responseHeaders) {
                                responseHeaders = {};
                                while (match = rheaders.exec(responseHeadersString)) responseHeaders[match[1].toLowerCase()] = match[2]
                            }
                            match = responseHeaders[key.toLowerCase()]
                        }
                        return match === undefined ? null : match
                    },
                    overrideMimeType: function (type) {
                        if (!state) s.mimeType = type;
                        return this
                    },
                    abort: function (statusText) {
                        statusText = statusText || "abort";
                        if (transport) transport.abort(statusText);
                        done(0, statusText);
                        return this
                    }
                };

            function done(status, nativeStatusText, responses, headers) {
                if (state === 2) return;
                state = 2;
                if (timeoutTimer) clearTimeout(timeoutTimer);
                transport = undefined;
                responseHeadersString = headers || "";
                jqXHR.readyState = status > 0 ? 4 : 0;
                var isSuccess, success, error, statusText = nativeStatusText,
                    response = responses ? ajaxHandleResponses(s, jqXHR, responses) : undefined,
                    lastModified, etag;
                if (status >= 200 && status < 300 || status === 304) {
                    if (s.ifModified) {
                        if (lastModified = jqXHR.getResponseHeader("Last-Modified")) jQuery.lastModified[ifModifiedKey] = lastModified;
                        if (etag = jqXHR.getResponseHeader("Etag")) jQuery.etag[ifModifiedKey] = etag
                    }
                    if (status === 304) {
                        statusText = "notmodified";
                        isSuccess = true
                    } else try {
                        success = ajaxConvert(s, response);
                        statusText = "success";
                        isSuccess = true
                    } catch (e) {
                        statusText = "parsererror";
                        error = e
                    }
                } else {
                    error = statusText;
                    if (!statusText || status) {
                        statusText = "error";
                        if (status < 0) status = 0
                    }
                }
                jqXHR.status = status;
                jqXHR.statusText = "" + (nativeStatusText || statusText);
                if (isSuccess) deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
                else deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
                jqXHR.statusCode(statusCode);
                statusCode = undefined;
                if (fireGlobals) globalEventContext.trigger("ajax" + (isSuccess ? "Success" : "Error"), [jqXHR, s, isSuccess ? success : error]);
                completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
                if (fireGlobals) {
                    globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                    if (!--jQuery.active) jQuery.event.trigger("ajaxStop")
                }
            }
            deferred.promise(jqXHR);
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            jqXHR.complete = completeDeferred.add;
            jqXHR.statusCode = function (map) {
                if (map) {
                    var tmp;
                    if (state < 2) for (tmp in map) statusCode[tmp] = [statusCode[tmp], map[tmp]];
                    else {
                        tmp = map[jqXHR.status];
                        jqXHR.then(tmp, tmp)
                    }
                }
                return this
            };
            s.url = ((url || s.url) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
            s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().split(rspacesAjax);
            if (s.crossDomain == null) {
                parts = rurl.exec(s.url.toLowerCase());
                s.crossDomain = !! (parts && (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))))
            }
            if (s.data && s.processData && typeof s.data !== "string") s.data = jQuery.param(s.data, s.traditional);
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
            if (state === 2) return false;
            fireGlobals = s.global;
            s.type = s.type.toUpperCase();
            s.hasContent = !rnoContent.test(s.type);
            if (fireGlobals && jQuery.active++ === 0) jQuery.event.trigger("ajaxStart");
            if (!s.hasContent) {
                if (s.data) {
                    s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
                    delete s.data
                }
                ifModifiedKey = s.url;
                if (s.cache === false) {
                    var ts = jQuery.now(),
                        ret = s.url.replace(rts, "$1_=" + ts);
                    s.url = ret + (ret === s.url ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "")
                }
            }
            if (s.data && s.hasContent && s.contentType !== false || options.contentType) jqXHR.setRequestHeader("Content-Type", s.contentType);
            if (s.ifModified) {
                ifModifiedKey = ifModifiedKey || s.url;
                if (jQuery.lastModified[ifModifiedKey]) jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[ifModifiedKey]);
                if (jQuery.etag[ifModifiedKey]) jqXHR.setRequestHeader("If-None-Match", jQuery.etag[ifModifiedKey])
            }
            jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
            for (i in s.headers) jqXHR.setRequestHeader(i, s.headers[i]);
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
                jqXHR.abort();
                return false
            }
            for (i in {
                success: 1,
                error: 1,
                complete: 1
            }) jqXHR[i](s[i]);
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
            if (!transport) done(-1, "No Transport");
            else {
                jqXHR.readyState = 1;
                if (fireGlobals) globalEventContext.trigger("ajaxSend", [jqXHR, s]);
                if (s.async && s.timeout > 0) timeoutTimer = setTimeout(function () {
                    jqXHR.abort("timeout")
                }, s.timeout);
                try {
                    state = 1;
                    transport.send(requestHeaders, done)
                } catch (e) {
                    if (state < 2) done(-1, e);
                    else throw e;
                }
            }
            return jqXHR
        },
        param: function (a, traditional) {
            var s = [],
                add = function (key, value) {
                    value = jQuery.isFunction(value) ? value() : value;
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value)
                };
            if (traditional === undefined) traditional = jQuery.ajaxSettings.traditional;
            if (jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) jQuery.each(a, function () {
                add(this.name, this.value)
            });
            else for (var prefix in a) buildParams(prefix, a[prefix], traditional, add);
            return s.join("&").replace(r20, "+")
        }
    });

    function buildParams(prefix, obj, traditional, add) {
        if (jQuery.isArray(obj)) jQuery.each(obj, function (i, v) {
            if (traditional || rbracket.test(prefix)) add(prefix, v);
            else buildParams(prefix + "[" + (typeof v === "object" || jQuery.isArray(v) ? i : "") + "]", v, traditional, add)
        });
        else if (!traditional && obj != null && typeof obj === "object") for (var name in obj) buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
        else add(prefix, obj)
    }
    jQuery.extend({
        active: 0,
        lastModified: {},
        etag: {}
    });

    function ajaxHandleResponses(s, jqXHR, responses) {
        var contents = s.contents,
            dataTypes = s.dataTypes,
            responseFields = s.responseFields,
            ct, type, finalDataType, firstDataType;
        for (type in responseFields) if (type in responses) jqXHR[responseFields[type]] = responses[type];
        while (dataTypes[0] === "*") {
            dataTypes.shift();
            if (ct === undefined) ct = s.mimeType || jqXHR.getResponseHeader("content-type")
        }
        if (ct) for (type in contents) if (contents[type] && contents[type].test(ct)) {
            dataTypes.unshift(type);
            break
        }
        if (dataTypes[0] in responses) finalDataType = dataTypes[0];
        else {
            for (type in responses) {
                if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                    finalDataType = type;
                    break
                }
                if (!firstDataType) firstDataType = type
            }
            finalDataType = finalDataType || firstDataType
        }
        if (finalDataType) {
            if (finalDataType !== dataTypes[0]) dataTypes.unshift(finalDataType);
            return responses[finalDataType]
        }
    }

    function ajaxConvert(s, response) {
        if (s.dataFilter) response = s.dataFilter(response, s.dataType);
        var dataTypes = s.dataTypes,
            converters = {},
            i, key, length = dataTypes.length,
            tmp, current = dataTypes[0],
            prev, conversion, conv, conv1, conv2;
        for (i = 1; i < length; i++) {
            if (i === 1) for (key in s.converters) if (typeof key === "string") converters[key.toLowerCase()] = s.converters[key];
            prev = current;
            current = dataTypes[i];
            if (current === "*") current = prev;
            else if (prev !== "*" && prev !== current) {
                conversion = prev + " " + current;
                conv = converters[conversion] || converters["* " + current];
                if (!conv) {
                    conv2 = undefined;
                    for (conv1 in converters) {
                        tmp = conv1.split(" ");
                        if (tmp[0] === prev || tmp[0] === "*") {
                            conv2 = converters[tmp[1] + " " + current];
                            if (conv2) {
                                conv1 = converters[conv1];
                                if (conv1 === true) conv = conv2;
                                else if (conv2 === true) conv = conv1;
                                break
                            }
                        }
                    }
                }
                if (!(conv || conv2)) jQuery.error("No conversion from " + conversion.replace(" ", " to "));
                if (conv !== true) response = conv ? conv(response) : conv2(conv1(response))
            }
        }
        return response
    }
    var jsc = jQuery.now(),
        jsre = /(\=)\?(&|$)|\?\?/i;
    jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function () {
            return jQuery.expando + "_" + jsc++
        }
    });
    jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {
        var inspectData = s.contentType === "application/x-www-form-urlencoded" && typeof s.data === "string";
        if (s.dataTypes[0] === "jsonp" || s.jsonp !== false && (jsre.test(s.url) || inspectData && jsre.test(s.data))) {
            var responseContainer, jsonpCallback = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback,
                previous = window[jsonpCallback],
                url = s.url,
                data = s.data,
                replace = "$1" + jsonpCallback + "$2";
            if (s.jsonp !== false) {
                url = url.replace(jsre, replace);
                if (s.url === url) {
                    if (inspectData) data = data.replace(jsre, replace);
                    if (s.data === data) url += (/\?/.test(url) ? "&" : "?") + s.jsonp + "=" + jsonpCallback
                }
            }
            s.url = url;
            s.data = data;
            window[jsonpCallback] = function (response) {
                responseContainer = [response]
            };
            jqXHR.always(function () {
                window[jsonpCallback] = previous;
                if (responseContainer && jQuery.isFunction(previous)) window[jsonpCallback](responseContainer[0])
            });
            s.converters["script json"] = function () {
                if (!responseContainer) jQuery.error(jsonpCallback + " was not called");
                return responseContainer[0]
            };
            s.dataTypes[0] = "json";
            return "script"
        }
    });
    jQuery.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            "text script": function (text) {
                jQuery.globalEval(text);
                return text
            }
        }
    });
    jQuery.ajaxPrefilter("script", function (s) {
        if (s.cache === undefined) s.cache = false;
        if (s.crossDomain) {
            s.type = "GET";
            s.global = false
        }
    });
    jQuery.ajaxTransport("script", function (s) {
        if (s.crossDomain) {
            var script, head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
            return {
                send: function (_, callback) {
                    script = document.createElement("script");
                    script.async = "async";
                    if (s.scriptCharset) script.charset = s.scriptCharset;
                    script.src = s.url;
                    script.onload = script.onreadystatechange = function (_, isAbort) {
                        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                            script.onload = script.onreadystatechange = null;
                            if (head && script.parentNode) head.removeChild(script);
                            script = undefined;
                            if (!isAbort) callback(200, "success")
                        }
                    };
                    head.insertBefore(script, head.firstChild)
                },
                abort: function () {
                    if (script) script.onload(0, 1)
                }
            }
        }
    });
    var xhrOnUnloadAbort = window.ActiveXObject ?
    function () {
        for (var key in xhrCallbacks) xhrCallbacks[key](0, 1)
    } : false, xhrId = 0, xhrCallbacks;

    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest
        } catch (e) {}
    }
    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP")
        } catch (e) {}
    }
    jQuery.ajaxSettings.xhr = window.ActiveXObject ?
    function () {
        return !this.isLocal && createStandardXHR() || createActiveXHR()
    } : createStandardXHR;
    (function (xhr) {
        jQuery.extend(jQuery.support, {
            ajax: !! xhr,
            cors: !! xhr && "withCredentials" in xhr
        })
    })(jQuery.ajaxSettings.xhr());
    if (jQuery.support.ajax) jQuery.ajaxTransport(function (s) {
        if (!s.crossDomain || jQuery.support.cors) {
            var callback;
            return {
                send: function (headers, complete) {
                    var xhr = s.xhr(),
                        handle, i;
                    if (s.username) xhr.open(s.type, s.url, s.async, s.username, s.password);
                    else xhr.open(s.type, s.url, s.async);
                    if (s.xhrFields) for (i in s.xhrFields) xhr[i] = s.xhrFields[i];
                    if (s.mimeType && xhr.overrideMimeType) xhr.overrideMimeType(s.mimeType);
                    if (!s.crossDomain && !headers["X-Requested-With"]) headers["X-Requested-With"] = "XMLHttpRequest";
                    try {
                        for (i in headers) xhr.setRequestHeader(i, headers[i])
                    } catch (_) {}
                    xhr.send(s.hasContent && s.data || null);
                    callback = function (_, isAbort) {
                        var status, statusText, responseHeaders, responses, xml;
                        try {
                            if (callback && (isAbort || xhr.readyState === 4)) {
                                callback = undefined;
                                if (handle) {
                                    xhr.onreadystatechange = jQuery.noop;
                                    if (xhrOnUnloadAbort) delete xhrCallbacks[handle]
                                }
                                if (isAbort) {
                                    if (xhr.readyState !== 4) xhr.abort()
                                } else {
                                    status = xhr.status;
                                    responseHeaders = xhr.getAllResponseHeaders();
                                    responses = {};
                                    xml = xhr.responseXML;
                                    if (xml && xml.documentElement) responses.xml = xml;
                                    responses.text = xhr.responseText;
                                    try {
                                        statusText = xhr.statusText
                                    } catch (e) {
                                        statusText = ""
                                    }
                                    if (!status && s.isLocal && !s.crossDomain) status = responses.text ? 200 : 404;
                                    else if (status === 1223) status = 204
                                }
                            }
                        } catch (firefoxAccessException) {
                            if (!isAbort) complete(-1, firefoxAccessException)
                        }
                        if (responses) complete(status, statusText, responses, responseHeaders)
                    };
                    if (!s.async || xhr.readyState === 4) callback();
                    else {
                        handle = ++xhrId;
                        if (xhrOnUnloadAbort) {
                            if (!xhrCallbacks) {
                                xhrCallbacks = {};
                                jQuery(window).unload(xhrOnUnloadAbort)
                            }
                            xhrCallbacks[handle] = callback
                        }
                        xhr.onreadystatechange = callback
                    }
                },
                abort: function () {
                    if (callback) callback(0, 1)
                }
            }
        }
    });
    var elemdisplay = {},
        iframe, iframeDoc, rfxtypes = /^(?:toggle|show|hide)$/,
        rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
        timerId, fxAttrs = [
            ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
            ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
            ["opacity"]
        ],
        fxNow;
    jQuery.fn.extend({
        show: function (speed, easing, callback) {
            var elem, display;
            if (speed || speed === 0) return this.animate(genFx("show", 3), speed, easing, callback);
            else {
                for (var i = 0, j = this.length; i < j; i++) {
                    elem = this[i];
                    if (elem.style) {
                        display = elem.style.display;
                        if (!jQuery._data(elem, "olddisplay") && display === "none") display = elem.style.display = "";
                        if (display === "" && jQuery.css(elem, "display") === "none") jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName))
                    }
                }
                for (i = 0; i < j; i++) {
                    elem = this[i];
                    if (elem.style) {
                        display = elem.style.display;
                        if (display === "" || display === "none") elem.style.display = jQuery._data(elem, "olddisplay") || ""
                    }
                }
                return this
            }
        },
        hide: function (speed, easing, callback) {
            if (speed || speed === 0) return this.animate(genFx("hide", 3), speed, easing, callback);
            else {
                var elem, display, i = 0,
                    j = this.length;
                for (; i < j; i++) {
                    elem = this[i];
                    if (elem.style) {
                        display = jQuery.css(elem, "display");
                        if (display !== "none" && !jQuery._data(elem, "olddisplay")) jQuery._data(elem, "olddisplay", display)
                    }
                }
                for (i = 0; i < j; i++) if (this[i].style) this[i].style.display = "none";
                return this
            }
        },
        _toggle: jQuery.fn.toggle,
        toggle: function (fn, fn2, callback) {
            var bool = typeof fn === "boolean";
            if (jQuery.isFunction(fn) && jQuery.isFunction(fn2)) this._toggle.apply(this, arguments);
            else if (fn == null || bool) this.each(function () {
                var state = bool ? fn : jQuery(this).is(":hidden");
                jQuery(this)[state ? "show" : "hide"]()
            });
            else this.animate(genFx("toggle", 3), fn, fn2, callback);
            return this
        },
        fadeTo: function (speed, to, easing, callback) {
            return this.filter(":hidden").css("opacity", 0).show().end().animate({
                opacity: to
            }, speed, easing, callback)
        },
        animate: function (prop, speed, easing, callback) {
            var optall = jQuery.speed(speed, easing, callback);
            if (jQuery.isEmptyObject(prop)) return this.each(optall.complete, [false]);
            prop = jQuery.extend({}, prop);

            function doAnimation() {
                if (optall.queue === false) jQuery._mark(this);
                var opt = jQuery.extend({}, optall),
                    isElement = this.nodeType === 1,
                    hidden = isElement && jQuery(this).is(":hidden"),
                    name, val, p, e, parts, start, end, unit, method;
                opt.animatedProperties = {};
                for (p in prop) {
                    name = jQuery.camelCase(p);
                    if (p !== name) {
                        prop[name] = prop[p];
                        delete prop[p]
                    }
                    val = prop[name];
                    if (jQuery.isArray(val)) {
                        opt.animatedProperties[name] = val[1];
                        val = prop[name] = val[0]
                    } else opt.animatedProperties[name] = opt.specialEasing && opt.specialEasing[name] || opt.easing || "swing";
                    if (val === "hide" && hidden || val === "show" && !hidden) return opt.complete.call(this);
                    if (isElement && (name === "height" || name === "width")) {
                        opt.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY];
                        if (jQuery.css(this, "display") === "inline" && jQuery.css(this, "float") === "none") if (!jQuery.support.inlineBlockNeedsLayout || defaultDisplay(this.nodeName) === "inline") this.style.display = "inline-block";
                        else this.style.zoom = 1
                    }
                }
                if (opt.overflow != null) this.style.overflow = "hidden";
                for (p in prop) {
                    e = new jQuery.fx(this, opt, p);
                    val = prop[p];
                    if (rfxtypes.test(val)) {
                        method = jQuery._data(this, "toggle" + p) || (val === "toggle" ? hidden ? "show" : "hide" : 0);
                        if (method) {
                            jQuery._data(this, "toggle" + p, method === "show" ? "hide" : "show");
                            e[method]()
                        } else e[val]()
                    } else {
                        parts = rfxnum.exec(val);
                        start = e.cur();
                        if (parts) {
                            end = parseFloat(parts[2]);
                            unit = parts[3] || (jQuery.cssNumber[p] ? "" : "px");
                            if (unit !== "px") {
                                jQuery.style(this, p, (end || 1) + unit);
                                start = (end || 1) / e.cur() * start;
                                jQuery.style(this, p, start + unit)
                            }
                            if (parts[1]) end = (parts[1] === "-=" ? -1 : 1) * end + start;
                            e.custom(start, end, unit)
                        } else e.custom(start, val, "")
                    }
                }
                return true
            }
            return optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation)
        },
        stop: function (type, clearQueue, gotoEnd) {
            if (typeof type !== "string") {
                gotoEnd = clearQueue;
                clearQueue = type;
                type = undefined
            }
            if (clearQueue && type !== false) this.queue(type || "fx", []);
            return this.each(function () {
                var index, hadTimers = false,
                    timers = jQuery.timers,
                    data = jQuery._data(this);
                if (!gotoEnd) jQuery._unmark(true, this);

                function stopQueue(elem, data, index) {
                    var hooks = data[index];
                    jQuery.removeData(elem, index, true);
                    hooks.stop(gotoEnd)
                }
                if (type == null) for (index in data) {
                    if (data[index] && data[index].stop && index.indexOf(".run") === index.length - 4) stopQueue(this, data, index)
                } else if (data[index = type + ".run"] && data[index].stop) stopQueue(this, data, index);
                for (index = timers.length; index--;) if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                    if (gotoEnd) timers[index](true);
                    else timers[index].saveState();
                    hadTimers = true;
                    timers.splice(index, 1)
                }
                if (!(gotoEnd && hadTimers)) jQuery.dequeue(this, type)
            })
        }
    });

    function createFxNow() {
        setTimeout(clearFxNow, 0);
        return fxNow = jQuery.now()
    }
    function clearFxNow() {
        fxNow = undefined
    }
    function genFx(type, num) {
        var obj = {};
        jQuery.each(fxAttrs.concat.apply([], fxAttrs.slice(0, num)), function () {
            obj[this] = type
        });
        return obj
    }
    jQuery.each({
        slideDown: genFx("show", 1),
        slideUp: genFx("hide", 1),
        slideToggle: genFx("toggle", 1),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function (name, props) {
        jQuery.fn[name] = function (speed, easing, callback) {
            return this.animate(props, speed, easing, callback)
        }
    });
    jQuery.extend({
        speed: function (speed, easing, fn) {
            var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
                complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
                duration: speed,
                easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
            };
            opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
            if (opt.queue == null || opt.queue === true) opt.queue = "fx";
            opt.old = opt.complete;
            opt.complete = function (noUnmark) {
                if (jQuery.isFunction(opt.old)) opt.old.call(this);
                if (opt.queue) jQuery.dequeue(this, opt.queue);
                else if (noUnmark !== false) jQuery._unmark(this)
            };
            return opt
        },
        easing: {
            linear: function (p, n, firstNum, diff) {
                return firstNum + diff * p
            },
            swing: function (p, n, firstNum, diff) {
                return (-Math.cos(p * Math.PI) / 2 + 0.5) * diff + firstNum
            }
        },
        timers: [],
        fx: function (elem, options, prop) {
            this.options = options;
            this.elem = elem;
            this.prop = prop;
            options.orig = options.orig || {}
        }
    });
    jQuery.fx.prototype = {
        update: function () {
            if (this.options.step) this.options.step.call(this.elem, this.now, this);
            (jQuery.fx.step[this.prop] || jQuery.fx.step._default)(this)
        },
        cur: function () {
            if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) return this.elem[this.prop];
            var parsed, r = jQuery.css(this.elem, this.prop);
            return isNaN(parsed = parseFloat(r)) ? !r || r === "auto" ? 0 : r : parsed
        },
        custom: function (from, to, unit) {
            var self = this,
                fx = jQuery.fx;
            this.startTime = fxNow || createFxNow();
            this.end = to;
            this.now = this.start = from;
            this.pos = this.state = 0;
            this.unit = unit || this.unit || (jQuery.cssNumber[this.prop] ? "" : "px");

            function t(gotoEnd) {
                return self.step(gotoEnd)
            }
            t.queue = this.options.queue;
            t.elem = this.elem;
            t.saveState = function () {
                if (self.options.hide && jQuery._data(self.elem, "fxshow" + self.prop) === undefined) jQuery._data(self.elem, "fxshow" + self.prop, self.start)
            };
            if (t() && jQuery.timers.push(t) && !timerId) timerId = setInterval(fx.tick, fx.interval)
        },
        show: function () {
            var dataShow = jQuery._data(this.elem, "fxshow" + this.prop);
            this.options.orig[this.prop] = dataShow || jQuery.style(this.elem, this.prop);
            this.options.show = true;
            if (dataShow !== undefined) this.custom(this.cur(), dataShow);
            else this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
            jQuery(this.elem).show()
        },
        hide: function () {
            this.options.orig[this.prop] = jQuery._data(this.elem, "fxshow" + this.prop) || jQuery.style(this.elem, this.prop);
            this.options.hide = true;
            this.custom(this.cur(), 0)
        },
        step: function (gotoEnd) {
            var p, n, complete, t = fxNow || createFxNow(),
                done = true,
                elem = this.elem,
                options = this.options;
            if (gotoEnd || t >= options.duration + this.startTime) {
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();
                options.animatedProperties[this.prop] = true;
                for (p in options.animatedProperties) if (options.animatedProperties[p] !== true) done = false;
                if (done) {
                    if (options.overflow != null && !jQuery.support.shrinkWrapBlocks) jQuery.each(["", "X", "Y"], function (index, value) {
                        elem.style["overflow" + value] = options.overflow[index]
                    });
                    if (options.hide) jQuery(elem).hide();
                    if (options.hide || options.show) for (p in options.animatedProperties) {
                        jQuery.style(elem, p, options.orig[p]);
                        jQuery.removeData(elem, "fxshow" + p, true);
                        jQuery.removeData(elem, "toggle" + p, true)
                    }
                    complete = options.complete;
                    if (complete) {
                        options.complete = false;
                        complete.call(elem)
                    }
                }
                return false
            } else {
                if (options.duration == Infinity) this.now = t;
                else {
                    n = t - this.startTime;
                    this.state = n / options.duration;
                    this.pos = jQuery.easing[options.animatedProperties[this.prop]](this.state, n, 0, 1, options.duration);
                    this.now = this.start + (this.end - this.start) * this.pos
                }
                this.update()
            }
            return true
        }
    };
    jQuery.extend(jQuery.fx, {
        tick: function () {
            var timer, timers = jQuery.timers,
                i = 0;
            for (; i < timers.length; i++) {
                timer = timers[i];
                if (!timer() && timers[i] === timer) timers.splice(i--, 1)
            }
            if (!timers.length) jQuery.fx.stop()
        },
        interval: 13,
        stop: function () {
            clearInterval(timerId);
            timerId = null
        },
        speeds: {
            slow: 600,
            fast: 200,
            _default: 400
        },
        step: {
            opacity: function (fx) {
                jQuery.style(fx.elem, "opacity", fx.now)
            },
            _default: function (fx) {
                if (fx.elem.style && fx.elem.style[fx.prop] != null) fx.elem.style[fx.prop] = fx.now + fx.unit;
                else fx.elem[fx.prop] = fx.now
            }
        }
    });
    jQuery.each(["width", "height"], function (i, prop) {
        jQuery.fx.step[prop] = function (fx) {
            jQuery.style(fx.elem, prop, Math.max(0, fx.now) + fx.unit)
        }
    });
    if (jQuery.expr && jQuery.expr.filters) jQuery.expr.filters.animated = function (elem) {
        return jQuery.grep(jQuery.timers, function (fn) {
            return elem === fn.elem
        }).length
    };

    function defaultDisplay(nodeName) {
        if (!elemdisplay[nodeName]) {
            var body = document.body,
                elem = jQuery("<" + nodeName + ">").appendTo(body),
                display = elem.css("display");
            elem.remove();
            if (display === "none" || display === "") {
                if (!iframe) {
                    iframe = document.createElement("iframe");
                    iframe.frameBorder = iframe.width = iframe.height = 0
                }
                body.appendChild(iframe);
                if (!iframeDoc || !iframe.createElement) {
                    iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
                    iframeDoc.write((document.compatMode === "CSS1Compat" ? "<!doctype html>" : "") + "<html><body>");
                    iframeDoc.close()
                }
                elem = iframeDoc.createElement(nodeName);
                iframeDoc.body.appendChild(elem);
                display = jQuery.css(elem, "display");
                body.removeChild(iframe)
            }
            elemdisplay[nodeName] = display
        }
        return elemdisplay[nodeName]
    }
    var rtable = /^t(?:able|d|h)$/i,
        rroot = /^(?:body|html)$/i;
    if ("getBoundingClientRect" in document.documentElement) jQuery.fn.offset = function (options) {
        var elem = this[0],
            box;
        if (options) return this.each(function (i) {
            jQuery.offset.setOffset(this, options, i)
        });
        if (!elem || !elem.ownerDocument) return null;
        if (elem === elem.ownerDocument.body) return jQuery.offset.bodyOffset(elem);
        try {
            box = elem.getBoundingClientRect()
        } catch (e) {}
        var doc = elem.ownerDocument,
            docElem = doc.documentElement;
        if (!box || !jQuery.contains(docElem, elem)) return box ? {
            top: box.top,
            left: box.left
        } : {
            top: 0,
            left: 0
        };
        var body = doc.body,
            win = getWindow(doc),
            clientTop = docElem.clientTop || body.clientTop || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
            scrollTop = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop || body.scrollTop,
            scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
            top = box.top + scrollTop - clientTop,
            left = box.left + scrollLeft - clientLeft;
        return {
            top: top,
            left: left
        }
    };
    else jQuery.fn.offset = function (options) {
        var elem = this[0];
        if (options) return this.each(function (i) {
            jQuery.offset.setOffset(this, options, i)
        });
        if (!elem || !elem.ownerDocument) return null;
        if (elem === elem.ownerDocument.body) return jQuery.offset.bodyOffset(elem);
        var computedStyle, offsetParent = elem.offsetParent,
            prevOffsetParent = elem,
            doc = elem.ownerDocument,
            docElem = doc.documentElement,
            body = doc.body,
            defaultView = doc.defaultView,
            prevComputedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle,
            top = elem.offsetTop,
            left = elem.offsetLeft;
        while ((elem = elem.parentNode) && elem !== body && elem !== docElem) {
            if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") break;
            computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
            top -= elem.scrollTop;
            left -= elem.scrollLeft;
            if (elem === offsetParent) {
                top += elem.offsetTop;
                left += elem.offsetLeft;
                if (jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName))) {
                    top += parseFloat(computedStyle.borderTopWidth) || 0;
                    left += parseFloat(computedStyle.borderLeftWidth) || 0
                }
                prevOffsetParent = offsetParent;
                offsetParent = elem.offsetParent
            }
            if (jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible") {
                top += parseFloat(computedStyle.borderTopWidth) || 0;
                left += parseFloat(computedStyle.borderLeftWidth) || 0
            }
            prevComputedStyle = computedStyle
        }
        if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static") {
            top += body.offsetTop;
            left += body.offsetLeft
        }
        if (jQuery.support.fixedPosition && prevComputedStyle.position === "fixed") {
            top += Math.max(docElem.scrollTop, body.scrollTop);
            left += Math.max(docElem.scrollLeft, body.scrollLeft)
        }
        return {
            top: top,
            left: left
        }
    };
    jQuery.offset = {
        bodyOffset: function (body) {
            var top = body.offsetTop,
                left = body.offsetLeft;
            if (jQuery.support.doesNotIncludeMarginInBodyOffset) {
                top += parseFloat(jQuery.css(body, "marginTop")) || 0;
                left += parseFloat(jQuery.css(body, "marginLeft")) || 0
            }
            return {
                top: top,
                left: left
            }
        },
        setOffset: function (elem, options, i) {
            var position = jQuery.css(elem, "position");
            if (position === "static") elem.style.position = "relative";
            var curElem = jQuery(elem),
                curOffset = curElem.offset(),
                curCSSTop = jQuery.css(elem, "top"),
                curCSSLeft = jQuery.css(elem, "left"),
                calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
                props = {},
                curPosition = {},
                curTop, curLeft;
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left
            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0
            }
            if (jQuery.isFunction(options)) options = options.call(elem, i, curOffset);
            if (options.top != null) props.top = options.top - curOffset.top + curTop;
            if (options.left != null) props.left = options.left - curOffset.left + curLeft;
            if ("using" in options) options.using.call(elem, props);
            else curElem.css(props)
        }
    };
    jQuery.fn.extend({
        position: function () {
            if (!this[0]) return null;
            var elem = this[0],
                offsetParent = this.offsetParent(),
                offset = this.offset(),
                parentOffset = rroot.test(offsetParent[0].nodeName) ? {
                    top: 0,
                    left: 0
                } : offsetParent.offset();
            offset.top -= parseFloat(jQuery.css(elem, "marginTop")) || 0;
            offset.left -= parseFloat(jQuery.css(elem, "marginLeft")) || 0;
            parentOffset.top += parseFloat(jQuery.css(offsetParent[0], "borderTopWidth")) || 0;
            parentOffset.left += parseFloat(jQuery.css(offsetParent[0], "borderLeftWidth")) || 0;
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            }
        },
        offsetParent: function () {
            return this.map(function () {
                var offsetParent = this.offsetParent || document.body;
                while (offsetParent && !rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") offsetParent = offsetParent.offsetParent;
                return offsetParent
            })
        }
    });
    jQuery.each(["Left", "Top"], function (i, name) {
        var method = "scroll" + name;
        jQuery.fn[method] = function (val) {
            var elem, win;
            if (val === undefined) {
                elem = this[0];
                if (!elem) return null;
                win = getWindow(elem);
                return win ? "pageXOffset" in win ? win[i ? "pageYOffset" : "pageXOffset"] : jQuery.support.boxModel && win.document.documentElement[method] || win.document.body[method] : elem[method]
            }
            return this.each(function () {
                win = getWindow(this);
                if (win) win.scrollTo(!i ? val : jQuery(win).scrollLeft(), i ? val : jQuery(win).scrollTop());
                else this[method] = val
            })
        }
    });

    function getWindow(elem) {
        return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false
    }
    jQuery.each(["Height", "Width"], function (i, name) {
        var type = name.toLowerCase();
        jQuery.fn["inner" + name] = function () {
            var elem = this[0];
            return elem ? elem.style ? parseFloat(jQuery.css(elem, type, "padding")) : this[type]() : null
        };
        jQuery.fn["outer" + name] = function (margin) {
            var elem = this[0];
            return elem ? elem.style ? parseFloat(jQuery.css(elem, type, margin ? "margin" : "border")) : this[type]() : null
        };
        jQuery.fn[type] = function (size) {
            var elem = this[0];
            if (!elem) return size == null ? null : this;
            if (jQuery.isFunction(size)) return this.each(function (i) {
                var self = jQuery(this);
                self[type](size.call(this, i, self[type]()))
            });
            if (jQuery.isWindow(elem)) {
                var docElemProp = elem.document.documentElement["client" + name],
                    body = elem.document.body;
                return elem.document.compatMode === "CSS1Compat" && docElemProp || body && body["client" + name] || docElemProp
            } else if (elem.nodeType === 9) return Math.max(elem.documentElement["client" + name], elem.body["scroll" + name], elem.documentElement["scroll" + name], elem.body["offset" + name], elem.documentElement["offset" + name]);
            else if (size === undefined) {
                var orig = jQuery.css(elem, type),
                    ret = parseFloat(orig);
                return jQuery.isNumeric(ret) ? ret : orig
            } else return this.css(type, typeof size === "string" ? size : size + "px")
        }
    });
    Streak.jQuery = Streak.$ = jQuery
})(window, Streak);
(function (global, exports) {
    var $d = global.document,
        $ = global.Streak.jQuery || global.Zepto || global.ender || $d,
        $$, $b, ke = "keydown";

    function realTypeOf(v, s) {
        return v === null ? s === "null" : v === undefined ? s === "undefined" : v.is && v instanceof $ ? s === "element" : Object.prototype.toString.call(v).toLowerCase().indexOf(s) > 7
    }
    if ($ === $d) {
        $$ = function (selector, context) {
            return selector ? $.querySelector(selector, context || $) : $
        };
        $b = function (e, fn) {
            e.addEventListener(ke, fn, false)
        };
        $f = function (e, jwertyEv) {
            var ret = document.createEvent("Event"),
                i;
            ret.initEvent(ke, true, true);
            for (i in jwertyEv) ret[i] = jwertyEv[i];
            return (e || $).dispatchEvent(ret)
        }
    } else {
        $$ = function (selector, context, fn) {
            return $(selector || $d, context)
        };
        $b = function (e, fn) {
            $(e).bind(ke + ".jwerty", fn)
        };
        $f = function (e, ob) {
            $(e || $d).trigger($.Event(ke, ob))
        }
    }
    var _modProps = {
        16: "shiftKey",
        17: "ctrlKey",
        18: "altKey",
        91: "metaKey"
    };
    var _keys = {
        mods: {
            "\u00e2\u2021\u00a7": 16,
            shift: 16,
            "\u00e2\u0152\u0192": 17,
            ctrl: 17,
            "\u00e2\u0152\u00a5": 18,
            alt: 18,
            option: 18,
            "\u00e2\u0152\u02dc": 91,
            meta: 91,
            cmd: 91,
            "super": 91,
            win: 91
        },
        keys: {
            "\u00e2\u0152\u00ab": 8,
            backspace: 8,
            "\u00e2\u2021\u00a5": 9,
            "\u00e2\u2021\u2020": 9,
            tab: 9,
            "\u00e2\u2020\u00a9": 13,
            "return": 13,
            enter: 13,
            "\u00e2\u0152\u2026": 13,
            "pause": 19,
            "pause-break": 19,
            "\u00e2\u2021\u00aa": 20,
            caps: 20,
            "caps-lock": 20,
            "\u00e2\u017d\u2039": 27,
            escape: 27,
            esc: 27,
            space: 32,
            "\u00e2\u2020\u2013": 33,
            pgup: 33,
            "page-up": 33,
            "\u00e2\u2020\u02dc": 34,
            pgdown: 34,
            "page-down": 34,
            "\u00e2\u2021\u0178": 35,
            end: 35,
            "\u00e2\u2021\u017e": 36,
            home: 36,
            ins: 45,
            insert: 45,
            del: 46,
            "delete": 46,
            "\u00e2\u2020\ufffd": 37,
            left: 37,
            "arrow-left": 37,
            "\u00e2\u2020\u2018": 38,
            up: 38,
            "arrow-up": 38,
            "\u00e2\u2020\u2019": 39,
            right: 39,
            "arrow-right": 39,
            "\u00e2\u2020\u201c": 40,
            down: 40,
            "arrow-down": 40,
            "*": 106,
            star: 106,
            asterisk: 106,
            multiply: 106,
            "+": 107,
            "plus": 107,
            "-": 109,
            subtract: 109,
            "=": 187,
            "equals": 187,
            ",": 188,
            comma: 188,
            ".": 190,
            period: 190,
            "full-stop": 190,
            "/": 191,
            slash: 191,
            "forward-slash": 191,
            "`": 192,
            tick: 192,
            "back-quote": 192,
            "[": 219,
            "open-bracket": 219,
            "\\": 220,
            "back-slash": 220,
            "]": 221,
            "close-bracket": 221,
            "'": 222,
            quote: 222,
            apostraphe: 222
        }
    };
    i = 95, n = 0;
    while (++i < 106) {
        _keys.keys["num-" + n] = i;
        ++n
    }
    i = 47, n = 0;
    while (++i < 58) {
        _keys.keys[n] = i;
        ++n
    }
    i = 111, n = 1;
    while (++i < 136) {
        _keys.keys["f" + n] = i;
        ++n
    }
    var i = 64;
    while (++i < 91) _keys.keys[String.fromCharCode(i).toLowerCase()] = i;

    function JwertyCode(jwertyCode) {
        var i, c, n, z, keyCombo, optionals, jwertyCodeFragment, rangeMatches, rangeI;
        if (jwertyCode instanceof JwertyCode) return jwertyCode;
        if (!realTypeOf(jwertyCode, "array")) jwertyCode = String(jwertyCode).replace(/\s/g, "").toLowerCase().match(/(?:\+,|[^,])+/g);
        for (i = 0, c = jwertyCode.length; i < c; ++i) {
            if (!realTypeOf(jwertyCode[i], "array")) jwertyCode[i] = String(jwertyCode[i]).match(/(?:\+\/|[^\/])+/g);
            optionals = [], n = jwertyCode[i].length;
            while (n--) {
                var jwertyCodeFragment = jwertyCode[i][n];
                keyCombo = {
                    jwertyCombo: String(jwertyCodeFragment),
                    shiftKey: false,
                    ctrlKey: false,
                    altKey: false,
                    metaKey: false
                };
                if (!realTypeOf(jwertyCodeFragment, "array")) jwertyCodeFragment = String(jwertyCodeFragment).toLowerCase().match(/(?:(?:[^\+])+|\+\+|^\+$)/g);
                z = jwertyCodeFragment.length;
                while (z--) {
                    if (jwertyCodeFragment[z] === "++") jwertyCodeFragment[z] = "+";
                    if (jwertyCodeFragment[z] in _keys.mods) keyCombo[_modProps[_keys.mods[jwertyCodeFragment[z]]]] = true;
                    else if (jwertyCodeFragment[z] in _keys.keys) keyCombo.keyCode = _keys.keys[jwertyCodeFragment[z]];
                    else rangeMatches = jwertyCodeFragment[z].match(/^\[([^-]+\-?[^-]*)-([^-]+\-?[^-]*)\]$/)
                }
                if (realTypeOf(keyCombo.keyCode, "undefined")) if (rangeMatches && rangeMatches[1] in _keys.keys && rangeMatches[2] in _keys.keys) {
                    rangeMatches[2] = _keys.keys[rangeMatches[2]];
                    rangeMatches[1] = _keys.keys[rangeMatches[1]];
                    for (rangeI = rangeMatches[1]; rangeI < rangeMatches[2]; ++rangeI) optionals.push({
                        altKey: keyCombo.altKey,
                        shiftKey: keyCombo.shiftKey,
                        metaKey: keyCombo.metaKey,
                        ctrlKey: keyCombo.ctrlKey,
                        keyCode: rangeI,
                        jwertyCombo: String(jwertyCodeFragment)
                    });
                    keyCombo.keyCode = rangeI
                } else keyCombo.keyCode = 0;
                optionals.push(keyCombo)
            }
            this[i] = optionals
        }
        this.length = i;
        return this
    }
    var jwerty = Streak.jwerty = {
        event: function (jwertyCode, callbackFunction, callbackContext) {
            if (realTypeOf(callbackFunction, "boolean")) {
                var bool = callbackFunction;
                callbackFunction = function () {
                    return bool
                }
            }
            jwertyCode = new JwertyCode(jwertyCode);
            var i = 0,
                c = jwertyCode.length - 1,
                returnValue, jwertyCodeIs;
            return function (event) {
                if (jwertyCodeIs = jwerty.is(jwertyCode, event, i)) if (i < c) {
                    ++i;
                    return
                } else {
                    returnValue = callbackFunction.call(callbackContext || this, event, jwertyCodeIs);
                    if (returnValue === false) event.preventDefault();
                    i = 0;
                    return
                }
                i = jwerty.is(jwertyCode, event) ? 1 : 0
            }
        },
        is: function (jwertyCode, event, i) {
            jwertyCode = new JwertyCode(jwertyCode);
            i = i || 0;
            jwertyCode = jwertyCode[i];
            event = event.originalEvent || event;
            var key, n = jwertyCode.length,
                returnValue = false;
            while (n--) {
                returnValue = jwertyCode[n].jwertyCombo;
                for (var p in jwertyCode[n]) if (p !== "jwertyCombo" && event[p] != jwertyCode[n][p]) returnValue = false;
                if (returnValue !== false) return returnValue
            }
            return returnValue
        },
        key: function (jwertyCode, callbackFunction, callbackContext, selector, selectorContext) {
            var realSelector = realTypeOf(callbackContext, "element") || realTypeOf(callbackContext, "string") ? callbackContext : selector,
                realcallbackContext = realSelector === callbackContext ? global : callbackContext,
                realSelectorContext = realSelector === callbackContext ? selector : selectorContext;
            $b(realTypeOf(realSelector, "element") ? realSelector : $$(realSelector, realSelectorContext), jwerty.event(jwertyCode, callbackFunction, realcallbackContext))
        },
        fire: function (jwertyCode, selector, selectorContext, i) {
            jwertyCode = new JwertyCode(jwertyCode);
            var realI = realTypeOf(selectorContext, "number") ? selectorContext : i;
            $f(realTypeOf(selector, "element") ? selector : $$(selector, selectorContext), jwertyCode[realI || 0][0])
        },
        KEYS: _keys
    }
})(this, typeof module !== "undefined" && module.exports ? module.exports : this);
(function (Streak) {
    var _ = Streak._;
    ObjectPath = {
        create: function (objString) {
            return new ObjectPath.impl(objString)
        },
        impl: function (inObjString) {
            var retObj = {},
                obj = null,
                objString = inObjString;
            if (objString) try {
                obj = JSON.parse(objString)
            } catch (err) {}
            if (!obj) obj = {};
            retObj.get = function (path) {
                var parts = path.split("/");
                var prop = obj[parts[0]];
                for (var i = 1; i < parts.length; i++) {
                    if (!prop) return null;
                    prop = prop[parts[i]]
                }
                return prop
            };
            retObj.set = function (path, value) {
                var parts = path.split("/");
                if (parts.length === 1) obj[parts[0]] = value;
                else if (parts.length > 1) {
                    var oprop = obj[parts[0]];
                    if (!oprop) oprop = {};
                    var prop = oprop;
                    for (var i = 1; i < parts.length - 1; i++) {
                        var newProp = prop[parts[i]];
                        if (!newProp) {
                            newProp = {};
                            prop[parts[i]] = newProp
                        }
                        prop = newProp
                    }
                    prop[_.last(parts)] = value;
                    obj[parts[0]] = oprop
                }
            };
            retObj.remove = function (path) {
                var parts = path.split("/");
                var prop = null;
                for (var i = 0; i < parts.length - 1; i++) {
                    prop = obj[prop[i]];
                    if (!prop) return
                }
                delete prop[parts.length - 1]
            };
            retObj.toString = function () {
                return JSON.stringify(obj)
            };
            retObj.object = obj;
            return retObj
        }
    };
    Streak.ObjectPath = ObjectPath
})(Streak);
(function (window, Streak) {
    var Date = Streak.Date;
    Date.prototype.getTimezoneOffsetInMilli = function () {
        return (new Date).getTimezoneOffset() * -60 * 1E3
    };
    Date.prototype.toLocalTime = function () {
        this.setTime(this.getTime() + this.getTimezoneOffsetInMilli())
    };
    Date.prototype.toGMT = function () {
        this.setTime(this.getTime() - this.getTimezoneOffsetInMilli())
    };
    Date.prototype.getGmailFormatted = function (isShort) {
        var dt = this;
        var now = new Date;
        var diff = (now.getTime() - dt.getTime()) / (1E3 * 60 * 60);
        var dv;
        if (diff < 12) dv = (dt.getHours() == 12 ? "12" : dt.getHours() % 12) + ":" + (dt.getMinutes() > 9 ? dt.getMinutes() : "0" + dt.getMinutes()) + (isShort ? "" : " ") + (dt.getHours() > 11 ? isShort ? "p" : "pm" : isShort ? "a" : "am");
        else {
            var parts = dt.toDateString().split(" ");
            dv = parts[1] + " " + parts[2] + (diff / 24 / 30 > 6 ? " " + dt.getFullYear() : "")
        }
        return dv
    };
    Date.addOutputFormat({
        token: "tzshort",
        format: function (d, loc, n, format) {
            var dstring = d.toString();
            if (dstring.indexOf("(") > -1) {
                var tzParts = d.toString().split("(")[1].split(" ");
                if (tzParts.length > 1) return tzParts.map(function (word) {
                    return word.at(0).capitalize()
                }).join("");
                else return tzParts[0].split(")")[0]
            }
            return ""
        }
    });
    Date.addOutputFormat({
        token: "mmshort",
        format: function (d, loc, n, format) {
            if (d.getMinutes() === 0) return "";
            else {
                var s = d.getMinutes();
                if (s.length === 1) s = "0" + s;
                return ":" + s
            }
        }
    });
    var dateLocale = "en";
    var dateOutputFormats = {
        en: {
            shortWithWeekday: "{Dow} {MM}/{day}/{yy} {h}:{mm}{tt}",
            shortDate: "{MM}/{dd}/{yy}",
            shortFormat: "{MM}/{dd}/{yy} {h}{mmshort}{tt}",
            longDateTime: "{Weekday} {Month} {ord}, {year} {h}:{mm}{tt}",
            longWithTimezone: "{Weekday} {Month} {ord}, {year} {h}:{mm}{tt} {tzshort}"
        },
        other: {
            shortDate: "{dd}/{MM}/{yy}",
            shortWithWeekday: "{Dow} {day}/{MM}/{yy} {h}:{mm}{tt}",
            shortFormat: "{dd}/{MM}/{yy} {h}{mmshort}{tt}",
            longDateTime: "{Weekday} {Month} {ord}, {year} {h}:{mm}{tt}",
            longWithTimezone: "{Weekday} {Month} {ord}, {year} {h}:{mm}{tt} {tzshort}"
        }
    };
    Date.extend({
        "setFormatLocale": function (locale) {
            dateLocale = locale
        },
        "customFormat": function (format) {
            return this.format(dateOutputFormats[dateLocale][format])
        }
    });
    Date.extend({
        "ccreate": function (s) {
            if (s && s.match && s.match(/^-?\d+$/)) return Date.create(parseInt(s));
            else return Date.create(s)
        }
    }, false, false);
    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest)
    };
    Array.prototype.removeVal = function (val) {
        var index = this.indexOf(val);
        if (index > -1) this.remove(index)
    };
    Array.prototype.unique = function (idfunc) {
        var hash = {};
        var out = [];
        for (var i = 0, len = this.length; i < len; i++) {
            var id = this[i].toString();
            if (idfunc) id = idfunc(this[i]);
            if (!hash[id]) {
                out.push(this[i]);
                hash[id] = 1
            }
        }
        return out
    };
    if (typeof String.prototype.capitalize !== "function") String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1)
    };
    String.prototype.isValidEmail = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return this.match(re)
    };
    if (typeof String.prototype.startsWith != "function") String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str
    };
    if (typeof String.prototype.endsWith != "function") String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1
    };
    String.prototype.sample = function (num) {
        var s = "";
        for (var i = 0, l = this.length; i < l; i++) if (i % num == 0) s += this[i];
        return s
    };
    if (!String.prototype.has) String.prototype.has = function (s) {
        return this.indexOf(s) > -1
    };

    function createGrid(rows, columns) {
        var grid = new Array(rows);
        for (var i = 0; i < rows; i++) {
            grid[i] = new Array(columns);
            for (var j = 0; j < columns; j++) grid[i][j] = 0
        }
        return grid
    }
    String.prototype.intersectionLength = function (bString, noSpace) {
        if (!this || !bString) return 0;
        var a = this.toLowerCase();
        var b = bString.toLowerCase();
        if (noSpace) {
            a = a.replace(/\s/img, "");
            b = b.replace(/\s/img, "")
        }
        var grid = createGrid(this.length, b.length);
        var lcs = 0;
        for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) if (grid[i] && grid[i].length > 0) if (a[i] === b[j]) {
            if (i === 0 || j === 0) grid[i][j] = 1;
            else grid[i][j] = grid[i - 1][j - 1] + 1;
            if (lcs < grid[i][j]) lcs = grid[i][j]
        } else grid[i][j] = 0;
        return lcs
    };
    String.prototype.intersectionRatio = function (b) {
        if (!b) b = "";
        if (this.length + b.length === 0) return 0;
        var length = this.intersectionLength(b);
        return length / (this.length + b.length)
    };
    Streak.searchObject = function (element, query, maxDepth, caseInsensitive, exactMatch) {
        var _ = Streak._;
        var retVal = [];
        var initialNode = {
            el: element,
            path: "",
            depth: 0
        };
        var nodeList = [initialNode];
        if (caseInsensitive) query = query.toLowerCase();
        while (nodeList.length > 0) {
            var node = nodeList.pop();
            if (node.depth <= maxDepth) try {
                if (_.keys(node.el).length > 0) for (var i = 0; i < _.keys(node.el).length; i++) {
                    var key = _.keys(node.el)[i];
                    var newNode = {
                        el: node.el[key],
                        path: node.path + "/" + key,
                        depth: node.depth + 1
                    };
                    nodeList.push(newNode)
                }
            } catch (err) {
                var toFind = node.el + "";
                if (caseInsensitive) toFind = toFind.toLowerCase();
                if (exactMatch) {
                    if (toFind === query) retVal.push(node)
                } else if (toFind.indexOf(query) > -1) retVal.push(node)
            }
        }
        return retVal
    };
    Streak.calculateLevinshtein = function (source, target, hashName) {
        if (!source) source = [];
        if (!target) target = [];
        var grid = createGrid(source.length + 1, target.length + 1);
        for (var row = 0; row < grid.length; row++) {
            var ops = [];
            if (row > 0) ops = grid[row - 1][0].ops.concat({
                opCode: "delete",
                i: row,
                j: 0
            });
            grid[row][0] = {
                num: row,
                ops: ops
            }
        }
        for (var col = 0; col < grid[0].length; col++) {
            var ops = [];
            if (col > 0) ops = grid[0][col - 1].ops.concat({
                opCode: "insert",
                i: 0,
                j: col
            });
            grid[0][col] = {
                num: col,
                ops: ops
            }
        }
        for (var i = 1; i < source.length + 1; i++) for (var j = 1; j < target.length + 1; j++) {
            var sourceVal = hashName ? source[i - 1][hashName]() : source[i - 1];
            var targetVal = hashName ? target[j - 1][hashName]() : target[j - 1];
            if (sourceVal === targetVal) grid[i][j] = grid[i - 1][j - 1];
            else {
                var deletion = grid[i - 1][j].num + 1;
                var insertion = grid[i][j - 1].num + 1;
                var substitution = grid[i - 1][j - 1].num + 1;
                if (deletion < insertion && deletion < substitution) grid[i][j] = {
                    num: deletion,
                    ops: grid[i - 1][j].ops.concat({
                        opCode: "delete",
                        i: i,
                        j: j
                    })
                };
                else if (insertion < substitution) grid[i][j] = {
                    num: insertion,
                    ops: grid[i][j - 1].ops.concat({
                        opCode: "insert",
                        i: i,
                        j: j
                    })
                };
                else grid[i][j] = {
                    num: substitution,
                    ops: grid[i - 1][j - 1].ops.concat({
                        opCode: "sub",
                        i: i,
                        j: j
                    })
                }
            }
        }
        return grid
    };
    Streak.calculateFastLevinshteinWithEqualsFunc = function (source, target, equalsFunc) {
        var ops = [];
        var sourceIndex = 0;
        var targetIndex = 0;
        var deleteChainLength = function () {
                if (equalsFunc(source[sourceIndex + 1], target[targetIndex])) return 1;
                else return -1
            };
        var insertChainLength = function () {
                if (equalsFunc(source[sourceIndex], target[targetIndex + 1])) return 1;
                else return -1
            };
        for (var sourceIndex = 0; sourceIndex < source.length;) {
            if (targetIndex >= target.length) break;
            if (equalsFunc(source[sourceIndex], target[targetIndex])) {
                targetIndex++;
                sourceIndex++
            } else {
                var deleteChain = deleteChainLength();
                if (deleteChain > 0) for (var i = 0; i < deleteChain; i++) {
                    ops.push({
                        opCode: "delete",
                        i: sourceIndex,
                        j: targetIndex
                    });
                    sourceIndex++
                } else {
                    var insertChain = insertChainLength();
                    if (insertChain > 0) for (var i = 0; i < insertChain; i++) {
                        ops.push({
                            opCode: "insert",
                            i: sourceIndex,
                            j: targetIndex
                        });
                        targetIndex++
                    } else {
                        ops.push({
                            opCode: "sub",
                            i: sourceIndex,
                            j: targetIndex
                        });
                        targetIndex++;
                        sourceIndex++
                    }
                }
            }
        }
        for (; targetIndex < target.length; targetIndex++) ops.push({
            opCode: "insert",
            i: sourceIndex,
            j: targetIndex
        });
        for (; sourceIndex < source.length; sourceIndex++) ops.push({
            opCode: "delete",
            i: sourceIndex,
            j: Math.min(targetIndex, target.length - 1)
        });
        return ops
    };
    Streak.calculateFastLevinshtein = function (source, target) {
        return Streak.calculateFastLevinshteinWithEqualsFunc(source, target, function (a, b) {
            return a === b
        })
    };
    Streak.genericEquals = function (a, b) {
        if (a == undefined || b == undefined && a != b) return a == b;
        var seen = {};
        for (var attr in a) if (!b.hasOwnProperty(attr) || a[attr] !== b[attr]) return false;
        for (var attr in b) if (!a.hasOwnProperty(attr)) return false;
        return true
    };
    Streak.kmp = function (sourceStr, targetStr) {
        var source = sourceStr.split(""),
            target = targetStr.split(""),
            sourceIndex = 0,
            targetIndex = 0;
        var lookup = [-1, 0],
            position = 2,
            candidate = 0;
        while (position < target.length) if (target[position - 1] == target[candidate]) {
            candidate = candidate + 1;
            lookup[position] = candidate;
            position++
        } else if (candidate > 0) candidate = lookup[candidate];
        else {
            lookup[position] = 0;
            position++
        }
        while (sourceIndex + targetIndex < source.length) if (target[targetIndex] == source[sourceIndex + targetIndex]) {
            if (targetIndex == target.length - 1) return sourceIndex;
            targetIndex++
        } else {
            sourceIndex += targetIndex - lookup[targetIndex];
            if (lookup[targetIndex] > -1) targetIndex = lookup[targetIndex];
            else targetIndex = 0
        }
        return -1
    };
    Streak.cleanupEmailSubject = function (subject) {
        var res = subject || "";
        res = res.trim();
        if (res.substring(0, 3).match(/re:/i)) res = res.substring(3);
        else if (res.substring(0, 4).match(/fwd:/i)) res = res.substring(4);
        res = res.replace(/[ ]{2,}/g, " ");
        res = res.trim();
        if (res.length > 90) res = res.substring(0, 87) + "...";
        return res.toLowerCase()
    };
    if (!JSON.compare) JSON.compare = function (obj, otherObj) {
        try {
            return JSON.stringify(obj) === JSON.stringify(otherObj)
        } catch (err) {
            return false
        }
    };
    if (!JSON.parseCompare) JSON.parseCompare = function (obj, otherObj) {
        try {
            return JSON.compare(JSON.parse(obj), JSON.parse(otherObj))
        } catch (err) {
            return false
        }
    };
    if (!JSON.deepClone) JSON.deepClone = function (obj) {
        if (obj) return JSON.parse(JSON.stringify(obj));
        return obj
    };
    Streak.createEl = function (type, inner) {
        var d = document.createElement(type);
        if (inner) d.innerHTML = inner;
        return d
    };
    window.isNumber = function (input) {
        return input - 0 == input && input.length > 0
    }
})(window, Streak);
(function (window) {
    var StateMachine = {
        VERSION: "2.0.0",
        create: function (cfg, target) {
            var initial = typeof cfg.initial == "string" ? {
                state: cfg.initial
            } : cfg.initial;
            var fsm = target || cfg.target || {};
            var events = cfg.events || [];
            var callbacks = cfg.callbacks || {};
            var map = {};
            var add = function (e) {
                    var from = e.from instanceof Array ? e.from : [e.from];
                    map[e.name] = map[e.name] || {};
                    for (var n = 0; n < from.length; n++) map[e.name][from[n]] = e.to
                };
            if (initial) {
                initial.event = initial.event || "startup";
                add({
                    name: initial.event,
                    from: "none",
                    to: initial.state
                })
            }
            for (var n = 0; n < events.length; n++) add(events[n]);
            for (var name in map) if (map.hasOwnProperty(name)) fsm[name] = StateMachine.buildEvent(name, map[name]);
            for (var name in callbacks) if (callbacks.hasOwnProperty(name)) fsm[name] = callbacks[name];
            fsm.current = "none";
            fsm.is = function (state) {
                return this.current == state
            };
            fsm.can = function (event) {
                return !!map[event][this.current] && !this.transition
            };
            fsm.cannot = function (event) {
                return !this.can(event)
            };
            if (initial && !initial.defer) fsm[initial.event]();
            return fsm
        },
        beforeEvent: function (name, from, to, args) {
            var func = this["onbefore" + name];
            if (func) return func.apply(this, [name, from, to].concat(args))
        },
        afterEvent: function (name, from, to, args) {
            var func = this["onafter" + name] || this["on" + name];
            if (func) return func.apply(this, [name, from, to].concat(args))
        },
        leaveState: function (name, from, to, args) {
            var func = this["onleave" + from];
            if (func) return func.apply(this, [name, from, to].concat(args))
        },
        enterState: function (name, from, to, args) {
            var func = this["onenter" + to] || this["on" + to];
            if (func) return func.apply(this, [name, from, to].concat(args))
        },
        changeState: function (name, from, to, args) {
            var func = this["onchangestate"];
            if (func) return func.apply(this, [name, from, to].concat(args))
        },
        buildEvent: function (name, map) {
            return function () {
                if (this.transition) {
                    console.log("event " + name + " innapropriate because previous transition did not complete");
                    return
                }
                if (this.cannot(name)) {
                    console.log("event " + name + " innapropriate in current state " + this.current);
                    return
                }
                var from = this.current;
                var to = map[from];
                var args = Array.prototype.slice.call(arguments);
                if (false === StateMachine.beforeEvent.call(this, name, from, to, args)) return;
                var self = this;
                this.transition = function () {
                    self.transition = null;
                    self.current = to;
                    StateMachine.enterState.call(self, name, from, to, args);
                    StateMachine.changeState.call(self, name, from, to, args);
                    StateMachine.afterEvent.call(self, name, from, to, args)
                };
                if (false !== StateMachine.leaveState.call(this, name, from, to, args)) if (this.transition) this.transition()
            }
        }
    };
    window.Streak.StateMachine = StateMachine
})(window);
(function ($) {
    $.fn.autoComplete = function (val) {
        return this.each(function () {
            var self = this;
            var input = $(this);
            var list = [];
            var potentials = [];
            var suggestion = null;
            var text;
            var span = $(document.createElement("span"));
            span.addClass("bbAutocomplete");
            this.setAutoCompleteList = function (aList) {
                list = aList || []
            };
            input.bind({
                "keydown": function (e) {
                    if (e.which === 16) return;
                    span.detach();
                    text = input[val]();
                    if (Streak.jwerty.is("right/tab", e)) {
                        if (suggestion) {
                            insertSuggestion();
                            if (Streak.jwerty.is("right", e)) e.preventDefault()
                        }
                    } else if (Streak.jwerty.is("[a-z]/[0-9]", e)) {
                        if (text.length > 0) renderSuggestion(text.length + 1)
                    } else if (Streak.jwerty.is("backspace/delete", e)) {
                        if (suggestion) e.preventDefault();
                        suggestion = null
                    }
                },
                "keyup": function (e) {
                    if (e.which === 16) return;
                    span.detach();
                    suggestion = null;
                    var oldLength = text ? text.length : 0;
                    text = input[val]();
                    if (text.length > oldLength && isCaretAtEnd() || e.which === 16) renderSuggestion(text.length)
                },
                "preDetach": function (e) {
                    insertSuggestion(true)
                }
            });
            var renderSuggestion = function (length) {
                    if (!isCaretAtEnd()) return;
                    potentials = list.filter(function (item) {
                        return item.display.toLowerCase().startsWith(text.toLowerCase())
                    });
                    if (potentials.length === 0) return;
                    suggestion = potentials[0];
                    if (length >= suggestion.display.length) {
                        suggestion = null;
                        return
                    }
                    span.text(suggestion.display.substring(length));
                    if (input.children().length > 0) if (input.children().last().is("br")) {
                        input.children().last().before(span);
                        return
                    }
                    input.append(span)
                };
            var insertSuggestion = function (force) {
                    if (suggestion && (force || isCaretAtEnd())) {
                        span.detach();
                        var html = input[val]();
                        html += suggestion.value.substring(html.length);
                        input[val](html);
                        input.caret().goToEnd();
                        suggestion = null
                    }
                };
            var isCaretAtEnd = function () {
                    return input.caret().start >= input[val]().length
                }
        })
    }
})(Streak.jQuery);
(function ($) {
    $.fn.autoGrowInput = function (o) {
        return this.each(function () {
            var input = $(this),
                check = function () {
                    input.attr("size", Math.max(input.val().length, 1))
                };
            $(this).bind("keyup keydown blur update change", check)
        });
        return this
    }
})(Streak.jQuery);
(function ($) {
    var queryCache = {};
    $.fn.AutoSuggest = function (config) {
        var defaults = {
            data: null,
            wrapperCss: {},
            minChars: 1,
            dataFunc: $.noop,
            convertFunc: $.noop,
            stringDataFunc: $.noop,
            selectFunc: $.noop,
            compareFunc: function (query, dataItem) {},
            noResultsFoundText: null,
            loadingResultsText: null,
            getExcludedIDsFunc: $.noop,
            idProperty: "email"
        };
        var currentDataInList = [];
        var options = {};
        $.extend(options, defaults, config);
        return this.each(function () {
            var self = this;
            var input = $(this);
            var suggestions = $('<div class="ausu-suggestionsBox"></div>');
            var list = $("<ul></ul>");
            var timer;
            var val = input.val();
            list.appendTo(suggestions);
            input.after(suggestions);
            input.autoGrowInput();
            input.on("keydown", function (event) {
                if (event.which === 40 || event.which === 38) if (suggestions.is(":FastVisible(noCompute)")) if (event.which === 40) {
                    keyEvent("next");
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false
                } else {
                    keyEvent("prev");
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false
                }
            });
            input.on("bbSelect", function (event) {
                if (input.val()) if (input.val().isValidEmail()) select()
            });
            input[0].addEventListener("keydown", function (event) {
                switch (event.which) {
                case 9:
                case 13:
                    if (input.val()) select();
                    else {
                        if (event.which === 13) input.trigger("enterPressed");
                        else if (event.shiftKey) input.trigger("shiftTabPressed");
                        else input.trigger("tabPressed");
                        event.preventDefault();
                        event.stopPropagation()
                    }
                    return false;
                    break;
                case 27:
                    suggestions.hide();
                    break
                }
            }, true);
            input[0].addEventListener("keyup", function (e) {
                if (e.which === 8) if (input.val()) inputChanged(input.val())
            });
            input.keypress(function (event) {
                if (event.keyCode == 13) return false;
                inputChanged(input.val() + String.fromCharCode(event.keyCode))
            });
            var suggestTimer = null;

            function inputChanged(newVal) {
                newVal = (newVal || "").toLowerCase();
                mostRecentQuery = newVal;
                if (newVal && val !== newVal) {
                    val = newVal;
                    clearTimeout(timer);
                    if (val.length < options.minChars) {
                        suggestions.hide();
                        input.removeClass("ausu-load")
                    } else {
                        input.toggleClass("ausu-load", true);
                        cacheSuggest(newVal);
                        var cache = queryCache[newVal];
                        var cacheTime;
                        if (cache && cache.cacheTime) cacheTime = cache.cacheTime;
                        if (!cacheTime || Date.now() - cacheTime > 12E4) timer = setTimeout(function () {
                            if (!suggestTimer) suggestTimer = setTimeout(function () {
                                suggest(newVal)
                            }, 50);
                            else {
                                clearTimeout(suggestTimer);
                                suggestTimer = setTimeout(function () {
                                    suggest(newVal);
                                    suggestTimer = null
                                }, 2E3)
                            }
                            suggest(newVal)
                        }, 250);
                        else input.removeClass("ausu-load")
                    }
                }
            }
            function suggest(dataInput) {
                if (dataInput !== mostRecentQuery) return;
                suggestions.show();
                options.dataFunc(dataInput, function (data) {
                    if (data) {
                        data.cacheTime = Date.now();
                        var oldCacheData = queryCache[dataInput];
                        if (!oldCacheData || oldCacheData.length === 0) queryCache[dataInput] = data;
                        renderList(dataInput, data)
                    }
                    input.removeClass("ausu-load")
                })
            }
            function cacheSuggest(dataInput) {
                var filtered;
                var cacheTime;
                if (dataInput !== mostRecentQuery) return;
                for (var i = dataInput.length; i > 0; i--) {
                    var sub = dataInput.substring(0, i);
                    var cachedData = queryCache[sub];
                    if (cachedData && cachedData.length > 0) {
                        cacheTime = cachedData.cacheTime;
                        filtered = cachedData.filter(function (item) {
                            return options.compareFunc(dataInput, item)
                        });
                        if (filtered.length > 0) break
                    }
                }
                if (filtered) {
                    suggestions.show();
                    renderList(dataInput, filtered);
                    return cacheTime
                }
                return null
            }
            var renderedList = {};

            function renderList(query, data) {
                if (query === mostRecentQuery && data.length === 0 && list.find("li").length > 0) return;
                if (data && data.length > 0) {
                    var newRenderedList = {};
                    list.find(".ausu-no-results").remove();
                    var excludedIds = options.getExcludedIDsFunc() || [];
                    for (var i = 0, len = data.length; i < len; i++) {
                        if (excludedIds.indexOf(data[i][options.idProperty]) > -1) continue;
                        if (renderedList[data[i][options.idProperty]]) {
                            newRenderedList[data[i][options.idProperty]] = renderedList[data[i][options.idProperty]];
                            continue
                        }
                        var li = options.convertFunc(query, data[i]);
                        $(li).data("data", data[i]);
                        list.append(li);
                        li.click(function (e) {
                            select()
                        }).hover(function (e) {
                            $(this).addClass("selected")
                        }, function (e) {
                            $(this).removeClass("selected")
                        });
                        newRenderedList[data[i][options.idProperty]] = li
                    }
                    for (var id in renderedList) if (!newRenderedList[id]) renderedList[id].remove();
                    renderedList = newRenderedList
                } else renderedList = {};
                if (Object.getOwnPropertyNames(renderedList).length === 0) {
                    list.html('<li class="ausu-no-results">' + options.noResultsFoundText + "</li>");
                    renderedList = {}
                }
            }
            function keyEvent(action) {
                if (suggestions.find("li.selected").length > 0) {
                    var sel = suggestions.find("li.selected");
                    var next = action == "next" ? sel.next() : sel.prev();
                    if (next.length == 0) next = action == "next" ? suggestions.find("li:first") : suggestions.find("li:last");
                    next.addClass("selected");
                    sel.removeClass("selected");
                    next.scrollintoview({
                        duration: 50
                    })
                } else action == "next" ? suggestions.find("li:first").addClass("selected") : suggestions.find("li:last").addClass("selected")
            }

            function select() {
                suggestions.hide();
                var selected = list.find("li.selected");
                var d = selected.data("data");
                if (selected.length === 0) d = options.stringDataFunc(input.val());
                input.val("");
                input.focus();
                options.selectFunc(d);
                mostRecentQuery = null
            }
        })
    }
})(Streak.jQuery);
(function ($, window) {
    "$:nomunge";
    var undefined, aps = Array.prototype.slice,
        decode = decodeURIComponent,
        jq_param = $.param,
        jq_param_sorted, jq_param_fragment, jq_deparam, jq_deparam_fragment, jq_bbq = $.bbq = $.bbq || {},
        jq_bbq_pushState, jq_bbq_getState, jq_elemUrlAttr, special = $.event.special,
        str_hashchange = "hashchange",
        str_querystring = "querystring",
        str_fragment = "fragment",
        str_elemUrlAttr = "elemUrlAttr",
        str_href = "href",
        str_src = "src",
        re_params_querystring = /^.*\?|#.*$/g,
        re_params_fragment, re_fragment, re_no_escape, ajax_crawlable, fragment_prefix, elemUrlAttr_cache = {};

    function is_string(arg) {
        return typeof arg === "string"
    }
    function curry(func) {
        var args = aps.call(arguments, 1);
        return function () {
            return func.apply(this, args.concat(aps.call(arguments)))
        }
    }
    function get_fragment(url) {
        return url.replace(re_fragment, "$2")
    }
    function get_querystring(url) {
        return url.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/, "$1")
    }
    function jq_param_sub(is_fragment, get_func, url, params, merge_mode) {
        var result, qs, matches, url_params, hash;
        if (params !== undefined) {
            matches = url.match(is_fragment ? re_fragment : /^([^#?]*)\??([^#]*)(#?.*)/);
            hash = matches[3] || "";
            if (merge_mode === 2 && is_string(params)) qs = params.replace(is_fragment ? re_params_fragment : re_params_querystring, "");
            else {
                url_params = jq_deparam(matches[2]);
                params = is_string(params) ? jq_deparam[is_fragment ? str_fragment : str_querystring](params) : params;
                qs = merge_mode === 2 ? params : merge_mode === 1 ? $.extend({}, params, url_params) : $.extend({}, url_params, params);
                qs = jq_param_sorted(qs);
                if (is_fragment) qs = qs.replace(re_no_escape, decode)
            }
            result = matches[1] + (is_fragment ? fragment_prefix : qs || !matches[1] ? "?" : "") + qs + hash
        } else result = get_func(url !== undefined ? url : location.href);
        return result
    }
    jq_param[str_querystring] = curry(jq_param_sub, 0, get_querystring);
    jq_param[str_fragment] = jq_param_fragment = curry(jq_param_sub, 1, get_fragment);
    jq_param.sorted = jq_param_sorted = function (a, traditional) {
        var arr = [],
            obj = {};
        $.each(jq_param(a, traditional).split("&"), function (i, v) {
            var key = v.replace(/(?:%5B|=).*$/, ""),
                key_obj = obj[key];
            if (!key_obj) {
                key_obj = obj[key] = [];
                arr.push(key)
            }
            key_obj.push(v)
        });
        return $.map(arr.sort(), function (v) {
            return obj[v]
        }).join("&")
    };
    jq_param_fragment.noEscape = function (chars) {
        chars = chars || "";
        var arr = $.map(chars.split(""), encodeURIComponent);
        re_no_escape = new RegExp(arr.join("|"), "g")
    };
    jq_param_fragment.noEscape(",/");
    jq_param_fragment.ajaxCrawlable = function (state) {
        if (state !== undefined) {
            if (state) {
                re_params_fragment = /^.*(?:#!|#)/;
                re_fragment = /^([^#]*)(?:#!|#)?(.*)$/;
                fragment_prefix = "#!"
            } else {
                re_params_fragment = /^.*#/;
                re_fragment = /^([^#]*)#?(.*)$/;
                fragment_prefix = "#"
            }
            ajax_crawlable = !! state
        }
        return ajax_crawlable
    };
    jq_param_fragment.ajaxCrawlable(0);
    $.deparam = jq_deparam = function (params, coerce) {
        var obj = {},
            coerce_types = {
                "true": !0,
                "false": !1,
                "null": null
            };
        $.each(params.replace(/\+/g, " ").split("&"), function (j, v) {
            var param = v.split("="),
                key = decode(param[0]),
                val, cur = obj,
                i = 0,
                keys = key.split("]["),
                keys_last = keys.length - 1;
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                keys[keys_last] = keys[keys_last].replace(/\]$/, "");
                keys = keys.shift().split("[").concat(keys);
                keys_last = keys.length - 1
            } else keys_last = 0;
            if (param.length === 2) {
                val = decode(param[1]);
                if (coerce) val = val && !isNaN(val) ? +val : val === "undefined" ? undefined : coerce_types[val] !== undefined ? coerce_types[val] : val;
                if (keys_last) for (; i <= keys_last; i++) {
                    key = keys[i] === "" ? cur.length : keys[i];
                    cur = cur[key] = i < keys_last ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val
                } else if ($.isArray(obj[key])) obj[key].push(val);
                else if (obj[key] !== undefined) obj[key] = [obj[key], val];
                else obj[key] = val
            } else if (key) obj[key] = coerce ? undefined : ""
        });
        return obj
    };

    function jq_deparam_sub(is_fragment, url_or_params, coerce) {
        if (url_or_params === undefined || typeof url_or_params === "boolean") {
            coerce = url_or_params;
            url_or_params = jq_param[is_fragment ? str_fragment : str_querystring]()
        } else url_or_params = is_string(url_or_params) ? url_or_params.replace(is_fragment ? re_params_fragment : re_params_querystring, "") : url_or_params;
        return jq_deparam(url_or_params, coerce)
    }
    jq_deparam[str_querystring] = curry(jq_deparam_sub, 0);
    jq_deparam[str_fragment] = jq_deparam_fragment = curry(jq_deparam_sub, 1);
    $[str_elemUrlAttr] || ($[str_elemUrlAttr] = function (obj) {
        return $.extend(elemUrlAttr_cache, obj)
    })({
        a: str_href,
        base: str_href,
        iframe: str_src,
        img: str_src,
        input: str_src,
        form: "action",
        link: str_href,
        script: str_src
    });
    jq_elemUrlAttr = $[str_elemUrlAttr];

    function jq_fn_sub(mode, force_attr, params, merge_mode) {
        if (!is_string(params) && typeof params !== "object") {
            merge_mode = params;
            params = force_attr;
            force_attr = undefined
        }
        return this.each(function () {
            var that = $(this),
                attr = force_attr || jq_elemUrlAttr()[(this.nodeName || "").toLowerCase()] || "",
                url = attr && that.attr(attr) || "";
            that.attr(attr, jq_param[mode](url, params, merge_mode))
        })
    }
    $.fn[str_querystring] = curry(jq_fn_sub, str_querystring);
    $.fn[str_fragment] = curry(jq_fn_sub, str_fragment);
    jq_bbq.pushState = jq_bbq_pushState = function (params, merge_mode) {
        if (is_string(params) && /^#/.test(params) && merge_mode === undefined) merge_mode = 2;
        var has_args = params !== undefined,
            url = jq_param_fragment(location.href, has_args ? params : {}, has_args ? merge_mode : 2);
        location.href = url
    };
    jq_bbq.getState = jq_bbq_getState = function (key, coerce) {
        return key === undefined || typeof key === "boolean" ? jq_deparam_fragment(key) : jq_deparam_fragment(coerce)[key]
    };
    jq_bbq.removeState = function (arr) {
        var state = {};
        if (arr !== undefined) {
            state = jq_bbq_getState();
            $.each($.isArray(arr) ? arr : arguments, function (i, v) {
                delete state[v]
            })
        }
        jq_bbq_pushState(state, 2)
    };
    special[str_hashchange] = $.extend(special[str_hashchange], {
        add: function (handleObj) {
            var old_handler;

            function new_handler(e) {
                var hash = e[str_fragment] = jq_param_fragment();
                e.getState = function (key, coerce) {
                    return key === undefined || typeof key === "boolean" ? jq_deparam(hash, key) : jq_deparam(hash, coerce)[key]
                };
                old_handler.apply(this, arguments)
            }
            if ($.isFunction(handleObj)) {
                old_handler = handleObj;
                return new_handler
            } else {
                old_handler = handleObj.handler;
                handleObj.handler = new_handler
            }
        }
    })
})(Streak.jQuery, this);
(function ($) {
    $.fn.extend({
        bodyCloseAndStop: function (theOptions) {
            var defaults = {
                closeFunction: null,
                stop: null,
                body: null,
                useCapture: true
            };
            var opts = {};
            $.extend(opts, defaults, theOptions);
            return this.each(function () {
                var self = this;
                var o = opts;
                if (!o.useCapture) o.body.click(function (e) {
                    if (o.closeFunction && $(e.target).parents().filter(o.stop).length == 0 && e.target != o.stop && $(e.target).parents().filter(self).length == 0 && $(e.target).parents().filter("body").length > 0) o.closeFunction(e)
                });
                else o.body[0].addEventListener("click", function (e) {
                    if (o.closeFunction && $(e.target).parents().filter(self).length === 0 && $(e.target).parents().filter(o.stop).length === 0 && e.target !== $(o.stop)[0]) o.closeFunction(e)
                }, true)
            })
        }
    })
})(Streak.jQuery);
(function (a) {
    var b = 0;
    a.fn.extend({
        bubbletip: function (c, d) {
            function t() {
                if (h.positionAt.match(/^element$/i)) {
                    var a = h.positionAtElement.offset();
                    if (h.deltaDirection.match(/^up$/i)) {
                        i.top = a.top + h.offsetTop - n.outerHeight();
                        i.left = a.left + h.offsetLeft + (h.positionAtElement.outerWidth() - n.outerWidth()) / 2;
                        i.delta = h.deltaPosition
                    } else if (h.deltaDirection.match(/^down$/i)) {
                        i.top = a.top + h.positionAtElement.outerHeight() + h.offsetTop;
                        i.left = a.left + h.offsetLeft + (h.positionAtElement.outerWidth() - n.outerWidth()) / 2;
                        i.delta = -h.deltaPosition
                    } else if (h.deltaDirection.match(/^left$/i)) {
                        i.top = a.top + h.offsetTop + (h.positionAtElement.outerHeight() - n.outerHeight()) / 2;
                        i.left = a.left + h.offsetLeft - n.outerWidth();
                        i.delta = h.deltaPosition
                    } else if (h.deltaDirection.match(/^right$/i)) {
                        i.top = a.top + h.offsetTop + (h.positionAtElement.outerHeight() - n.outerHeight()) / 2;
                        i.left = a.left + h.positionAtElement.outerWidth() + h.offsetLeft;
                        i.delta = -h.deltaPosition
                    }
                } else if (h.positionAt.match(/^body$/i)) if (h.deltaDirection.match(/^up|left$/i)) {
                    i.top = h.offsetTop;
                    i.left = h.offsetLeft;
                    i.delta = h.deltaPosition
                } else {
                    if (h.deltaDirection.match(/^down$/i)) {
                        i.top = parseInt(h.offsetTop + n.outerHeight());
                        i.left = h.offsetLeft
                    } else {
                        i.top = h.offsetTop;
                        i.left = parseInt(h.offsetLeft + n.outerWidth())
                    }
                    i.delta = -h.deltaPosition
                } else if (h.positionAt.match(/^mouse$/i)) if (h.deltaDirection.match(/^up|left$/i)) {
                    if (h.deltaDirection.match(/^up$/i)) {
                        i.top = -(h.offsetTop + n.outerHeight());
                        i.left = h.offsetLeft
                    } else if (h.deltaDirection.match(/^left$/i)) {
                        i.top = h.offsetTop;
                        i.left = -(h.offsetLeft + n.outerWidth())
                    }
                    i.delta = h.deltaPosition
                } else {
                    i.top = h.offsetTop;
                    i.left = h.offsetLeft;
                    i.delta = -h.deltaPosition
                }
                if (h.positionAt.match(/^element|body$/i)) n.css({
                    position: "absolute",
                    top: i.top + "px",
                    left: i.left + "px"
                })
            }
            function s() {
                var b;
                l = false;
                m = true;
                if (h.positionAt.match(/^element|body$/i)) if (h.deltaDirection.match(/^up|down$/i)) b = {
                    top: parseInt(i.top - i.delta) + "px"
                };
                else b = {
                    left: parseInt(i.left - i.delta) + "px"
                };
                else if (h.deltaDirection.match(/^up|down$/i)) b = {
                    top: parseInt(i.mouseTop - i.delta) + "px"
                };
                else b = {
                    left: parseInt(i.mouseLeft - i.delta) + "px"
                };
                b = a.extend(b, {
                    opacity: 0
                });
                n.animate(b, h.animationDuration, h.animationEasing, function () {
                    n.hide();
                    m = false;
                    if (h.postHide()) h.postHide()
                })
            }
            function r() {
                var b;
                if (l) return;
                l = true;
                if (m) n.stop(true, false);
                if (h.calculateOnShow) t();
                if (h.positionAt.match(/^element|body$/i)) if (h.deltaDirection.match(/^up|down$/i)) {
                    if (!m) n.css("top", parseInt(i.top + i.delta) + "px");
                    b = {
                        top: i.top + "px"
                    }
                } else {
                    if (!m) n.css("left", parseInt(i.left + i.delta) + "px");
                    b = {
                        left: i.left + "px"
                    }
                } else if (h.deltaDirection.match(/^up|down$/i)) {
                    if (!m) {
                        i.mouseTop = e.pageY + i.top;
                        n.css({
                            top: parseInt(i.mouseTop + i.delta) + "px",
                            left: parseInt(e.pageX - n.width() / 2) + "px"
                        })
                    }
                    b = {
                        top: i.mouseTop + "px"
                    }
                } else {
                    if (!m) {
                        i.mouseLeft = e.pageX + i.left;
                        n.css({
                            left: parseInt(i.mouseLeft + i.delta) + "px",
                            top: parseInt(e.pageY - n.height() / 2) + "px"
                        })
                    }
                    b = {
                        left: i.left + "px"
                    }
                }
                m = false;
                n.show();
                b = a.extend(b, {
                    opacity: 1
                });
                n.animate(b, h.animationDuration, h.animationEasing, function () {
                    n.css("opacity", "");
                    l = true;
                    if (h.postShow) h.postShow()
                })
            }
            if (a("table.bubbletip #" + a(c).get(0).id).length > 0) return this;
            var f, g, h, i, j, k, l, m, n, o;
            var p, q;
            f = a(this);
            g = a(c);
            o = b++;
            h = {
                positionAt: "element",
                positionAtElement: f,
                offsetTop: 0,
                offsetLeft: 0,
                deltaPosition: 30,
                deltaDirection: "up",
                animationDuration: 250,
                animationEasing: "swing",
                bindShow: "mouseover",
                bindHide: "mouseout",
                delayShow: 0,
                delayHide: 500,
                calculateOnShow: false,
                body: "body",
                postShow: null,
                postHide: null
            };
            if (d) h = a.extend(h, d);
            i = {
                top: 0,
                left: 0,
                delta: 0,
                mouseTop: 0,
                mouseLeft: 0,
                tipHeight: 0,
                bindShow: (h.bindShow + " ").replace(/ +/g, ".bubbletip" + o),
                bindHide: (h.bindHide + " ").replace(/ +/g, ".bubbletip" + o)
            };
            j = null;
            k = null;
            l = false;
            m = false;
            if (!f.data("bubbletip_tips")) f.data("bubbletip_tips", [
                [g.get(0).id, o]
            ]);
            else f.data("bubbletip_tips", a.merge(f.data("bubbletip_tips"), [
                [g.get(0).id, o]
            ]));
            if (!h.positionAt.match(/^element|body|mouse$/i)) h.positionAt = "element";
            if (!h.deltaDirection.match(/^up|down|left|right$/i)) h.deltaDirection = "up";
            if (h.deltaDirection.match(/^up$/i)) n = a('<table class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td class="bt-top"></td><td class="bt-topright"></td></tr><tr><td class="bt-left"></td><td class="bt-content"></td><td class="bt-right"></td></tr><tr><td class="bt-bottomleft"></td><td><table class="bt-bottom" cellspacing="0" cellpadding="0"><tr><th></th><td><div></div></td><th></th></tr></table></td><td class="bt-bottomright"></td></tr></tbody></table>');
            else if (h.deltaDirection.match(/^down$/i)) n = a('<table class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td><table class="bt-top" cellspacing="0" cellpadding="0"><tr><th></th><td><div></div></td><th></th></tr></table></td><td class="bt-topright"></td></tr><tr><td class="bt-left"></td><td class="bt-content"></td><td class="bt-right"></td></tr><tr><td class="bt-bottomleft"></td><td class="bt-bottom"></td><td class="bt-bottomright"></td></tr></tbody></table>');
            else if (h.deltaDirection.match(/^left$/i)) n = a('<table class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td class="bt-top"></td><td class="bt-topright"></td></tr><tr><td class="bt-left"></td><td class="bt-content"></td><td class="bt-right-tail"><div class="bt-right"></div><div class="bt-right-tail"></div><div class="bt-right"></div></td></tr><tr><td class="bt-bottomleft"></td><td class="bt-bottom"></td><td class="bt-bottomright"></td></tr></tbody></table>');
            else if (h.deltaDirection.match(/^right$/i)) n = a('<table class="bubbletip" cellspacing="0" cellpadding="0"><tbody><tr><td class="bt-topleft"></td><td class="bt-top"></td><td class="bt-topright"></td></tr><tr><td class="bt-left-tail"><div class="bt-left"></div><div class="bt-left-tail"></div><div class="bt-left"></div></td><td class="bt-content"></td><td class="bt-right"></td></tr><tr><td class="bt-bottomleft"></td><td class="bt-bottom"></td><td class="bt-bottomright"></td></tr></tbody></table>');
            n.appendTo(h.body);
            if (/msie/.test(navigator.userAgent.toLowerCase()) && !/opera/.test(navigator.userAgent.toLowerCase())) a("*", n).each(function () {
                var b = a(this).css("background-image");
                if (b.match(/^url\(["']?(.*\.png)["']?\)$/i)) {
                    b = RegExp.$1;
                    a(this).css({
                        backgroundImage: "none",
                        filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=" + (a(this).css("backgroundRepeat") == "no-repeat" ? "crop" : "scale") + ", src='" + b + "')"
                    }).each(function () {
                        var b = a(this).css("position");
                        if (b != "absolute" && b != "relative") a(this).css("position", "relative")
                    })
                }
            });
            a(".bt-content", n).append(g);
            g.show();
            if (h.deltaDirection.match(/^left|right$/i)) {
                i.tipHeight = parseInt(g.height() / 2);
                if (g.height() % 2 == 1) i.tipHeight++;
                i.tipHeight = i.tipHeight < 20 ? 6 : i.tipHeight - 10;
                i.tipHeight += 10;
                if (h.deltaDirection.match(/^left$/i)) a("div.bt-right", n).css("height", i.tipHeight + "px");
                else a("div.bt-left", n).css("height", i.tipHeight + "px")
            }
            n.css("opacity", 0);
            n.css({
                width: n.width(),
                height: n.height()
            });
            t();
            n.hide();
            a(window).bind("resize.bubbletip" + o, function () {
                var b = a(window).width();
                var c = a(window).height();
                if (b === p && c === q) return;
                p = b;
                q = c;
                if (k) clearTimeout(k);
                k = setTimeout(function () {
                    t()
                }, 250)
            });
            a([n.get(0), this.get(0)]).bind(i.bindShow, function () {
                if (j) clearTimeout(j);
                if (h.delayShow === 0) r();
                else j = setTimeout(function () {
                    r()
                }, h.delayShow);
                return false
            }).bind(i.bindHide, function () {
                if (!l) return;
                if (j) clearTimeout(j);
                if (h.delayHide === 0) s();
                else j = setTimeout(function () {
                    s()
                }, h.delayHide);
                return false
            });
            return this
        },
        removeBubbletip: function (b) {
            var c;
            var d = new Array;
            var e = new Array;
            var f, g, h;
            var i;
            c = a.makeArray(a(this).data("bubbletip_tips"));
            f = a.makeArray(b);
            for (g = 0; g < f.length; g++) d.push(a(f[g]).get(0).id);
            for (g = 0; g < c.length; g++) {
                h = null;
                if (d.length == 0 || (h = a.inArray(c[g][0], d)) >= 0) {
                    i = a("#" + c[g][0]).parents("table.bubbletip");
                    a(i).remove();
                    a(this).unbind(".bubbletip" + c[g][1]);
                    a(window).unbind(".bubbletip" + c[g][1])
                } else e.push(c[g])
            }
            a(this).data("bubbletip_tips", e);
            return this
        }
    })
})(Streak.jQuery);
(function ($) {
    $.fn.extend({
        captureClick: function (inCB) {
            var cb = inCB;
            return this.each(function () {
                var self = $(this);
                this.addEventListener("click", function (e) {
                    if (cb) cb(e);
                    e.stopPropagation();
                    return false
                }, true)
            })
        }
    })
})(Streak.jQuery);
(function (Streak) {
    var $ = Streak.jQuery;
    $.cleanString = function (s) {
        var d = document.createElement("div");
        d.innerHTML = s;
        return d.innerText
    };
    $.fn.cleanText = function () {
        var s = this[0].innerHTML.replace(/<br\s*\/?>|<div>/img, "\n").stripTags();
        return s.replace("&nbsp;", " ")
    };
    $.cleanText = function (s, replaceNewlines) {
        if (!s) return "";
        var sPrime = s.replace(/<br\s*\/?>|<div>/img, "\n").stripTags().replace("&nbsp;", " ");
        if (replaceNewlines) sPrime = sPrime.replace(/\n/img, " ");
        return sPrime
    };
    $.fn.plainText = function (text) {
        if (text) this.setPlainText(text);
        else {
            var innerText = "";
            if (this.is("textarea") || this.is("input")) innerText = this.val();
            else {
                var doc = Streak.document;
                var sel, range, node, innerText = "";
                var el = this[0];
                sel = doc.getSelection();
                if (sel.rangeCount === 1) {
                    range = sel.getRangeAt(0);
                    sel.removeAllRanges()
                }
                sel.selectAllChildren(el);
                innerText = "" + sel;
                if (range) {
                    sel.removeAllRanges();
                    sel.addRange(range)
                }
            }
            return innerText
        }
    };
    var charEncodings = {
        "\t": "&nbsp;&nbsp;&nbsp;&nbsp;",
        "  ": "&nbsp; ",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\n": "<br />",
        "\r": "<br />"
    };
    var space = /[\t ]/;
    var noWidthSpace = "&#8203;";
    $.fn.setPlainText = function (text) {
        if (this.is("textarea") || this.is("input")) this.val(text);
        else this[0].innerHTML = $.getTextHTML(text)
    };
    $.getTextHTML = function (text) {
        var text = (text || "") + "";
        text = $.cleanText(text);
        text = text.replace(/\r\n/g, "\n");
        var html = "";
        var lastChar = "";
        for (var i = 0; i < text.length; i++) {
            var c = text[i];
            var charCode = text.charCodeAt(i);
            if (space.test(c) && !space.test(lastChar) && space.test(text[i + 1] || "")) html += noWidthSpace;
            html += c in charEncodings ? charEncodings[c] : charCode > 127 ? "&#" + charCode + ";" : c;
            lastChar = c
        }
        return html
    }
})(Streak);
(function ($) {
    $.fn.colResizable = function (opts) {
        var defaults = {
            onResize: $.noop
        };
        var options = $.extend(defaults, opts);
        return this.each(function () {
            var td = $(this),
                grip = $(document.createElement("div"));
            grip.addClass("colResize");
            grip.attr("draggable", true);
            td.append(grip);
            var isMoving = false,
                currentX = 0,
                currentWidth = 0;
            grip.bind({
                "dragstart.colResizable": function (e) {
                    isMoving = true;
                    currentX = e.originalEvent.pageX;
                    currentWidth = td.width();
                    var dt = e.originalEvent.dataTransfer;
                    dt.dropEffect = "none";
                    dt.setData("text/html", null);
                    dt.effectAllowed = "none";
                    grip.addClass("active")
                },
                "drag.colResizable": function (e) {
                    var newX = e.originalEvent.pageX;
                    var diff = currentX - newX;
                    var newWidth = currentWidth - diff;
                    td.css({
                        minWidth: newWidth,
                        width: newWidth,
                        maxWidth: newWidth
                    })
                },
                "dragend.colResizable": function (e) {
                    options.onResize(td.width());
                    grip.removeClass("active");
                    e.preventDefault()
                }
            });
            grip.easyHoverClass("hover")
        })
    }
})(Streak.jQuery);
(function ($) {
    $.fn.getBoundingBox = function () {
        var el = $(this[0]);
        var offset = el.offset();
        var bb = [{
            x: offset.left,
            y: offset.top
        }, {
            x: offset.left + el.width(),
            y: offset.top + el.outerHeight()
        }];
        bb.width = el.width();
        bb.height = el.outerHeight();
        return bb
    };
    var opsChecker = function (theOps) {
            var ops = theOps;
            return {
                can: function (checkOps) {
                    var ret = false;
                    if ($.isArray(checkOps)) {
                        ret = false;
                        for (var i = 0; i < checkOps.length; i++) if (ops.indexOf(checkOps[i]) > -1) {
                            ret = true;
                            break
                        }
                    } else ret = ops.indexOf(checkOps) > -1;
                    return ret
                }
            }
        };
    var BoundingBoxContainer = function (theContainerBB, theContainedBB, theAnchorPoint) {
            var containerBB = theContainerBB;
            var containedBB = theContainedBB;
            var anchorPoint = theAnchorPoint;
            return {
                containDimension: function (axis, dimension, anchorCheck, coord) {
                    coord = coord === 1 ? 1 : 0;
                    var checkCoord = (coord + 1) % 2;
                    var adjuster = 1;
                    if (coord === 1) adjuster = -1;
                    var ops = [];
                    if (containedBB[coord][axis] * adjuster < containerBB[coord][axis] * adjuster) {
                        ops.push(axis + "|" + coord + "=" + containerBB[coord][axis]);
                        if (containedBB[checkCoord][axis] * adjuster > containerBB[checkCoord][axis] * adjuster) ops.push(axis + "|" + checkCoord + "=" + containerBB[checkCoord][axis]);
                        else if (anchorPoint.indexOf(anchorCheck) > -1) ops.push(axis + "|" + checkCoord + "=" + containedBB[checkCoord][axis]);
                        else if ((containerBB[coord][axis] + containedBB[dimension] * adjuster) * adjuster > containerBB[checkCoord][axis] * adjuster) ops.push(axis + "|" + checkCoord + "=" + containerBB[checkCoord][axis])
                    }
                    return ops
                }
            }
        };
    $.fn.containElement = function (theContained, theAnchorPoint) {
        var container = $(this[0]);
        var contained = $(theContained);
        var anchorPoint = theAnchorPoint || "";
        var containerBB = container.getBoundingBox();
        var containedBB = contained.getBoundingBox();
        var offset = contained.offset();
        var css = {};
        var ops = [];
        var boundingBoxContainer = new BoundingBoxContainer(containerBB, containedBB, anchorPoint);
        ops = ops.concat(boundingBoxContainer.containDimension("x", "width", "right", 0));
        ops = ops.concat(boundingBoxContainer.containDimension("x", "width", "left", 1));
        ops = ops.concat(boundingBoxContainer.containDimension("y", "height", "bottom", 0));
        ops = ops.concat(boundingBoxContainer.containDimension("y", "height", "top", 1));
        if (ops.length === 0);
        else {
            var shrinkWidth = false;
            var shrinkHeight = false;
            ops.sort();
            for (var i = 0; i < ops.length; i++) {
                var op = ops[i];
                if (!op) continue;
                var opParts = op.split("=");
                var value = parseInt(opParts[1]);
                var axis = opParts[0].split("|")[0];
                var coord = opParts[0].split("|")[1];
                if (axis === "x") if (coord === "0") {
                    offset.left = value;
                    shrinkWidth = true
                } else if (shrinkWidth) css.width = value - offset.left + "px";
                else offset.left = offset.left - (containedBB[0].x - value);
                else if (coord === "0") {
                    shrinkHeight = true;
                    offset.top = value
                } else if (shrinkHeight) css.height = value - offset.top + "px";
                else offset.top = offset.top - (containedBB[1].y - value)
            }
        }
        contained.offset(offset);
        contained.css(css)
    }
})(Streak.jQuery);
(function ($) {
    var getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
        rupper = /([A-Z])/g,
        rdashAlpha = /-([a-z])/ig,
        fcamelCase = function (all, letter) {
            return letter.toUpperCase()
        },
        getStyle = function (elem) {
            if (getComputedStyle) return getComputedStyle(elem, null);
            else if (elem.currentStyle) return elem.currentStyle
        },
        rfloat = /float/i,
        rnumpx = /^-?\d+(?:px)?$/i,
        rnum = /^-?\d/;
    $.curStyles = function (el, styles) {
        if (!el) return null;
        var currentS = getStyle(el),
            oldName, val, style = el.style,
            results = {},
            i = 0,
            left, rsLeft, camelCase, name;
        for (; i < styles.length; i++) {
            name = styles[i];
            oldName = name.replace(rdashAlpha, fcamelCase);
            if (rfloat.test(name)) {
                name = jQuery.support.cssFloat ? "float" : "styleFloat";
                oldName = "cssFloat"
            }
            if (getComputedStyle) {
                name = name.replace(rupper, "-$1").toLowerCase();
                val = currentS.getPropertyValue(name);
                if (name === "opacity" && val === "") val = "1";
                results[oldName] = val
            } else {
                camelCase = name.replace(rdashAlpha, fcamelCase);
                results[oldName] = currentS[name] || currentS[camelCase];
                if (!rnumpx.test(results[oldName]) && rnum.test(results[oldName])) {
                    left = style.left;
                    rsLeft = el.runtimeStyle.left;
                    el.runtimeStyle.left = el.currentStyle.left;
                    style.left = camelCase === "fontSize" ? "1em" : results[oldName] || 0;
                    results[oldName] = style.pixelLeft + "px";
                    style.left = left;
                    el.runtimeStyle.left = rsLeft
                }
            }
        }
        return results
    };
    $.fn.curStyles = function () {
        return $.curStyles(this[0], $.makeArray(arguments))
    }
})(Streak.jQuery);
(function ($) {
    $.expr[":"].Contains = function (a, i, m) {
        return (a.textContent || a.innerText || "").toLowerCase().indexOf(m[3].toLowerCase()) >= 0
    };
    $.expr[":"].FastVisible = function (a, i, m) {
        if (a.style.display === "none") return false;
        var parents = $(a).parents();
        if (parents.length === 0) return false;
        var body = false;
        for (var i = 0; i < parents.length; i++) {
            if (parents[i].style.display === "none") return false;
            if (parents[i].tagName.toLowerCase() === "body") body = true
        }
        if (!body) return false;
        if (m === "compute") return a.offsetHeight > 0 || a.offsetWidth > 0;
        return true
    };
    $.expr[":"].DisplayVisible = function (a, i, m) {
        var $a = $(a);
        if (a.style.display === "none") return false;
        if ($a.parents("body").length === 0) return false;
        if ($a.parents(":DisplayNone").length > 0) return false;
        return true
    };
    $.expr[":"].NotDisplayNone = function (a, i, m) {
        return a.style.display !== "none"
    };
    $.expr[":"].DisplayNone = function (a, i, m) {
        return a.style.display === "none"
    };
    $.expr[":"].scroll = function (a, i, m) {
        var $a = $(a);
        var styles = $a.curStyles("overflow", "overflowX", "overflowY");
        return /(auto|scroll)/.test(styles.overflow + styles.overflowX + styles.overflowY)
    };
    $.expr[":"].inBody = function (a, i, m) {
        var check = a;
        while (true) if (!check) return false;
        else if (check.tagName && check.tagName.toLowerCase() === "body") return true;
        else check = check.parentNode
    };
    $.fn._find = $.fn.find;
    $.fn.find = function (selector) {
        if (this.length === 0) return $("");
        else {
            var list = [];
            for (var i = 0; i < this.length; i++) {
                var newList = [];
                if (selector.indexOf(":") > -1 || !this[i].querySelectorAll) newList = this._find(selector);
                else try {
                    newList = this[i].querySelectorAll(selector)
                } catch (err) {
                    newList = this._find(selector)
                }
                if (newList.length > 0) for (var j = 0; j < newList.length; j++) list.push(newList[j])
            }
            return $(list)
        }
    };
    $.fn.outerHTML = function () {
        return this[0].outerHTML
    }
})(Streak.jQuery);
(function ($) {
    $.fn.extend({
        delayedSave: function (opts) {
            var defaults = {
                saveFunction: null,
                delay: 1E3,
                enter: false
            };
            var options = {};
            $.extend(options, defaults, opts);
            return this.each(function () {
                var o = options,
                    timer, self = $(this),
                    enterTriggered = false,
                    content = self.val() || self.html(),
                    callsave = function (isEnter) {
                        clearTimeout(timer);
                        if (content != (self.val() || self.html()) || isEnter) {
                            content = self.val() || self.html();
                            if (o.saveFunction) o.saveFunction.call(self, isEnter)
                        }
                    };
                self.focus(function (e) {
                    content = self.val() || self.html()
                });
                self.bind("blur", function (e) {
                    var isEnter = enterTriggered;
                    enterTriggered = false;
                    if ((self.val() || self.html()) != content || isEnter) callsave(isEnter)
                });
                if (o.delay) self.keydown(function (e) {
                    clearTimeout(timer);
                    if (o.enter && e.which === 13) {
                        enterTriggered = true;
                        self.blur()
                    } else timer = setTimeout(function () {
                        callsave(e.which === 13)
                    }, o.delay)
                });
                else self.keydown(function (e) {
                    if (o.enter && e.which === 13) {
                        enterTriggered = true;
                        self.blur()
                    }
                })
            })
        }
    })
})(Streak.jQuery);
(function ($) {
    $.fn.extend({
        easyHoverClass: function (hoverClass) {
            var theHoverClass = hoverClass;
            return this.each(function () {
                var self = $(this),
                    hold = false,
                    isOver = false,
                    disabled = false;
                self.hover(function (e) {
                    if (disabled) return;
                    self.addClass(theHoverClass);
                    isOver = true
                }, function (e) {
                    isOver = false;
                    if (!hold) self.removeClass(theHoverClass)
                });
                self.focus(function (e) {
                    hold = true;
                    self.addClass(theHoverClass)
                });
                self.blur(function (e) {
                    hold = false;
                    self.removeClass(theHoverClass)
                });
                self.bind({
                    "hold": function () {
                        self.addClass(theHoverClass);
                        hold = true
                    },
                    "unhold": function () {
                        if (!isOver) self.removeClass(theHoverClass);
                        hold = false
                    },
                    "disabled": function () {
                        disabled = true
                    },
                    "enabled": function () {
                        disabled = false
                    }
                })
            })
        }
    })
})(Streak.jQuery);
(function ($) {
    $.fn.extend({
        easyTab: function (o) {
            var defaults = {
                prev: -1,
                next: -1,
                delay: null,
                namespace: null
            };
            var options = {};
            $.extend(options, defaults, o);
            options.namespace = options.namespace || "easyTab";
            return this.each(function () {
                var self = $(this);
                var go = function (isPrev) {
                        if ((isPrev ? options.prev : options.next) === -1) return true;
                        self.blur();
                        if (options.delay) setTimeout(function () {
                            goNow(isPrev)
                        }, 50);
                        else goNow(isPrev)
                    };
                var goNow = function (isPrev) {
                        if (isPrev) {
                            if (options.prev) options.prev.focus()
                        } else if (options.next) options.next.focus()
                    };
                self.bind("keydown." + options.namespace, function (e) {
                    if (e.which == 9) {
                        if (e.shiftKey) {
                            if (go(true)) return
                        } else if (go()) return;
                        e.stopPropagation();
                        e.preventDefault()
                    }
                });
                self.bind("tabPressed." + options.namespace, function (e) {
                    go()
                });
                self.bind("shiftTabPressed." + options.namespace, function (e) {
                    go(true)
                })
            })
        }
    });
    $.tabChain = function (arr, delay) {
        if (arr && arr.length > 0) for (var i = 0; i < arr.length; i++) {
            var prev = (i - 1) % arr.length;
            var next = (i + 1) % arr.length;
            if (prev < 0) prev = arr.length + prev;
            if (arr[i] && arr[i] !== -1) arr[i].easyTab({
                prev: arr[prev],
                next: arr[next],
                delay: delay
            })
        }
    }
})(Streak.jQuery);
(function (Streak, len, createRange, duplicate) {
    var $ = Streak.jQuery;
    $.fn.caret = function (options, opt2) {
        var doc = Streak.document;
        var start, end, t = this[0],
            browser = $.browser.msie;
        if (typeof options === "object" && typeof options.start === "number" && typeof options.end === "number") {
            start = options.start;
            end = options.end
        } else if (typeof options === "number" && typeof opt2 === "number") {
            start = options;
            end = opt2
        } else if (typeof options === "string") if ((start = t.value.indexOf(options)) > -1) end = start + options[len];
        else start = null;
        else if (Object.prototype.toString.call(options) === "[object RegExp]") {
            var re = options.exec(t.value);
            if (re != null) {
                start = re.index;
                end = start + re[0][len]
            }
        }
        if (typeof start != "undefined") {
            if (browser) {
                var selRange = this[0].createTextRange();
                selRange.collapse(true);
                selRange.moveStart("character", start);
                selRange.moveEnd("character", end - start);
                selRange.select()
            } else {
                this[0].selectionStart = start;
                this[0].selectionEnd = end
            }
            this[0].focus();
            return this
        } else {
            if (browser) {
                var selection = doc.selection;
                if (this[0].tagName.toLowerCase() != "textarea") {
                    var val = this.val(),
                        range = selection[createRange]()[duplicate]();
                    range.moveEnd("character", val[len]);
                    var s = range.text == "" ? val[len] : val.lastIndexOf(range.text);
                    range = selection[createRange]()[duplicate]();
                    range.moveStart("character", -val[len]);
                    var e = range.text[len]
                } else {
                    var range = selection[createRange](),
                        stored_range = range[duplicate]();
                    stored_range.moveToElementText(this[0]);
                    stored_range.setEndPoint("EndToEnd", range);
                    var s = stored_range.text[len] - range.text[len],
                        e = s + range.text[len]
                }
            } else var s = t.selectionStart,
                e = t.selectionEnd;
            if (t.tagName === "INPUT") {
                var te = t.value.substring(s, e);
                return {
                    start: s,
                    end: e,
                    text: te,
                    replace: function (st) {
                        return t.value.substring(0, s) + st + t.value.substring(e, t.value[len])
                    }
                }
            }
            return {
                start: doc.getSelection().getRangeAt().startOffset,
                end: doc.getSelection().getRangeAt().endOffset,
                goToEnd: function () {
                    var sel, range;
                    if (doc.createRange) {
                        range = doc.createRange();
                        range.selectNodeContents(t);
                        range.collapse(false);
                        sel = doc.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range)
                    }
                }
            }
        }
    };
    $.fn.insertNodeAtCaret = function (text) {
        if (this.is("textarea")) {
            var ta = this[0];
            var oldStart = ta.selectionStart;
            if (ta.selectionStart < ta.selectionEnd) ta.value = ta.value.substring(0, ta.selectionStart) + ta.value.substring(ta.selectionEnd);
            ta.value = ta.value.substring(0, oldStart) + text + ta.value.substring(oldStart);
            ta.selectionStart = oldStart + text.length;
            ta.selectionEnd = oldStart + text.length
        } else {
            var sel, range, textNode;
            var editable = null;
            if (this[0].getSelection) editable = this[0];
            else if (this[0].ownerDocument && this[0].ownerDocument.getSelection) editable = this[0].ownerDocument;
            if (editable) {
                sel = editable.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();
                    var el = document.createElement("div");
                    el.innerHTML = text;
                    var frag = document.createDocumentFragment(),
                        firstNode = el.firstChild,
                        node, lastNode;
                    while (node = el.firstChild) lastNode = frag.appendChild(node);
                    range.insertNode(frag);
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range)
                    }
                    return firstNode
                }
            }
        }
    };
    $.fn.deleteText = function (text) {
        if (this.is("textarea")) {
            var ta = this[0];
            var oldStart = ta.selectionStart;
            var begVal = ta.value.substring(0, ta.selectionStart - text.length + 1);
            var endVal = ta.value.substring(ta.selectionStart);
            ta.value = begVal + endVal;
            ta.selectionStart = oldStart - text.length + 1;
            ta.selectionEnd = ta.selectionStart
        } else {
            var sel, range;
            var editor = null;
            if (this[0].getSelection) editor = this[0];
            else if (this[0].ownerDocument) editor = this[0].ownerDocument;
            if (editor.getSelection) {
                sel = editor.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.setStart(range.startContainer, range.startOffset - text.length);
                    range.deleteContents()
                }
            }
        }
    }
})(Streak, "length", "createRange", "duplicate");
(function ($) {
    $.fn.MultipleAutoSuggest = function (config) {
        var defaults = {
            data: null,
            wrapperCss: {},
            minChars: 2,
            dataFunc: function (query, cb) {},
            stringDataFunc: $.noop,
            convertFunc: function (query, data) {},
            compareFunc: function (query, dataItem) {},
            selectFunc: function (data) {},
            removeFunc: function (data) {},
            doneFunc: function (list) {},
            listChangeFunc: function (list) {},
            clickStop: null,
            clickBody: null,
            noResultsFoundText: null,
            immediateDone: false,
            idProperty: "email",
            suggestionTemplate: null
        };
        var options = {};
        $.extend(options, defaults, config);
        return this.each(function () {
            var self = this;
            var input = $(this);
            var parent = input.parent();
            parent.addClass("parent");
            parent.css(options.wrapperCss);
            parent.after('<div style="clear:both;"></div>');
            var dataList = [];
            var ids = [];
            var hasFocus = false;
            var internalSelectFunction = options.selectFunc;
            options.selectFunc = select;
            options.getExcludedIDsFunc = function () {
                return ids
            };
            input.AutoSuggest(options);
            if (options.data) $.each(options.data, function (i, v) {
                addSelection(v)
            });
            input.bind("setPeopleList", function (e) {
                parent.parent().find(".autoChosen").remove();
                dataList = [];
                ids = [];
                $.each(input.data("peopleList"), function (i, v) {
                    addSelection(v)
                })
            });
            input[0].addEventListener("keydown", function (event) {
                switch (event.which) {
                case 27:
                    hasFocus = false;
                    break;
                case 8:
                    if (!input.val()) parent.parent().find("span.autoChosen:last a").trigger("click");
                    break
                }
            }, true);
            input.focus(function () {
                hasFocus = true
            });
            input.bind("enterPressed shiftTabPressed tabPressed", function (e) {
                offFocus()
            });
            parent.blur(function () {
                if (!options.immediateDone) offFocus()
            });
            parent.bodyCloseAndStop({
                closeFunction: offFocus,
                body: options.clickBody,
                stop: options.clickStop
            });

            function select(selectedItem) {
                internalSelectFunction(selectedItem);
                addSelection(selectedItem)
            }
            function addSelection(data) {
                var sel = $('<span class="autoChosen"></span>');
                var close = $('<a class="close" href="#">x</a>');
                sel.text(data.fullName);
                sel.append(close);
                close.click(function (e) {
                    input.focus();
                    dataList.removeVal(data);
                    ids.removeVal(data[options.idProperty]);
                    sel.remove();
                    if (options.removeFunc) options.removeFunc(data);
                    if (options.listChangeFunc) options.listChangeFunc(dataList);
                    e.preventDefault();
                    return false
                });
                parent.before(sel);
                dataList.push(data);
                ids.push(data[options.idProperty]);
                if (options.listChangeFunc) options.listChangeFunc(dataList);
                return sel
            }
            function offFocus() {
                if (hasFocus) {
                    hasFocus = false;
                    if (options.doneFunc) options.doneFunc(dataList)
                }
            }
        })
    }
})(Streak.jQuery);
(function ($) {
    var Date = Streak.Date;
    $.fn.will_pickdate = function (opts) {
        return this.each(function (index) {
            var self = $(this);
            if (!$.data(this, "will_pickdate")) {
                var pd = new will_pickdate(this, index, opts);
                self.data("pickdate", pd)
            }
        })
    };

    function will_pickdate(element, index, options) {
        var init_clone_val;
        this.element = $(element);
        this.options = {};
        $.extend(this.options, {
            pickerClass: "wpd",
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            dayShort: 2,
            monthShort: 3,
            startDay: 0,
            timePicker: false,
            timePickerOnly: false,
            yearPicker: true,
            militaryTime: false,
            yearsPerPage: 20,
            format: "d-m-Y",
            allowEmpty: false,
            inputOutputFormat: "U",
            animationDuration: 400,
            useFadeInOut: !$.browser.msie,
            startView: "month",
            positionOffset: {
                x: 0,
                y: 0
            },
            minDate: null,
            maxDate: null,
            debug: false,
            toggleElements: null,
            appendTo: document.body,
            body: document.body,
            isPersistent: false,
            setInput: true,
            autoClose: true,
            onShow: $.noop,
            onClose: $.noop,
            onSelect: $.noop,
            onClear: $.noop
        }, options);
        if (this.options.toggleElements != null && this.options.toggleElements.jquery) {
            this.toggler = this.options.toggleElements.eq(index);
            $(document).keydown($.proxy(function (event) {
                if (event.which == 9) this.close(null, true)
            }, this))
        }
        this.formatMinMaxDates();
        $(document).mousedown($.proxy(this.close, this));
        if (this.options.timePickerOnly) {
            this.options.timePicker = true;
            this.options.startView = "time"
        }
        if (init_clone_val = this.element.val()) init_clone_val = this.format(new Date(this.unformat(init_clone_val, this.options.inputOutputFormat)), this.options.format);
        else if (!options.allowEmpty) init_clone_val = this.format(new Date, this.options.format);
        else init_clone_val = "";
        this.display = this.element.css("display");
        this.element.data("will_pickdate", true);
        if (this.toggler) {
            this.toggler.css("cursor", "pointer").click($.proxy(function (event) {
                this.onFocus(this.element, this.clone)
            }, this));
            this.clone.blur($.proxy(function () {
                this.element.val(this.clone.val())
            }, this))
        } else {
            var self = this;
            this.element.bind({
                "keydown": $.proxy(function (e) {
                    if (e.which == 27) if (this.element.data("time")) {
                        this.choice = this.dateToObject(Date.ccreate(this.element.data("time")));
                        this.select(this.choice)
                    } else {
                        this.element.val("");
                        this.close(null, true)
                    } else if (e.which == 13) {
                        if (this.element.val().length > 0) {
                            var d = Date.ccreate(this.element.val());
                            if (d.isValid()) {
                                this.choice = this.dateToObject(d);
                                this.select(this.choice, true)
                            } else {
                                this.element.val("");
                                if ($.isFunction(this.options.onClear)) this.options.onClear();
                                this.close(null, true, true)
                            }
                        } else {
                            if ($.isFunction(this.options.onClear)) this.options.onClear();
                            this.close(null, true, true)
                        }
                        e.preventDefault();
                        e.stopPropagation()
                    } else if (e.which === 9) self.close(null, true)
                }, this),
                "keyup": $.proxy(function (e) {
                    var d = Date.ccreate(this.element.val());
                    if (!d.isValid()) d = Date.ccreate(this.element.val(), Streak.BentoBox.Locale.getCurrent());
                    if (d.isValid()) {
                        this.choice = this.dateToObject(d);
                        this.render(null, d)
                    }
                }, this)
            });
            if (this.options.isPersistent) this.onFocus(this.element, this.element);
            else this.element.bind({
                "onfocus": $.proxy(function (e) {
                    this.onFocus(this.element, this.element)
                }, this),
                "onblur": $.proxy(function (e) {
                    this.close(null, true, false)
                }, this)
            })
        }
    }
    will_pickdate.prototype = {
        onFocus: function (original, visual_input) {
            var init_visual_date, d = visual_input.offset();
            if (init_visual_date = original.data("time")) init_visual_date = new Date(init_visual_date);
            else {
                init_visual_date = new Date;
                if (this.options.maxDate && init_visual_date.valueOf() > this.options.maxDate.valueOf()) init_visual_date = new Date(this.options.maxDate.valueOf());
                if (this.options.minDate && init_visual_date.valueOf() < this.options.minDate.valueOf()) init_visual_date = new Date(this.options.minDate.valueOf())
            }
            this.input = original, this.visual = visual_input;
            if (!this.options.isPersistent) this.show({
                left: d.left + this.options.positionOffset.x,
                top: d.top + this.visual.outerHeight() + this.options.positionOffset.y
            }, init_visual_date);
            else this.show({
                left: 0,
                top: 0
            }, init_visual_date)
        },
        dateToObject: function (d) {
            return {
                year: d.getFullYear(),
                month: d.getMonth(),
                day: d.getDate(),
                hours: d.getHours(),
                minutes: d.getMinutes(),
                seconds: d.getSeconds()
            }
        },
        dateFromObject: function (values) {
            var d = new Date,
                v;
            d.setDate(1);
            $.each(["year", "month", "day", "hours", "minutes", "seconds"], $.proxy(function (index, value) {
                v = values[value];
                if (!(v || v === 0)) return;
                switch (value) {
                case "day":
                    d.setDate(v);
                    break;
                case "month":
                    d.setMonth(v);
                    break;
                case "year":
                    d.setFullYear(v);
                    break;
                case "hours":
                    d.setHours(v);
                    break;
                case "minutes":
                    d.setMinutes(v);
                    break;
                case "seconds":
                    d.setSeconds(v);
                    break
                }
            }, this));
            return d
        },
        show: function (position, timestamp) {
            this.formatMinMaxDates();
            if (timestamp) this.working_date = new Date(timestamp);
            else this.working_date = new Date;
            this.today = new Date;
            this.choice = this.dateToObject(this.working_date);
            this.mode = this.options.startView == "time" && !this.options.timePicker ? "month" : this.options.startView;
            this.render();
            if ($.isFunction(this.options.onShow)) this.options.onShow()
        },
        render: function (use_fx, aDate) {
            if (!this.picker) this.constructPicker();
            else {
                var o = this.oldContents;
                this.oldContents = this.newContents;
                this.newContents = o;
                this.newContents.empty()
            }
            if (aDate) this.working_date = aDate;
            var startDate = new Date(this.working_date.getTime());
            this.limit = {
                right: false,
                left: false
            };
            switch (this.mode) {
            case "decades":
                this.renderDecades();
                break;
            case "year":
                this.renderYear();
                break;
            case "time":
                this.renderTime();
                this.limit = {
                    right: true,
                    left: true
                };
                break;
            default:
                this.renderMonth()
            }
            this.picker.find(".previous").toggleClass("disabled", this.limit.left);
            this.picker.find(".next").toggleClass("disabled", this.limit.right);
            this.picker.find(".title").css("cursor", this.allowZoomOut() ? "pointer" : "default");
            this.working_date = startDate;
            if (this.options.useFadeInOut) this.picker.fadeIn(this.options.animationDuration);
            if (use_fx) this.fx(use_fx);
            else {
                this.oldContents.hide();
                this.newContents.css({
                    left: "0px"
                }).show()
            }
        },
        fx: function (effects) {
            if (effects == "right") {
                this.oldContents.css("left", 0).show();
                this.newContents.css("left", this.bodyWidth).show();
                this.slider.css("left", 0).animate({
                    "left": -this.bodyWidth
                })
            } else if (effects == "left") {
                this.oldContents.css("left", this.bodyWidth).show();
                this.newContents.css("left", 0).show();
                this.slider.css("left", -this.bodyWidth).animate({
                    "left": 0
                })
            } else if (effects == "fade") {
                this.slider.css("left", 0);
                this.oldContents.css("left", 0).fadeOut(this.options.animationDuration >> 1);
                this.newContents.css("left", 0).hide().fadeIn(this.options.animationDuration)
            }
        },
        constructPicker: function () {
            var self = this;
            $(this.options.appendTo).append(this.picker = $('<div class="' + this.options.pickerClass + '" />'));
            if (this.options.useFadeInOut) this.picker.hide();
            if (this.options.isPersistent) this.picker.css({
                position: "relative"
            });
            var h, title_cont, b;
            this.picker.append(h = $('<div class="header"/>'));
            h.append(title_cont = $('<div class="title"/>').captureClick($.proxy(this.zoomOut, this)));
            h.append($('<div class="previous">&larr;</div>').captureClick($.proxy(this.previous, this)));
            h.append($('<div class="next">&rarr;</div>').captureClick($.proxy(this.next, this)));
            h.append($('<div class="closeButton">x</div>').captureClick($.proxy(this.close, this)));
            title_cont.append($('<span class="titleText"/>'));
            this.picker.append(b = $('<div class="body"/>'));
            this.bodyHeight = b.outerHeight();
            this.bodyWidth = b.outerWidth();
            b.append(this.slider = $('<div style="position:absolute;top:0;left:0;width:' + 2 * this.bodyWidth + "px;height:" + 2 * this.bodyHeight + 'px" />'));
            this.slider.append(this.oldContents = $('<div style="position:absolute;top:0;left:' + this.bodyWidth + "px;width:" + this.bodyWidth + "px;height:" + this.bodyHeight + 'px" />'));
            this.slider.append(this.newContents = $('<div style="position:absolute;top:0;left:0;width:' + this.bodyWidth + "px;height:" + this.bodyHeight + 'px" />'));
            var self = this;
            if (this.options.autoClose) this.picker.bodyCloseAndStop({
                body: $(this.options.body),
                stop: $(this.options.appendTo)[0],
                closeFunction: function () {
                    self.close(null, true)
                }
            })
        },
        renderDecades: function () {
            while (this.working_date.getFullYear() % this.options.yearsPerPage > 0) this.working_date.setFullYear(this.working_date.getFullYear() - 1);
            this.renderTitle(this.working_date.getFullYear() + "-" + (this.working_date.getFullYear() + this.options.yearsPerPage - 1));
            var i, y, e, available = false,
                container;
            this.newContents.append(container = $('<div class="years"/>'));
            if (this.options.minDate && this.working_date.getFullYear() <= this.options.minDate.getFullYear()) this.limit.left = true;
            for (i = 0; i < this.options.yearsPerPage; i++) {
                y = this.working_date.getFullYear();
                container.append(e = $('<div class="year year' + i + (y == this.today.getFullYear() ? " today" : "") + (y == this.choice.year ? " selected" : "") + '">' + y + "</>"));
                if (this.limited("year")) {
                    e.addClass("unavailable");
                    if (available) this.limit.right = true;
                    else this.limit.left = true
                } else {
                    available = true;
                    e.click({
                        year: y
                    }, $.proxy(function (event) {
                        this.working_date.setFullYear(event.data.year);
                        this.mode = "year";
                        this.render("fade")
                    }, this))
                }
                this.working_date.setFullYear(this.working_date.getFullYear() + 1)
            }
            if (!available || this.options.maxDate && this.working_date.getFullYear() >= this.options.maxDate.getFullYear()) this.limit.right = true
        },
        renderYear: function () {
            var month = this.today.getMonth(),
                this_year = this.working_date.getFullYear() == this.today.getFullYear(),
                selected_year = this.working_date.getFullYear() == this.choice.year,
                available = false,
                container, i, e;
            this.renderTitle(this.working_date.getFullYear());
            this.working_date.setMonth(0);
            this.newContents.append(container = $('<div class="months"/>'));
            for (i = 0; i <= 11; i++) {
                container.append(e = $('<div class="month month' + (i + 1) + (i == month && this_year ? " today" : "") + (i == this.choice.month && selected_year ? " selected" : "") + '">' + (this.options.monthShort ? this.options.months[i].substring(0, this.options.monthShort) : this.options.months[i]) + "</div>"));
                if (this.limited("month")) {
                    e.addClass("unavailable");
                    if (available) this.limit.right = true;
                    else this.limit.left = true
                } else {
                    available = true;
                    e.click({
                        month: i
                    }, $.proxy(function (event) {
                        this.working_date.setDate(1);
                        this.working_date.setMonth(event.data.month);
                        this.mode = "month";
                        this.render("fade")
                    }, this))
                }
                this.working_date.setMonth(i)
            }
            if (!available) this.limit.right = true
        },
        renderTime: function () {
            var container;
            this.newContents.append(container = $('<div class="time"/>'));
            if (this.options.timePickerOnly) this.renderTitle("Select a time");
            else this.renderTitle(this.format(this.working_date, "j M, Y"));
            container.append($('<input type="text" class="hour"' + (this.options.militaryTime ? ' style="left:30px"' : "") + ' maxlength="2" value="' + this.leadZero(this.options.militaryTime ? this.working_date.getHours() : this.working_date.getHours() > 12 ? this.working_date.getHours() - 12 : this.working_date.getHours()) + '"/>'));
            container.append($('<input type="text" class="minutes"' + (this.options.militaryTime ? ' style="left:110px"' : "") + ' maxlength="2" value="' + this.leadZero(this.working_date.getMinutes()) + '"/>'));
            container.append($('<div class="separator"' + (this.options.militaryTime ? ' style="left:91px"' : "") + ">:</div>"));
            if (!this.options.militaryTime) container.append($('<select class="ampn">' + '<option value="PM">PM</option>' + '<option value="AM">AM</option>' + "</select>"));
            container.append($('<input type="submit" value="OK" class="ok"/>').click($.proxy(function (event) {
                event.stopPropagation();
                this.select($.extend(this.dateToObject(this.working_date), {
                    hours: parseInt(this.picker.find(".hour").val(), 10) + (!this.options.militaryTime && this.picker.find(".ampm").val() == "PM" ? 12 : 0),
                    minutes: parseInt(this.picker.find(".minutes").val(), 10)
                }))
            }, this)))
        },
        renderMonth: function () {
            var month = this.working_date.getMonth(),
                container = $('<div class="days"/>'),
                titles = $('<div class="titles"/>'),
                available = false,
                t = this.today.toDateString(),
                currentChoice = this.dateFromObject(this.choice).toDateString(),
                d, i, classes, e, weekContainer;
            this.renderTitle(this.options.months[month] + " " + this.working_date.getFullYear());
            this.working_date.setDate(1);
            while (this.working_date.getDay() != this.options.startDay) this.working_date.setDate(this.working_date.getDate() - 1);
            this.newContents.append(container.append(titles));
            for (d = this.options.startDay; d < this.options.startDay + 7; d++) titles.append($('<div class="title day day' + d % 7 + '">' + this.options.days[d % 7].substring(0, this.options.dayShort) + "</div>"));
            for (i = 0; i < 42; i++) {
                classes = ["day", "day" + this.working_date.getDay()];
                if (this.working_date.toDateString() == t) classes.push("today");
                if (this.working_date.toDateString() == currentChoice) classes.push("selected");
                if (this.working_date.getMonth() != month) classes.push("otherMonth");
                if (i % 7 == 0) container.append(weekContainer = $('<div class="week week' + Math.floor(i / 7) + '"/>'));
                weekContainer.append(e = $('<div class="' + classes.join(" ") + '">' + this.working_date.getDate() + "</div>"));
                if (this.limited("date")) {
                    e.addClass("unavailable");
                    if (available) this.limit.right = true;
                    else if (this.working_date.getMonth() == month) this.limit.left = true
                } else {
                    available = true;
                    e.click({
                        day: this.working_date.getDate(),
                        month: this.working_date.getMonth(),
                        year: this.working_date.getFullYear()
                    }, $.proxy(function (event) {
                        if (this.options.timePicker) {
                            this.working_date.setDate(event.data.day);
                            this.working_date.setMonth(event.data.month);
                            this.mode = "time";
                            this.render("fade")
                        } else {
                            event.stopPropagation();
                            this.select(event.data)
                        }
                    }, this))
                }
                this.working_date.setDate(this.working_date.getDate() + 1)
            }
            if (!available) this.limit.right = true
        },
        renderTitle: function (text) {
            if (this.allowZoomOut()) this.picker.find(".title").removeClass("disabled");
            else this.picker.find(".title").addClass("disabled");
            this.picker.find(".titleText").text(text)
        },
        limited: function (type) {
            var cs = !! this.options.minDate,
                ce = !! this.options.maxDate;
            if (!(cs && ce)) return false;
            switch (type) {
            case "year":
                return cs && this.working_date.getFullYear() < this.options.minDate.getFullYear() || ce && this.working_date.getFullYear() > this.options.maxDate.getFullYear();
            case "month":
                var ms = parseInt("" + this.working_date.getFullYear() + this.leadZero(this.working_date.getMonth()), 10);
                return cs && ms < parseInt("" + this.options.minDate.getFullYear() + this.leadZero(this.options.minDate.getMonth()), 10) || ce && ms > parseInt("" + this.options.maxDate.getFullYear() + this.leadZero(this.options.maxDate.getMonth()), 10);
            case "date":
                return cs && this.working_date < this.options.minDate || ce && this.working_date > this.options.maxDate
            }
        },
        allowZoomOut: function () {
            if (this.mode == "time" && this.options.timePickerOnly) return false;
            if (this.mode == "decades") return false;
            return !(this.mode == "year" && !this.options.yearPicker)
        },
        zoomOut: function () {
            if (!this.allowZoomOut()) return;
            switch (this.mode) {
            case "year":
                this.mode = "decades";
                break;
            case "time":
                this.mode = "month";
                break;
            default:
                this.mode = "year"
            }
            this.render("fade")
        },
        previous: function () {
            switch (this.mode) {
            case "decades":
                this.working_date.setFullYear(this.working_date.getFullYear() - this.options.yearsPerPage);
                break;
            case "year":
                this.working_date.setFullYear(this.working_date.getFullYear() - 1);
                break;
            case "month":
                this.working_date.setMonth(this.working_date.getMonth() - 1)
            }
            if (this.mode != "time") this.render("left")
        },
        next: function () {
            switch (this.mode) {
            case "decades":
                this.working_date.setFullYear(this.working_date.getFullYear() + this.options.yearsPerPage);
                break;
            case "year":
                this.working_date.setFullYear(this.working_date.getFullYear() + 1);
                break;
            case "month":
                this.working_date.setMonth(this.working_date.getMonth() + 1)
            }
            if (this.mode != "time") this.render("right")
        },
        close: function (e, force, isEnter) {
            var self = this;
            if (!this.picker || this.closing || this.options.isPersistent) return;
            if (force || e && e.target != this.picker && this.picker.has(e.target).size() == 0 && e.target != this.visual) if (this.options.useFadeInOut) {
                this.closing = true;
                this.picker.fadeOut(this.options.animationDuration >> 1, function () {
                    self.destroy(isEnter)
                })
            } else this.destroy(isEnter)
        },
        destroy: function (isEnter) {
            this.picker.remove();
            this.picker = null;
            this.closing = false;
            if ($.isFunction(this.options.onClose)) this.options.onClose(isEnter)
        },
        select: function (values, isEnter) {
            this.working_date = this.dateFromObject($.extend(this.choice, values));
            if (!this.options.timePicker) {
                var dDate = new Date(this.working_date.getFullYear(), this.working_date.getMonth(), this.working_date.getDate(), 12, 0, 0);
                dDate.toLocalTime();
                this.working_date.setTime(dDate.getTime())
            }
            if (this.options.setInput) this.input.val(this.format(this.working_date, this.options.inputOutputFormat));
            this.visual.val(this.format(this.working_date, this.options.format));
            if ($.isFunction(this.options.onSelect)) this.options.onSelect(this.working_date);
            this.close(null, true, isEnter)
        },
        formatMinMaxDates: function () {
            if (this.options.maxDate && this.options.maxDate.format) {
                this.options.maxDate = this.unformat(this.options.maxDate.date, this.options.maxDate.format);
                this.options.maxDate.setHours(23);
                this.options.maxDate.setMinutes(59);
                this.options.maxDate.setSeconds(59)
            }
        },
        leadZero: function (v) {
            return v < 10 ? "0" + v : v
        },
        format: function (t, format) {
            var f = "",
                h = t.getHours(),
                m = t.getMonth();
            for (var i = 0; i < format.length; i++) switch (format.charAt(i)) {
            case "\\":
                i++;
                f += format.charAt(i);
                break;
            case "y":
                f += (100 + t.getYear() + "").substring(1);
                break;
            case "Y":
                f += t.getFullYear();
                break;
            case "m":
                f += this.leadZero(m + 1);
                break;
            case "n":
                f += m + 1;
                break;
            case "M":
                f += this.options.months[m].substring(0, this.options.monthShort);
                break;
            case "F":
                f += this.options.months[m];
                break;
            case "d":
                f += this.leadZero(t.getDate());
                break;
            case "j":
                f += t.getDate();
                break;
            case "D":
                f += this.options.days[t.getDay()].substring(0, this.options.dayShort);
                break;
            case "l":
                f += this.options.days[t.getDay()];
                break;
            case "G":
                f += h;
                break;
            case "H":
                f += this.leadZero(h);
                break;
            case "g":
                f += h % 12 ? h % 12 : 12;
                break;
            case "h":
                f += this.leadZero(h % 12 ? h % 12 : 12);
                break;
            case "a":
                f += h > 11 ? "pm" : "am";
                break;
            case "A":
                f += h > 11 ? "PM" : "AM";
                break;
            case "i":
                f += this.leadZero(t.getMinutes());
                break;
            case "s":
                f += this.leadZero(t.getSeconds());
                break;
            case "U":
                f += Math.floor(t.valueOf() / 1E3);
                break;
            default:
                f += format.charAt(i)
            }
            return f
        },
        unformat: function (t, format) {
            var d = new Date,
                a = {},
                c, m, v;
            t = t.toString();
            for (var i = 0; i < format.length; i++) {
                c = format.charAt(i);
                switch (c) {
                case "\\":
                    r = null;
                    i++;
                    break;
                case "y":
                    r = "[0-9]{2}";
                    break;
                case "Y":
                    r = "[0-9]{4}";
                    break;
                case "m":
                    r = "0[1-9]|1[012]";
                    break;
                case "n":
                    r = "[1-9]|1[012]";
                    break;
                case "M":
                    r = "[A-Za-z]{" + this.options.monthShort + "}";
                    break;
                case "F":
                    r = "[A-Za-z]+";
                    break;
                case "d":
                    r = "0[1-9]|[12][0-9]|3[01]";
                    break;
                case "j":
                    r = "[1-9]|[12][0-9]|3[01]";
                    break;
                case "D":
                    r = "[A-Za-z]{" + this.options.dayShort + "}";
                    break;
                case "l":
                    r = "[A-Za-z]+";
                    break;
                case "G":
                case "H":
                case "g":
                case "h":
                    r = "[0-9]{1,2}";
                    break;
                case "a":
                    r = "(am|pm)";
                    break;
                case "A":
                    r = "(AM|PM)";
                    break;
                case "i":
                case "s":
                    r = "[012345][0-9]";
                    break;
                case "U":
                    r = "-?[0-9]+$";
                    break;
                default:
                    r = null
                }
                if (r) {
                    m = t.match("^" + r);
                    if (m) {
                        a[c] = m[0];
                        t = t.substring(a[c].length)
                    } else {
                        if (this.options.debug) alert("Fatal Error in will_pickdate\n\nUnexpected format at: '" + t + "' expected format character '" + c + "' (pattern '" + r + "')");
                        return d
                    }
                } else t = t.substring(1)
            }
            for (c in a) {
                v = a[c];
                switch (c) {
                case "y":
                    d.setFullYear(v < 30 ? 2E3 + parseInt(v, 10) : 1900 + parseInt(v, 10));
                    break;
                case "Y":
                    d.setFullYear(v);
                    break;
                case "m":
                case "n":
                    d.setMonth(v - 1);
                    break;
                case "M":
                    v = this.options.months.filter(function (index) {
                        return this.substring(0, this.options.monthShort) == v
                    })[0];
                case "F":
                    d.setMonth(options.months.indexOf(v));
                    break;
                case "d":
                case "j":
                    d.setDate(v);
                    break;
                case "G":
                case "H":
                    d.setHours(v);
                    break;
                case "g":
                case "h":
                    if (a["a"] == "pm" || a["A"] == "PM") d.setHours(v == 12 ? 0 : parseInt(v, 10) + 12);
                    else d.setHours(v);
                    break;
                case "i":
                    d.setMinutes(v);
                    break;
                case "s":
                    d.setSeconds(v);
                    break;
                case "U":
                    d = new Date(parseInt(v, 10) * 1E3)
                }
            }
            return d
        }
    }
})(Streak.jQuery);
(function (Streak) {
    var $ = Streak.jQuery,
        Date = Streak.Date;

    function prettyDate(time, justDate) {
        var date = new Date(time),
            diff = ((new Date).getTime() - date.getTime()) / 1E3,
            day_diff = Math.floor(diff / 86400),
            year_diff = Math.abs((new Date).getYear() - date.getYear());
        if (isNaN(day_diff) || (day_diff < 0 || day_diff >= 31) && !justDate) return;
        if (justDate) {
            var parts = date.toDateString().split(" ");
            return year_diff == 0 && parts[1] + " " + parts[2] || parts[1] + " " + parts[2] + " " + parts[3]
        } else return day_diff == 0 && (diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff == 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago"
    }
    $.fn.prettyDate = function (justDate) {
        return this.each(function () {
            var date = prettyDate(this.title, justDate);
            if (date) Streak.jQuery(this).text(date)
        })
    };
    Date.prototype.prettyDate = function (justDate) {
        return prettyDate(this, justDate)
    }
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery;
    $.fn.selectAllOnClick = function () {
        return this.each(function () {
            $(this).click(function (e) {
                var sel = Streak.document.getSelection();
                sel.removeAllRanges();
                sel.selectAllChildren(this)
            }.bind(this))
        })
    }
})(Streak);
(function ($) {
    var converter = {
        vertical: {
            x: false,
            y: true
        },
        horizontal: {
            x: true,
            y: false
        },
        both: {
            x: true,
            y: true
        },
        x: {
            x: true,
            y: false
        },
        y: {
            x: false,
            y: true
        }
    };
    var settings = {
        duration: "fast",
        direction: "both",
        toTop: false
    };
    var rootrx = /^(?:html)$/i;
    var borders = function (domElement, styles) {
            styles = styles || (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(domElement, null) : domElement.currentStyle);
            var px = document.defaultView && document.defaultView.getComputedStyle ? true : false;
            var b = {
                top: parseFloat(px ? styles.borderTopWidth : $.css(domElement, "borderTopWidth")) || 0,
                left: parseFloat(px ? styles.borderLeftWidth : $.css(domElement, "borderLeftWidth")) || 0,
                bottom: parseFloat(px ? styles.borderBottomWidth : $.css(domElement, "borderBottomWidth")) || 0,
                right: parseFloat(px ? styles.borderRightWidth : $.css(domElement, "borderRightWidth")) || 0
            };
            return {
                top: b.top,
                left: b.left,
                bottom: b.bottom,
                right: b.right,
                vertical: b.top + b.bottom,
                horizontal: b.left + b.right
            }
        };
    var dimensions = function ($element) {
            var win = $(window);
            var isRoot = rootrx.test($element[0].nodeName);
            return {
                border: isRoot ? {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                } : borders($element[0]),
                scroll: {
                    top: (isRoot ? win : $element).scrollTop(),
                    left: (isRoot ? win : $element).scrollLeft()
                },
                scrollbar: {
                    right: isRoot ? 0 : $element.innerWidth() - $element[0].clientWidth,
                    bottom: isRoot ? 0 : $element.innerHeight() - $element[0].clientHeight
                },
                rect: function () {
                    var r = $element[0].getBoundingClientRect();
                    return {
                        top: isRoot ? 0 : r.top,
                        left: isRoot ? 0 : r.left,
                        bottom: isRoot ? $element[0].clientHeight : r.bottom,
                        right: isRoot ? $element[0].clientWidth : r.right
                    }
                }()
            }
        };
    $.fn.extend({
        scrollintoview: function (options) {
            options = $.extend({}, settings, options);
            options.direction = converter[typeof options.direction === "string" && options.direction.toLowerCase()] || converter.both;
            var dirStr = "";
            if (options.direction.x === true) dirStr = "horizontal";
            if (options.direction.y === true) dirStr = dirStr ? "both" : "vertical";
            var el = this.eq(0);
            if (!el.is(":FastVisible(noCompute)")) {
                if ($.isFunction(options.complete)) options.complete();
                return
            }
            var scroller = el.closest(":scrollable(" + dirStr + ")");
            if (scroller.length > 0) {
                scroller = scroller.eq(0);
                var dim = {
                    e: dimensions(el),
                    s: dimensions(scroller)
                };
                var rel = {
                    top: dim.e.rect.top - (dim.s.rect.top + dim.s.border.top),
                    bottom: dim.s.rect.bottom - dim.s.border.bottom - dim.s.scrollbar.bottom - dim.e.rect.bottom,
                    left: dim.e.rect.left - (dim.s.rect.left + dim.s.border.left),
                    right: dim.s.rect.right - dim.s.border.right - dim.s.scrollbar.right - dim.e.rect.right
                };
                var animOptions = {};
                if (options.direction.y === true) if (rel.top < 0) animOptions.scrollTop = dim.s.scroll.top + rel.top;
                else if (rel.top > 0 && rel.bottom < 0 || options.toTop) animOptions.scrollTop = dim.s.scroll.top + Math.min(rel.top, -rel.bottom) + (options.toTop ? dim.s.rect.bottom - dim.s.rect.top + (dim.e.rect.top - dim.e.rect.bottom) : 0);
                if (options.direction.x === true) if (rel.left < 0) animOptions.scrollLeft = dim.s.scroll.left + rel.left;
                else if (rel.left > 0 && rel.right < 0) animOptions.scrollLeft = dim.s.scroll.left + Math.min(rel.left, -rel.right);
                if (!$.isEmptyObject(animOptions)) {
                    if (rootrx.test(scroller[0].nodeName)) scroller = $("html,body");
                    scroller.animate(animOptions, options.duration).eq(0).queue(function (next) {
                        $.isFunction(options.complete) && options.complete.call(scroller[0]);
                        next()
                    })
                } else $.isFunction(options.complete) && options.complete.call(scroller[0])
            }
            return this
        }
    });
    var scrollValue = {
        auto: true,
        scroll: true,
        visible: false,
        hidden: false
    };
    $.extend($.expr[":"], {
        scrollable: function (element, index, meta, stack) {
            var direction = converter[typeof meta[3] === "string" && meta[3].toLowerCase()] || converter.both;
            var styles = document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(element, null) : element.currentStyle;
            var overflow = {
                x: scrollValue[styles.overflowX.toLowerCase()] || false,
                y: scrollValue[styles.overflowY.toLowerCase()] || false,
                isRoot: rootrx.test(element.nodeName)
            };
            if (!overflow.x && !overflow.y && !overflow.isRoot) return false;
            var size = {
                height: {
                    scroll: element.scrollHeight,
                    client: element.clientHeight
                },
                width: {
                    scroll: element.scrollWidth,
                    client: element.clientWidth
                },
                scrollableX: function () {
                    return (overflow.x || overflow.isRoot) && this.width.scroll > this.width.client
                },
                scrollableY: function () {
                    return (overflow.y || overflow.isRoot) && this.height.scroll > this.height.client
                }
            };
            return direction.y && size.scrollableY() || direction.x && size.scrollableX()
        }
    })
})(Streak.jQuery);
(function ($) {
    var ie6 = $.browser.msie && parseInt($.browser.version) === 6 && typeof window["XMLHttpRequest"] !== "object",
        ie7 = $.browser.msie && parseInt($.browser.version) === 7,
        ieQuirks = null,
        w = [];
    $.modal = function (data, options) {
        return $.modal.impl.init(data, options)
    };
    $.modal.close = function () {
        $.modal.impl.close()
    };
    $.modal.focus = function (pos) {
        $.modal.impl.focus(pos)
    };
    $.modal.setContainerDimensions = function () {
        $.modal.impl.setContainerDimensions()
    };
    $.modal.setPosition = function () {
        $.modal.impl.setPosition()
    };
    $.modal.update = function (height, width) {
        $.modal.impl.update(height, width)
    };
    $.fn.modal = function (options) {
        return $.modal.impl.init(this, options)
    };
    $.modal.defaults = {
        appendTo: "body",
        focus: true,
        opacity: 50,
        overlayId: "simplemodal-overlay",
        overlayCss: {},
        containerId: "simplemodal-container",
        containerCss: {},
        dataId: "simplemodal-data",
        dataCss: {},
        minHeight: null,
        minWidth: null,
        maxHeight: null,
        maxWidth: null,
        autoResize: false,
        autoPosition: true,
        zIndex: 1E3,
        close: true,
        closeHTML: '<a class="modalCloseImg" title="Close"></a>',
        closeClass: "simplemodal-close",
        escClose: true,
        overlayClose: false,
        position: null,
        persist: false,
        modal: true,
        onOpen: null,
        onShow: null,
        onClose: null
    };
    $.modal.impl = {
        d: {},
        dStack: [],
        currentData: null,
        currentOptions: null,
        overlayStack: [],
        init: function (data, options) {
            var s = this;
            if (s.d.data) s.close(!options.dontStack);
            s.currentData = data;
            s.currentOptions = options;
            s.o = $.extend({}, $.modal.defaults, options);
            s.zIndex = s.o.zIndex;
            s.occb = false;
            if (typeof data === "object") {
                data = data instanceof $ ? data : $(data);
                s.d.placeholder = false;
                if (data.parent().parent().size() > 0) {
                    data.before($("<span></span>").attr("id", "simplemodal-placeholder").css({
                        display: "none"
                    }));
                    s.d.placeholder = true;
                    s.display = data.css("display");
                    if (!s.o.persist) s.d.orig = data.clone(true)
                }
            } else if (typeof data === "string" || typeof data === "number") data = $("<div></div>").html(data);
            else {
                alert("SimpleModal Error: Unsupported data type: " + typeof data);
                return s
            }
            s.create(data);
            data = null;
            s.open();
            if ($.isFunction(s.o.onShow)) s.o.onShow.apply(s, [s.d]);
            return s
        },
        create: function (data) {
            var s = this;
            w = s.getDimensions();
            s.d.overlay = $("<div></div>").attr("id", s.o.overlayId).addClass("simplemodal-overlay").css($.extend(s.o.overlayCss, {
                display: "none",
                opacity: s.o.opacity / 100,
                position: "fixed",
                zIndex: s.o.zIndex + 1
            })).appendTo(s.o.appendTo);
            s.d.container = $("<div></div>").attr("id", s.o.containerId).addClass("simplemodal-container").css({
                display: "none",
                position: "fixed",
                zIndex: s.o.zIndex + 2
            }).append(s.o.close && s.o.closeHTML ? $(s.o.closeHTML).addClass(s.o.closeClass) : "").appendTo(s.o.appendTo);
            s.d.wrap = $("<div></div>").attr("tabIndex", -1).addClass("simplemodal-wrap").appendTo(s.d.container);
            s.d.innerWrap = $("<div></div>").addClass("simplemodal-innerWrap").appendTo(s.d.wrap);
            s.d.data = data.attr("id", data.attr("id") || s.o.dataId).addClass("simplemodal-data").css($.extend(s.o.dataCss, {
                display: "none"
            })).appendTo(s.o.appendTo);
            data = null;
            s.d.data.appendTo(s.d.innerWrap)
        },
        bindEvents: function () {
            var s = this;
            $("." + s.o.closeClass).bind("click.simplemodal", function (e) {
                e.preventDefault();
                s.close()
            });
            if (s.o.modal && s.o.close && s.o.overlayClose) s.d.overlay.bind("click.simplemodal", function (e) {
                e.preventDefault();
                s.close()
            });
            $(document).bind("keydown.simplemodal", function (e) {
                if (s.o.modal && e.keyCode === 9) s.watchTab(e);
                else if (s.o.close && s.o.escClose && e.keyCode === 27) {
                    e.preventDefault();
                    s.close()
                }
            })
        },
        unbindEvents: function () {
            $("." + this.o.closeClass).unbind("click.simplemodal");
            $(document).unbind("keydown.simplemodal");
            $(window).unbind("resize.simplemodal");
            this.d.overlay.unbind("click.simplemodal")
        },
        focus: function (pos) {
            var s = this,
                p = pos && $.inArray(pos, ["first", "last"]) !== -1 ? pos : "first";
            var input = $(":input:enabled:FastVisible(noCompute):" + p, s.d.wrap);
            setTimeout(function () {
                input.length > 0 ? input.focus() : s.d.wrap.focus()
            }, 10)
        },
        getDimensions: function () {
            var el = $(window);
            var h = $.browser.opera && $.browser.version > "9.5" && $.fn.jquery < "1.3" || $.browser.opera && $.browser.version < "9.5" && $.fn.jquery > "1.2.6" ? el[0].innerHeight : el.height();
            return [h, el.width()]
        },
        getVal: function (v, d) {
            return v ? typeof v === "number" ? v : v === "auto" ? 0 : v.indexOf("%") > 0 ? parseInt(v.replace(/%/, "")) / 100 * (d === "h" ? w[0] : w[1]) : parseInt(v.replace(/px/, "")) : null
        },
        update: function (height, width) {
            var s = this;
            if (!s.d.data) return false;
            s.d.origHeight = s.getVal(height, "h");
            s.d.origWidth = s.getVal(width, "w");
            s.d.data.hide();
            height && s.d.container.css("height", height);
            width && s.d.container.css("width", width);
            s.setContainerDimensions();
            s.d.data.show();
            s.o.focus && s.focus();
            s.unbindEvents();
            s.bindEvents()
        },
        setContainerDimensions: function () {
            var s = this,
                badIE = ie6 || ie7;
            var ch = s.d.origHeight ? s.d.origHeight : $.browser.opera ? s.d.container.height() : s.getVal(badIE ? s.d.container[0].currentStyle["height"] : s.d.container.css("height"), "h"),
                cw = s.d.origWidth ? s.d.origWidth : $.browser.opera ? s.d.container.width() : s.getVal(badIE ? s.d.container[0].currentStyle["width"] : s.d.container.css("width"), "w"),
                dh = s.d.data.outerHeight(true),
                dw = s.d.data.outerWidth(true);
            s.d.origHeight = s.d.origHeight || ch;
            s.d.origWidth = s.d.origWidth || cw;
            var mxoh = s.o.maxHeight ? s.getVal(s.o.maxHeight, "h") : null,
                mxow = s.o.maxWidth ? s.getVal(s.o.maxWidth, "w") : null,
                mh = mxoh && mxoh < w[0] ? mxoh : w[0],
                mw = mxow && mxow < w[1] ? mxow : w[1];
            var moh = s.o.minHeight ? s.getVal(s.o.minHeight, "h") : "auto";
            if (!ch) if (!dh) ch = moh;
            else if (dh > mh) ch = mh;
            else if (s.o.minHeight && moh !== "auto" && dh < moh) ch = moh;
            else ch = dh;
            else ch = s.o.autoResize && ch > mh ? mh : ch < moh ? moh : ch;
            var mow = s.o.minWidth ? s.getVal(s.o.minWidth, "w") : "auto";
            if (!cw) if (!dw) cw = mow;
            else if (dw > mw) cw = mw;
            else if (s.o.minWidth && mow !== "auto" && dw < mow) cw = mow;
            else cw = dw;
            else cw = s.o.autoResize && cw > mw ? mw : cw < mow ? mow : cw;
            s.d.container.css({
                height: ch,
                width: cw
            });
            s.d.wrap.css({
                overflow: dh > ch || dw > cw ? "auto" : "visible"
            });
            s.o.autoPosition && s.setPosition()
        },
        setPosition: function () {
            var s = this,
                top, left, hc = w[0] / 2 - s.d.container.outerHeight(true) / 2,
                vc = w[1] / 2 - s.d.container.outerWidth(true) / 2;
            if (s.o.position && Object.prototype.toString.call(s.o.position) === "[object Array]") {
                top = s.o.position[0] || hc;
                left = s.o.position[1] || vc
            } else {
                top = hc;
                left = vc
            }
            s.d.container.css({
                left: left,
                top: top
            })
        },
        watchTab: function (e) {
            var s = this;
            if ($(e.target).parents(".simplemodal-container").length > 0) {
                s.inputs = $(":input:enabled:FastVisible(noCompute):first, :input:enabled:FastVisible(noCompute):last", s.d.data[0]);
                if (!e.shiftKey && e.target === s.inputs[s.inputs.length - 1] || e.shiftKey && e.target === s.inputs[0] || s.inputs.length === 0) {
                    e.preventDefault();
                    var pos = e.shiftKey ? "last" : "first";
                    s.focus(pos)
                }
            } else {
                e.preventDefault();
                s.focus()
            }
        },
        open: function () {
            var s = this;
            s.d.iframe && s.d.iframe.show();
            if ($.isFunction(s.o.onOpen)) s.o.onOpen.apply(s, [s.d]);
            else {
                s.d.overlay.show();
                s.d.container.show();
                s.d.data.show()
            }
            s.o.focus && s.focus();
            s.bindEvents()
        },
        close: function (isStacked) {
            var s = this;
            if (!s.d.data) return false;
            s.unbindEvents();
            if (s.d.placeholder) {
                var ph = $("#simplemodal-placeholder");
                if (s.o.persist) ph.replaceWith(s.d.data.removeClass("simplemodal-data").css("display", s.display));
                else {
                    s.d.data.hide().detach();
                    ph.replaceWith(s.d.orig)
                }
            } else s.d.data.hide().detach();
            s.d.container.hide().remove();
            s.d.iframe && s.d.iframe.hide().remove();
            var overlay = s.d.overlay;
            if (isStacked) {
                s.d = {};
                s.dStack.push({
                    data: s.currentData,
                    options: s.currentOptions
                })
            } else {
                if ($.isFunction(s.o.onClose)) if (s.o.onClose.apply(s, [s.d])) return;
                s.d = {};
                if (s.dStack.length > 0) {
                    var d = s.dStack.pop();
                    s.init(d.data, d.options)
                }
            }
            overlay.hide().remove()
        }
    }
})(Streak.jQuery);
(function ($) {
    $.fn.bbmodal = function (options) {
        var defaults = {
            focus: false,
            overlayCss: {
                backgroundColor: "white",
                opacity: "0.75"
            },
            overlayClose: true,
            escClose: true,
            persist: true
        };
        var o = $.extend({}, defaults, options);
        var self = this;
        return this.each(function () {
            self.modal(o)
        })
    }
})(Streak.jQuery);
(function (Streak) {
    var $ = Streak.jQuery;
    $.fn.simulateKeyboardPress = function (code) {
        var el = $(this[0]);
        var pos = el.offset();
        var document = Streak.document;
        var evt = document.createEvent("KeyboardEvent");
        evt.initKeyboardEvent("keydown", true, true, null, false, false, false, false, code, code);
        el[0].dispatchEvent(evt);
        var evt = document.createEvent("KeyboardEvent");
        evt.initKeyboardEvent("keypress", true, true, null, false, false, false, false, code, code);
        el[0].dispatchEvent(evt);
        var evt = document.createEvent("KeyboardEvent");
        evt.initKeyboardEvent("keyup", true, true, null, false, false, false, false, code, code);
        el[0].dispatchEvent(evt)
    }
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery;
    $.fn.simulateRawClick = function () {
        var el = $(this[0]);
        var pos = el.offset();
        var document = Streak.document;
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("mousedown", true, true, window, 0, pos.left, pos.top, 0, 0, false, false, false, false, 0, null);
        el[0].dispatchEvent(evt);
        evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("mouseup", true, true, window, 0, pos.left, pos.top, 0, 0, false, false, false, false, 0, null);
        el[0].dispatchEvent(evt);
        evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, pos.left, pos.top, 0, 0, false, false, false, false, 0, null);
        el[0].dispatchEvent(evt)
    }
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery;
    $(function () {
        var calculator = {
            primaryStyles: ["fontFamily", "fontSize", "fontWeight", "fontVariant", "fontStyle", "paddingLeft", "paddingTop", "paddingBottom", "paddingRight", "marginLeft", "marginTop", "marginBottom", "marginRight", "borderLeftColor", "borderTopColor", "borderBottomColor", "borderRightColor", "borderLeftStyle", "borderTopStyle", "borderBottomStyle", "borderRightStyle", "borderLeftWidth", "borderTopWidth", "borderBottomWidth", "borderRightWidth", "line-height", "outline"],
            specificStyle: {
                "word-wrap": "break-word",
                "overflow-x": "hidden",
                "overflow-y": "auto"
            },
            simulator: function (doc) {
                if ($(doc.body).find("#streak_textarea_simulator").length === 0) $('<div id="streak_textarea_simulator"/>').css({
                    position: "absolute",
                    top: 0,
                    left: 0,
                    visibility: "hidden"
                }).appendTo(doc.body);
                return $(doc.body).find("#streak_textarea_simulator")
            },
            toHtml: function (text) {
                return $.getTextHTML(text)
            },
            getCaretPosition: function () {
                var cal = calculator,
                    self = this,
                    element = self[0],
                    elementOffset = self.offset(),
                    document = element.ownerDocument;
                if ($.browser.msie) {
                    element.focus();
                    var range = document.selection.createRange();
                    $("#hskeywords").val(element.scrollTop);
                    return {
                        left: range.boundingLeft - elementOffset.left,
                        top: parseInt(range.boundingTop) - elementOffset.top + element.scrollTop + document.documentElement.scrollTop + parseInt(self.getComputedStyle("fontSize", document))
                    }
                }
                cal.simulator(document).empty();
                $.each(cal.primaryStyles, function (index, styleName) {
                    self.cloneStyle(cal.simulator(document), styleName, document)
                });
                cal.simulator(document).css($.extend({
                    "width": self.width(),
                    "height": self.height()
                }, cal.specificStyle));
                var value = self.val(),
                    cursorPosition = self.getCursorPosition();
                var beforeText = value.substring(0, cursorPosition),
                    afterText = value.substring(cursorPosition);
                var before = $('<span class="before"/ style="display:inline-block;">').html(cal.toHtml(beforeText)),
                    focus = $('<span class="focus">&nbsp;</span>'),
                    after = $('<span class="after"/>').html(cal.toHtml(afterText));
                before.append(focus);
                cal.simulator(document).append(before).append(after);
                var focusOffset = focus.offset(),
                    simulatorOffset = cal.simulator(document).offset(),
                    elementOffset = self.offset();
                offset = {
                    top: focusOffset.top - simulatorOffset.top - element.scrollTop + ($.browser.mozilla ? 0 : parseInt(self.getComputedStyle("fontSize", document))) + elementOffset.top,
                    left: focus[0].offsetLeft - cal.simulator(document)[0].offsetLeft - element.scrollLeft + elementOffset.left
                };
                cal.simulator(document).empty();
                return offset
            }
        };
        $.fn.extend({
            getComputedStyle: function (styleName, document) {
                if (this.length == 0) return;
                var thiz = this[0];
                var result = this.css(styleName);
                result = result || ($.browser.msie ? thiz.currentStyle[styleName] : document.defaultView.getComputedStyle(thiz, null)[styleName]);
                return result
            },
            cloneStyle: function (target, styleName, document) {
                var styleVal = this.getComputedStyle(styleName, document);
                if ( !! styleVal) $(target).css(styleName, styleVal)
            },
            cloneAllStyle: function (target, style, document) {
                var thiz = this[0];
                for (var styleName in thiz.style) {
                    var val = thiz.style[styleName];
                    typeof val == "string" || typeof val == "number" ? this.cloneStyle(target, styleName, document) : NaN
                }
            },
            getCursorPosition: function (document) {
                var thiz = this[0],
                    result = 0;
                if ("selectionStart" in thiz) result = thiz.selectionStart;
                else if ("selection" in document) {
                    var range = document.selection.createRange();
                    if (parseInt($.browser.version) > 6) {
                        thiz.focus();
                        var length = document.selection.createRange().text.length;
                        range.moveStart("character", -thiz.value.length);
                        result = range.text.length - length
                    } else {
                        var bodyRange = document.body.createTextRange();
                        bodyRange.moveToElementText(thiz);
                        for (; bodyRange.compareEndPoints("StartToStart", range) < 0; result++) bodyRange.moveStart("character", 1);
                        for (var i = 0; i <= result; i++) if (thiz.value.charAt(i) == "\n") result++;
                        var enterCount = thiz.value.split("\n").length - 1;
                        result -= enterCount;
                        return result
                    }
                }
                return result
            },
            getCaretPosition: calculator.getCaretPosition
        })
    })
})(Streak);
(function (Streak) {
    var _ = Streak._;
    if (!_) {
        console.log(JSON.stringify(_));
        console.log(JSON.stringify(Streak));
        alert("f'd")
    }
    _.mixin({
        groupByMultiple: function (list, iterator) {
            var objs = _.toArray(arguments).slice(2);
            _.each(list, function (item) {
                _.wrap(iterator, function (func) {
                    var res = func(item);
                    for (var i = 0, l = objs.length; i < l; i++) {
                        if (!objs[i][res[i]]) objs[i][res[i]] = [];
                        objs[i][res[i]].push(item)
                    }
                })
            })
        },
        groupByPlus: function (obj, iterator) {
            var result = {};
            _.each(obj, function (value, index) {
                var keys = iterator(value, index);
                _.each(keys, function (key) {
                    (result[key] || (result[key] = [])).push(value)
                })
            });
            return result
        },
        includePlus: function (obj, target, tester) {
            if (!tester || obj == null) return _.include(obj, target);
            var found = false;
            _.any(obj, function (value) {
                if (found = tester(value, target)) return true
            });
            return found
        },
        intersectionPlus: function (array, other, tester) {
            return _.filter(array, function (value) {
                return _.any(other, function (otherValue) {
                    return tester(value, otherValue)
                })
            })
        },
        differencePlus: function (array, other, tester) {
            return _.filter(array, function (value) {
                return _.all(other, function (otherValue) {
                    return !tester(value, otherValue)
                })
            })
        },
        indexTheory: function (array, obj, comparator) {
            array.push(obj);
            array.sort(comparator);
            var index = array.indexOf(obj);
            array.removeVal(obj);
            return index
        },
        pluckPlus: function (array, iterator) {
            return _.map(array, function (val) {
                return iterator.call(array, val)
            })
        },
        isArrayDifferent: function (array, other) {
            if (array.length != other.length) return true;
            for (var i = 0; i < array.length; i++) if (array[i] != other[i]) return true;
            return false
        },
        sortedPluck: function (array, options) {
            var grouped = _(array).chain().pluckPlus(function (val) {
                return options.pluck(val)
            }).flatten().map(function (val) {
                if (options.map) return options.map(val);
                else return val
            }).filter(function (val) {
                if (options.filter) return options.filter(val);
                else return val
            }).groupBy(function (val) {
                return val
            }).value();
            return _(grouped).chain().keys().sortBy(function (key) {
                return this[key].length
            }, grouped).value()
        },
        filter: function (array, iterator) {
            var arr = [];
            _.each(array, function (val) {
                if (iterator(val)) arr.push(val)
            });
            return arr
        },
        onceAfter: function (number, func) {
            var once = _.once(func);
            return _.after(number, once)
        },
        chainedApply: function (array, func, params, doneFunc, errFunc) {
            var chain = function (item) {
                    func.apply(null, [item].concat(params).concat([function () {
                        if (array.length > 0) chain(array.pop());
                        else if (doneFunc) doneFunc()
                    }]).concat([function () {
                        if (errFunc) errFunc(array.length)
                    }]))
                };
            chain(array.pop())
        },
        firstIfPresent: function (arrays) {
            return _.chain(arrays).map(_.first).compact().value()
        },
        restIfPresent: function (arrays) {
            return _.flatten(_.map(arrays, _.rest))
        }
    })
})(Streak);
(function (Streak, window) {
    var Date = Streak.Date;
    var Requester = {
        flags: {},
        maxAttempts: 5,
        error: function (message, cb, errCb, id) {
            var params = {
                error: message
            };
            params.msgMethod = "POST";
            params.msgUrl = "/ajaxcalls/logClientError";
            this.makeCall(params, cb, errCb, id, false, 1, true)
        },
        get: function (params, cb, errCb, id, attempt, noTeardown) {
            var self = this;
            if (!attempt) attempt = 1;
            if (!params) params = {};
            if (!params.msgMethod) params.msgMethod = "POST";
            if (!params.msgUrl) params.msgUrl = "/ajaxcalls/getEntities";
            this.makeCall(Streak._.clone(params), cb, function (res, xhr) {
                if (attempt < 3) setTimeout(function () {
                    self.get(params, cb, errCb, null, attempt + 1, noTeardown)
                }, 500);
                else {
                    self.logError(xhr, params);
                    if (!noTeardown) Streak.BentoBox.trigger("criticalError");
                    else if (errCb) errCb(res, xhr)
                }
                return true
            }, id)
        },
        getFile: function (params, cb, errCb, id) {
            if (!params) params = {};
            params.msgMethod = "GET";
            this.makeCall(params, cb, errCb, id)
        },
        getString: function (params, cb, errCb, id) {
            if (!params) params = {};
            params.msgMethod = "GET";
            this.makeCall(params, cb, errCb, id, true)
        },
        create: function (params, cb, errCb, id) {
            if (!params) params = {};
            params.msgMethod = "POST";
            params.msgUrl = "/ajaxcalls/createEntity";
            this.makeCall(params, cb, errCb, id)
        },
        update: function (params, cb, errCb, id) {
            if (!params) params = {};
            params.msgMethod = "POST";
            params.msgUrl = "/ajaxcalls/updateEntity";
            this.makeCall(params, cb, errCb, id)
        },
        del: function (params, cb, errCb, id) {
            if (!params) return;
            params.msgMethod = "POST";
            params.msgUrl = "/ajaxcalls/deleteEntity";
            this.makeCall(params, cb, errCb, id)
        },
        search: function (params, cb, errCb, id) {
            if (!params) params = {};
            params.msgMethod = "POST";
            params.msgUrl = "/ajaxcalls/search";
            this.makeCall(params, cb, errCb, id)
        },
        makeCall: function (params, cb, errCb, id, noParse, attempt, noReattempt) {
            var self = this;
            if (!attempt) attempt = 1;
            if (!id) id = (new Date).getTime() * Math.random();
            if (attempt === 1) {
                params.clientVersion = Streak.clientVersion;
                params.extVersion = Streak.extVersion;
                params.email = Streak.userEmail;
                if (Streak.ai) {
                    params.ai = true;
                    params.email = Streak.ai
                }
                if (Requester.flags.chaos) params.chaos = true;
                if (Requester.flags.forceErrorCode) params.forceErrorCode = Requester.flags.forceErrorCode;
                if (params.msgMethod === "GET") params.msgUrl += "?" + this.encodeData(params);
                else params.data = this.encodeData(params);
                params.server = params.server || Streak.server;
                params.msgUrl = params.server + params.msgUrl
            }
            var handler = function (xhr) {
                    if (xhr === null) return;
                    if (xhr.readyState === 4) if (xhr.status === 200) {
                        Messenger.unobserve("serverCallReturn", id);
                        var s = xhr.responseText;
                        var d = s;
                        if (s && !noParse) try {
                            d = JSON.parse(s.replace("%26", "&").replace("%25", "%"))
                        } catch (err) {
                            d = null;
                            self.logError(xhr, params)
                        }
                        if (cb) cb(d, xhr)
                    } else if (!noReattempt) {
                        if (xhr.status === 0 || xhr.status === 500) if (attempt < self.maxAttempts) {
                            attempt += 1;
                            setTimeout(function () {
                                self.makeCall(params, cb, errCb, id, noParse, attempt)
                            }, 500);
                            return
                        } else {
                            var msg = "Crap, status " + xhr.status;
                            msg += "\n url: " + params.msgUrl;
                            try {
                                msg += "\n params: " + JSON.stringify(params)
                            } catch (err) {}
                            if (errCb) if (errCb(xhr, params)) return;
                            Streak.BentoBox.logError(msg);
                            return
                        }
                        var s = xhr.responseText;
                        var d = s;
                        if (s) try {
                            d = JSON.parse(s.replace("%26", "&").replace("%25", "%"))
                        } catch (err) {
                            d = null
                        }
                        if (d && d.error === "clientVersionNotSupported") {
                            Messenger.unobserve("serverCallReturn", id);
                            Streak.BentoBox.trigger("newClientVersion");
                            return
                        }
                        if (d && d.error === "extVersionNotSupported") {
                            Messenger.unobserve("serverCallReturn", id);
                            Streak.BentoBox.trigger("newExtVersion");
                            return
                        }
                        if (errCb) if (errCb(d, xhr)) {
                            Messenger.unobserve("serverCallReturn", id);
                            return
                        }
                        Messenger.unobserve("serverCallReturn", id);
                        if (xhr.status !== 0) self.logError(xhr, params)
                    }
                };
            if (attempt === 1) {
                handler.runOnce = false;
                Messenger.observe("serverCallReturn", handler, id)
            }
            Messenger.sendMessage("serverCall", params, null, null, id)
        },
        logError: function (xhr, params) {
            if (!xhr) return;
            var d, s = xhr.responseText;
            var msg;
            if (xhr.status === 500) {
                msg = "500 error from server";
                msg += "\n stack trace: " + s
            } else {
                msg = "Error from server";
                if (s) try {
                    d = JSON.parse(s.replace("%26", "&").replace("%25", "%"))
                } catch (err) {
                    d = null
                }
                if (d && d.error) msg = d.error;
                msg += "\n status: " + xhr.status
            }
            msg += "\n msgUrl: " + params.msgUrl;
            msg += "\n params: " + JSON.stringify(params);
            msg += "\n response: " + s;
            Streak.BentoBox.logError(msg)
        },
        encodeData: function (data) {
            var dstring = "";
            if (data) for (var m in data) dstring += "&" + m + "=" + encodeURIComponent(data[m]);
            return dstring.substring(1)
        },
        gmailGet: function (params, cb, errCb, id) {
            if (!params) params = {};
            params.server = location.origin;
            params.msgUrl = location.pathname;
            params.msgMethod = "GET";
            params.ik = GLOBALS[9];
            this.makeCall(params, cb, errCb, id, true)
        },
        gmailPost: function (params, cb, errCb, id) {
            if (!params) params = {};
            params.server = location.origin;
            params.msgUrl = location.pathname;
            params.msgMethod = "POST";
            params.ik = GLOBALS[9];
            this.makeCall(params, cb, errCb, id, true)
        },
        gmailGetList: function (list, cb, errCb, id) {
            var parts = list.split("/");
            var opts = {
                ui: 2,
                view: "tl",
                start: "0",
                num: "100",
                rt: "c",
                pcd: "1",
                mb: "0"
            };

            function processAdvancedSearchParameters(prefix) {
                var searchParts = parts[1].split("&");
                for (var i = 0; i < searchParts.length; i++) {
                    var subParts = searchParts[i].split("=");
                    opts[prefix + "_" + subParts[0]] = decodeURIComponent(subParts[1])
                }
            }
            if (parts.length > 0) if (parts[0] === "label") {
                opts.search = "cat";
                opts.cat = parts[1]
            } else if (parts[0] === "search") {
                opts.search = "query";
                opts.q = parts[1];
                opts.qs = "true"
            } else if (parts[0] === "advanced-search") {
                processAdvancedSearchParameters("as");
                opts.search = "adv"
            } else if (parts[0] === "create-filter") {
                processAdvancedSearchParameters("cf1");
                opts.search = "cf"
            } else {
                opts.search = parts[0];
                opts.q = parts[1]
            }
            this.gmailPost(opts, cb, errCb, id)
        },
        gmailGetSentMail: function (cb, errCb, id) {
            this.gmailGet({
                view: "tl",
                start: "0",
                num: "100",
                rt: "c",
                search: "sent"
            }, cb, errCb, id)
        }
    };
    Streak.Requester = Requester
})(Streak, window);
(function (Streak) {
    var $ = Streak.jQuery,
        Date = Streak.Date,
        Requester = Streak.Requester;
    Streak.Locale = Streak.Eventer.create({
        supported: ["en"],
        initial: "en",
        map: null,
        init: function () {
            var self = this;
            Requester.getFile({
                msgUrl: "/i18n/locale",
                locale: this.getCurrent()
            }, function (res) {
                self.map = res;
                self.trigger("ready")
            }, function (res) {
                Streak.BentoBox.logError("language file wasn't loaded")
            });
            Date.prototype.setFormatLocale(this.getGmail() === "en" ? "en" : "other")
        },
        getGmail: function () {
            return GLOBALS[4].split(".")[1]
        },
        getCurrent: function () {
            if (localStorage["bb_locale"]) return localStorage["bb_locale"];
            return this.getGmail()
        },
        setCurrent: function (locale) {
            if (locale === this.getGmail()) localStorage.removeItem("bb_locale");
            else localStorage["bb_locale"] = locale
        },
        getString: function (key, hash) {
            if (hash) {
                var value = this.map[key];
                var texts = value.split(/<[^>]+>/);
                var keys = value.match(/<[^>]+>/g);
                var outText = null;
                if (keys && keys.length > 0) {
                    keys = keys.map(function (a) {
                        return a.substring(1, a.length - 1)
                    });
                    var output = [];
                    for (i = 0; i < keys.length; i++) {
                        output.push(texts[i]);
                        output.push(hash[keys[i]] ? hash[keys[i]] : "<" + keys[i] + ">")
                    }
                    output.push(texts[texts.length - 1]);
                    outText = output.join("")
                } else outText = value;
                if (hash.pluralize && hash.pluralize.length > 0) {
                    var numMatch = outText.match(/\[.*?\]/g);
                    if (numMatch && numMatch.length > 0) for (var i = 0; i < numMatch.length; i++) {
                        var match = numMatch[i];
                        var innerMatch = match.match(/\[(.*?)\]/)[1];
                        var parts = innerMatch.split("|");
                        var num = hash.pluralize[i];
                        var replace = null;
                        for (var j = 0; j < parts.length; j++) {
                            var innerParts = parts[j].split(":");
                            if (innerParts.length === 1) replace = innerParts[0];
                            else if (innerParts[0] == num) {
                                replace = innerParts[1];
                                break
                            }
                        }
                        if (replace) outText = outText.replace(match, replace)
                    }
                }
                return outText
            } else return this.map[key] || key
        },
        localize: function (s) {
            var self = this;
            return s.replace(/<%%([\s\S]+?)%>/g, function (match, code) {
                return self.getString(code.trim())
            })
        },
        convertLocaleCodeToName: function (code) {
            return this.map["supportedLocales"][code]
        }
    })
})(Streak);
(function (Streak, window) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Requester = Streak.Requester;
    HTML = Streak.Eventer.create({
        loaded: null,
        init: function () {
            var self = this;
            Requester.getString({
                msgUrl: Streak.getCombined("html", false)
            }, function (res) {
                self.loaded = $(document.createElement("div"));
                self.loaded[0].innerHTML = res;
                self.trigger("ready")
            }, function (res) {})
        },
        get: function (id, isElement) {
            var d = this.loaded.find("#" + id);
            if (d.length === 0) console.log("can't find " + id);
            else {
                var s = Streak.Locale.localize(d[0].innerHTML.unescapeHTML());
                if (isElement) return $(s);
                else return _.template(s)
            }
        }
    });
    Streak.HTML = HTML
})(Streak, window);
//Gmail
(function (f, n) {
    var e = f.jQuery,
        i = f._,
        o = f.Date,
        j = new f.Eventer;
    i.extend(j, {
        Constants: {
            Compose: "compose",
            Inbox: "inbox",
            SectionQuery: "section_query",
            All: "all",
            Important: "imp",
            Conversation: "conversation",
            Contacts: "contacts",
            Contact: "contact",
            Sent: "sent",
            Starred: "starred",
            Drafts: "drafts",
            Label: "label",
            Search: "search",
            AdvancedSearch: "advanced-search",
            Trash: "trash",
            Spam: "spam",
            Apps: "apps",
            Box: "box",
            Pipeline: "pipeline",
            NewPipeline: "newpipeline",
            Pipelines: "pipelines",
            GmailThread: "thread",
            Circle: "circle",
            ListViews: [],
            BentoBoxViews: []
        },
        debug: !1,
        elements: {},
        hash: {
            parts: null,
            query: null
        },
        view: null,
        lastView: "",
        wasLastViewConversation: !1,
        currentVisibleModal: "",
        label: null,
        conversation: null,
        timer: null,
        dontLoad: !1,
        init: function () {
            var a = this;
            j.debug && console.log("Initializing Gmailr API");
            this.xhrWatcher.init(this);
            a.Constants.ListViews = [a.Constants.Inbox, a.Constants.SectionQuery, a.Constants.Important, a.Constants.All, a.Constants.Sent, a.Constants.Starred, a.Constants.Drafts, a.Constants.Label, a.Constants.Search, a.Constants.AdvancedSearch, a.Constants.Spam, a.Constants.Trash, a.Constants.Apps, a.Constants.Circle];
            a.Constants.ContactViews = [a.Constants.Contacts, a.Constants.Contact];
            a.Constants.BentoBoxViews = [a.Constants.Pipeline, a.Constants.Box, a.Constants.NewPipeline, a.Constants.Pipelines, a.Constants.GmailThread];
            a.delayed_loader = setInterval(function () {
                a.bootstrap();
                a.isReadyToLoad ? (clearInterval(a.delayed_loader), a.parse(), a.bindWatchers(), a.trigger("load")) : a.dontLoad && clearInterval(a.delayed_loader)
            }, 1E3); - 1 === a.Constants.ContactViews.indexOf(location.hash.substring(1).split("/")[0].toLowerCase()) && setTimeout(function () {
                !a.isReadyToLoad && !a.dontLoad && f.BentoBox.logError("something wrong with Gmail")
            }, 24E4)
        },
        teardown: function () {
            this.unReady();
            clearInterval(this.timer)
        },
        reup: function () {
            this.trigger("ready");
            this.setupGmailTimer()
        },
        destroy: function () {
            this.unbindWatchers();
            this.xhrWatcher.destroy()
        },
        $: function (a) {
            return this.elements.body.find(a)
        },
        insertCss: function (a) {
            var b = e('<link rel="stylesheet" type="text/css">');
            b.attr("href", a);
            this.elements.canvas.find("head").first().append(b)
        },
        showNotice: function (a, b, c) {
            c || (c = -1);
            this.elements.notice.data("priority") && this.elements.notice.data("priority") > c || (this.elements.notice.css({
                visibility: "visible"
            }), this.elements.notice.message.html(a), this.elements.notice.data("priority", c || -1), clearTimeout(this.elements.notice.hideTimer), b && (this.elements.notice.hideTimer = setTimeout(e.proxy(this.hideNotice, this), b)))
        },
        hideNotice: function (a) {
            var b = this;
            this.elements.notice.hideTimer && clearTimeout(this.elements.notice.hideTimer);
            a ? this.elements.notice.hideTimer = setTimeout(function () {
                b.elements.notice.css({
                    visibility: "hidden"
                });
                b.elements.notice.message.empty();
                b.elements.notice.data("priority", -1)
            }, a) : (this.elements.notice.css({
                visibility: "hidden"
            }), this.elements.notice.message.empty(), b.elements.notice.data("priority", -1))
        },
        observe: function (a, b, c, d) {
            c && (b.uniq = c);
            b.uniq || (b.uniq = "" + (new o).getTime() + Math.random());
            d || (d = 100);
            b.priority || (b.priority = d);
            this.ob_queues[a] || (this.ob_queues[a] = []);
            this.ob_queues[a].push(b);
            this.ob_queues[a] = i.uniq(this.ob_queues[a], !1, function (a) {
                return a.uniq
            });
            this.ob_queues[a] = i.sortBy(this.ob_queues[a], function (a) {
                return a.priority
            })
        },
        unobserve: function (a, b) {
            this.ob_queues[a] = i.filter(this.ob_queues[a], function (a) {
                return a.uniq != b
            })
        },
        bootstrap: function () {
            var a = document.getElementById("loading"),
                b = document.getElementById("canvas_frame");
            a && "none" === a.style.display && (b = b ? b.contentDocument : document);
            b && 0 < document.getElementsByTagName("body").length && (this.elements.canvas = e(b), this.elements.body = this.elements.canvas.find("body").first(), a = this.$("div[role=main]"), this.elements.main = a.closest(".ar4"), a && 0 < a.length && this.elements.main && 0 < this.elements.main.length ? (this.isReadyToLoad = !0, f.document = b) : -1 < location.search.indexOf("view=cm") && (this.dontLoad = !0))
        },
        bindWatchers: function () {
            var a = this;
            e(n).bind("hashchange.gmail", function (b) {
                a.detectViewChange(b)
            });
            this.getCurrentMain(!0);
            this.setupGmailTimer();
            this.detectListToggle();
            this.setupAnimationWatcher();
            this.detectReplyOpen();
            this.detectPreviewPaneChange();
            this.detectNewCompose()
        },
        unbindWatchers: function () {
            e(n).unbind(".gmail");
            this.pauseTimer();
            f.document.removeEventListener("animationstart", this.animationWatcher.watchFunc);
            f.document.removeEventListener("MSAnimationStart", this.animationWatcher.watchFunc);
            f.document.removeEventListener("webkitAnimationStart", this.animationWatcher.watchFunc)
        },
        parse: function () {
            this.elements.topbar = this.$("div#gb");
            this.elements.topbar.find(".gbvg");
            this.elements.topbar.leftLinks = this.elements.topbar.find("ol.gbtc:first");
            this.elements.topbar.rightLinks = this.elements.topbar.find("ol.gbtc:last");
            this.elements.notice = this.$("div.nn:nth-child(2) .b8");
            this.elements.notice.message = this.elements.notice.find(".vh");
            this.elements.logo = this.$("div.nn:first");
            this.elements.search = this.$("div.nn:nth-child(2) table[role=search]");
            this.elements.leftbar = this.$("div.oy8Mbf div[role=navigation]").parents("div.oy8Mbf");
            this.elements.leftbar.links = this.elements.leftbar.find("div[role=navigation] [title]:first").parents(".n3");
            this.elements.main = this.$("div[role=main]:first").closest(".ar4");
            this.elements.mainParent = this.$("div[role=main]:first").parent()
        },
        xhrWatcher: {
            xhrParams: null,
            initialized: null,
            init: function (a) {
                if (!this.initialized) {
                    this.initialized = !0;
                    var b = top.document.getElementById("js_frame").contentDocument.defaultView;
                    b.XMLHttpRequest.prototype._Gmail_open = b.XMLHttpRequest.prototype.open;
                    b.XMLHttpRequest.prototype.open = function (b, d, h, g, j) {
                        var p = this._Gmail_open.apply(this, arguments);
                        this.xhrParams = {
                            method: b.toString(),
                            url: d.toString()
                        };
                        try {
                            var k = e.deparam(d);
                            if (k.search && "tl" == k.view) {
                                var m = this.onreadystatechange,
                                    l = this;
                                k.q && a.executeObQueues("search", k.q);
                                this.onreadystatechange = function () {
                                    4 == l.readyState && 200 == l.status && (m(), a.executeObQueues("ajaxListRefresh", {
                                        search: k.search,
                                        viewData: l.responseText
                                    }))
                                }
                            }
                            "sd" == k.act && (m = this.onreadystatechange, l = this, a.executeObQueues("draftSaving", k.q), this.onreadystatechange = function () {
                                if (4 == l.readyState && 200 == l.status) {
                                    a.executeObQueues("draftSavedPre", l.responseText);
                                    m();
                                    var b = null;
                                    try {
                                        for (var c = a.cleanGmailResponseText(l.responseText), d = f.searchObject(c, "a", 100, !0, !0)[0].path, d = d.split("/"), d = i(d).chain().rest(1).initial().value(), h = 0; h < d.length; h++) c = c[d[h]];
                                        b = c[3][0]
                                    } catch (e) {
                                        console.warn("draft saving error", e)
                                    }
                                    a.executeObQueues("draftSaved", l.responseText, b)
                                }
                            })
                        } catch (n) {}
                        return p
                    };
                    b.XMLHttpRequest.prototype._Gmail_send = b.XMLHttpRequest.prototype.send;
                    b.XMLHttpRequest.prototype.send = function (a) {
                        var b = this._Gmail_send.apply(this, arguments);
                        this.xhrParams && (this.xhrParams.body = a, j.detectXHREvents(this.xhrParams));
                        return b
                    };
                    top._Gmail_iframeFn || (top._Gmail_iframeFn = top.GG_iframeFn, this.iframeData = {}, this.iframeCachedData = [], this.iframeCachedData.push({
                        responseDataId: 1,
                        url: top.location.href,
                        responseData: top.VIEW_DATA
                    }), top.GG_iframeFn = function (b, d) {
                        var h = top._Gmail_iframeFn.apply(this, arguments);
                        try {
                            var g = b && b.location ? b.location.href : null;
                            if (g && d && -1 != g.indexOf("act=") && !a.iframeData[g]) {
                                var f = "",
                                    i = b.frameElement.parentNode;
                                i && 0 < e(i).find("form").length && (f = e(i).find("form").first().serialize());
                                a.iframeData[g] = !0;
                                j.detectXHREvents({
                                    body: f,
                                    url: g
                                })
                            }
                        } catch (k) {
                            try {
                                j.debug && console.log("DEBUG error in GG_iframeFn: " + k)
                            } catch (m) {}
                        }
                        return h
                    })
                }
            },
            destroy: function () {
                var a = top.document.getElementById("js_frame").contentDocument.defaultView;
                a.XMLHttpRequest.prototype.open = a.XMLHttpRequest.prototype._Gmail_open;
                a.XMLHttpRequest.prototype.send = a.XMLHttpRequest.prototype._Gmail_send
            }
        },
        cleanGmailResponseText: function (a) {
            var b = a.substring(a.indexOf("[")).replace(/\];var\s.*/img, ""),
                b = "[" + b.replace(/\r|\n/img, "").replace(/,(,|\]|\})/img, ",null$1").replace(/\]\d+\[/img, "],[") + "]",
                c;
            try {
                b = b.replace(/,(,|\]|\})/img, ",null$1"), c = eval("(function(){return " + b + ";})()")
            } catch (d) {
                BB.logError("error parsing clean response \n viewData:" + a, d)
            }
            return c
        },
        setupTimer: function (a) {
            clearTimeout(this.timer);
            delete this.timer;
            this.timer = setTimeout(this.timerFunction, a || 500)
        },
        timerFunction: function (a) {
            j.view = j.getLiveView();
            j.isGmailView() && j.getCurrentMain(!0);
            j.executeObQueues("gmailTimer");
            j.setupTimer(a)
        },
        setupGmailTimer: function (a) {
            this.pauseTimer();
            this.timerFunction(a)
        },
        pauseTimer: function () {
            clearTimeout(this.timer);
            delete this.timer
        },
        resumeTimer: function () {
            this.setupGmailTimer()
        },
        addTimerObserver: function (a, b, c) {
            var d = a;
            b && (d = i.throttle(function () {
                a()
            }, b));
            this.observe("gmailTimer", function () {
                d()
            }, c)
        },
        detectListToggle: function () {
            var a = this;
            j.observe("viewChanged", function () {
                if (a.isListView()) for (var b = a.getCurrentMain().find("h3.Wr"), c = 0; c < b.length; c++) {
                    var d = e(b[c]);
                    d.data("toggleTracked") || (d.click(function () {
                        var b = !1;
                        0 < e(this).closest(".ae4").find(".Cp").children().length && (b = !0);
                        a.executeObQueues("listToggle", b)
                    }), d.data("toggleTracked", !0))
                }
            })
        },
        detectReplyOpen: function () {
            var a = this,
                b = [],
                c = 0;
            j.observe("viewChanged", function () {
                b = [];
                c = 0
            });
            this.addAnimationWatcher("streakReplyOpen", function (d) {
                var h = e(d.target);
                h.addClass("streakReplyArea");
                0 === h.find("[role=navigation]").length && (h = a.createComposeWindow(h));
                i.any(b, function (a) {
                    return a[0] === h[0]
                }) || (b.push(h), a.executeObQueues("replyOpen", h), c = j.getCurrentMain().find("div.adB").length)
            });
            this.addAnimationWatcher("streakReplyClosed", function () {
                var d = j.getCurrentMain().find("div.adB").length;
                if (d !== c) {
                    a.executeObQueues("replyAreasChanged", d, c);
                    c = d;
                    for (var d = [], h = 0; h < b.length; h++) b[h].is(".adB") ? d.push(b[h]) : b[h].trigger("removed");
                    b = d
                }
            })
        },
        detectPreviewPaneChange: function () {
            var a = this;
            this.currentPreviewPaneSettings = this.getFreshPreviewPaneSettings();
            var b = i.throttle(function () {
                a.isListView() && a.getFreshPreviewPaneSettings()
            }, 500);
            j.observe("gmailTimer", function () {
                b()
            });
            j.observe("viewChanged", function () {
                if (a.isListView() && a.isHorizontalSplitPreviewPane() && 0 === a.getCurrentMain().find(".age").filter(":FastVisible").filter(":first").height()) {
                    var b = a.getLeftbarLinks().find(".ain").filter(":not(.pipeline)");
                    if (0 < b.length) {
                        var d = b.siblings();
                        e(d[0]).find(".nU").click();
                        b.find(".nU").click()
                    }
                }
            })
        },
        detectNewCompose: function () {
            var a = this;
            a.composeSystem = {};
            a.composeSystem.windows = [];
            var b = !0;
            this.addAnimationWatcher("streakComposeNodeInserted", function (c) {
                if (0 !== e(c.target).find(".gU.Up").length) {
                    var d = a.createComposeWindow(e(c.target));
                    i.any(a.composeSystem.windows, function (a) {
                        return a[0] === d[0]
                    }) || (a.composeSystem.windows.push(d), b && (a.composeSystem.container = d.container.parent(), a.composeSystem.container.children().addClass("streakGmailComposeChildren"), b = !1), a.composeSystem.number = a.composeSystem.container.children(".streakGmailComposeChildren").length, a.executeObQueues("newComposeWindow", d))
                }
            });
            this.addAnimationWatcher(["streakComposeTriggerEven", "streakComposeTriggerOdd"], function () {
                if (a.composeSystem.container.children().length < a.composeSystem.number) {
                    a.composeSystem.number = a.composeSystem.container.children().length;
                    for (var b = [], d = [], h = 0; h < a.composeSystem.windows.length; h++) {
                        var e = a.composeSystem.windows[h];
                        0 === e.container.parent().length ? (d.push(e), e.trigger("removed")) : b.push(e)
                    }
                    0 < d.length && a.executeObQueues("composeWindowRemoved", d);
                    a.composeSystem.windows = b
                }
            });
            this.observe("draftSaved", function (b, d) {
                for (var e = 0; e < a.composeSystem.windows.length; e++) a.composeSystem.windows[e].getFieldValue("draft") === d && a.composeSystem.windows[e].trigger("draftSaved")
            });
            this.observe("compose", function (b) {
                for (var d = 0; d < a.composeSystem.windows.length; d++) a.composeSystem.windows[d].getFieldValue("draft") === b.draft && a.composeSystem.windows[d].trigger("sent", b)
            })
        },
        createComposeWindow: function (a) {
            a.container = a.closest(".no").parent();
            a.container.addClass("streakGmailCompose");
            a.minimize = e(a.find(".Hm > img")[0]);
            a.popOut = e(a.find(".Hm > img")[1]);
            a.close = e(a.find(".Hm > img")[2]);
            a.editor = a.find(".Ap [contenteditable=true]");
            a.sendButton = a.find(".IZ").find(".Up > div > div:last-child");
            a.insertMoreArea = a.find(".eq");
            a.formattingArea = a.find(".oc");
            a.discardButton = a.find(".gU.az5 .oh");
            a.toolbar = a.find(".aDh");
            a.isNew = !0;
            a.toolbar.height();
            a.getAddresses = function () {
                for (var b = [], c = a.find("span.vN[email]"), d = 0; d < c.length; d++) {
                    var e = {
                        emailAddress: c[d].getAttribute("email")
                    };
                    c[d].innerText !== e.emailAddress && (e.name = c[d].innerText);
                    b.push(e)
                }
                return b
            };
            a.getSubject = function () {
                return a.find("input[name=subjectbox]").val()
            };
            a.getEditor = function () {
                a.editor = a.find(".Ap [contenteditable=true]");
                return a.editor
            };
            a.addStreakArea = function () {
                if (0 === a.find(".streakArea").length) {
                    var b = e(f.createEl("td"));
                    b.addClass("streakArea gU");
                    a.formattingArea.before(b);
                    b.after('<td class="gU"><div class="Uz"></div></td>');
                    a.streakArea = b;
                    b.closest("table").find("colgroup").prepend("<col></col><col></col>")
                }
            };
            a.addToStreakArea = function (b, c) {
                var d = a.formattingArea.offset().left;
                a.streakArea || a.addStreakArea();
                c ? a.streakArea.prepend(b) : a.streakArea.append(b);
                var e = a.formattingArea.offset().left,
                    g = parseInt(a.insertMoreArea.css("left"));
                a.insertMoreArea.css("left", g + (e - d) + "px")
            };
            a.getFieldValue = function (b) {
                b = a.find("input[type=hidden][name=" + b + "]");
                if (0 === b.length) return "";
                if (1 === b.length) return b.val();
                for (var c = [], d = 0; d < b.length; d++) c.push(e(b[d]).val());
                return c
            };
            a.getInsertLeft = function () {
                return a.formattingArea.offset().left
            };
            a.updateInsertLeft = function (b) {
                var b = a.formattingArea.offset().left - b,
                    c = parseInt(a.insertMoreArea.css("left"));
                a.insertMoreArea.css("left", c + b + "px")
            };
            return a
        },
        setupAnimationWatcher: function () {
            var a = this;
            this.animationWatcher = f.Eventer.create({
                watchFunc: function (b) {
                    a.animationWatcher.trigger(b.animationName, b)
                }
            });
            f.document.addEventListener("animationstart", this.animationWatcher.watchFunc, !1);
            f.document.addEventListener("MSAnimationStart", this.animationWatcher.watchFunc, !1);
            f.document.addEventListener("webkitAnimationStart", this.animationWatcher.watchFunc, !1)
        },
        addAnimationWatcher: function (a, b) {
            i.isString(a) && (a = [a]);
            if (a && 0 < a.length) for (var c = 0; c < a.length; c++) this.animationWatcher.bind(a[c], b)
        },
        ob_queues: {
            archive: [],
            "delete": [],
            spam: [],
            reply: [],
            compose: [],
            viewChanged: [],
            ajaxListRefresh: [],
            search: []
        },
        detectXHREvents: function (a) {
            try {
                var b = /[?&]act=([^&]+)/.exec(a.url);
                if (b && b[1]) {
                    var c = decodeURIComponent(b[1]);
                    e.deparam(a.url);
                    if (0 < a.body.length) var d = e.deparam(a.body);
                    switch (c) {
                    case "sm":
                        this.executeObQueues("compose", d)
                    }
                }
            } catch (h) {
                j.debug && console.log("Error in detectXHREvents: " + h)
            }
        },
        pageREGEX: /p\d+/,
        getLiveView: function () {
            return this.view = this.hash.parts && 0 < this.hash.parts.length ? this.hash.parts[0] : this.Constants.Inbox
        },
        detectViewChange: function (a, b) {
            b || (b = 1);
            var c = this;
            this.view = null;
            if (this.getCurrentMain(!0)) {
                var d = this.hash.partsString;
                this.hash.parts = [];
                this.hash.query = null;
                this.hash.partsString = "";
                if (a.fragment) {
                    var e = a.fragment,
                        g = e.indexOf("?"); - 1 < g && (this.hash.query = e.substring(g + 1), e = e.substring(0, g));
                    g = e.split("/");
                    this.hash.parts = g;
                    this.hash.partsString = e;
                    this.conversation = null;
                    this.view = g[0];
                    this.label = (this.view == this.Constants.Label || this.view == this.Constants.Search || this.view == this.Constants.Apps) && 1 < g.length ? g[1] : null;
                    if (this.isCompose()) this.view === this.Constants.Drafts && 1 < g.length && (this.conversation = i.last(g));
                    else if (this.isInConversation()) this.conversation = i.last(g);
                    else if (!this.isInContacts()) {
                        if ((e = i.last(g)) && 16 === e.length && 30 > b) {
                            this.isGmailView() && f.BentoBox.UI.setGmailView();
                            setTimeout(function () {
                                c.detectViewChange(a, b + 1)
                            }, 300);
                            return
                        }
                        this.conversation = null
                    }
                }
                c.view || (c.view = c.Constants.Inbox);
                if (d !== this.hash.partsString || 1 < b) c.executeObQueues("viewChanged", c.conversation ? c.Constants.Conservation : c.view)
            }
        },
        isInConversation: function () {
            var a = this.hash.parts;
            return 1 < a.length && 16 === i.last(a).length || 1 === a.length && a[0] === this.Constants.Sent ? 0 < this.getCurrentMain().find(".gA.gt").filter(":FastVisible(noCompute)").length && 0 < this.getCurrentMain().find("h1.ha").length : !1
        },
        isInSentConversation: function () {
            return this.isInConversation() && 1 === this.hash.parts.length
        },
        isInContacts: function () {
            return this.view === this.Constants.Contacts || this.view === this.Constants.Contact
        },
        executeObQueues: function (a, b) {
            var c = this,
                d = Array.prototype.slice.call(arguments, 1);
            this.ready(function () {
                if (c.ob_queues[a]) for (var b = 0; b < c.ob_queues[a].length; b++) try {
                    c.ob_queues[a][b].apply(c, d)
                } catch (e) {
                    console.log(e.stack || e)
                }
            })
        },
        getConversationId: function () {
            return this.hash.parts && 0 < this.hash.parts.length ? i.last(this.hash.parts) : null
        },
        getCurrentMain: function (a) {
            if (a || !this.currentMain) {
                a: {
                    this.elements.main || (this.elements.main = this.$("div[role=main]:first").closest(".ar4"));
                    this.elements.mainParent || (this.elements.mainParent = this.$("div[role=main]:first").parent());
                    if (0 < this.elements.mainParent.length) for (var a = this.elements.mainParent[0].children, b = 0; b < a.length; b++) {
                        var c = a[b];
                        if ("main" === c.getAttribute("role") && "none" !== c.style.display) {
                            a = e(c);
                            break a
                        }
                    }
                    a = e(document.createElement("div"))
                }
                this.currentMain = a
            }
            return this.currentMain
        },
        getCurrentMainContainer: function () {
            return this.elements.main
        },
        getCurrentMoreButton: function () {
            var a = e(j.$("div[gh=tm]")[0]),
                a = a.find("[gh=mtb] div[role=button]"),
                a = a.filter(":FastVisible(noCompute)"),
                a = a.filter(":not(.Bq)");
            return a = a.filter(":last")
        },
        getRightSide: function () {
            if (this.isCompose()) return this.isRapportiveInstalled() ? this.getCurrentMain().find("#rapportive-sidebar") : this.isXobniInstalled() ? this.$("#xobni_frame").parent() : this.getCurrentMain().find(".bb_right");
            if (this.isXobniInstalled()) return this.$("#xobni_frame").parent();
            this.isRapportiveInstalled();
            return this.getCurrentMain().find("table.Bs .Bu").filter(":last")
        },
        getLeftBar: function () {
            if (!this.elements.leftbar || !this.elements.leftbar.is(":FastVisible(noCompute)")) {
                var a = this.$("div.oy8Mbf div[role=navigation]"),
                    a = a.filter(":FastVisible(noCompute)");
                this.elements.leftbar = a.parents("div.oy8Mbf")
            }
            return this.elements.leftbar
        },
        getLeftbarLinks: function () {
            if (!this.getLeftBar().links || !this.getLeftBar().links.is(":FastVisible(noCompute)")) {
                var a = this.getLeftBar().find("div[role=navigation] [title]");
                this.getLeftBar().links = e(a[0]).parents(".n3")
            }
            return this.getLeftBar().links
        },
        isListView: function () {
            return -1 < this.Constants.ListViews.indexOf(this.view) && !this.isConversation() && !this.isCompose()
        },
        isConversation: function () {
            return this.isInConversation()
        },
        isGmailView: function () {
            return -1 < i.values(this.Constants.ListViews).indexOf(this.view)
        },
        isContacts: function () {
            return this.view == this.Constants.Contacts
        },
        isSearch: function () {
            return (this.view == this.Constants.Search || this.view == this.Constants.Apps) && !this.isConversation()
        },
        isCompose: function () {
            return this.view == this.Constants.Compose || this.view == this.Constants.Drafts && 0 === this.getCurrentMoreButton().length
        },
        isDrafts: function () {
            return this.view == this.Constants.Drafts
        },
        getMainList: function () {
            for (var a = this.getCurrentMain().find("[gh=tl]"), b = 0; b < a.length; b++) if (1 === e(a[b]).parents("[role=main]").length) return e(a[b])
        },
        getListRows: function (a, b) {
            for (var c = [], d = a.find("tr.zA"), h = a.find("table colgroup col.yg").filter(":first").index(), g = 0; g < d.length; g++) {
                var f = {
                    type: b,
                    node: e(d[g]),
                    rowIndex: g,
                    rowNode: e(d[g]),
                    iconIndex: h,
                    getList: function () {
                        return a
                    },
                    checked: 0 < e(d[g]).find("input[type=checkbox]:checked, div[role=checkbox][aria-checked=true]").length
                };
                "horizontal" === b && (f.checked = f.checked || f.rowNode.hasClass("aps"), f.previewed = f.rowNode.hasClass("aps"));
                f.labelContainer = f.rowNode.find(".xT");
                c.push(f)
            }
            return c
        },
        getVerticalListRows: function (a) {
            for (var b = [], c = [], d = a.find("tr.zA"), h = 0, g = function () {
                    if (0 < c.length) {
                        var d = {
                            type: "vertical",
                            node: c,
                            rowIndex: h++,
                            rowNode: c[0],
                            getList: function () {
                                return a
                            }
                        };
                        d.checked = 0 < d.rowNode.find("input[type=checkbox]:check, div[role=checkbox][aria-checked=true]").length || d.rowNode.hasClass("aps");
                        d.previewed = d.rowNode.hasClass("aps");
                        d.iconIndex = d.rowNode.find("td.apt").index();
                        for (var f = 0; f < c.length; f++) {
                            var g = c[f];
                            0 < e(g).find(".apu").length && (d.labelContainer = e(g).find(".apu"))
                        }
                        b.push(d);
                        c = []
                    }
                }, f = 0; f < d.length; f++) {
                var i = e(d[f]);
                0 < i.find("[role=checkbox]").length && g();
                c.push(i)
            }
            g();
            return b
        },
        getVisibleThreadRows: function () {
            if (this.isListView()) {
                for (var a = [], b = this.getCurrentMain().find("[gh=tl]"), c = 0; c < b.length; c++) var d = e(b[c]),
                    a = b[c].getAttribute("class").has("aia") ? 0 < d.find(".nn").length ? a.concat(this.getVerticalListRows(d)) : a.concat(this.getListRows(d, "horizontal")) : a.concat(this.getListRows(d));
                return a
            }
            return []
        },
        getSelectedThreadRows: function () {
            return this.getVisibleThreadRows().filter(function (a) {
                return a.checked
            })
        },
        getPreviewedRow: function () {
            var a = this.getVisibleThreadRows().filter(function (a) {
                return a.previewed
            });
            if (0 < a.length) return a[0]
        },
        getActiveViewLink: function () {
            return this.getLeftbarLinks().find(".nZ")
        },
        getToolbarButtons: function () {
            return this.getCurrentMainContainer().find("[role=navigation] div[role=button]").filter(":FastVisible(noCompute)")
        },
        getSendButton: function () {
            return e(this.getToolbarButtons()[0])
        },
        getSaveButton: function () {
            return e(this.getToolbarButtons()[1])
        },
        getDiscardButton: function () {
            return e(this.getToolbarButtons()[2])
        },
        getDiscardDraftsButton: function () {
            return e(this.$("div[gh=tm]").find("div[gh=mtb] div[role=button]")[1])
        },
        getThemeLoaded: function () {
            try {
                var a = JSON.stringify(GLOBALS),
                    b = a.indexOf("sx_skcs");
                if (-1 < b) {
                    var c = a.substring(b - 2, a.indexOf("]", b) + 1);
                    return JSON.parse(c)[1]
                }
            } catch (d) {}
            return "unknown"
        },
        getEnabledLabs: function () {
            try {
                var a = i.filter(GLOBALS[17][6][1], function (a) {
                    if (-1 < a[0].indexOf("lab") && "1" == a[1]) return !0
                });
                return i.pluckPlus(a, function (a) {
                    return a[0]
                })
            } catch (b) {}
            return ""
        },
        isOldUI: function () {
            try {
                var a = JSON.stringify(GLOBALS),
                    b = a.indexOf("sx_sd");
                if (-1 < b) {
                    var c = a.substring(b - 2, a.indexOf("]", b) + 1);
                    return "classic" == JSON.parse(c)[1]
                }
            } catch (d) {}
            return !1
        },
        isGooglePlusEnabled: function () {
            return 0 < this.$("#gbi4i").length
        },
        getPreviewPaneSettings: function () {
            return this.currentPreviewPaneSettings
        },
        getFreshPreviewPaneSettings: function () {
            var a = "classic";
            this.getPreviewPaneLoaded() && (this.isVerticalSplitPreviewPane() ? a = "vertical" : this.isHorizontalSplitPreviewPane() && (a = "horizontal"));
            this.currentPreviewPaneSettings != a && (this.currentPreviewPaneSettings = a, this.executeObQueues("previewPaneChanged", a));
            return a
        },
        getPreviewPaneLoaded: function () {
            var a = this.getMainList();
            return !a ? !1 : a[0].getAttribute("class").has("aia")
        },
        getSearchContainer: function () {
            this.elements.searchContainer || (this.elements.searchContainer = this.$("[gh=sb]"));
            return this.elements.searchContainer
        },
        getSearchInput: function () {
            this.elements.search.input || (this.elements.search.input = this.$("[gh=sb] input"), 1 < this.elements.search.input && (this.elements.search.input = this.elements.search.input.filter("#gbqfq")));
            return this.elements.search.input
        },
        getSearchAutoComplete: function () {
            this.elements.search.autoComplete = this.$(".U5");
            if (!this.elements.search.autoComplete || 0 === this.elements.search.autoComplete.length) this.elements.search.autoComplete = this.$(".gstl_0.gssb_c");
            return this.elements.search.autoComplete
        },
        getKeyboardHelp: function () {
            return this.$(".wa")
        },
        getReplyButtons: function (a) {
            for (var a = a.find("[role=navigation]"), b = [], c = [], d = [], f = 0; f < a.length; f++) {
                var g = e(a[f]).find("div[role=button]");
                b.push(g.filter(".nS"));
                c.push(g.filter(".nQ"));
                d.push(g.filter(".lX"))
            }
            return {
                send: b,
                save: c,
                discard: d
            }
        },
        getEditableArea: function (a) {
            var b = a.find("iframe.editable"),
                a = 0 < b.length ? e(b[0].contentDocument).find("body.editable") : null,
                b = j.getCurrentMain().find("form .At textarea");
            if ((b = 0 < b.length ? e(b[0]) : null) && b.is(":FastVisible(noCompute)")) return b;
            if (a) return a
        },
        isPreviewPane: function () {
            return "classic" !== this.currentPreviewPaneSettings
        },
        isVerticalSplitPreviewPane: function () {
            return this.getPreviewPaneLoaded() ? 0 < this.getMainList().find(".nn").length : !1
        },
        isHorizontalSplitPreviewPane: function () {
            return this.getPreviewPaneLoaded() ? 0 === this.getMainList().find(".nn").length : !1
        },
        isRapportiveInstalled: function () {
            return "undefined" !== typeof rapportive
        },
        getRapportive: function () {
            return this.getCurrentMain().find("#rapportive-sidebar")
        },
        isXobniInstalled: function () {
            return "undefined" !== typeof xobni
        },
        isGmailRightSide: function () {
            return !(this.isRapportiveInstalled() || this.isXobniInstalled())
        },
        addToRightSide: function (a) {
            if (this.isGmailRightSide()) {
                this.getRightSide();
                this.getRightSide().find(".anT").prepend(a);
                var b = this.getRightSide().find(".adC");
                b.css({
                    position: ""
                });
                a.is(":FastVisible(noCompute)") || b.prepend(a);
                a.is(":FastVisible(noCompute)") || this.getRightSide().find("div.Bt").after(a)
            } else this.getRightSide().prepend(a)
        },
        widgets: {
            getDeleteIcon: function () {
                var a = e(document.createElement("div"));
                a.addClass("ar9 G8oNDd tk3N6e-I-J3 J-J5-Ji");
                a[0].setAttribute("style", "vertical-align: middle; padding-top:2px; width: 16px;");
                return a
            },
            getSettingsIcon: function () {
                var a = e(document.createElement("div"));
                a.addClass("aos");
                return a
            },
            getLabelTag: function (a, b, c) {
                var d = e(document.createElement("div"));
                d.addClass("ar as");
                d[0].innerHTML = i.template('<div class="at" title="<%= text %>" style="background-color: <%= groupcolor %>; border-color: <%= groupcolor %>;"><div class="au" style="border-color:<%= groupcolor %>"><div class="av" style="color: <%= textcolor %>"><%= text %></div> </div></div>', {
                    text: a,
                    groupcolor: b,
                    textcolor: c
                });
                return d
            },
            getCheckbox: function (a, b) {
                var c = e(f.createEl("div"));
                c.addClass("gmailCheckbox");
                var d = e(f.createEl("div"));
                d.addClass("oZ-jc T-Jo J-J5-Ji");
                var h = e(f.createEl("div"));
                h.addClass("T-Jo-auh");
                var g = f.createEl("span", a);
                c.append(d);
                d.append(h);
                a && 0 < a.length && c.append(g);
                d.easyHoverClass("T-Jo-JW");
                b && (d.addClass("T-Jo-Jp"), c.prop("checked", !0));
                c.click(function () {
                    d.toggleClass("T-Jo-Jp");
                    c.prop("checked", d.hasClass("T-Jo-Jp"));
                    c.trigger("change")
                });
                c.setChecked = function (a) {
                    d.toggleClass("T-Jo-Jp", a);
                    c.prop("checked", d.hasClass("T-Jo-Jp"))
                };
                c.isChecked = function () {
                    return c.prop("checked") === true
                };
                return c
            },
            getLabelActionTag: function (a) {
                var b = {};
                e.extend(b, {
                    backgroundColor: "rgb(221, 221, 221)",
                    textColor: "rgb(102, 102, 102)",
                    labelText: null,
                    labelHelpText: null,
                    labelCallback: e.noop,
                    xHelpText: null,
                    xCallback: e.noop
                }, a);
                var c = e(document.createElement("span"));
                c.addClass("J-J5-Ji");
                c[0].innerHTML = i.template('<table cellpadding="0" class="cf hX"><tbody><tr class="hR"><td class="hU hM" style="background-color: <%= backgroundColor %>; color: <%= textColor %>;"><div class="hN" title="<%= labelHelpText %>" role="button"><%= labelText %></div></td><td class="hV hM bb_labelActionTag" style="background-color: <%= backgroundColor %>; color: <%= textColor %>;"><span class="hO" title="<%= xHelpText %>" role="button">x</span></td></tr></tbody></table>', b);
                c.find(".bb_labelActionTag").hover(function () {
                    e(this);
                    e(this).css({
                        backgroundColor: b.textColor,
                        color: b.backgroundColor
                    })
                }, function () {
                    e(this);
                    e(this).css({
                        backgroundColor: b.backgroundColor,
                        color: b.textColor
                    })
                });
                c.reset = function () {
                    c.find(".hM").css({
                        backgroundColor: b.backgroundColor,
                        color: b.textColor
                    })
                };
                c.find(".hU").click(b.labelCallback);
                c.find(".hV").click(b.xCallback);
                return c
            }
        }
    });
    j.init();
    f.Gmail = j
})(Streak, window);
(function (Streak, window) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester;
    var MAX_BACKOFF = 32E3;
    var Model = function (obj) {
            this.obj = obj;
            this.serverObject = JSON.deepClone(obj);
            this.updatedServerObject = null;
            this._triggersActive = true;
            this.isDeleting = false;
            this.requestPending = false;
            this.currentEditOps = [];
            this.syncOps = [];
            this.lastSyncOp = null;
            this.pendingCallbacks = [];
            this.timeLastSynced = null;
            this.currentBackoff = 1E3;
            if (this.processObj) this.obj = this.processObj(this.obj);
            this.eventCBs = {}
        };
    _.extend(Model.prototype, {
        set: function (property, value) {
            this.currentEditOps.push({
                property: property,
                value: value
            });
            this.obj[property] = value;
            this.trigger("set", property);
            this.trigger("change", null, property)
        },
        get: function (property) {
            return this.obj[property] || ""
        },
        update: function (obj2) {
            var updateStatus = {
                updated: []
            };
            this.startTransaction();
            if (this.processObj) obj2 = this.processObj(obj2);
            if (this.key() !== obj2[this.keyName]) this.set(this.keyName, obj2[this.keyName]);
            if (JSON.stringify(this.obj) !== JSON.stringify(obj2)) {
                var keys = _.keys(obj2);
                for (var i = 0; i < keys.length; i++) {
                    var aKey = keys[i];
                    if (this.updateMap && this.updateMap[aKey]) {
                        if (this.updateMap[aKey].call(this, obj2)) updateStatus.updated.push(aKey)
                    } else {
                        var isDiff = JSON.stringify(this.obj[aKey]) !== JSON.stringify(obj2[aKey]);
                        if (isDiff) {
                            this.set(aKey, obj2[aKey]);
                            updateStatus.updated.push(aKey)
                        }
                    }
                }
            }
            this.endTransaction();
            return updateStatus
        },
        bind: function (event, property, cb, uniq) {
            if (cb === null) return;
            if (uniq) cb.uniq = uniq;
            if (!property) property = "_";
            else if (_.isArray(property)) for (var i = 0; i < property.length; i++) this.bind(event, property[i], cb, uniq);
            if (!this.eventCBs[event]) this.eventCBs[event] = {};
            if (!this.eventCBs[event][property]) {
                this.eventCBs[event][property] = [];
                this.eventCBs[event][property].uniqMap = {}
            }
            var cbList = this.eventCBs[event][property];
            if (cb.uniq) if (cbList.uniqMap[cb.uniq] || cbList.uniqMap[cb.uniq] === 0) cbList[cbList.uniqMap[cb.uniq]] = cb;
            else {
                cbList.push(cb);
                cbList.uniqMap[cb.uniq] = cbList.length - 1
            } else cbList.push(cb)
        },
        unbind: function (event, property, uniq, cb) {
            if (!property) property = "_";
            else if (_.isArray(property)) for (var i = 0; i < property.length; i++) this.unbind(event, property[i], uniq, cb);
            if (this.eventCBs[event]) if (this.eventCBs[event][property]) {
                var index = -1;
                if (uniq) {
                    index = this.eventCBs[event][property].uniqMap[uniq];
                    delete this.eventCBs[event][property].uniqMap[uniq]
                } else index = this.eventCBs[event][property].indexOf(cb);
                this.eventCBs[event][property][index] = null
            }
        },
        unbindAll: function (uniq) {
            for (var event in this.eventCBs.length) {
                var eventMap = this.eventCBs[event];
                for (var property in eventMap) {
                    var propertyCBs = eventMap[property];
                    var newCBs = [];
                    for (var i = 0; i < propertyCBs.length; i++) if (propertyCBs[i].uniq !== uniq) newCBs.push(propertyCBs[i]);
                    eventMap[property] = newCBs
                }
            }
        },
        trigger: function (event, property) {
            if (!this._triggersActive) {
                this.transactionEventQueue.push({
                    event: event,
                    property: property
                });
                return
            }
            if (!property) property = "_";
            if (this.eventCBs[event]) {
                var cbs = this.eventCBs[event][property];
                if (cbs && cbs.length > 0) {
                    var uniqMap = cbs.uniqMap;
                    cbs = _.clone(cbs);
                    this.eventCBs[event][property].length = 0;
                    for (var i = 0; i < cbs.length; i++) try {
                        if (cbs[i]) if (!cbs[i].apply(null, [this].concat(_.chain(arguments).toArray().rest(1).value()))) this.eventCBs[event][property].push(cbs[i])
                    } catch (err) {
                        var msg = "Event model trigger error";
                        try {
                            msg += "\nmodel: " + JSON.stringify(this.obj)
                        } catch (err2) {
                            msg += "\nmodel: error serializing"
                        }
                        Streak.BentoBox.logError(msg, err)
                    }
                }
            }
        },
        startTransaction: function () {
            this.transactionEventQueue = [];
            this.setTriggersActive(false)
        },
        endTransaction: function () {
            this.setTriggersActive(true);
            this.transactionEventQueue = _.uniq(this.transactionEventQueue, false, function (event) {
                return JSON.stringify(event)
            });
            for (var i = 0; i < this.transactionEventQueue.length; i++) this.trigger(this.transactionEventQueue[i].event, this.transactionEventQueue[i].property)
        },
        setTriggersActive: function (isActive) {
            this._triggersActive = isActive
        },
        processParam: function (param) {
            if (this.modifyProperties) for (var i = 0; i < this.modifyProperties.length; i++) {
                var prop = this.modifyProperties[i];
                param[prop] = this.get(prop)
            }
        },
        isSyncPending: function () {
            return this.syncOps.length > 0
        },
        isFullySynced: function () {
            return !this.requestPending && !this.isSyncPending()
        },
        addSyncOperation: function (syncOp) {
            var runImmediate = this.syncOps.length === 0 && !this.requestPending;
            this.syncOps.push(syncOp);
            if (runImmediate) this.performNextSyncOperation()
        },
        performNextSyncOperation: function (isError) {
            if (!this.isSyncPending()) {
                this.requestPending = false;
                this.completeResponseChain(isError);
                return
            }
            this.requestPending = true;
            this.lastSyncOp = this.syncOps.shift();
            this.updatedServerObject = JSON.deepClone(this.serverObject);
            if (this.lastSyncOp.editOps) for (var i = 0; i < this.lastSyncOp.editOps.length; i++) this.updatedServerObject[this.lastSyncOp.editOps[i].property] = this.lastSyncOp.editOps[i].value;
            switch (this.lastSyncOp.type) {
            case "SAVE":
                this.executeSave(1, this.lastSyncOp.dontCreate, this.lastSyncOp.fromCreate);
                break;
            case "REFRESH":
                this.executeRefresh();
                break;
            case "DELETE":
                this.executeDelete();
                break
            }
        },
        handleSuccessfulResponse: function (res) {
            this.currentBackoff = 1E3;
            _.extend(this.serverObject, JSON.deepClone(res));
            this.performNextSyncOperation()
        },
        handleErrorResponse: function (params, xhr) {
            var self = this;
            switch (xhr.status) {
            case 0:
                this.syncOps.unshift(this.lastSyncOp);
                this.currentBackoff = Math.min(this.currentBackoff * 2, MAX_BACKOFF);
                setTimeout(this.performNextSyncOperation.bind(this), this.currentBackoff);
                return true;
                break;
            case 400:
                this.performNextSyncOperation(true, params, xhr);
                break;
            case 401:
                this.syncOps.length = 0;
                this.performNextSyncOperation(true, params, xhr);
                Streak.BentoBox.trigger("criticalError");
                break;
            case 404:
                this.syncOps.length = 0;
                this.performNextSyncOperation(true, params, xhr);
                this.trigger("delete");
                break;
            case 405:
                this.performNextSyncOperation(true, params, xhr);
                break;
            case 500:
                this.syncOps.unshift(this.lastSyncOp);
                this.currentBackoff = Math.min(this.currentBackoff * 2, MAX_BACKOFF);
                setTimeout(this.performNextSyncOperation.bind(this), this.currentBackoff);
                return true;
                break;
            case 503:
                this.performNextSyncOperation(true, params, xhr);
                break;
            default:
                this.performNextSyncOperation(true, params, xhr);
                return false
            }
        },
        completeResponseChain: function (isError, params, xhr) {
            if (this.serverObject) this.update(this.serverObject);
            this.currentEditOps.length = 0;
            this.timeLastSynced = Date.now();
            var callbacks = _.clone(this.pendingCallbacks);
            this.pendingCallbacks = [];
            for (var i = 0; i < callbacks.length; i++) if (isError && callbacks[i].errCb) callbacks[i].errCb(params, xhr);
            else if (callbacks[i].cb) callbacks[i].cb()
        },
        save: function (cb, tries, dontCreate, errCb, fromCreate) {
            this.pendingCallbacks.push({
                cb: cb,
                errCb: errCb
            });
            this.addSyncOperation({
                type: "SAVE",
                editOps: _.clone(this.currentEditOps),
                params: {
                    dontCreate: dontCreate,
                    fromCreate: fromCreate
                }
            });
            this.currentEditOps.length = 0
        },
        executeSave: function (tries, dontCreate, fromCreate) {
            if (!tries) tries = 1;
            if (tries === 1) {
                if (!this.serverObject) this.serverObject = JSON.deepClone(this.obj);
                if (this.preSaveFunction && !this.preSaveFunction()) {
                    this.trigger("saveRejected");
                    this.performNextSyncOperation();
                    return
                }
            }
            if (this.serverObject[this.keyName]) {
                var param = {
                    entityType: this.entityType
                };
                this.processParam(param);
                if (tries === 1) this.trigger("preUpdate");
                this.saveUpdate(param, tries, fromCreate)
            } else if (!dontCreate) {
                var param = {
                    entityType: this.entityType
                };
                var checkProps = this.requiredCreate || this.createProperties;
                for (var i = 0; i < this.createProperties.length; i++) {
                    var prop = this.createProperties[i];
                    if (prop == "json") param[prop] = JSON.stringify(this.updatedServerObject);
                    else {
                        if (this.updatedServerObject[prop] === null && checkProps.indexOf(prop) > -1) return;
                        if (this.updatedServerObject[prop] !== null && typeof this.updatedServerObject[prop] !== "undefined") param[prop] = this.updatedServerObject[prop]
                    }
                }
                if (tries === 1) this.trigger("preCreate");
                this.saveCreate(param, tries)
            } else;
        },
        saveUpdate: function (param, tries, fromCreate) {
            var self = this;
            if (tries === 1) this.pendingCallbacks.unshift({
                cb: function () {
                    self.trigger("save")
                },
                errCb: function (params, xhr) {
                    var msg = "Error updating model";
                    msg += "\n type: " + self.entityType;
                    msg += "\n key: " + self.key();
                    msg += "\n json: " + JSON.stringify(self.obj);
                    Streak.BentoBox.logAjaxError(msg, null, xhr);
                    Streak.Gmail.showNotice("Error occurred saving changes", 5E3)
                }
            });
            param.json = JSON.stringify(this.updatedServerObject);
            Requester.update(param, _.bind(this.handleSuccessfulResponse, this), _.bind(this.handleErrorResponse, this))
        },
        saveCreate: function (param, tries) {
            var self = this;
            if (tries === 1) this.pendingCallbacks.unshift({
                cb: function () {
                    self.trigger("create")
                },
                errCb: function (params, xhr) {
                    var msg = "Error creating object";
                    msg += "\n obj: " + JSON.stringify(this.obj);
                    Streak.BentoBox.logAjaxError(msg, null, xhr);
                    Streak.Gmail.showNotice("Creating failed", 5E3);
                    self.trigger("errorCreate")
                }
            });
            Requester.create(param, _.bind(this.handleSuccessfulResponse, this), _.bind(this.handleErrorResponse, this))
        },
        del: function (cb, errCb) {
            if (this.preDeleteFunction && !this.preDeleteFunction()) {
                if (errCb) errCb();
                return
            }
            this.pendingCallbacks.push({
                cb: cb,
                errCb: errCb
            });
            this.addSyncOperation({
                type: "DELETE"
            });
            this.trigger("delete");
            this.obj[this.keyName] = ""
        },
        executeDelete: function () {
            var self = this;
            var param = {
                entityType: this.entityType,
                json: JSON.stringify(this.serverObject)
            };
            this.processParam(param);
            var oldServerObject = this.serverObject;
            this.pendingCallbacks.unshift({
                errCb: function (params, xhr) {
                    self.serverObject = oldServerObject;
                    var msg = "Error deleting object";
                    Streak.BentoBox.logAjaxError(msg, null, xhr);
                    Streak.Gmail.showNotice("Delete failed, please try again", 5E3);
                    self.trigger("undelete")
                }
            });
            Requester.del(param, _.bind(function () {
                this.serverObject[this.keyName] = "";
                this.handleSuccessfulResponse(this.serverObject)
            }, this), _.bind(this.handleErrorResponse, this))
        },
        refresh: function (cb) {
            this.pendingCallbacks.push({
                cb: cb,
                errCb: cb
            });
            if (this.isFullySynced()) this.addSyncOperation({
                type: "REFRESH"
            })
        },
        executeRefresh: function () {
            if (!this.key()) {
                this.handleSuccessfulResponse(this.serverObject);
                return
            }
            var params = {
                entityType: this.entityType
            };
            params[this.keyName] = this.get(this.keyName);
            Requester.get(params, _.bind(this.handleSuccessfulResponse, this), _.bind(this.handleErrorResponse, this))
        },
        collectionUpdate: function (obj) {
            if (this.isFullySynced()) if (Date.now() > this.timeLastSynced) {
                this.serverObject = obj;
                this.update(this.serverObject)
            }
        },
        syncedSet: function (property, value) {
            if (this.isFullySynced() && Date.now() > this.timeLastSynced) {
                this.set(property, value);
                return true
            }
        },
        link: function () {
            return this.typeName + "/" + this.key()
        },
        key: function () {
            return this.get(this.keyName)
        },
        displayName: function () {
            if (this.nameProperty) if (this.get(this.nameProperty).escapeHTML) return this.get(this.nameProperty).escapeHTML();
            else return this.get(this.nameProperty);
            return ""
        },
        staticEventCBs: {},
        staticBind: function (entityType, event, cb) {
            if (!this.staticEventCBs[entityType]) this.staticEventCBs[entityType] = {
                "create": [],
                "delete": []
            };
            if (!this.staticEventCBs[entityType[event]]) this.staticEventCBs[entityType][event] = [];
            this.staticEventCBs[entityType][event].push(cb)
        },
        staticTrigger: function (entityType, event) {
            if (this.staticEventCBs[entityType]) if (this.staticEventCBs[entityType][event]) for (var i = 0, l = this.staticEventCBs[entityType][event].length; i < l; i++) this.staticEventCBs[entityType][event][i](this)
        }
    });
    Streak.Model = Model
})(Streak, window);
(function (Streak, window) {
    var _ = Streak._,
        Requester = Streak.Requester;
    var Collection = Streak.iframe.contentWindow.Array;
    _.extend(Collection.prototype, {
        purge: function (from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest)
        },
        purgeVal: function (val) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.purge(index);
                return true
            }
            return false
        },
        unique: function (idfunc) {
            var hash = {};
            var out = [];
            for (var i = 0, len = this.length; i < len; i++) {
                var id = this[i].toString();
                if (idfunc) id = idfunc(this[i]);
                if (!hash[id]) {
                    out.push(this[i]);
                    hash[id] = 1
                }
            }
            return out
        },
        init: function (options) {
            this.entityType = options.entityType;
            this.keyName = options.keyName;
            this.keyValue = options.keyValue;
            this.parent = options.parent;
            this.key = options.key;
            this.onlyUnique = options.onlyUnique;
            this.eventsActive = true;
            this.modelsAdded = {};
            this.makeModel = options.makeModel;
            this.refreshTimeout = null;
            this.eventCBs = {
                "add": [],
                "remove": [],
                "change": [],
                "collectionChange": []
            }
        },
        setTriggersActive: function (isActive) {
            this.eventsActive = isActive
        },
        bind: function (event, cb) {
            if (!this.eventCBs[event]) this.eventCBs[event] = [];
            this.eventCBs[event].push(cb)
        },
        trigger: function (event) {
            if (!this.eventCBs[event]) return;
            if (this.eventsActive) {
                var self = this;
                var args = _.toArray(arguments).slice(1);
                var cbs = _.clone(self.eventCBs[event]);
                for (var i = 0; i < cbs.length; i++) cbs[i](args.length > 0 ? args[0] : null, self)
            }
        },
        add: function (obj) {
            var m = this.makeModel(obj);
            this.addModel(m);
            return m
        },
        addModel: function (aModel, supress) {
            var self = this;
            var m = aModel;
            var shouldPush = true;
            if (this.onlyUnique) if (m.key && m.key()) {
                var obj = self.modelsAdded[m.key()];
                shouldPush = !obj
            } else shouldPush = this.indexOf(m) === -1;
            if (shouldPush) {
                this.push(m);
                if (m.key && m.key()) self.modelsAdded[m.key()] = m;
                this.trigger("add", m);
                if (!supress) {
                    this.trigger("change", m);
                    this.trigger("collectionChange", m)
                }
                if (this.onlyUnique) {
                    var oldKey = m.key();
                    m.bind("set", this.keyName, _.bind(function () {
                        if (oldKey) {
                            delete this.modelsAdded[oldKey];
                            oldKey = null
                        }
                        if (m.key()) {
                            var oldModel = this.modelsAdded[m.key()];
                            if (oldModel) this.remove(oldModel);
                            this.modelsAdded[m.key()] = m;
                            oldKey = m.key()
                        }
                    }, this))
                }
                m.bind("save", null, _.bind(function () {
                    this.trigger("change")
                }, this));
                m.bind("delete", null, _.bind(function () {
                    this.remove(m)
                }, this));
                m.bind("undelete", null, _.bind(function () {
                    this.refresh()
                }, this));
                m.bind("change", null, _.bind(function (property) {
                    this.trigger("modelChange", m, property)
                }, this))
            } else return m
        },
        remove: function (obj, supress) {
            if (!this.purgeVal(obj)) return;
            if (obj.key && obj.key() && this.modelsAdded[obj.key()]) this.modelsAdded[obj.key()] = null;
            this.trigger("remove", obj);
            obj.trigger("remove");
            if (!supress) {
                this.trigger("change");
                this.trigger("collectionChange")
            }
        },
        refresh: function (cb, forceChange) {
            var self = this;
            var changed = forceChange;
            if (!cb) cb = function () {};
            if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
            this.refreshTimeout = setTimeout(_.bind(function () {
                var after = _.after(2, function () {
                    if (changed) self.trigger("refreshed");
                    cb(changed)
                });
                if (this.parent) this.parent.refresh(function (isChanged) {
                    changed = isChanged || changed;
                    after()
                });
                else after();
                var params = {
                    entityType: this.entityType
                };
                if (this.keyName) params[this.keyName] = this.keyValue;
                Requester.get(params, _.bind(function (res) {
                    res = res || [];
                    var key = self.key;
                    var changed = false;
                    var added = [];
                    var deleted = [];
                    var newMap = {};
                    var i = 0;
                    for (i = 0; i < res.length; i++) {
                        var obj = res[i];
                        var m = this.modelsAdded[obj[key]];
                        if (m) {
                            if (m.collectionUpdate) m.collectionUpdate(obj)
                        } else if (m !== null) {
                            m = this.makeModel(obj);
                            added.push(m)
                        }
                        newMap[m.key()] = m
                    }
                    for (i = 0; i < self.length; i++) {
                        var model = self[i];
                        if (newMap[model.key()]);
                        else if (model.isFullySynced()) deleted.push(model)
                    }
                    if (added.length > 0 || deleted.length > 0) changed = true;
                    for (i = 0; i < deleted.length; i++) this.remove(deleted[i], true);
                    for (i = 0; i < added.length; i++) this.addModel(added[i], true);
                    if (changed) {
                        this.trigger("change");
                        this.trigger("collectionChange")
                    }
                    after()
                }, this))
            }, this), 100)
        }
    });
    Streak.Collection = Collection
})(Streak, window);
//IMT
(function (Streak, window) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Gmail = Streak.Gmail,
        Requester = Streak.Requester,
        HTML = Streak.HTML,
        Model = Streak.Model,
        Collection = Streak.Collection,
        Eventer = Streak.Eventer;
    var BentoBox = new Eventer;
    _.extend(BentoBox, {
        currentTime: null,
        Models: {},
        Modules: {},
        Widgets: {},
        isError: false,
        maxGetUserAttempts: 2,
        Constants: {
            SERVER: null,
            EMAIL_BLACK_LIST: ["gmail.com", "facebook.com", "aol.com", "yahoo.com", "hotmail.com", "att.net", "googlemail.com"],
            COLOR_LIST: ["RGB(99,99,48)", "IndianRed", "Salmon", "CornflowerBlue", "DodgerBlue", "LightSlateGray", "LightSteelBlue", "RGB(90,105,134)", "RGB(235,112,0)", "RGB(179,109,0)", "RGB(171,139,0)"]
        },
        user: null,
        userSettings: null,
        userEmail: null,
        _isReady: false,
        _readyFuncs: [],
        _isLoggedOutReady: false,
        _loggedOutReadyFuncs: [],
        _isLoaded: false,
        _loadedFuncs: [],
        init: function () {
            this.userEmail = Streak.userEmail;
            var self = this;
            var loadAfter = _.onceAfter(2, function () {
                self._runOnLoad()
            });
            self.Constants.SERVER = Streak.server;
            Gmail.onLoad(function () {
                Gmail.insertCss(Streak.getCombined("css", true));
                loadAfter()
            });
            this.getTheUser(1, loadAfter);
            this.bind("criticalError", function () {
                self.criticalError()
            });
            this.bind("newClientVersion", function () {
                self.newClientVersion()
            });
            this.bind("newExtVersion", function () {
                self.newExtVersion()
            });
            this.bind("noThirdPartyCookie", function () {
                self.noThirdPartyCookie()
            })
        },
        criticalError: function () {
            if (this._isReady) {
                this.teardown();
                this.establishConnection()
            } else this.teardown(BentoBox.Locale.getString("error_message_critical_title"), BentoBox.Locale.getString("error_message_critical_body"), BentoBox.Locale.getString("error_message_critical_action"), function () {
                location.reload()
            })
        },
        newClientVersion: function () {
            this.teardown(BentoBox.Locale.getString("error_message_clientversion_title"), BentoBox.Locale.getString("error_message_clientversion_body"), BentoBox.Locale.getString("error_message_clientversion_action"), function () {
                location.reload()
            })
        },
        newExtVersion: function () {
            this.teardown(BentoBox.Locale.getString("error_message_extversion_title"), BentoBox.Locale.getString("error_message_extversion_body"), BentoBox.Locale.getString("error_message_extversion_action"), "http://support.streak.com/customer/portal/articles/722076-streak-tells-me-i-need-to-update-the-extension-what-do-i-do-")
        },
        noThirdPartyCookie: function () {
            this.teardown("Third party cookies disabled", 'You have third party cookies disabled which prevents Streak from working properly. Please follow <b><a href="http://support.streak.com/customer/portal/articles/386931-streak-says-i-have-3rd-party-cookies-disabled-now-what-" target="_blank">these directions</a></b> to fix the problem')
        },
        establishConnection: function (attempt, delay) {
            var self = this;
            if (!attempt) attempt = 1;
            if (attempt === 1) Gmail.showNotice("Error communicating with Streak servers, retrying now...");
            this.connectionTest(function () {
                Gmail.hideNotice();
                self.reup()
            }, function () {
                attempt += 1;
                if (!delay) delay = 2E3;
                else delay = Math.min(delay * 2, 6E4);
                Gmail.showNotice("Streak: retrying in " + delay / 1E3 + " seconds");
                setTimeout(function () {
                    self.establishConnection(attempt, delay)
                }, delay)
            })
        },
        connectionTest: function (pass, fail) {
            var self = this;
            Requester.get({
                entityType: "User"
            }, function (res, xhr) {
                if (res && res.isOauthComplete) pass();
                else self.reset()
            }, function (res, xhr) {
                if (res && res.error === "user not logged in") self.reset();
                else fail()
            }, null, 10, true)
        },
        reset: function () {
            Gmail.hideNotice();
            this.reup();
            this.trigger("logged_out")
        },
        teardown: function (title, message, actionTitle, action) {
            var self = this;
            Gmail.onLoad(function () {
                self.UI.teardown();
                for (module in self.Modules) if (self.Modules[module].teardown) self.Modules[module].teardown();
                if (title && message) {
                    self.isError = true;
                    self.Modules.TopNav.showError(title, message, actionTitle, action)
                }
                self.Modules.TopNav.haltExecution();
                Gmail.teardown()
            })
        },
        reup: function () {
            var self = this;
            for (module in self.Modules) if (self.Modules[module].reup) self.Modules[module].reup();
            Gmail.reup();
            Gmail.detectViewChange({
                fragment: location.hash.substring(1)
            });
            self.trigger("reup")
        },
        destroy: function () {
            this.teardown();
            this.Modules.TopNav.destroy();
            Gmail.destroy();
            this.UI.destroy();
            undoErrorWrap()
        },
        ai: function (ai, cb) {
            Gmail.showNotice("Transforming... be patient");
            var self = this;
            this.user = null;
            self.teardown();
            Streak.ai = ai;
            Streak.userEmail = ai;
            this.userEmail = Streak.userEmail;
            this.UserSettings.active = false;
            Messenger.storeData("useremail", Streak.userEmail);
            BentoBox.Data._inited = false;
            this.getTheUser(0, function () {
                BentoBox.Data.init(function () {
                    self.UserSettings.init();
                    self.reup();
                    Gmail.hideNotice(500);
                    if (cb) cb()
                })
            })
        },
        aiExplore: function (delay) {
            var self = this;
            delay = delay || 100;
            setTimeout(function () {
                if (!self.exploreAddresses || self.exploreAddresses.length === 0) Requester.get({
                    msgMethod: "GET",
                    msgUrl: "/geckoboard",
                    statType: "recentEmailAddresses"
                }, function (res) {
                    if (res && res.length > 0) {
                        self.exploreAddresses = res.last(50).randomize();
                        self.exploreAccount(self.exploreAddresses.pop())
                    }
                }, $.noop, null, 0, true);
                else self.exploreAccount(self.exploreAddresses.pop())
            }, delay)
        },
        exploreAccount: function (email) {
            var self = this;
            this.ai(email, function () {
                goToHeadsUp()
            });

            function goToHeadsUp() {
                var delay = 0;
                if (BentoBox.Modules.HeadsUp.el.is(":FastVisible")) delay = 1E4;
                setTimeout(goToPipeline, delay)
            }
            function goToPipeline() {
                try {
                    var pipelines = self.Data.getAllPipelines();
                    if (pipelines.length > 0) {
                        var pipeline = _.toArray(pipelines).randomize().first();
                        self.UI.setURL(pipeline.link());
                        setTimeout(goToBox, 2E4)
                    } else self.aiExplore()
                } catch (err) {
                    self.aiExplore(1E4)
                }
            }
            function goToBox() {
                try {
                    var boxes = self.Modules.PipelineView.cached[Gmail.getConversationId()].spreadsheet.el.find(".boxRow:FastVisible");
                    if (boxes.length > 0) {
                        $(Streak._.toArray(boxes).randomize().first()).find("[role=link]").click();
                        setTimeout(goToCompose, 12E3)
                    } else self.aiExplore(1E4)
                } catch (err) {
                    self.aiExplore(1E4)
                }
            }

            function goToCompose() {
                self.UI.setURL("compose");
                var interval = setInterval(function () {
                    try {
                        if (self.Modules.Snippets.buttons.length > 0) if (self.Modules.Snippets.buttons[0].el.is(":FastVisible(noCompute)")) {
                            clearInterval(interval);
                            self.Modules.Snippets.buttons[0].el.find(".snippetsButton").click();
                            finish()
                        }
                    } catch (err) {
                        clearInterval(interval);
                        finish()
                    }
                })
            }
            function finish() {
                setTimeout(function () {
                    Gmail.getDiscardButton().simulateRawClick();
                    self.aiExplore()
                }, 5E3)
            }
        },
        getTheUser: function (attempt, cb) {
            var self = this;
            Requester.get({
                entityType: "User"
            }, function (res, xhr) {
                self.handleGetUser(res, xhr, attempt, cb)
            }, function (res, xhr) {
                self.handleGetUser(res, xhr, attempt, cb)
            }, null, 1, true)
        },
        handleGetUser: function (res, xhr, attempt, cb) {
            var self = this;
            if (res) {
                if (res.error);
                else self.setUser(res);
                if (attempt > 1) self.logGetUserError(attempt)
            }
            if (self.user && self.user.get("isOauthComplete") && self.Data) {
                cb();
                return
            } else {
                if (xhr.status !== 200) if (res && res.error && res.error === "user not logged in");
                else {
                    if (attempt < self.maxGetUserAttempts) setTimeout(function () {
                        self.getTheUser(attempt + 1, cb)
                    }, 1E3);
                    else {
                        self.logGetUserError(attempt, res);
                        cb()
                    }
                    return
                }
                if (Messenger.getData("isSafari")) {
                    if (cb) cb();
                    return
                }
                var params = {
                    msgMethod: "GET",
                    msgUrl: "/ajaxcalls/setRandomCookie"
                };
                Requester.makeCall(params, function (res) {
                    if (res) {
                        params.msgUrl = "/ajaxcalls/checkRandomCookie";
                        for (value in res) params[value] = res[value];
                        Requester.makeCall(params, function (res2) {
                            if (res2) if (res2.success);
                            else self.noThirdPartyCookie();
                            else self.logGetUserCookieError(xhr);
                            if (cb) cb()
                        }, function (res2, xhr) {
                            self.logGetUserCookieError(xhr);
                            if (cb) cb()
                        })
                    } else {
                        self.logGetUserCookieError(xhr);
                        if (cb) cb()
                    }
                }, function (res, xhr) {
                    self.logGetUserCookieError(xhr);
                    if (cb) cb()
                })
            }
        },
        logGetUserError: function (attempts, res) {
            var msg = "Server threw an error getting user";
            msg += "\n attempt: " + attempts;
            if (res && res.error) msg += "\nServer msg: " + res.error;
            this.logError(msg);
            this.trigger("criticalError");
            this.isError = true
        },
        logGetUserCookieError: function (xhr) {
            var msg = "Error in determining 3rd party cookies";
            msg += "\n status: " + xhr.status;
            msg += "\n response: " + JSON.stringify(xhr);
            this.logError(msg);
            this.isError = true;
            this.trigger("criticalError")
        },
        onLoad: function (cb) {
            if (this._isLoaded) cb();
            else this._loadedFuncs.push(cb)
        },
        _runOnLoad: function () {
            var self = this;
            this._isLoaded = true;
            var after = _.onceAfter(this._loadedFuncs.length, function () {
                self.load()
            });
            _(this._loadedFuncs).chain().sortBy(function (cb) {
                return cb.priority || 100
            }).each(function (cb) {
                try {
                    cb(after)
                } catch (err) {
                    BentoBox.logError("error in onLoad", err);
                    after()
                }
            })
        },
        load: function () {
            if (this.user && this.user.get("isOauthComplete")) {
                this.trigger("userReady");
                this._runReady()
            } else this._runLoggedOutReady();
            Gmail.detectViewChange({
                fragment: location.hash.substring(1)
            })
        },
        ready: function (cb, forLoggedOut) {
            if (forLoggedOut) if (this._isLoggedOutReady) cb($.noop);
            else this._loggedOutReadyFuncs.push(cb);
            else if (this._isReady) cb($.noop);
            else this._readyFuncs.push(cb)
        },
        _runReady: function () {
            var self = this;
            this.Data.init(function () {
                var once = _.once(function () {
                    self._isReady = true;
                    Gmail.trigger("ready");
                    self.trigger("allready")
                });
                var after = _.after(self._readyFuncs.length, function () {
                    once()
                });
                _.each(self._readyFuncs, function (cb) {
                    try {
                        cb(after)
                    } catch (err) {
                        BentoBox.logError("error in runReady", err);
                        after()
                    }
                })
            })
        },
        _runLoggedOutReady: function () {
            this._isLoggedOutReady = true;
            _.each(this._loggedOutReadyFuncs, function (cb) {
                try {
                    cb()
                } catch (err) {
                    BentoBox.logError("error in loggedOutReady", err)
                }
            })
        },
        setUser: function (user) {
            this.user = this.Models.User.create(user)
        },
        getUser: function () {
            return this.user
        },
        getUserSettings: function () {
            return this.userSettings
        },
        logError: function (message, err) {
            if (!message && !err) return;
            if (err) {
                if (err.msg) message += "\n msg: " + err.msg;
                message += "\n stack: " + (err.stack || err)
            }
            if (this.userEmail) message += "\n user: " + this.userEmail;
            message += "\n clientVersion: " + Streak.clientVersion;
            message += "\n extVersion: " + Streak.extVersion;
            message += "\n url: " + location.toString();
            console.log(message);
            Requester.error(message)
        },
        logAjaxError: function (msg, res, xhr) {
            if (xhr) msg += "\n status: " + xhr.status;
            if (res && res.error) msg += "\n server msg: " + res.error;
            if (res && res.details) msg += "\n server details: " + res.details;
            if (!res && xhr && xhr.responseText) msg += "\n server response: " + xhr.responseText;
            BentoBox.logError(msg)
        }
    });
    Streak.userEmail = GLOBALS[10];
    if (!Streak.userEmail || !Streak.userEmail.isValidEmail()) {
        Messenger.storeData("useremail", "broken.noemail@streak.com");
        return
    } else Messenger.storeData("useremail", Streak.userEmail);
    Streak.BentoBox = BentoBox;
    var after = _.after(2, function () {
        BentoBox.init()
    });
    Streak.HTML.ready(function () {
        after()
    });
    Streak.Locale.ready(function () {
        after()
    });
    Streak.Locale.init();
    Streak.HTML.init();
    BentoBox.Locale = Streak.Locale;
    var stackDetector = "mailfoogae.appspot.com";
    var getErrorWrapped = function (func) {
            return function () {
                try {
                    func.apply(this, arguments)
                } catch (err) {
                    if (err.stack) {
                        var parts = err.stack.split("\n").splice(1);
                        if (parts && parts.length > 0 && _.all(parts, function (part) {
                            return part.indexOf(stackDetector) > -1
                        })) {
                            var msg = "";
                            if (err.name) msg += err.name + ": ";
                            if (err.message) msg += err.message;
                            if (msg.length === 0) msg = "event listener error";
                            BentoBox.logError(msg, err)
                        }
                    }
                    throw err;
                }
            }
        };
    var wrappedFunctions = [];
    var errorWrap = function (object, oldFunctionName, functionArgIndex) {
            var streakFunctionName = "_streak" + oldFunctionName;
            wrappedFunctions.push({
                object: object,
                originalFunctionName: oldFunctionName,
                streakFunctionName: streakFunctionName
            });
            object[streakFunctionName] = object[oldFunctionName];
            object[oldFunctionName] = function () {
                var args = _.toArray(arguments);
                var func = args[functionArgIndex];
                if (func && func.apply) args[functionArgIndex] = getErrorWrapped.call(this, func).bind(this);
                return this[streakFunctionName].apply(this, args)
            }
        };
    var undoErrorWrap = function () {
            for (var i = 0; i < wrappedFunctions.length; i++) {
                var obj = wrappedFunctions[i].object;
                var original = wrappedFunctions[i].originalFunctionName;
                var streakFunctionName = wrappedFunctions[i].streakFunctionName;
                obj[original] = obj[streakFunctionName];
                delete obj[streakFunctionName]
            }
        };
    errorWrap(window.Node.prototype, "addEventListener", 1);
    errorWrap(window, "setTimeout", 0)
})(Streak, window);
//Begin Models

(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        Collection = Streak.Collection,
        BB = Streak.BentoBox;
    var Pipeline = function (data) {
            Model.call(this, data);
            this.bind("set", "stages", _.bind(function () {
                this.trigger("stageChange")
            }, this));
            this.bind("set", "stageOrder", _.bind(function () {
                this.trigger("stageChange")
            }, this))
        };
    Pipeline.prototype = Object.create(Model.prototype);
    _.extend(Pipeline.prototype, {
        keyName: "workflowKey",
        nameProperty: "friendlyName",
        entityType: "Workflow",
        typeName: "pipeline",
        createProperties: ["friendlyName", "stageNames", "fieldNames", "fieldTypes"],
        processObj: function (obj) {
            var fields = obj.fields;
            var newFields = [];
            if (fields) {
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    field.workflowKey = obj.workflowKey;
                    newFields.push(BB.Models.PipelineField.create(field))
                }
                obj.fields = newFields
            }
            var newStages = {};
            if (obj.stageOrder) {
                var stages = obj.stages;
                for (var i = 0; i < obj.stageOrder.length; i++) {
                    var stageKey = obj.stageOrder[i];
                    var aStage = stages[stageKey];
                    if (aStage) {
                        var stage = BB.Models.Stage.create(_.extend(stages[stageKey], {
                            workflowKey: obj.workflowKey
                        }));
                        newStages[stageKey] = stage
                    }
                }
            }
            obj.stages = newStages;
            obj.stageNames = null;
            return obj
        },
        updateMap: {
            fields: function (newObj) {
                var newFields = newObj.fields;
                var oldFields = this.obj.fields;
                var fieldsAdded = false;
                var updated = false;
                if (newFields.length === oldFields.length) for (var i = 0; i < newFields.length; i++) {
                    var fieldKey = newFields[i].key();
                    var field = oldFields[i];
                    if (field && field.key() === fieldKey) {
                        if (field.displayName() !== newFields[i].displayName()) {
                            var isDirtyBlocked = field.set("name", newFields[i].displayName(), true);
                            if (!isDirtyBlocked) updated = true
                        }
                        if (field.get("workflowKey") !== newFields[i].get("workflowKey")) {
                            field.set("workflowKey", newFields[i].get("workflowKey"));
                            updated = true
                        }
                    } else {
                        updated = true;
                        fieldsAdded = true;
                        break
                    }
                } else fieldsAdded = true;
                if (fieldsAdded) {
                    updated = true;
                    this.set("fields", newObj.fields)
                }
                return updated
            },
            "stages": function (newObj) {
                var oldStages = _.pluckPlus(this.obj.stages, function (stage) {
                    return stage.get("name")
                });
                var newStages = _.pluckPlus(newObj.stages, function (stage) {
                    return stage.get("name")
                });
                if (!JSON.compare(oldStages, newStages) || !JSON.compare(this.obj.stageOrder, newObj.stageOrder)) {
                    var newStages = {};
                    for (var i = 0; i < newObj.stageOrder.length; i++) {
                        var stageKey = newObj.stageOrder[i];
                        if (this.obj.stages[stageKey]) {
                            newStages[stageKey] = this.obj.stages[stageKey];
                            newStages[stageKey].set("workflowKey", this.key());
                            if (this.obj.stages[stageKey].displayName() !== newObj.stages[stageKey].displayName()) newStages[stageKey].set("name", newObj.stages[stageKey].displayName())
                        } else newStages[stageKey] = newObj.stages[stageKey]
                    }
                    this.set("stages", newStages)
                }
            }
        },
        addStages: function (stageNames, cb) {
            if (stageNames && stageNames.length > 0) {
                var self = this;
                var stageName = stageNames.shift();
                this.addStage(stageName, _.bind(function () {
                    this.addStages(stageNames, cb)
                }, this))
            } else cb()
        },
        addStage: function (stageName, cb) {
            var stageModel = BB.Models.Stage.create({
                name: stageName,
                workflowKey: this.key()
            });
            stageModel.save(_.bind(function () {
                this.refresh(function () {
                    if (cb) cb()
                })
            }, this))
        },
        addFields: function (fields, cb) {
            if (fields && fields.length > 0) {
                var self = this;
                var field = fields.shift();
                this.addField(field.name, field.type, _.bind(function () {
                    this.addFields(fields, cb)
                }, this))
            } else cb()
        },
        addField: function (name, type, cb) {
            var field = BB.Models.PipelineField.create({
                name: name,
                type: type,
                workflowKey: this.key()
            });
            field.save(_.bind(function () {
                this.refresh(function () {
                    if (cb) cb()
                })
            }, this))
        },
        getField: function (fieldKey) {
            return _.find(this.get("fields"), function (aField) {
                return aField.key() === fieldKey
            })
        },
        getStage: function (stageKey) {
            return this.get("stages")[stageKey]
        },
        getStageByName: function (stageName) {
            return _.find(this.get("stages"), function (stage) {
                return stage.displayName() === stageName
            })
        },
        getStageNames: function () {
            var stages = [];
            for (var i = 0; i < this.get("stageOrder").length; i++) stages.push(this.getStage(this.get("stageOrder")[i]).displayName());
            return stages
        },
        getStages: function () {
            var stages = [];
            for (var i = 0; i < this.get("stageOrder").length; i++) stages.push(this.getStage(this.get("stageOrder")[i]));
            return stages
        },
        getStagesAsList: function () {
            return this.getStages().map(function (stage) {
                return {
                    text: stage.displayName(),
                    value: stage.key()
                }
            })
        }
    });
    Pipeline.createCollection = function () {
        var c = new Collection;
        c.init({
            entityType: "Workflow",
            key: "workflowKey",
            makeModel: function (obj) {
                return Pipeline.create(obj)
            }
        });
        return c
    };
    Pipeline.create = function (data) {
        return new Pipeline(data)
    };
    BB.Models.Pipeline = Pipeline
})(Streak);
(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        Collection = Streak.Collection,
        BB = Streak.BentoBox;
    var fieldMap = {};
    var Box = function (data) {
            Model.call(this, data);
            var pipeline = BB.Data.getPipeline(data.workflowKey);
            pipeline.bind("set", "fields", this.resetBoxFields.bind(this));
            var self = this;
            if (this.key().length > 0) {
                fieldMap[self.key()] = [];
                this.processFields(this.obj);
                this.bindFields()
            }
            this.bind("set", "caseKey", function () {
                if (!fieldMap[self.key()]) {
                    fieldMap[self.key()] = [];
                    self.processFields(self.obj);
                    self.bindFields()
                }
            })
        };
    Box.prototype = Object.create(Model.prototype);
    _.extend(Box.prototype, {
        keyName: "caseKey",
        nameProperty: "name",
        entityType: "Case",
        typeName: "box",
        createProperties: ["workflowKey", "name", "stageKey"],
        processFields: function (obj) {
            if (obj.workflowKey) {
                var pipeline = BB.Data.getPipeline(obj.workflowKey);
                var pipeFieldKeys = [];
                for (var i = 0; i < pipeline.get("fields").length; i++) pipeFieldKeys.push(pipeline.get("fields")[i].key());
                var newFields = [];
                var fields = obj.fields;
                if (fields) for (var fieldKey in fields) if (pipeline.getField(fieldKey)) {
                    pipeFieldKeys.removeVal(fieldKey);
                    currField = BB.Models.BoxField.create({
                        key: fieldKey,
                        caseKey: obj.caseKey,
                        value: fields[fieldKey] || "",
                        type: pipeline.getField(fieldKey).get("type")
                    });
                    newFields.push(currField)
                }
                for (var i = 0; i < pipeFieldKeys.length; i++) newFields.push(BB.Models.BoxField.create({
                    key: pipeFieldKeys[i],
                    caseKey: obj.caseKey,
                    value: "",
                    type: pipeline.getField(pipeFieldKeys[i]).get("type")
                }));
                fieldMap[this.key()].length = 0;
                for (var i = 0; i < newFields.length; i++) fieldMap[this.key()].push(newFields[i])
            }
        },
        resetBoxFields: function () {
            if (this.key().length === 0) return;
            var newPipeFields = this.getPipeline().get("fields");
            var newBoxFields = [];
            for (var i = 0; i < newPipeFields.length; i++) {
                var fieldKey = newPipeFields[i].key();
                var currField = this.getField(fieldKey);
                if (!currField) newBoxFields.push(BB.Models.BoxField.create({
                    key: fieldKey,
                    caseKey: this.key(),
                    type: newPipeFields[i].get("type")
                }));
                else newBoxFields.push(currField)
            }
            if (!fieldMap[this.key()]) fieldMap[this.key()] = [];
            fieldMap[this.key()].length = 0;
            for (var i = 0; i < newBoxFields.length; i++) fieldMap[this.key()].push(newBoxFields[i])
        },
        updateMap: {
            fields: function (newObj) {
                var newFields = newObj.fields;
                var fieldsAdded = false;
                var updated = false;
                for (var fieldKey in newFields) {
                    var field = this.getField(fieldKey);
                    if (field) {
                        field.set("caseKey", this.obj.caseKey);
                        if (JSON.stringify(field.displayName()) !== JSON.stringify(newFields[fieldKey])) updated = field.syncedSet("value", newFields[fieldKey])
                    } else {
                        updated = true;
                        fieldsAdded = true;
                        break
                    }
                }
                if (fieldsAdded) this.resetBoxFields();
                return updated
            }
        },
        getField: function (fieldKey) {
            if (!fieldMap[this.key()]) return null;
            return _.find(fieldMap[this.key()], function (field) {
                return field.key() === fieldKey
            })
        },
        getFields: function () {
            return fieldMap[this.key()]
        },
        bindFields: function () {
            var fields = fieldMap[this.key()];
            for (var i = 0; i < fields.length; i++) {
                fields[i].bind("set", "value", function () {
                    this.trigger("change")
                }.bind(this), this.key());
                fields[i].bind("save", null, function () {
                    this.trigger("save")
                }.bind(this), this.key())
            }
        },
        getStage: function () {
            var pipeline = this.getPipeline();
            if (pipeline) return pipeline.getStage(this.get("stageKey"));
            return null
        },
        getStageName: function () {
            return this.getStage().displayName()
        },
        getPipeline: function () {
            return BB.Data.getPipeline(this.get("workflowKey"))
        }
    });
    Box.create = function (data) {
        return new Box(data)
    };
    Box.createCollection = function (pipelineKey) {
        var c = new Collection;
        c.init({
            entityType: "Case",
            key: "caseKey",
            keyName: "workflowKey",
            keyValue: pipelineKey,
            makeModel: function (obj) {
                return BB.Models.Box.create(obj)
            },
            onlyUnique: true
        });
        return c
    };
    BB.Models.Box = Box
})(Streak);
(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        Collection = Streak.Collection,
        BB = Streak.BentoBox;
    var GmailThread = function (data) {
            Model.call(this, data)
        };
    GmailThread.prototype = Object.create(Model.prototype);
    _.extend(GmailThread.prototype, {
        keyName: "gmailThreadKey",
        entityType: "GmailThread",
        typeName: "thread",
        createProperties: ["caseKey"]
    });
    GmailThread.create = function (data) {
        return new GmailThread(data)
    };
    GmailThread.createCollection = function (caseKey) {
        var c = new Collection;
        c.init({
            entityType: "GmailThread",
            keyName: caseKey ? "caseKey" : null,
            keyValue: caseKey ? caseKey : null,
            key: "gmailThreadKey",
            makeModel: function (obj) {
                return GmailThread.create(obj)
            }
        });
        return c
    };
    BB.Models.GmailThread = GmailThread
})(Streak);
(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        Collection = Streak.Collection,
        BB = Streak.BentoBox,
        Gmail = Streak.Gmail;
    var SendLater = function (data) {
            Model.call(this, data)
        };
    SendLater.prototype = Object.create(Model.prototype);
    _.extend(SendLater.prototype, {
        keyName: "sendLaterKey",
        entityType: "SendLater",
        typeName: "sendLater",
        createProperties: ["gmailDraftId", "sendDate", "subject", "sendLaterType"],
        link: function () {
            return Gmail.Constants.Drafts + "/" + this.get("gmailDraftId")
        }
    });
    SendLater.create = function (data) {
        return new SendLater(data)
    };
    SendLater.createCollection = function (caseKey) {
        var c = new Collection;
        c.init({
            entityType: "SendLater",
            key: "sendLaterKey",
            onlyUnique: true,
            makeModel: function (obj) {
                return SendLater.create(obj)
            }
        });
        return c
    };
    BB.Models.SendLater = SendLater
})(Streak);
(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        Collection = Streak.Collection,
        BB = Streak.BentoBox;
    var Stage = function (data) {
            Model.call(this, data);
            var oldStageName = data.name;
            this.bind("set", "name", _.bind(function () {
                var pipeline = BB.Data.getPipeline(this.obj.workflowKey);
                if (pipeline) pipeline.trigger("stageChange")
            }, this));
            this.bind("save", null, _.bind(function () {
                oldStageName = this.get("name")
            }, this));
            this.bind("saveRejected", null, _.bind(function () {
                this.set("name", oldStageName)
            }, this))
        };
    Stage.prototype = Object.create(Model.prototype);
    _.extend(Stage.prototype, {
        keyName: "key",
        entityType: "Stage",
        createProperties: ["name", "workflowKey"],
        modifyProperties: ["key", "workflowKey"],
        nameProperty: "name",
        preSaveFunction: function () {
            var pipeline = BB.Data.getPipeline(this.obj.workflowKey);
            if (pipeline) {
                var existing = pipeline.getStageByName(this.displayName());
                if (existing) if (existing.key() !== this.key()) {
                    Streak.Gmail.showNotice(BB.Locale.getString("same_stage_name"), 5E3);
                    return false
                }
                return true
            }
            return false
        },
        preDeleteFunction: function () {
            var pipeline = BB.Data.getPipeline(this.get("workflowKey"));
            if (!pipeline) return false;
            var boxes = BB.Data.getPipelineBoxes(this.obj.workflowKey);
            if (boxes && boxes.length > 0) boxes = BB.Data.getPipelineBoxes(this.obj.workflowKey).filter(_.bind(function (box) {
                return box.get("stageKey") === this.key()
            }, this));
            if (boxes && boxes.length > 0) {
                Streak.Gmail.showNotice(BB.Locale.getString("stage_empty"), 5E3);
                return false
            }
            return true
        }
    });
    Stage.create = function (data) {
        return new Stage(data)
    };
    BB.Models.Stage = Stage
})(Streak);
(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        Collection = Streak.Collection,
        BB = Streak.BentoBox;
    var Reminder = function (data) {
            Model.call(this, data)
        };
    Reminder.prototype = Object.create(Model.prototype);
    _.extend(Reminder.prototype, {
        keyName: "reminderKey",
        entityType: "Reminder",
        createProperties: ["remindDate", "caseKey", "workflowKey", "message", "remindFollowers"]
    });
    Reminder.create = function (data) {
        return new Reminder(data)
    };
    Reminder.createCollection = function (caseKey) {
        var c = new Collection;
        c.init({
            makeModel: function (obj) {
                return Reminder.create(obj)
            }
        });
        return c
    };
    BB.Models.Reminder = Reminder
})(Streak);
(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        BB = Streak.BentoBox;
    var PipelineField = function (data) {
            Model.call(this, data)
        };
    PipelineField.prototype = Object.create(Model.prototype);
    _.extend(PipelineField.prototype, {
        keyName: "key",
        entityType: "Field",
        createProperties: ["name", "type", "workflowKey"],
        modifyProperties: ["key", "workflowKey"],
        nameProperty: "name"
    });
    PipelineField.create = function (data) {
        return new PipelineField(data)
    };
    BB.Models.PipelineField = PipelineField
})(Streak);
(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        BB = Streak.BentoBox;
    var BoxField = function (data) {
            Model.call(this, data);
            this.bind("set", "value", function () {
                this.setProcessedValue()
            }.bind(this));
            this.setProcessedValue()
        };
    BoxField.prototype = Object.create(Model.prototype);
    _.extend(BoxField.prototype, {
        keyName: "key",
        entityType: "Field",
        createProperties: ["caseKey"],
        modifyProperties: ["key", "caseKey"],
        nameProperty: "value",
        updateMap: {
            "value": function (newObj) {
                var currValue = this.getProcessedValue();
                var newValue;
                switch (this.get("type")) {
                case "TEXT_INPUT":
                    newValue = newObj.value.replace(/<br\s*\/?>|<div>/img, "\n").stripTags().replace("&nbsp;", " ");
                    break;
                case "DATE":
                    newValue = newObj.value;
                    break;
                case "PERSON":
                    try {
                        var list = JSON.parse(newObj.value);
                        var arr = [];
                        for (var i = 0; i < list.length; i++) arr.push(list[i].displayName);
                        newValue = arr.join(",")
                    } catch (err) {
                        newValue = ""
                    }
                    break
                }
                if (JSON.compare(currValue, newValue)) {
                    this.set("value", newObj.value);
                    return true
                }
            }
        },
        getProcessedValue: function () {
            return this.processedValue
        },
        setProcessedValue: function () {
            switch (this.get("type")) {
            case "TEXT_INPUT":
                this.processedValue = this.displayName().replace(/<br\s*\/?>|<div>/img, "\n").stripTags().replace("&nbsp;", " ");
                break;
            case "DATE":
                this.processedValue = this.displayName();
                break;
            case "PERSON":
                try {
                    var list = JSON.parse(this.displayName());
                    var arr = [];
                    for (var i = 0; i < list.length; i++) arr.push(list[i].displayName);
                    this.processedValue = arr.join(",")
                } catch (err) {
                    this.processedValue = ""
                }
                break
            }
        }
    });
    BoxField.create = function (data) {
        return new BoxField(data)
    };
    BB.Models.BoxField = BoxField
})(Streak);
(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        Collection = Streak.Collection,
        BB = Streak.BentoBox;
    var Snippet = function (data) {
            Model.call(this, data)
        };
    Snippet.prototype = Object.create(Model.prototype);
    _.extend(Snippet.prototype, {
        keyName: "snippetKey",
        entityType: "Snippet",
        typeName: "snippet",
        createProperties: ["snippetName", "snippetText", "snippetKeyShortcut", "workflowKey", "type"],
        requiredCreate: ["snippetName", "snippetText", "snippetKeyShortcut"],
        nameProperty: "snippetName"
    });
    Snippet.create = function (data) {
        return new Snippet(data)
    };
    Snippet.createCollection = function (caseKey) {
        var c = new Collection;
        c.init({
            entityType: "Snippet",
            key: "snippetKey",
            onlyUnique: true,
            makeModel: function (obj) {
                return Snippet.create(obj)
            }
        });
        return c
    };
    BB.Models.Snippet = Snippet
})(Streak);
(function (Streak) {
    var _ = Streak._,
        Date = Streak.Date,
        Requester = Streak.Requester,
        Model = Streak.Model,
        Collection = Streak.Collection,
        BB = Streak.BentoBox;
    var User = function (data) {
            Model.call(this, data)
        };
    User.prototype = Object.create(Model.prototype);
    _.extend(User.prototype, {
        entityType: "User",
        keyName: "userKey",
        nameProperty: "displayName"
    });
    User.create = function (data) {
        return new User(data)
    };
    BB.Models.User = User
})(Streak);
//End Models
/*
//Start BB Setup
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Date = Streak.Date,
        Gmail = Streak.Gmail,
        HTML = Streak.HTML,
        BB = Streak.BentoBox;
    var globalActive = {
        "movingBoxes": true
    };
    var adminActive = {
        "movingBoxes": true
    };
    var adminEmails = ["omar@streak.com", "support@streak.com", "oismail@gmail.com", "aleem@streak.com", "aleem.mawani@gmail.com"];
    BB.ActiveFeatures = {
        init: function (cb) {
            cb()
        },
        isActive: function (feature) {
            var isActive = globalActive[feature];
            if (!isActive && this.isAdmin()) isActive = adminActive[feature];
            return isActive
        },
        isAdmin: function () {
            return adminEmails.indexOf(BB.getUser().get("email")) > -1
        }
    };
    BB.onLoad(function (cb) {
        BB.ActiveFeatures.init(cb)
    })
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Eventer = Streak.Eventer,
        Gmail = Streak.Gmail,
        HTML = Streak.HTML,
        BB = Streak.BentoBox;
    BB.BentoTips = Eventer.create({
        _bentoTipTemplate: null,
        register: function (el, name, text, dir, force, dontSave, nextEl, hover) {
            var self = this,
                cIndex = -1,
                shouldShow = true,
                user = BB.getUser();
            this.ready(function () {
                if (user) if (user.get("helpTipNames")) cIndex = user.get("helpTipNames").indexOf(name);
                else user.set("helpTipNames", []);
                else if (localStorage["helpTipNames"]) cIndex = localStorage["helpTipNames"].indexOf(name);
                shouldShow = cIndex == -1;
                if (shouldShow || force) {
                    var tip = $(self._bentoTipTemplate({
                        tip: text
                    }));
                    tip.insertAfter(el).hide().attr("id", "tipid_" + name);
                    if (!nextEl) $(".next_a", tip).hide();
                    if (hover) $(".dismiss", tip).hide();
                    var options = {
                        body: Gmail.elements.body,
                        deltaDirection: dir,
                        calculateOnShow: true,
                        delayHide: 0,
                        postHide: $.noop
                    };
                    if (!hover) {
                        el.bind("tipstart", function (e) {
                            if (user && !dontSave) {
                                if (cIndex == -1) user.get("helpTipNames").push(name);
                                user.save($.noop, 0, true)
                            } else if (!user && !dontSave) if (cIndex == -1) localStorage["helpTipNames"] = localStorage["helpTipNames"] + "|" + name
                        });
                        $(".dismiss_a", tip).click(function (e) {
                            el.trigger("tipend");
                            e.stopPropagation()
                        });
                        $(".next_a", tip).click(function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            el.trigger("tipend");
                            if (nextEl) nextEl.trigger("tipstart")
                        });
                        options.bindShow = "tipstart";
                        options.bindHide = "tipend";
                        options.delayHide = 100;
                        options.postHide = function () {
                            el.removeBubbletip();
                            el.unbind("tipstart")
                        };
                        Gmail.elements.body.click(function (e) {
                            el.trigger("tipend")
                        })
                    }
                    el.bubbletip(tip, options);
                    el.data("tip", tip);
                    return tip
                }
            })
        },
        init: function (cb) {
            if (!this._bentoTipTemplate) {
                this._bentoTipTemplate = HTML.get("bentotips");
                if (cb) cb();
                this.trigger("ready")
            }
        }
    });
    BB.onLoad(function (cb) {
        BB.BentoTips.init(cb)
    })
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        BB = Streak.BentoBox;
    BB.Cursor = {
        defaults: {
            selectedClass: "selected",
            selectFunc: $.noop,
            highlightFunc: $.noop,
            dimensions: 1,
            highlightOnHover: false,
            highlightOnClick: false,
            rollOver: false,
            input: null,
            noScroll: false,
            scrollStop: null,
            positionChangeFunc: $.noop,
            textSearch: false,
            aggressiveInputCapture: false
        },
        init: function (cb) {
            cb()
        },
        create: function (opts) {
            var options = {};
            $.extend(options, this.defaults, opts);
            return new this.impl(options)
        },
        impl: function (options) {
            var position = null,
                dataset = null,
                currentEl = null,
                isPaused = false,
                initialize = function (dontSetPosition) {
                    if (dontSetPosition && position) if (options.dimensions < 2) {
                        if (position[0] >= dataset.length) position[0] = dataset.length - 1
                    } else try {
                        if (position[0] >= dataset.length) position[0] = dataset.length - 1;
                        else if (position[1] >= dataset[position[0]].length) position[1] = dataset[position[0]].length - 1
                    } catch (err) {
                        position = getZeroPosition()
                    } else position = getZeroPosition();
                    if (options.dimensions === 1) for (var i = 0; i < dataset.length; i++) setupElement($(dataset[i]), [i]);
                    else if (options.dimensions === 2) for (var i = 0; i < dataset.length; i++) for (var j = 0; j < dataset[i].length; j++) {
                        var el = dataset[i][j];
                        el.setAttribute("cursorPosition", i + "," + j)
                    }
                    updateDisplay()
                },
                setupElement = function (el, pos) {
                    el.unbind(".bbCursor");
                    if (options.highlightOnHover) el.bind("hover.bbCursor", function (e) {
                        if (e.type !== "mouseleave") {
                            position = pos;
                            updateDisplay(null, el, false, true)
                        }
                    });
                    if (options.highlightOnClick) el.bind("click.bbCursor", function (e) {
                        updateDisplay(pos, el)
                    })
                },
                resetPosition = function () {
                    position = getZeroPosition()
                },
                get = function (pos) {
                    if (!dataset) return null;
                    var subset = dataset;
                    for (var i = 0; i < pos.length; i++) subset = subset[pos[i]];
                    if (pos.length === options.dimensions) return $(subset);
                    else return subset
                },
                getZeroPosition = function () {
                    var pos = new Array(options.dimensions);
                    for (var i = 0; i < options.dimensions; i++) pos[i] = 0;
                    return pos
                },
                updatePosition = function (direction, axis) {
                    if (!axis) axis = 0;
                    if (!dataset) return;
                    var subset = dataset;
                    if (!position) resetPosition();
                    for (var i = 0; i < axis; i++) subset = subset[position[i]];
                    if (direction === "up") if (position[axis] - 1 < 0) {
                        if (options.rollOver) position[axis] = subset.length - 1
                    } else {
                        position[axis] = position[axis] - 1;
                        if (options.dimensions > 1 && axis === 1) {
                            var set = get(position.first(1));
                            if (position[axis] >= set.length) position[axis] = set.length - 2
                        }
                    } else if (direction === "down") if (position[axis] + 1 >= subset.length) {
                        if (options.rollOver) position[axis] = 0
                    } else position[axis] = position[axis] + 1;
                    updateDisplay(position)
                },
                moveToBeginning = function (axis) {
                    if (axis === 0) position[0] = 0;
                    else position[axis] = 0;
                    updateDisplay(position)
                },
                moveToEnd = function (axis) {
                    if (axis === 0) position[0] = dataset.length - 1;
                    else position[axis] = get(position.first(axis)).length - 1;
                    updateDisplay(position)
                },
                updateDisplay = function (pos, el, noTrigger, noScroll) {
                    options.positionChangeFunc();
                    if (pos) position = pos;
                    var dpos = _.clone(position);
                    if (options.dimensions > 1) for (var i = 1; i < options.dimensions; i++) {
                        var sset = get(dpos.first(i));
                        if (dpos[i] >= sset.length) dpos[i] = sset.length - 1
                    }
                    if (!el) el = get(dpos);
                    unfocus();
                    el.addClass(options.selectedClass);
                    if (!options.noScroll && !noScroll) if (!el.is(".noScroll")) el.scrollintoview({
                        duration: 0,
                        scrollStop: options.scrollStop
                    });
                    currentEl = el;
                    if (!noTrigger) {
                        el.trigger("bbCursorSelect");
                        options.highlightFunc(currentEl)
                    }
                },
                triggerSelect = function (el, isEnter) {
                    if (!isPaused) options.selectFunc(el, isEnter)
                },
                select = function (isEnter) {
                    if (!position) resetPosition();
                    var getEl = get(position);
                    if (getEl) triggerSelect(getEl, isEnter)
                },
                setup = function (dSet, keepPosition) {
                    dataset = dSet.slice();
                    initialize(keepPosition)
                },
                fastSetup = function (dSet) {
                    dataset = dSet
                },
                focus = function () {
                    if (dataset !== null) updateDisplay()
                },
                unfocus = function () {
                    if (currentEl) {
                        currentEl.removeClass(options.selectedClass);
                        currentEl.trigger("bbCursorDeselect")
                    }
                },
                getCell = function () {
                    return get(position)
                },
                setCursorPosition = function (el) {
                    var posAttribute = el.getAttribute("cursorPosition");
                    if (posAttribute && posAttribute.length > 0) {
                        var pos = posAttribute.split(",");
                        var coord = [parseInt(pos[0]), parseInt(pos[1])];
                        updateDisplay(coord)
                    }
                },
                pause = function () {
                    isPaused = true
                },
                resume = function () {
                    isPaused = false
                };
            if (options.input) {
                BB.Keyboard.bindChordToElement(options.input, "down", function () {
                    updatePosition("down")
                }, true, true);
                BB.Keyboard.bindChordToElement(options.input, "up", function () {
                    updatePosition("up")
                }, true, true);
                BB.Keyboard.bindChordToElement(options.input, "home", function () {
                    moveToBeginning(0)
                }, true);
                BB.Keyboard.bindChordToElement(options.input, "end", function () {
                    moveToEnd(0)
                }, true);
                BB.Keyboard.bindChordToElement(options.input, "enter", function (e) {
                    if (!isPaused) {
                        select(true);
                        e.preventDefault();
                        e.stopImmediatePropagation()
                    }
                }, false, false, false, "keydown", options.aggressiveInputCapture)
            }
            if (options.textSearch) {
                var hInput = $(document.createElement("input"));
                hInput[0].setAttribute("type", "text");
                BB.Keyboard.bindChordToElement(options.input, "[a-z]/shift+[a-z]/backspace", function (e) {
                    clearTimeout(timeout);
                    if (Streak.jwerty.is("backspace", e)) hInput.val(hInput.val().first(hInput.val().length - 1));
                    else hInput.val(hInput.val() + String.fromCharCode(e.which));
                    setCursor();
                    timeout = setTimeout(function () {
                        hInput.val("")
                    }, 1E3)
                }, true, true, true);
                BB.Keyboard.bindChordToElement(options.input, "up/down/home/end", function (e) {
                    hInput.val("")
                }, true, true);
                var setCursor = function () {
                        var val = hInput.val().toLowerCase();
                        $.each(dataset, function (index, item) {
                            if ($(item)[0].innerText.trim().toLowerCase().startsWith(val)) {
                                updateDisplay([index]);
                                return
                            }
                        })
                    }
            }
            return {
                setup: setup,
                getPosition: function () {
                    return position
                },
                updatePosition: updatePosition,
                moveToBeginning: moveToBeginning,
                moveToEnd: moveToEnd,
                select: select,
                focus: focus,
                setPosition: updateDisplay,
                setCursorPosition: setCursorPosition,
                unfocus: unfocus,
                reset: resetPosition,
                getCell: getCell,
                pause: pause,
                resume: resume,
                fastSetup: fastSetup
            }
        }
    };
    BB.onLoad(function (cb) {
        BB.Cursor.init(cb)
    })
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        BB = Streak.BentoBox;
    BB.VirtualCursor = {
        defaults: {
            highlightFunc: $.noop,
            selectFunc: $.noop
        },
        init: function (cb) {
            cb()
        },
        create: function (opts) {
            var options = {};
            $.extend(options, this.defaults, opts);
            return new this.impl(options)
        },
        impl: function (options) {
            var position = null,
                prevPosition = null,
                dataset = null,
                isPaused = false,
                noScroll = false,
                resetPosition = function () {
                    position = [0, 0]
                },
                getFixedPosition = function () {
                    if (!position) resetPosition();
                    var dpos = position.clone();
                    if (dataset && dataset.length > 0) {
                        dpos[0] = Math.min(dataset.length - 1, dpos[0]);
                        dpos[1] = Math.min(dataset[dpos[0]].length - 1, dpos[1])
                    } else dpos = [0, 0];
                    return dpos
                },
                updatePosition = function (direction, axis) {
                    this.notToTop = true;
                    if (!axis) axis = 0;
                    if (direction === "up") {
                        var fpos = getFixedPosition();
                        position[axis] = Math.max(position[axis] - 1, 0);
                        if (axis === 1) {
                            var f2pos = getFixedPosition();
                            if (fpos[1] === f2pos[1]) position[1] = Math.max(f2pos[1] - 1, 0)
                        }
                    } else if (direction === "down") {
                        var setLength = axis === 1 ? dataset[position[0]].length : dataset.length;
                        position[axis] = Math.min(position[axis] + 1, setLength - 1)
                    }
                    updateDisplay(position);
                    this.notToTop = false
                },
                moveToBeginning = function (axis) {
                    this.notToTop = true;
                    if (axis === 0) position[0] = 0;
                    else position[axis] = 0;
                    updateDisplay();
                    this.notToTop = false
                },
                moveToEnd = function (axis) {
                    this.notToTop = true;
                    if (axis === 0) position[0] = dataset.length - 1;
                    else position[axis] = dataset[position[0]].length - 1;
                    updateDisplay();
                    this.notToTop = false
                },
                updateDisplay = function (pos) {
                    if (pos) position = pos;
                    var dpos = getFixedPosition();
                    unfocus();
                    prevPosition = _.clone(dpos);
                    options.highlightFunc(dpos)
                },
                select = function () {
                    options.selectFunc(getFixedPosition())
                },
                setup = function (dSet) {
                    dataset = dSet;
                    if (!position) resetPosition()
                },
                focus = function () {
                    if (dataset !== null) updateDisplay()
                },
                unfocus = function () {
                    if (prevPosition) options.unhighlightFunc(prevPosition)
                },
                pause = function () {
                    isPaused = true
                },
                resume = function () {
                    isPaused = false
                };
            return {
                setup: setup,
                updatePosition: updatePosition,
                moveToBeginning: moveToBeginning,
                moveToEnd: moveToEnd,
                select: select,
                focus: focus,
                setPosition: updateDisplay,
                unfocus: unfocus,
                reset: resetPosition,
                pause: pause,
                resume: resume,
                getPosition: getFixedPosition
            }
        }
    };
    BB.onLoad(function (cb) {
        BB.VirtualCursor.init(cb)
    })
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Date = Streak.Date,
        Gmail = Streak.Gmail,
        HTML = Streak.HTML,
        BB = Streak.BentoBox;
    BB.ExtensionCode = {
        init: function (cb) {
            this.bindHandlers();
            cb()
        },
        bindHandlers: function () {
            Messenger.observe("extensionRunCodeError", function (err) {
                console.log(err)
            });
            Messenger.observe("extensionEvalCodeError", function (err) {
                console.log(err)
            })
        },
        run: function (callable, parameters, cb) {
            if (!cb) cb = $.noop;
            Messenger.sendMessage("extensionRunCode", {
                code: callable.toString(),
                parameters: parameters
            }, "extensionRunCodeReturn", cb)
        },
        runEval: function (code) {
            Messenger.sendMessage("extensionEvalCode", {
                code: code
            })
        }
    };
    BB.onLoad(function (cb) {
        BB.ExtensionCode.init(cb)
    })
})(Streak);

//End BB Setup
*/
//IMT Threads
(function (m) {
    var h = m.jQuery,
        j = m._,
        n = m.Date,
        e = m.Gmail,
        g = m.BentoBox;
    g.Threads = {
        list: null,
        byId: {},
        byUniq: {},
        byFuzzyUniq: {},
        bySubjectUniq: {},
        byOrder: [],
        current: null,
        rows: {},
        composeThread: null,
        composeThreads: {},
        composedThreads: {},
        init: function (b) {
            var a = this;
            a.initThreads();
            e.observe("ajaxListRefresh", function (b) {
                b && b.viewData && a.refreshThreads(b.viewData)
            });
            e.observe("viewChanged", function () {
                a.mapRows();
                e.isCompose() && (e.view === e.Constants.Drafts ? (a.composeThreads[e.getConversationId()] || (a.composeThreads[e.getConversationId()] = g.Models.GmailThread.create({
                    encodedThreadId: e.getConversationId()
                })), a.composeThread = a.composeThreads[e.getConversationId()]) : a.composeThread = g.Models.GmailThread.create({}))
            });
            e.observe("newComposeWindow", h.proxy(this.handleNewCompose, this));
            e.observe("compose", h.proxy(this.registerSentEmail, this));
            var c = localStorage.composedThreads;
            c && (this.composedThreads = JSON.parse(c));
            b()
        },
        registerSentEmail: function (b) {
            if (!("undefined" !== b.rm && "" !== b.rm)) {
                var a = this,
                    c = 0,
                    d = !1,
                    i = function () {
                        m.Requester.gmailGetSentMail(function (f) {
                            if (!d) if (c += 1, 10 < c) {
                                var k;
                                k = "sent email couldn't be found\n email subject: " + b.subject;
                                k += " | to: " + b.to;
                                if (f && (f = a.buildThreadList(f)) && 0 < f.length) {
                                    var o = Math.min(10, f.length);
                                    k += "\n recent " + o + " sent emails";
                                    for (var l = 0; l < o; l++) k += "\n subject " + l + ": " + f[l].subject + " | emailString: " + f[l].emailString + " | reason: " + a.compareSentMail(f[l], b, !0)
                                }
                                g.logError(k)
                            } else if (f) {
                                if ((f = a.buildThreadList(f)) && 0 < f.length) if (f = f.filter(function (c) {
                                    return a.compareSentMail(c, b)
                                }), 0 < f.length) {
                                    for (l = 0; l < f.length; l++) k = f[l], a.byId[k.encodedThreadId] || a.list.add(k), e.trigger("newSentEmail", a.byId[k.encodedThreadId]);
                                    d = !0
                                } else setTimeout(i, 2E3)
                            } else setTimeout(i, 2E3)
                        })
                    };
                i()
            }
        },
        compareSentMail: function (b, a, c) {
            var d = !1,
                i = m.cleanupEmailSubject(a.subject);
            i === m.cleanupEmailSubject(b.subject) && (d = !0);
            0 === i.trim().length && b.subject.match(/^\((\s|\w)*?\)$/) && (d = !0);
            if (d) if (d = function (b, a) {
                if (!b || !a) return !1;
                var c = b.match(/(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/ig);
                if (c && 0 < c.length) for (var i = 0; i < c.length; i++) {
                    var d = c[i].toLowerCase();
                    if (-1 < a.toLowerCase().indexOf(d)) return !0
                }
                return !1
            }, j.isArray(a.to)) {
                for (i = 0; i < a.to.length; i++) if (d(a.to[i], b.emailString)) return !0;
                if (c) return "array to not matched"
            } else {
                if (d(a.to, b.emailString)) return !0;
                if (c) return "single email not matched"
            } else if (c) return "subject not matched";
            return !1
        },
        requestCurrentList: function (b) {
            var a = location.hash.substring(1);
            !a || 0 === a.length ? b() : m.Requester.gmailGetList(location.hash.substring(1), function (a) {
                if (a && (a = this.buildThreadList(a)) && 0 < a.length) for (var d = 0; d < a.length; d++) {
                    var i = a[d];
                    this.byId[i.encodedThreadId] || this.list.add(i)
                }
                b && b()
            }.bind(this))
        },
        initThreads: function () {
            var b = this,
                a = h("script"),
                c = /var VIEW_DATA\=\[\[/;
            b.list = g.Models.GmailThread.createCollection();
            b.list.bind("add", function (a) {
                b.byId[a.get("encodedThreadId")] = a;
                b.byUniq[a.get("uniq")] = a;
                b.byFuzzyUniq[a.get("fuzzyUniq")] || (b.byFuzzyUniq[a.get("fuzzyUniq")] = []);
                b.byFuzzyUniq[a.get("fuzzyUniq")].push(a);
                b.bySubjectUniq[a.get("subjectUniq")] || (b.bySubjectUniq[a.get("subjectUniq")] = []);
                b.bySubjectUniq[a.get("subjectUniq")].push(a);
                var c = a.get("uniq"),
                    d = a.get("fuzzyUniq"),
                    e = a.get("subjectUniq");
                a.bind("set", "uniq", function () {
                    delete b.byUniq[c];
                    b.byUniq[a.get("uniq")] = a;
                    c = a.get("uniq")
                });
                a.bind("set", "fuzzyUniq", function () {
                    if (b.byFuzzyUniq[d]) {
                        b.byFuzzyUniq[d].removeVal(a);
                        var c = b.byFuzzyUniq[a.get("fuzzyUniq")] || [];
                        c.push(a);
                        b.byFuzzyUniq[a.get("fuzzyUniq")] = c
                    }
                    d = a.get("fuzzyUniq")
                });
                a.bind("set", "subjectUniq", function () {
                    if (b.bySubjectUniq[e]) {
                        b.bySubjectUniq[e].removeVal(a);
                        var c = b.bySubjectUniq[a.get("subjectUniq")] || [];
                        c.push(a);
                        b.bySubjectUniq[a.get("subjectUniq")] = c
                    }
                    e = a.get("subjectUniq")
                })
            });
            b.list.bind("remove", function (a) {
                delete b.byUniq[a.get("uniq")];
                b.byFuzzyUniq[a.get("fuzzyUniq")] && b.byFuzzyUniq[a.get("fuzzyUniq")].removeVal(a);
                b.bySubjectUniq[a.get("subjectUniq")] && b.bySubjectUniq[a.get("subjectUniq")].removeVal(a)
            });
            var d;
            a.each(function (a, e) {
                if (!h(e).attr("src")) {
                    var g = h(e).html();
                    c.test(g) && (d = b.buildThreadList(g.replace(/.*var VIEW_DATA=/, "").replace(/;var GM_TIMING.*/, "")))
                }
            });
            d && b.processThreadList(d)
        },
        refreshThreads: function (b) {
            (b = this.buildThreadList(b)) && this.processThreadList(b)
        },
        cleanGmailResponseText: function (b) {
            var a = b.substring(b.indexOf("[")).replace(/\];var\s.*/img, ""),
                a = "[" + a.replace(/\r|\n/img, "").replace(/,(,|\]|\})/img, ",null$1").replace(/\]\d+\[/img, "],[") + "]",
                c;
            try {
                a = a.replace(/,(,|\]|\})/img, ",null$1"), c = eval("(function(){return " + a + ";})()")
            } catch (d) {
                g.logError("error parsing clean response \n viewData:" + b, d)
            }
            return c
        },
        buildThreadList: function (b) {
            function a(b, d) {
                if ("object" == typeof b && b && 0 < b.length) if ("tb" == b[0]) j.each(b[2], function (a) {
                    d.push(c.processJSONThread(a))
                });
                else if ("stu" == b[0]) j.each(b[2], function (a) {
                    d.push(c.processJSONThread(a[1]))
                });
                else for (var e = 0; e < b.length; e++) try {
                    a(b[e], d)
                } catch (i) {
                    console.log("oh snap")
                }
            }
            var c = this,
                d = b.substring(b.indexOf("[")).replace(/\];var\s.*/img, ""),
                d = "[" + d.replace(/\r|\n/img, "").replace(/,(,|\]|\})/img, ",null$1").replace(/\]\d+\[/img, "],[") + "]",
                e, f = [];
            try {
                d = d.replace(/,(,|\]|\})/img, ",null$1"), e = eval("(function(){return " + d + ";})()"), g.Threads.byOrder.length = 0, a(e, f)
            } catch (h) {
                g.logError("error parsing while building thread list \n viewData:" + b, h)
            }
            e = d = null;
            return f
        },
        processThreadList: function (b) {
            var a = this;
            j.each(b, function (b) {
                a.byUniq[b.uniq] && a.byUniq[b.uniq].update(b);
                a.byId[b.encodedThreadId] ? a.byId[b.encodedThreadId].update(b) : a.list.add(b)
            })
        },
        addDraftThread: function () {},
        getDraftUniq: function (b) {
            return b.subject.first(30) + b.date
        },
        mapRows: function () {
            this.visible = [];
            this.current = null;
            e.isConversation() && (this.current = this.getCurrent())
        },
        processJSONThread: function (b) {
            b = {
                encodedThreadId: b[0],
                subject: h.cleanString(b[9]),
                date: h.cleanString(b[14]),
                timeString: h.cleanString(b[15]),
                emailString: b[7]
            };
            this.getThreadUniq(b);
            g.Threads.byOrder.push(b);
            return b
        },
        processRow: function (b) {
            var b = b.rowNode,
                a = {},
                c = b.find("td").filter(":last");
            a.timeString = c.find("span").attr("title");
            a.date = h.cleanString(c.find("span")[0].innerHTML);
            if (0 < b.find("td[role=link] span").filter(":first").length) a.subject = h.cleanString(b.find("td[role=link] span").filter(":first")[0].innerHTML);
            else throw {
                msg: "threads.js couldn't find subject. \n row structure: " + b.html()
            };
            a.names = [];
            a.emailAddresses = [];
            a.emailString = "";
            b.find("span[email]").each(function (b, c) {
                a.names.push(h(c)[0].innerHTML);
                a.emailAddresses.push(h(c).attr("email"))
            });
            0 < a.emailAddresses.length && (a.emailString = b.find("span[email]").closest("div")[0].innerHTML);
            this.getThreadUniq(a);
            return a
        },
        processRowSet: function (b) {
            var a = {},
                b = b.node;
            if (0 !== b[0].find("td.apt .apm span").length) return a.timeString = b[0].find("td.apt .apm span").attr("title"), a.date = h.cleanString(b[0].find("td.apt .apm span")[0].innerHTML), a.subject = b[1].find("td[role=link] span").filter(":first")[0].innerHTML, a.names = [], a.emailAddresses = [], a.emailString = "", b[0].find("span[email]").each(function (b, d) {
                a.names.push(h(d)[0].innerHTML);
                a.emailAddresses.push(h(d).attr("email"))
            }), 0 < a.emailAddresses.length && (a.emailString = b[0].find("span[email]").closest("div")[0].innerHTML), this.getThreadUniq(a), a
        },
        getThreadFromRow: function (b) {
            var a;
            if (e.view === e.Constants.Drafts) a = g.Threads.byOrder[b.rowIndex];
            else if ("vertical" === b.type) {
                if ((a = b.rowNode.data("thread")) && !a.get("noCache")) return a;
                a = this.processRowSet(b)
            } else {
                if ((a = b.rowNode.data("thread")) && !a.get("noCache") && a.get("encodedThreadId")) return a;
                a = this.processRow(b)
            }
            a && (a = this.getThreadFromRowThread(a), b.rowNode.data("thread", a));
            return a
        },
        mergeThreads: function (b, a) {
            a.update(b);
            a.set("noCache", !0);
            return a
        },
        getThreadFromRowThread: function (b) {
            var a = b && b.uniq ? this.byUniq[b.uniq] : null;
            if (a) return a.update(b), a;
            if ((a = this.byFuzzyUniq[b.fuzzyUniq]) && 0 < a.length) return a = j.sortBy(a, function (a) {
                return a.get("subject").intersectionLength(b.subject)
            }), this.mergeThreads(b, j.last(a));
            a = j.filter(this.list, function (a) {
                return a.get("subject") === b.subject && (a.get("emailString") === b.emailString || a.get("timeString") === b.timeString)
            });
            if (0 === a.length) {
                if ((a = this.bySubjectUniq[b.subjectUniq]) && 0 < a.length) return a = j.sortBy(a, function (a) {
                    return a.get("subject").intersectionLength(b.subject)
                }), this.mergeThreads(b, j.last(a));
                b.encodedThreadId = null;
                b.noCache = !0;
                return g.Models.GmailThread.create(b)
            }
            if (1 == a.length) return a[0].set("noCache", !0), a[0].update(b), a[0];
            a = j.sortBy(a, function (a) {
                a = n.ccreate(a.get("timeString"));
                return a.isValid() ? a.getTime() : -1
            });
            return this.mergeThreads(b, j.last(a))
        },
        processConversation: function () {
            var b = {};
            b.encodedThreadId = e.getConversationId();
            b.subject = e.getCurrentMain().find(".Bs .ha .hP").text();
            b.names = [];
            b.emailAddresses = [];
            e.getCurrentMain().find("table.Bs div.hx span.gD, table.Bs div.hx span.g2").each(function (a, d) {
                var e = h(d),
                    f = e.attr("email");
                f && e.is(":FastVisible(noCompute)") && (b.names.push(e.text()), b.emailAddresses.push(f))
            });
            if (e.isInSentConversation()) {
                var a = this.list.filter(function (a) {
                    return a.get("subject") === b.subject
                });
                b.encodedThreadId = 0 === a.length ? null : 1 === a.length ? a[0].get("encodedThreadId") : a.sort(function (a) {
                    try {
                        return n.create(a.get("timeString")).getTime()
                    } catch (b) {
                        return -1
                    }
                }).reverse()[0].get("encodedThreadId")
            }
            return b
        },
        handleNewCompose: function (b) {
            var a = this,
                c = g.Models.GmailThread.create(this.processComposeWindow(b));
            b.bind("draftSaved", function () {
                c.update(a.processComposeWindow(b))
            });
            b.bind("sent", function () {
                c.update(a.processComposeWindow(b))
            });
            b.thread = c
        },
        processComposeWindow: function (b) {
            var a = {};
            a.encodedThreadId = b.getFieldValue("draft");
            a.subject = b.getSubject();
            a.timeString = "";
            a.emailString = "";
            a.names = [];
            a.emailAddresses = [];
            for (var b = b.getAddresses(), c = 0; c < b.length; c++) {
                var d = b[c];
                a.emailAddresses.push(d.emailAddress);
                d.name && a.names.push(d.name)
            }
            this.getThreadUniq(a);
            return a
        },
        addRow: function (b, a) {
            this.rows[a] || (this.rows[a] = []);
            this.rows[a].push(b);
            j.uniq(this.rows[a], !1, function (a) {
                return a[0]
            })
        },
        getThreadUniq: function (b) {
            b.uniq = this.hash(b.emailString.split("(")[0] + b.subject.first(30) + b.timeString);
            b.fuzzyUniq = this.hash((b.emailString.split("(")[0] || b.subject.first(30)) + b.timeString);
            b.subjectUniq = this.hash(b.subject.first(30) + b.timeString)
        },
        hash: function (b) {
            return b.replace(/\W/img, "")
        },
        getPreviewed: function () {
            var b = e.getPreviewedRow();
            return b ? this.getThreadFromRow(b) : null
        },
        getActive: function () {
            var b = this,
                a = null;
            if (e.isConversation()) a = [this.getCurrent()];
            else {
                if (e.isCompose()) {
                    this.composeThread.set("subject", e.getCurrentMain().find('form [name="subject"]').val());
                    var a = [],
                        c = [];
                    this.parseInputForNames(e.getCurrentMain().find('form [name="to"]').val(), a, c);
                    this.parseInputForNames(e.getCurrentMain().find('form [name="cc"]').val(), a, c);
                    this.composeThread.set("names", a);
                    this.composeThread.set("emailAddresses", c);
                    return [this.composeThread]
                }
                var d = [],
                    a = j.pluckPlus(e.getSelectedThreadRows(), function (a) {
                        try {
                            return b.getThreadFromRow(a)
                        } catch (c) {
                            return d.push(c), null
                        }
                    });
                0 < d.length && g.logError("Error processing rows.", d[0])
            }
            return a
        },
        parseInputForNames: function (b, a, c) {
            b && 0 !== b.length && j(b.split(",")).chain().each(function (b) {
                b = b.trim();
                b.has("<") ? (b = b.split("<"), a.push(b[0].replace(/\"/img, "").trim()), c.push(b[1].replace("<", "").replace(">", "").trim())) : b.isValidEmail() && (a.push(b), c.push(b))
            })
        },
        getCurrent: function () {
            if (e.isConversation()) {
                var b = this.processConversation();
                if (!b.encodedThreadId) return g.Models.GmailThread.create(b);
                var a = this.byId[b.encodedThreadId];
                a ? a.update(b) : (this.list.add(b), a = this.byId[b.encodedThreadId]);
                return a
            }
            if (e.isListView()) {
                var c = this,
                    d = [],
                    b = j.pluckPlus(e.getVisibleThreadRows(), function (a) {
                        try {
                            return c.getThreadFromRow(a)
                        } catch (b) {
                            return d.push(b), null
                        }
                    });
                0 < d.length && g.logError("Error processing rows.", d[0]);
                return b
            }
        },
        getActiveThread: function () {
            if (e.isPreviewPane()) return this.getPreviewed();
            if (e.isConversation()) return this.getCurrent()
        }
    };
    g.onLoad(h.proxy(g.Threads.init, g.Threads))
})(Streak);
//BB Start
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Date = Streak.Date,
        Gmail = Streak.Gmail,
        Requester = Streak.Requester,
        Model = Streak.Model,
        Collection = Streak.Collection,
        BB = Streak.BentoBox;
    BB.Data = {
        _initFuncs: [],
        _inited: false,
        init: function (cb) {
            var self = this;
            if (BB.getUser() && BB.getUser().get("isOauthComplete")) if (!self._inited) {
                var after = _.after(this._initFuncs.length, function () {
                    cb();
                    self._inited = true
                });
                for (var i = 0, l = this._initFuncs.length; i < l; i++) this._initFuncs[i](after)
            } else cb();
            else cb()
        }
    };
    _.extend(BB.Data, {
        pipelines: {
            list: null,
            keyed: {}
        },
        initPipelines: function (cb) {
            var self = this;
            self.pipelines.list = BB.Models.Pipeline.createCollection();
            var once = _.once(function () {
                cb()
            });
            Requester.get({
                entityType: "Workflow"
            }, function (res) {
                self.initPipelinesList(res, once)
            }, function () {
                Requester.error("BentoBox: server threw an error getting pipelines");
                BB.isError = true;
                BB.trigger("error_load")
            })
        },
        initPipelinesList: function (res, cb) {
            var self = this;
            var after = _.onceAfter(res.length, cb);
            self.pipelines.list.bind("add", function (pipeline) {
                if (pipeline.key()) {
                    self.pipelines.keyed[pipeline.get("workflowKey")] = pipeline;
                    self.pipelines.list.sort(function (a, b) {
                        return (a.get("friendlyName") > b.get("friendlyName")) - (a.get("friendlyName") < b.get("friendlyName"))
                    });
                    self.getPipelineBoxes(pipeline.key()).refresh(after)
                }
                BB.UI.addSavingNotice(pipeline)
            });
            self.pipelines.list.bind("remove", function (pipeline) {
                var boxes = _.clone(self.getPipelineBoxes(pipeline.key()));
                for (var i = 0; i < boxes.length; i++) boxes[i].trigger("delete");
                delete self.boxes.grouped[pipeline.key()];
                delete self.pipelines.keyed[pipeline.key()];
                BB.trigger("change")
            });
            if (!res.error) if (res.length > 0) _.each(res, function (pipeline) {
                var p = self.pipelines.list.add(pipeline)
            });
            else cb()
        },
        setupPipelineBoxCollection: function (key) {
            var self = this;
            this.boxes.grouped[key] = BB.Models.Box.createCollection(key);
            this.boxes.grouped[key].bind("add", function (box) {
                self.boxes.keyed[box.key()] = box;
                self.boxes.list.addModel(box);
                BB.UI.addSavingNotice(box);
                var fields = box.getFields();
                for (var i = 0; i < fields.length; i++) BB.UI.addSavingNotice(fields[i])
            });
            this.boxes.grouped[key].bind("remove", function (box) {
                self.removeBox(box)
            })
        },
        resetPipeline: function (pipeline) {
            delete self.boxes.grouped[pipeline.key()];
            delete self.pipelines.keyed[pipeline.key()]
        },
        createPipelineFromTemplate: function (templatePipeline, cb) {
            var stageNames = [];
            for (var i = 0; i < templatePipeline.stageOrder.length; i++) stageNames.push(templatePipeline.stages[templatePipeline.stageOrder[i]].name);
            var fields = [];
            for (var i = 0; i < templatePipeline.fields.length; i++) fields.push({
                name: templatePipeline.fields[i].name,
                type: templatePipeline.fields[i].type
            });
            this.createNewPipeline(templatePipeline, stageNames, fields, cb)
        },
        createPipelineFromExistingPipeline: function (templatePipeline, cb) {
            var stageNames = [];
            for (var i = 0; i < templatePipeline.get("stageOrder").length; i++) stageNames.push(templatePipeline.stages[templatePipeline.get("stageOrder")[i]].displayName());
            var fields = [];
            for (var i = 0; i < templatePipeline.get("fields").length; i++) fields.push({
                name: templatePipeline.get("fields")[i].displayName(),
                type: templatePipeline.get("fields")[i].get("type")
            });
            this.createNewPipeline(templatePipeline, stageNames, fields, cb)
        },
        createNewPipeline: function (templatePipeline, stageNames, fields, cb) {
            var pipeline = BB.Models.Pipeline.create(templatePipeline);
            pipeline.set("stageNames", stageNames);
            var fieldNames = [],
                fieldTypes = [];
            for (var i = 0; i < fields.length; i++) {
                fieldNames.push(fields[i].name);
                fieldTypes.push(fields[i].type)
            }
            pipeline.set("fieldNames", fieldNames);
            pipeline.set("fieldTypes", fieldTypes);
            pipeline.save(function () {
                BB.Data.getAllPipelines().addModel(pipeline);
                if (cb) cb(pipeline)
            })
        },
        getPipeline: function (key) {
            return this.pipelines.keyed[key]
        },
        getAllPipelines: function () {
            return this.pipelines.list
        },
        addNewPipeline: function (key) {
            var self = this;
            Requester.get({
                entityType: "Workflow",
                workflowKey: key
            }, function (res) {
                self.pipelines.list.add(res)
            })
        },
        removePipeline: function (key) {
            if (this.getPipeline(key)) {
                this.getPipeline(key).trigger("delete");
                return true
            }
            return false
        },
        hasSharedPipelines: function () {
            var pips = BB.Data.getAllPipelines();
            if (!pips) return false;
            for (var i = 0; i < pips.length; i++) if (pips[i].get("shareState") != "PRIVATE") return true;
            return false
        }
    });
    _.extend(BB.Data, {
        boxes: {
            list: null,
            keyed: {},
            grouped: {},
            byHex: {},
            hexList: {}
        },
        initBoxes: function (cb) {
            this.boxes.list = new Collection;
            this.boxes.list.init({
                entityType: "Case",
                key: "caseKey"
            });
            if (cb) cb()
        },
        addBox: function (rawBox) {
            if (this.getBox(rawBox.caseKey)) this.getBox(rawBox.caseKey).update(rawBox);
            else if (rawBox.workflowKey) {
                var collection = this.getPipelineBoxes(rawBox.workflowKey);
                if (collection) collection.add(rawBox)
            }
            return this.boxes.keyed[rawBox.caseKey]
        },
        addBoxModel: function (box) {
            if (this.getBox(box.key())) this.getBox(box.key()).update(box.obj);
            else if (box.get("workflowKey")) this.getPipelineBoxes(box.get("workflowKey")).addModel(box);
            return this.boxes.keyed[box.key()]
        },
        addNewBox: function (key, cb) {
            var self = this;
            Requester.get({
                entityType: "Case",
                caseKey: key
            }, function (res) {
                self.addBox(res);
                cb()
            })
        },
        getBox: function (key) {
            var retVal = this.boxes.keyed[key];
            if (retVal) return retVal;
            retVal = this.getAllBoxes().filter(function (box) {
                return box.key() === key
            });
            if (retVal.length > 0) {
                retVal = retVal[0];
                this.boxes.keyed[key] = retVal
            } else retVal = null;
            return retVal
        },
        getAllBoxes: function () {
            return this.boxes.list
        },
        getPipelineBoxes: function (key) {
            var boxes = this.boxes.grouped[key];
            if (!boxes) this.setupPipelineBoxCollection(key);
            return this.boxes.grouped[key]
        },
        removeBox: function (box) {
            var self = this;
            delete self.boxes.keyed[box.get("caseKey")];
            if (self.boxes.grouped[box.get("workflowKey")] && self.boxes.grouped[box.get("workflowKey")].indexOf(box) >= 0) self.boxes.grouped[box.get("workflowKey")].remove(box);
            var list = self.boxes.hexList[box.key()];
            if (list && list.length > 0) {
                _.each(list, function (hexId) {
                    delete self.boxes.byHex[hexId]
                });
                delete self.boxes.hexList[box.key()]
            }
            self.boxes.list.remove(box)
        },
        registerBoxByHexID: function (hexId, box) {
            this.boxes.byHex[hexId] = box;
            if (!this.boxes.hexList[box.key()]) this.boxes.hexList[box.key()] = [];
            if (this.boxes.hexList[box.key()].indexOf(hexId) == -1) this.boxes.hexList[box.key()].push(hexId)
        },
        addThreadsToBox: function (box, threads, cb, forceSave) {
            var self = this;
            if (Gmail.isCompose() && !forceSave) {
                threads[0].set("box", box);
                if (cb) cb()
            } else {
                var jsonThreads = _(threads).chain().filter(function (thread) {
                    return !thread.get("box") && thread.get("encodedThreadId")
                }).pluckPlus(function (thread) {
                    return thread.obj
                }).value();
                if (jsonThreads.length > 0) {
                    _.each(threads, function (thread) {
                        self.registerBoxByHexID(thread.get("encodedThreadId"), box);
                        thread.set("box", box)
                    });
                    Requester.create({
                        entityType: "GmailThread",
                        caseKey: box.get("caseKey"),
                        json: JSON.stringify(jsonThreads)
                    }, function (res) {
                        box.trigger("addThreads");
                        self.getAllBoxes().trigger("threadChange");
                        BB.trigger("change");
                        if (cb) cb()
                    }, function (res) {
                        _.each(threads, function (thread) {
                            delete self.boxes.byHex[thread.get("encodedThreadId")];
                            thread.set("box", null);
                            box.trigger("removeThreads")
                        });
                        Gmail.showNotice(BB.Locale.getString("error_saving_conversations"), 5E3)
                    })
                } else if (cb) cb()
            }
        },
        removeThreadFromBox: function (threads, cb) {
            var self = this;
            if (Gmail.isCompose()) {
                threads[0].set("box", null);
                cb()
            } else {
                var after = _.after(threads.length, function () {
                    self.getAllBoxes().trigger("threadChange");
                    cb()
                });
                var cleanup = function (thread, box) {
                        delete self.boxes.byHex[thread.get("encodedThreadId")];
                        box.trigger("removeThreads")
                    };
                _.each(threads, function (thread) {
                    var box = thread.get("box");
                    thread.set("box", null);
                    if (box) Requester.get({
                        entityType: "GmailThread",
                        hexGmailThreadId: thread.get("encodedThreadId")
                    }, function (res) {
                        Requester.del({
                            entityType: "GmailThread",
                            json: JSON.stringify(res)
                        }, function () {
                            cleanup(thread, box);
                            after()
                        }, function () {
                            cleanup(thread, box);
                            after();
                            return true
                        })
                    }, after);
                    else after()
                })
            }
        },
        getBoxByHexID: function (hexId, cb) {
            if (!cb) cb = $.noop;
            if (!hexId || hexId.length === 0) cb();
            else {
                var self = this,
                    box = self.boxes.byHex[hexId];
                if (box) if (this.getPipeline(box.get("workflowKey"))) cb(box);
                else {
                    delete self.boxes.byHex[hexId];
                    cb()
                } else Requester.get({
                    entityType: "Case",
                    hexGmailThreadId: hexId
                }, function (res) {
                    if (res && !res.error) {
                        box = self.getBox(res.caseKey);
                        if (!box) {
                            self.boxes.pipelineBoxes(res.workflowKey).add(res);
                            box = self.getBox(res.caseKey);
                            self.registerBoxByHexID(hexId, box)
                        }
                    }
                    cb(box)
                })
            }
        },
        createBox: function (name, workflowKey, cb) {
            var self = this;
            var box = BB.Models.Box.create({
                name: name,
                workflowKey: workflowKey
            });
            box.save(function () {
                self.addBoxModel(box);
                cb(box)
            })
        }
    });
    _.extend(BB.Data, {
        gmailThreads: {
            grouped: {},
            keyed: {}
        },
        createGmailThreadGroup: function (key) {
            this.gmailThreads.grouped[key] = BB.Models.GmailThread.createCollection(key)
        },
        getGmailThreadGroup: function (key) {
            if (!this.gmailThreads.grouped[key]) this.gmailThreads.grouped[key] = BB.Models.GmailThread.createCollection(key);
            return this.gmailThreads.grouped[key]
        },
        getGmailThreads: function (key, cb, isImmediate) {
            var self = this;
            if (isImmediate) return this.gmailThreads.grouped[key];
            if (!this.gmailThreads.grouped[key]) this.createGmailThreadGroup(key);
            this.gmailThreads.grouped[key].refresh(function () {
                cb(self.gmailThreads.grouped[key])
            })
        },
        getGmailThread: function (key, cb, isImmediate) {
            var self = this;
            if (self.gmailThreads.keyed[key] || isImmediate) if (isImmediate) return self.gmailThreads.keyed[key];
            else cb(self.gmailThreads.keyed[key]);
            else Requester.get({
                entityType: "GmailThread",
                gmailThreadKey: key
            }, function (res) {
                if (!self.gmailThreads.grouped[res.caseKey]) self.createGmailThreadGroup(res.caseKey);
                var ret = self.gmailThreads.grouped[res.caseKey].add(res);
                cb(ret)
            })
        }
    });
    _.extend(BB.Data, {
        sendLaters: {
            list: null,
            keyed: {},
            byHexId: {}
        },
        initSendLaters: function (cb) {
            var self = this;
            self.sendLaters.list = BB.Models.SendLater.createCollection();
            Requester.get({
                entityType: "SendLater",
                sendLaterStatusList: JSON.stringify(["SCHEDULED", "ERROR_ON_SEND"])
            }, function (res) {
                self.initSendLatersList(res);
                cb()
            }, function () {
                cb()
            })
        },
        initSendLatersList: function (res) {
            var self = this;
            this.sendLaters.list.bind("add", function (sendLater) {
                if (sendLater.key()) self.sendLaters.keyed[sendLater.key()] = sendLater;
                else sendLater.bind("set", "sendLaterKey", function () {
                    self.sendLaters.keyed[sendLater.key()] = sendLater
                });
                var draftId = sendLater.get("gmailDraftId");
                self.sendLaters.byHexId[draftId] = sendLater;
                sendLater.bind("set", "gmailDraftId", function () {
                    if (draftId) delete self.sendLaters.byHexId[draftId];
                    draftId = sendLater.get("gmailDraftId");
                    self.sendLaters.byHexId[draftId] = sendLater
                })
            });
            this.sendLaters.list.bind("remove", function (sendLater) {
                if (sendLater.key()) delete self.sendLaters.keyed[sendLater.key()];
                if (sendLater.get("gmailDraftId")) delete self.sendLaters.byHexId[sendLater.get("gmailDraftId")]
            });
            _.each(res || [], function (sendLater) {
                if (sendLater) self.sendLaters.list.add(sendLater)
            })
        },
        getSendLater: function (key) {
            return this.sendLaters.keyed[key]
        },
        getSendLaterByHexId: function (hexId) {
            return this.sendLaters.byHexId[hexId] || null
        },
        getSendLaterListByHexIds: function (hexIdList, cb) {
            var self = this;
            Requester.get({
                entityType: "SendLater",
                hexGmailThreadIdList: JSON.stringify(hexIdList)
            }, function (res) {
                if (res && !res.error) {
                    var mres = [];
                    _.each(res, function (sl) {
                        mres.push(BB.Models.SendLater.create(sl))
                    });
                    cb(mres)
                }
            })
        },
        newSendLater: function (obj) {
            return this.sendLaters.list.add(obj || {})
        },
        getAllSendLaters: function () {
            return this.sendLaters.list
        }
    });
    _.extend(BB.Data, {
        snippets: {
            list: null,
            keyed: null,
            grouped: null
        },
        initSnippets: function (cb) {
            var self = this;
            self.snippets.list = BB.Models.Snippet.createCollection();
            self.snippets.grouped = {};
            self.snippets.keyed = {};
            Requester.get({
                entityType: "Snippet"
            }, function (res) {
                self.initSnippetsList(res);
                cb()
            })
        },
        initSnippetsList: function (res) {
            var self = this;
            var defP = "Personal Snippets";
            this.snippets.list.bind("add", function (snippet) {
                if (snippet.key()) self.snippets.keyed[snippet.key()] = snippet;
                else snippet.bind("set", "snippetKey", function () {
                    self.snippets.keyed[snippet.key()] = snippet
                });
                var pipelineKey = snippet.get("workflowKey");
                if (!pipelineKey) pipelineKey = defP;
                else {
                    var pipeline = BB.Data.getPipeline(pipelineKey);
                    if (pipeline) pipeline.bind("remove", null, function () {
                        snippet.trigger("delete")
                    })
                }
                if (!self.snippets.grouped[pipelineKey]) self.snippets.grouped[pipelineKey] = [];
                self.snippets.grouped[pipelineKey].push(snippet)
            });
            this.snippets.list.bind("remove", function (snippet) {
                delete self.snippets.keyed[snippet.key()];
                var pipelineKey = snippet.get("workflowKey");
                if (!pipelineKey) pipelineKey = defP;
                self.snippets.grouped[pipelineKey].removeVal(snippet)
            });
            _.each(res || [], function (snippet) {
                if (snippet) self.snippets.list.add(snippet)
            })
        },
        getAllSnippets: function () {
            return this.snippets.list
        },
        getSnippet: function (key) {
            return this.snippets.keyed[key]
        },
        getSnippetsByPipeline: function (key) {
            return this.snippets.grouped[key] || []
        },
        newSnippet: function (obj, cb) {
            var self = this;
            var snippet = BB.Models.Snippet.create(obj);
            self.snippets.list.addModel(snippet);
            snippet.save(function () {
                if (cb) cb()
            })
        }
    });
    BB.Data._initFuncs.push($.proxy(BB.Data.initPipelines, BB.Data));
    BB.Data._initFuncs.push($.proxy(BB.Data.initBoxes, BB.Data));
    BB.Data._initFuncs.push($.proxy(BB.Data.initSendLaters, BB.Data));
    BB.Data._initFuncs.push($.proxy(BB.Data.initSnippets, BB.Data))
})(Streak);
/*
(function (Streak) {
    var _ = Streak._,
        BB = Streak.BentoBox,
        Requester = Streak.Requester;
    BB.Realtime = {
        active: true,
        initialized: false,
        connectDelay: 1E3,
        token: null,
        handlers: {},
        connectTimeout: null,
        init: function (cb) {
            var self = this;
            if (!this.initialized) {
                this.setupObservers();
                this.setupChannelFramework();
                this.initialized = true;
                BB.bind("reup", function () {
                    self.connectChannel()
                })
            }
            if (cb) cb()
        },
        setupObservers: function () {
            var self = this;
            this.handlers.open = function (message) {
                self.connectDelay = 4E3
            };
            this.handlers.error = function (message) {};
            this.handlers.close = function (message) {
                self.token = null;
                self.connectChannel()
            };
            this.handlers.message = function (message) {
                var json = JSON.parse(message.data);
                switch (json.entityType) {
                case "Box":
                    handleCase(json);
                    break;
                case "Pipeline":
                    handleWorkflow(json);
                    break;
                case "Reminder":
                    handleReminder(json);
                    break;
                case "Comment":
                    handleComment(json);
                    break;
                case "GmailThread":
                    handleGmailThread(json);
                    break;
                case "Snippet":
                    handleSnippet(json);
                    break;
                default:
                    BB.logError("Realtime Error - entityType " + json.entityType + " is not supported yet.");
                    break
                }
            };
            Messenger.observe("channelConnectMessage", function (message) {
                if (self.handlers[message.op]) self.handlers[message.op](message.data)
            })
        },
        setupChannelFramework: function () {
            var self = this;
            Messenger.sendMessage("channelSetup", {
                src: (Streak.devRealtimeServer || Streak.server) + "/_ah/channel/jsapi"
            }, "channelSetupReturn", function () {
                self.connectChannel()
            })
        },
        getToken: function (cb) {
            var self = this;
            Requester.getFile({
                msgUrl: "/realtime/createChannelToken"
            }, function (res) {
                self.token = res.message;
                if (cb) cb()
            }, function (data, xhr) {
                self.token = null;
                if (xhr.status === 401) return true;
                else if (cb) cb()
            }, null, 0, true)
        },
        connectChannel: function () {
            if (this.token) Messenger.sendMessage("channelConnect", {
                token: this.token,
                server: Streak.server
            });
            else this.backoff()
        },
        backoff: function () {
            var self = this;
            self.connectDelay = Math.min(self.connectDelay * 2, 16E3);
            clearTimeout(this.connectTimeout);
            this.connectTimeout = setTimeout(function () {
                self.getToken(function () {
                    self.connectChannel()
                })
            }, self.connectDelay)
        }
    };
    var handleCase = function (json) {
            var box;
            switch (json.REALTIME_EVENT) {
            case "CREATE":
                var box = BB.Data.getBox(json.key);
                if (!box) BB.Data.addNewBox(json.key, function () {
                    BB.Data.getBox(json.key).trigger("change")
                });
                break;
            case "DELETE":
                var box = BB.Data.getBox(json.key);
                if (box) {
                    var key = box.get("workflowKey");
                    box.trigger("delete");
                    BB.Data.getPipelineBoxes(key).trigger("refreshed")
                }
                break;
            case "UPDATE":
                var box = BB.Data.getBox(json.key);
                if (box) box.refresh();
                else BB.Data.addNewBox(json.key, function () {
                    BB.Data.getBox(json.key).trigger("change")
                });
                break
            }
        };
    var handleWorkflow = function (json) {
            switch (json.REALTIME_EVENT) {
            case "NEW_ACL":
            case "CREATE":
            case "REMOVE_ACL":
                BB.Data.getAllPipelines().refresh();
                break;
            case "DELETE":
                BB.Data.removePipeline(json.key);
                break;
            case "UPDATE":
                var pipe = BB.Data.getPipeline(json.key);
                if (pipe) pipe.refresh();
                else BB.Data.addNewPipeline(json.key);
                break;
            case "UPDATE_CASCADE":
                var pipe = BB.Data.getPipeline(json.key);
                if (pipe) BB.Data.getPipelineBoxes(json.key).refresh();
                else BB.Data.addNewPipeline(json.key);
                break
            }
        };
    var handleComment = function (json) {
            var box = BB.Data.getBox(json.caseKey);
            if (box) box.refresh()
        };
    var handleReminder = function (json) {
            var box = BB.Data.getBox(json.caseKey);
            if (box) box.trigger("reminderRefresh")
        };
    var handleGmailThread = function (json) {
            var box = BB.Data.getBox(json.caseKey);
            if (box) BB.Data.getGmailThreadGroup(box.key()).refresh()
        };
    var handleSnippet = function (json) {
            switch (json.REALTIME_EVENT) {
            case "CREATE":
            case "DELETE":
                BB.Data.getAllSnippets().refresh();
                break;
            case "UPDATE":
                var snippet = BB.Data.getSnippet(json.key);
                if (snippet) snippet.refresh();
                else BB.Data.getAllSnippets().refresh();
                break
            }
        };
    BB.ready(function (cb) {
        BB.Realtime.init(cb)
    })
})(Streak);
*/
(function (Streak) {
    var $ = Streak.jQuery,
        BB = Streak.BentoBox,
        HTML = Streak.HTML;
    BB.FirstRun = {
        init: function (cb) {
            this.elements = {};
            this.elements.stage2modal = HTML.get("stage2_modal", true);
            this.elements.stage3modal = HTML.get("stage2_modal", true);
            this.setupModals();
            if (cb) cb()
        },
        getStage: function () {
            if (BB.Data.getAllPipelines().length == 0) return 1;
            if (BB.Data.getAllBoxes().length == 0) return 2;
            return 3
        },
        setupModals: function () {
            this.s2modal = BB.Widgets.Modal.create({
                title: BB.Locale.getString("stage2_modal_title"),
                confirmText: "OK",
                showCancel: false,
                inner: this.elements.stage2modal,
                confirmFunc: $.noop,
                maxHeight: "600px",
                onClose: function () {
                  //  BB.Modules.BoxesButton.el.css({
                  //      zIndex: "1"
                  //  })
                }
            });
            this.s3modal = BB.Widgets.Modal.create({
                title: BB.Locale.getString("stage3_modal_title"),
                confirmText: "OK",
                showCancel: false,
                inner: this.elements.stage3modal,
                maxHeight: "600px"
            })
        },
        showStageModal: function (stage) {
            var self = this;
            self["showStage" + (stage ? stage : self.getStage()) + "Modal"]()
        },
        showStage1Modal: function () {
//            BB.Modules.LeftLink.newPipelineShow()
        },
        showStage2Modal: function () {
            BB.Modules.BoxesButton.el.css({
                zIndex: "2000"
            });
            this.s2modal.show()
        },
        showStage3Modal: function () {
            this.s3modal.show()
        }
    };
    BB.onLoad(function (cb) {
        BB.FirstRun.init(cb)
    })
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        jwerty = Streak.jwerty,
        Gmail = Streak.Gmail,
        BB = Streak.BentoBox;
    BB.Keyboard = {
        activeTimer: null,
        clearTime: 1E3,
        activeChords: [],
        multiChords: [],
        chordHelp: [],
        initialized: false,
        helpRendered: false,
        helpEl: null,
        init: function (cb) {
            var self = this;
            if (!this.initialized) {
                Gmail.elements.body.bind("keydown", function (e) {
                    self.handleChordKeyEntry(e)
                });
                self.bindChord("shift+/", function () {
                    setTimeout(function () {
                        self.renderHelpItems()
                    }, 20)
                });
                this.initialized = true
            }
            if (cb) cb()
        },
        bindChord: function (chord, cb, description) {
            var chordParts = chord.split(",");
            if (chordParts.length === 1) {
                var jfunc = jwerty.event(chord, cb);
                Gmail.elements.body.bind("keydown", function (e) {
                    if (!$(e.srcElement).is("input,textarea,[contentEditable=true],.input")) jfunc(e)
                })
            } else this.multiChords.push({
                chord: chordParts,
                cb: cb
            });
            if (description) this.addChordHelpItem(chord, description)
        },
        addChordHelpItem: function (chord, description) {
            this.chordHelp.push({
                chord: chord,
                description: description
            })
        },
        handleChordKeyEntry: function (e) {
            var self = this;
            if (!$(e.srcElement).is("input,textarea,[contentEditable=true],.input")) {
                if (self.activeTimer) clearTimeout(self.activeTimer);
                self.activeTimer = setTimeout(function () {
                    self.activeChords = []
                }, self.clearTime);
                var active = [];
                var callbacks = [];
                for (var i = 0; i < self.multiChords.length; i++) {
                    var activeChord = self.multiChords[i];
                    var currentKey = activeChord.chord[0];
                    if (jwerty.is(currentKey, e)) {
                        var chord = activeChord.chord.slice();
                        chord.shift();
                        active.push({
                            chord: chord,
                            cb: activeChord.cb
                        })
                    }
                }
                for (var i = 0; i < self.activeChords.length; i++) {
                    var activeChord = self.activeChords[i];
                    var currentKey = activeChord.chord.shift();
                    if (jwerty.is(currentKey, e)) if (activeChord.chord.length === 0) callbacks.push(activeChord.cb);
                    else active.push(activeChord)
                }
                if (callbacks.length > 0) {
                    self.activeChord = [];
                    clearTimeout(self.activeTimer);
                    for (var i = 0; i < callbacks.length; i++) callbacks[i](e)
                } else self.activeChords = active;
                if (callbacks.length > 0) {
                    e.preventDefault();
                    e.stopPropagation()
                }
            }
        },
        bindChordToElement: function (el, chord, cb, noBubble, noDefault, notOnInput, keyEvent, useCapture) {
            this.bindChordToEl({
                el: el,
                chord: chord,
                cb: cb,
                noBubble: noBubble,
                noDefault: noDefault,
                notOnInput: notOnInput,
                keyEvent: keyEvent,
                useCapture: useCapture
            })
        },
        bindChordToEl: function (options) {
            var el = options.el,
                chord = options.chord,
                cb = options.cb,
                noBubble = options.noBubble,
                noDefault = options.noDefault,
                notOnInput = options.notOnInput,
                keyEvent = options.keyEvent,
                useCapture = options.useCapture,
                delegate = options.delegate;
            if (!keyEvent) keyEvent = "keydown";
            var jfunc = jwerty.event(chord, cb);
            var bind = function (event) {
                    if (useCapture) el[0].addEventListener(keyEvent, checkAndRun, true);
                    else el.on(event, options.delegate, null, function (e) {
                        if (!(notOnInput && $(e.srcElement).is("input,textarea,[contentEditable=true],.input"))) checkAndRun(e)
                    })
                };
            var checkAndRun = function (e) {
                    jfunc(e);
                    if (noBubble && jwerty.is(chord, e)) if (useCapture) {
                        e.stopPropagation();
                        e.stopImmediatePropagation()
                    } else e.stopPropagation();
                    if (noDefault && jwerty.is(chord, e)) e.preventDefault()
                };
            if (_.isArray(keyEvent)) _.each(keyEvent, function (event) {
                bind(event)
            });
            else bind(keyEvent)
        },
        renderHelpItems: function () {
            var self = this;
            var row = $(document.createElement("tr"));
            row[0].innerHTML = '<th class="Do"></th><th class="Do"><span class="boxIcon"></span>Streak</th>';
            this.getKeyboardHelpFirstColumn().append(row);
            _.each(self.chordHelp, function (help) {
                self.renderChordHelpItem(help.chord, help.description)
            })
        },
        renderSeparator: function (separator) {
            switch (separator) {
            case ",":
                return '</span> <span class="wb">then</span> ';
                break;
            case "+":
                return '</span> <span class="wb">+</span> ';
                break;
            default:
                return ""
            }
        },
        renderChordHelpItem: function (chord, description) {
            var parts = chord.split(/[,+]/g);
            var separators = chord.match(/[,+]/g);
            var row = $(document.createElement("tr"));
            var html = '<td class="wg Dn">';
            for (var i = 0; i < parts.length - 1; i++) html += '<span class="wh">' + parts[i].escapeHTML() + this.renderSeparator(separators[i]);
            html += '<span class="wh">' + _.last(parts) + "</span>" + " :</td>";
            html += '<td class="we Dn">' + description + "<td>";
            row[0].innerHTML = html;
            this.getKeyboardHelpFirstColumn().append(row)
        },
        getKeyboardHelpFirstColumn: function () {
            return Gmail.getKeyboardHelp().find(".cf.wd .cf").filter(":first").find("tbody")
        }
    };
    BB.onLoad(function (cb) {
        BB.Keyboard.init(cb)
    })
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Gmail = Streak.Gmail,
        HTML = Streak.HTML,
        Model = Streak.Model,
        BB = Streak.BentoBox;
    LocalSettings = Streak.Eventer.create({
        settings: null,
        initialized: false,
        init: function (cb) {
            if (!this.initialized) {
                this.email = Streak.userEmail;
                this.settings = Streak.ObjectPath.create(localStorage["streakLocalSettings" + this.email]);
                this.initialized = true
            }
            if (cb) cb()
        },
        get: function (path) {
            return this.settings.get(path)
        },
        set: function (path, value) {
            this.settings.set(path, value);
            this.save()
        },
        save: function () {
            localStorage["streakLocalSettings" + this.email] = this.settings.toString()
        }
    });
    BB.LocalSettings = LocalSettings;
    BB.onLoad(function (cb) {
        BB.LocalSettings.init(cb)
    })
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        Date = Streak.Date,
        BB = Streak.BentoBox;
    var performance = window.performance;
    if (!performance) performance = {};
    if (!performance.webkitNow) performance.webkitNow = function () {
        return (new Date).getTime()
    };
    BB.Logger = {
        isDebug: false,
        init: function (cb) {
            cb()
        },
        log: function (msg, force) {
            if (this.isDebug || force) console.log(msg)
        },
        output: function (activity, diff) {
            console.log(activity + ": " + diff + " ticks")
        },
        start: function (activity) {
            return new function () {
                var sd = performance.webkitNow();
                var d = performance.webkitNow();
                var end = function (anActivity) {
                        if (BB.Logger.isDebug) BB.Logger.output(anActivity || activity, performance.webkitNow() - sd)
                    };
                var mark = function (anActivity) {
                        if (BB.Logger.isDebug) {
                            BB.Logger.output(anActivity || activity, performance.webkitNow() - d);
                            d = performance.webkitNow()
                        }
                    };
                return {
                    end: end,
                    mark: mark
                }
            }
        }
    };
    BB.onLoad($.proxy(BB.Logger.init, BB.Logger))
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Gmail = Streak.Gmail,
        Requester = Streak.Requester,
        BB = Streak.BentoBox;
    BB.Tracker = {
        mixpanel: null,
        analytics: null,
        init: function (cb) {
            var self = this;
            self.initializeMixPanel();
            self.initializeAnalytics();
            BB.ready(function (cb2) {
                BB.Tracker.trackStreakPassive({
                    eventName: "StreakLoaded",
                    previewPane: Gmail.getPreviewPaneLoaded(),
                    theme: Gmail.getThemeLoaded(),
                    labs: Gmail.getEnabledLabs(),
                    oldUI: Gmail.isOldUI()
                });
                var extensions = Messenger.getData("extensionsInstalled");
                if (extensions) {
                    var props = {};
                    for (var i = 0; i < extensions.length; i++) props[extensions[i].name] = true;
                    props["eventName"] = "ExtensionsInstalled";
                    BB.Tracker.trackStreakPassive(props)
                }
                cb2()
            });
            Gmail.observe("viewChanged", function (view) {
                var lastView = BB.UI.getPreviousView();
                var eventName = "viewChanged";
                if (Gmail.isGmailView()) BB.Tracker.trackGmail({
                    "eventName": eventName,
                    "lastView": lastView
                });
                else BB.Tracker.trackStreakPassive({
                    "eventName": eventName,
                    "lastView": lastView
                })
            });
            cb()
        },
        initializeMixPanel: function () {
            var self = this;
            var mpq = [];
            var mixpanelToken = Streak.mixpanelToken;
            mpq.push(["init", mixpanelToken]);
            (function () {
                var b, a, e, d, c;
                b = document.createElement("script");
                b.type = "text/javascript";
                b.async = true;
                b.src = (document.location.protocol === "https:" ? "https:" : "http:") + "//api.mixpanel.com/site_media/js/api/mixpanel.js";
                var headID = document.getElementsByTagName("head")[0];
                headID.appendChild(b);
                e = function (f) {
                    return function () {
                        mpq.push([f].concat(Array.prototype.slice.call(arguments, 0)))
                    }
                };
                d = ["init", "track", "track_links", "track_forms", "register", "register_once", "identify", "name_tag", "set_config"];
                for (c = 0; c < d.length; c++) mpq[d[c]] = e(d[c])
            })();
            self.mixpanel = mpq;
            window.mpq = mpq
        },
        born: function () {
            mpq.track("$born")
        },
        initializeAnalytics: function () {
            var self = this;
            var analyticsToken = Streak.analyticsToken;
            var _gaq = _gaq || [];
            _gaq.push(["_setAccount", analyticsToken]);
            _gaq.push(["_trackPageview"]);
            (function () {
                var ga = document.createElement("script");
                ga.type = "text/javascript";
                ga.async = true;
                ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
                var s = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(ga, s)
            })();
            self.analytics = _gaq;
            window._gaq = _gaq
        },
        currentTrackableViewName: function () {
            var vToUse = BB.UI.getCurrentView();
            if (Gmail.currentVisibleModal != "") vToUse = Gmail.currentVisibleModal + " MODAL";
            return vToUse
        },
        addTracking: function (el, elEvent, props) {
            el.bind(elEvent, function () {
                BB.Tracker.trackStreakActive(props)
            })
        },
        addPassiveTracking: function (el, elEvent, props) {
            el.bind(elEvent, function () {
                BB.Tracker.trackStreakPassive(props)
            })
        },
        addDelegatedTracking: function (el, selector, elEvent, props) {
            el.on(elEvent, selector, function () {
                BB.Tracker.trackStreakActive(props)
            })
        },
        trackStreakActive: function (props) {
            if (props != null) {
                props.name = "StreakActive";
                props.viewName = BB.Tracker.currentTrackableViewName();
                BB.Tracker.record(props)
            }
        },
        trackStreakPassive: function (props) {
            if (props != null) {
                props.name = "StreakPassive";
                props.viewName = BB.Tracker.currentTrackableViewName();
                BB.Tracker.record(props)
            }
        },
        trackGmail: function (props) {
            if (props != null) {
                props.name = "Gmail";
                props.viewName = BB.Tracker.currentTrackableViewName();
                BB.Tracker.record(props)
            }
        },
        record: function (properties) {
            try {
                var self = this;
                var props = $.extend({}, properties);
                var superProps = BB.user ? {
                    "email": BB.user.get("email"),
                    "creationTimestamp": BB.user.get("creationTimestamp"),
                    "isGoogleApps": !BB.userEmail.endsWith("@gmail.com"),
                    "hasSharedWorkflows": BB.Data.hasSharedPipelines(),
                    loggedIn: true
                } : {
                    loggedIn: false
                };
                BB.Logger.log("Record event Properties: " + JSON.stringify(properties));
                BB.Logger.log("Record event Super Properties: " + JSON.stringify(superProps));
                self.mixpanel.register(superProps);
                self.mixpanel.identify(BB.userEmail);
                self.mixpanel.name_tag(BB.userEmail);
                var name = props.name;
                delete props.name;
                self.mixpanel.track(name, props);
                props.name = name;
                var category = props.name;
                delete props.name;
                var i = 1;
                _.map(properties, function (value, key) {
                    self.analytics.push(["_setCustomVar", i, key, value, 3]);
                    i++
                });
                self.analytics.push(["_trackEvent", category, event])
            } catch (err) {}
        }
    };
    BB.onLoad($.proxy(BB.Tracker.init, BB.Tracker))
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Date = Streak.Date,
        Gmail = Streak.Gmail,
        BB = Streak.BentoBox;
    BB.UI = {
        suppressSearch: false,
        originalHash: null,
        el: null,
        interval: false,
        initialized: false,
        viewHistory: [],
        init: function (cb) {
            var self = this;
            if (!self.initialized) {
                self.el = $(document.createElement("div"));
                self.el.addClass("BltHke nH oy8Mbf");
                self.el.attr("id", "workflowArea");
                self.el.hide();
                if (Gmail.getCurrentMainContainer().length === 0) {
                    var parentString = "";
                    var parents = Gmail.getCurrentMain().parents();
                    if (parents.length == 0) parentString = Gmail.elements.body.html();
                    else parents.each(function () {
                        parentString += "<" + this.nodeName;
                        $.each(this.attributes, function (i, n) {
                            parentString += " " + n.name + '="' + n.value + '"'
                        });
                        parentString += ">"
                    });
                    BB.logError("ui.js getCurrentMainContainer has a length of 0 \n Parents: " + parentString)
                } else Gmail.getCurrentMainContainer().prepend(self.el);
                Gmail.observe("viewChanged", function (view) {
                    self.setupViewCanvas()
                }, null, 1);
                if (!self.interval) {
                    self.interval = true;
                    $(window).bind("resize.mainResize", function () {
                        if (self.isBentoBoxView()) self.setHeight()
                    })
                }
                BB.ready(function (cb) {
                    self.setupPipelineObserving();
                    if (cb) cb()
                })
            }
            self.initialized = true;
            if (cb) cb()
        },
        teardown: function () {
            if (this.isBentoBoxView()) {
                this.setURL(Gmail.Constants.Inbox);
                this.el.hide();
                this.el.siblings().show()
            }
        },
        destroy: function () {
            if (this.el) this.el.remove()
        },
        setHeight: function () {
            if (this.height != Gmail.getLeftBar().height()) {
                this.height = Gmail.getLeftBar().height();
                this.el.height(this.height + 33 + "px")
            }
        },
        setGmailView: function () {
            this.el.hide();
            this.el.siblings().show()
        },
        setupViewCanvas: function () {
            if (Gmail.isConversation()) this.viewHistory.push("conversation");
            else this.viewHistory.push(Gmail.view);
            this.viewHistory = _.last(this.viewHistory, 100);
            if (this.isBentoBoxView()) {
                this.el.siblings().hide();
                this.el.show();
                this.setHeight()
            } else {
                this.el.hide();
                this.el.siblings().show();
                if (Gmail.view === Gmail.Constants.Contact) {
                    var contactNotes = Gmail.$(".acn textarea.R5").filter(":FastVisible");
                    if (contactNotes && contactNotes.length > 0) {
                        var contactNotesContainer = contactNotes.closest(".nn");
                        if (contactNotesContainer.length > 0) {
                            var contactNotesContainerParent = contactNotesContainer.parent();
                            contactNotesContainer.height(contactNotesContainerParent.height())
                        }
                    }
                }
            }
            this.suppressSearch = false
        },
        isBoxView: function () {
            return Gmail.view == Gmail.Constants.Box
        },
        isPipelineView: function () {
            return Gmail.view == Gmail.Constants.Pipeline
        },
        isBentoBoxView: function () {
            return Gmail.Constants.BentoBoxViews.indexOf(Gmail.view) > -1
        },
        getCanvas: function () {
            return this.el
        },
        goToThread: function (hexId) {
            this.setURL(Gmail.Constants.Inbox + "/" + hexId)
        },
        linkify: function (type, key) {
            if (type.link) return type.link();
            else if (type == "thread" || type == "GmailThread") return Gmail.Constants.GmailThread + "/" + key
        },
        setURL: function (url) {
            if (this.setURLIntercept) this.setURLIntercept(function () {
                location.hash = "#" + url
            });
            else location.hash = "#" + url
        },
        appendURLQuery: function (part) {
            var append = null;
            if (Gmail.hash.query === null) append = "?";
            else append = encodeURIComponent(",");
            location.hash = location.hash + append + part
        },
        getResourceURL: function (url) {
            return Streak.server + (url.indexOf("/") === 0 ? "" : "/") + url + (url.indexOf("?") > -1 ? "&" : "?") + "clientVersion=" + encodeURIComponent(Streak.clientVersion)
        },
        getPreviousView: function () {
            return _.chain(this.viewHistory).last(2).first(1).value()[0]
        },
        getCurrentView: function () {
            if (this.viewHistory.length > 0) return _.last(this.viewHistory)[0];
            return null
        },
        getFieldIndexText: function (box, pipeline, index) {
            var pipeField = pipeline.get("fields")[index];
            return this.getFieldText(box, pipeField)
        },
        getFieldKeyText: function (box, pipeline, fieldKey, cleanText) {
            return this.getFieldText(box, pipeline.getField(fieldKey), cleanText)
        },
        getFieldText: function (box, field, cleanText, getEmail) {
            var text = "";
            var val = box.getField(field.key()).displayName();
            switch (field.get("type")) {
            case "TEXT_INPUT":
                if (cleanText) text = $.cleanText(val);
                else text = val;
                break;
            case "DATE":
                var date = val ? new Date(parseInt(val)) : null,
                    dateText = val ? date.prettyDate(true) : null;
                text = dateText;
                break;
            case "PERSON":
                try {
                    var list = JSON.parse(val);
                    if (list && list.length > 0) _.each(list, function (contact) {
                        if (getEmail && contact.email) {
                            text += text.length > 0 ? ", " : "";
                            if (contact.fullName) text += '"' + contact.fullName + '" <' + contact.email + ">";
                            else contact.email
                        } else text += (text.length > 0 ? ", " : "") + contact.fullName
                    })
                } catch (err) {}
                break
            }
            if (!text || text === "null") text = "";
            return text
        },
        dateNameConstants: ["today", "tomorrow", "this sunday", "this monday", "this tuesday", "this wednesday", "this thursday", "this friday", "this saturday", "this week", "this month", "this sunday", "this monday", "this tuesday", "this wednesday", "this thursday", "this friday", "this saturday", "this week", "this month"],
        getFieldTextValues: function (pipeline, fieldKey) {
            return this.generateTextValueList(pipeline, fieldKey)
        },
        generateTextValueList: function (pipeline, fieldKey) {
            var boxes = BB.Data.getPipelineBoxes(pipeline.key());
            var type = pipeline.getField(fieldKey).get("type");
            var mark = BB.Logger.start("value list");
            return _(boxes).chain().filter(function (box) {
                var field = box.getField(fieldKey);
                if (field) return field.displayName().length > 0;
                return false
            }).tap(function () {
                mark.mark("filter")
            }).map(function (box) {
                var ret = {
                    value: box.getField(fieldKey).displayName()
                };
                switch (type) {
                case "TEXT_INPUT":
                    ret.display = ret.value.replace(/\n/img, " ");
                    break;
                case "DATE":
                    ret.display = ret.value;
                    break
                }
                return ret
            }).tap(function () {
                mark.mark("map")
            }).sortBy(function (item) {
                return item.display.length
            }).tap(function () {
                mark.mark("sort by")
            }).unique(true, function (item) {
                return item.display
            }).tap(function () {
                mark.mark("unique")
            }).tap(function () {
                mark.end()
            }).value()
        },
        setupPipelineObserving: function () {
            var self = this;
            self.fieldTextValuesMap = {};
            var setupPipeline = function (pipeline) {
                    self.fieldTextValuesMap[pipeline.key()] = {};
                    BB.Data.getPipelineBoxes(pipeline.key()).bind("collectionChange", function () {
                        self.fieldTextValuesMap[pipeline.key()] = {}
                    })
                };
            BB.Data.getAllPipelines().bind("add", function (pipeline) {
                setupPipeline(pipeline)
            });
            _.each(BB.Data.getAllPipelines(), setupPipeline)
        },
        addSavingNotice: function (model) {
            model.bind("preUpdate", null, function () {
                Gmail.showNotice(BB.Locale.getString("saving"))
            });
            model.bind("save", null, function () {
                Gmail.showNotice(BB.Locale.getString("saved"), 750)
            })
        }
    };
    BB.UI.originalHash = location.hash;
    BB.onLoad($.proxy(BB.UI.init, BB.UI))
})(Streak);
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Gmail = Streak.Gmail,
        HTML = Streak.HTML,
        Model = Streak.Model,
        BB = Streak.BentoBox;
    UserSettings = Streak.Eventer.create({
        user: null,
        settings: null,
        active: true,
        localSettings: null,
        init: function () {
            var self = this;
            this.user = BB.getUser();
            if (this.user.get("userSettings")) try {
                this.settings = new Model(JSON.parse(this.user.get("userSettings").value))
            } catch (err) {}
            if (!this.settings) this.settings = new Model({})
        },
        getSetting: function (path) {
            var parts = path.split("/");
            var setting = this.settings.get(parts[0]);
            for (var i = 1; i < parts.length; i++) if (setting) setting = setting[parts[i]];
            return setting
        },
        get: function (path) {
            return this.getSetting(path)
        },
        setSetting: function (path, value) {
            var parts = path.split("/");
            var osetting = this.settings.get(parts[0]);
            if (!osetting) osetting = {};
            var setting = osetting;
            for (var i = 1; i < parts.length - 1; i++) {
                var newSetting = setting[parts[i]];
                if (!newSetting) {
                    newSetting = {};
                    setting[parts[i]] = newSetting
                }
                setting = newSetting
            }
            setting[_.last(parts)] = value;
            this.settings.set(parts[0], osetting)
        },
        set: function (path, value) {
            this.setSetting(path, value)
        },
        saveSettings: function () {
            if (this.active) {
                this.user.set("userSettings", {
                    value: JSON.stringify(this.settings.obj)
                });
                this.user.save($.noop, 0, true)
            }
        },
        save: function () {
            this.saveSettings()
        }
    });
    BB.UserSettings = UserSettings;
    BB.bind("userReady", function () {
        BB.UserSettings.init()
    })
})(Streak);
//BB End

/*
//BB Widget
*/

(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Gmail = Streak.Gmail,
        HTML = Streak.HTML,
        BB = Streak.BentoBox;
    var Modal = {
        templates: {},
        defaults: {
            title: null,
            canSubmitFunc: function () {
                return true
            },
            confirmFunc: $.noop,
            cancelFunc: $.noop,
            showCancel: true,
            cancelText: null,
            showConfirm: true,
            confirmText: null,
            width: "400px",
            minHeight: null,
            onClose: $.noop,
            inner: "",
            showTitle: true,
            doneButtonColor: "blue",
            persist: false
        },
        init: function (cb) {
            this.defaults.cancelText = BB.Locale.getString("modal_cancel");
            this.defaults.confirmText = BB.Locale.getString("modal_done");
            this.templates.modal = HTML.get("modalModal");
            if (cb) cb()
        },
        create: function (options) {
            var o = {};
            $.extend(o, this.defaults, options);
            return new this.impl(o)
        },
        confirm: function (title, message, cb) {
            var modal = Modal.create({
                title: title,
                inner: message,
                confirmFunc: cb,
                doneButtonColor: "red",
                confirmText: BB.Locale.getString("ok")
            });
            modal.show();
            modal.getOkButton().el.focus()
        },
        confirmDelete: function (item, cb, extraText) {
            var delTitle = BB.Locale.getString("confirm_delete_title", {
                item: item
            });
            var message = BB.Locale.getString("confirm_delete_message", {
                item: "<strong>" + item + "</strong>"
            });
            if (extraText) message += "<br /><br />" + extraText;
            BB.Widgets.Modal.confirm(delTitle, message, cb)
        }
    };
    Modal.impl = function (o) {
        var options = o,
            okButton = null,
            cancelButton = null,
            el = null,
            checkCanSubmit = function () {
                if (options.canSubmitFunc()) {
                    okButton.enable();
                    return true
                } else {
                    okButton.disable();
                    return false
                }
            };
        show = function (dontStack) {
            Gmail.currentVisibleModal = options.title;
            el = $(Modal.templates.modal({
                title: options.title,
                confirm: options.confirmText
            }));
            if (!options.showTitle) el.find(".title").hide();
            el.width(options.width);
            el.find(".inner").append(options.inner);
            if (options.showCancel) {
                cancelButton = BB.Widgets.Button.create({
                    name: options.cancelText,
                    onFunc: function () {
                        options.cancelFunc();
                        Gmail.currentVisibleModal = "";
                        $.modal.close()
                    },
                    isToggle: false
                });
                el.find(".buttonArea").append(cancelButton.el)
            }
            if (options.showConfirm) {
                okButton = BB.Widgets.Button.create({
                    name: options.confirmText,
                    onFunc: function () {
                        if (options.confirmFunc) if (options.confirmFunc()) return;
                        Gmail.currentVisibleModal = "";
                        $.modal.close()
                    },
                    isToggle: false,
                    color: options.doneButtonColor
                });
                el.find(".buttonArea").append(okButton.el);
                checkCanSubmit()
            }
            el.find(".close").click(function (e) {
                $.modal.close()
            });
            el.bbmodal({
                appendTo: Gmail.elements.body,
                onClose: function () {
                    Gmail.currentVisibleModal = "";
                    options.onClose()
                },
                maxHeight: options.maxHeight,
                minHeight: options.minHeight,
                persist: options.persist,
                dontStack: dontStack
            });
            BB.Keyboard.bindChordToElement(el, "escape", function () {
                $.modal.close()
            });
            el.focus()
        };
        return {
            show: show,
            checkCanSubmit: checkCanSubmit,
            confirm: function () {
                okButton.on()
            },
            getEl: function () {
                return el
            },
            getOkButton: function () {
                return okButton
            },
            getCancelButton: function () {
                return cancelButton
            }
        }
    };
    BB.Widgets.Modal = Modal;
    BB.onLoad($.proxy(Modal.init, Modal))
})(Streak);
/*
*/

(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Gmail = Streak.Gmail,
        Requester = Streak.Requester,
        BB = Streak.BentoBox;
    var ListIndicators = {
        template: null,
        colIndex: -1,
        initialized: false,
        active: true,
        refreshNeeded: true,
        timeout: null,
        init: function (readyCB) {
            var self = this;
            this.active = true;
            if (!self.initialized) {
                Gmail.observe("ajaxListRefresh", function () {
                    self.refreshIndicators()
                });
                Gmail.observe("viewChanged", function () {
                    if (Gmail.isSearch()) self.refreshIndicators();
                    else if (Gmail.isListView()) if (self.refreshNeeded) self.refreshIndicators();
                    self.refreshNeeded = true
                });
                Gmail.observe("previewPaneChanged", $.proxy(self.refreshIndicators, self));
                Gmail.observe("listToggle", function (isOpen) {
                    if (isOpen) self.refreshIndicators()
                });
                BB.Data.getAllBoxes().bind("collectionChange", $.proxy(self.refreshIndicators, self));
                BB.Data.getAllBoxes().bind("threadChange", $.proxy(self.refreshIndicators, self));
                BB.bind("logged_out", function () {
                    self.active = false
                })
            }
            self.initialized = true;
            if (readyCB) readyCB()
        },
        teardown: function () {
            Gmail.$("tr.zA .bentoBoxRow").hide()
        },
        refreshIndicators: function (attempts) {
            if (!attempts) attempts = 1;
            if (attempts > 2) {
                this.removeIndicators();
                return
            }
            var self = this;
            if (!self.active) return;
            try {
                if (Gmail.isListView() && Gmail.getLiveView() !== Gmail.Constants.Drafts) {
                    this.refreshNeeded = false;
                    var hexIds = _.pluckPlus(BB.Threads.getCurrent(), function (thread) {
                        return thread && thread.get && thread.get("encodedThreadId") ? thread.get("encodedThreadId") : null
                    });
                    var allNull = !_.any(hexIds, function (hexId) {
                        return !!hexId
                    });
                    if (allNull && BB.Threads.getCurrent().length > 0) {
                        BB.Threads.requestCurrentList(function () {
                            self.refreshIndicators(attempts + 1)
                        });
                        return
                    }
                    try {
                        self.showCached()
                    } catch (err) {}
                    if (self.timeout) clearTimeout(self.timeout);
                    self.timeout = setTimeout(function () {
                        Requester.get({
                            entityType: "EstimatedTime",
                            hexGmailThreadIdList: JSON.stringify(hexIds)
                        }, function (res) {
                            if (res && res.length > 0) {
                                var rows = Gmail.getVisibleThreadRows();
 
                                self.preMarkIndicators();
                                var shouldRefresh = false;
                                $.each(res, function (index, box) {
                                    if (hexIds[index] && BB.Threads.byId[hexIds[index]]) {
                                        if (box) self.addIndicator(rows[index], box);
                                        else self.removeIndicator(rows[index])
                                    }
                                });
                                self.hideIndicators()
                            }
                        })
                    }, 1000)
                }
            } catch (err) {
                BB.logError("List Indicators error.", err)
            }
        },
        showCached: function (hexIds) {
            var rows = Gmail.getVisibleThreadRows();
            for (var i = 0; i < rows.length; i++) if (rows[i] && rows[i].rowNode && rows[i].rowNode.data("thread") && rows[i].rowNode.data("thread").get("box")) this.addIndicator(rows[i], rows[i].rowNode.data("thread").get("box"))
        },
        addIndicator: function (rowObj, box) {
            if (!rowObj || !box) return;
            var self = this;
            var row = rowObj.rowNode;
            if (!row) return;
            row.data("box", box);
            if (row.find(".bentoBoxRow").length === 0) {
                var color;
                if (!color) color = {
                    backgroundColor: "rgb(255, 173, 71)",
                    textColor: "rgb(0, 0, 0)"
                };
                var tag = Gmail.widgets.getLabelTag(box, color.backgroundColor, color.textColor);
                tag.addClass("bentoBoxRow");
                tag.find(".at").prepend('<div style="background-color: ' + color.textColor + ';" class="maskedIcon"></div>');
                rowObj.labelContainer.prepend(tag);
            } else row.find(".bentoBoxRow").removeClass("toHide");
            row.find(".bentoBoxRow").show()
        },
        preMarkIndicators: function () {
            var self = this;
            if (Gmail.isListView()) var rows = Gmail.getCurrentMain().find("tr.zA .bentoBoxRow").addClass("toHide")
        },
        hideIndicators: function () {
            Gmail.getCurrentMain().find("tr.zA .bentoBoxRow.toHide").hide()
        },
        removeIndicators: function (row) {
            Gmail.getCurrentMain().find("tr.zA .bentoBoxRow").hide()
        },
        removeIndicator: function (row) {
            if (row && row.rowNode) row.rowNode.find(".bentoBoxRow").remove()
        }
    };
    BB.ready(function (readyCB) {
        ListIndicators.init(readyCB)
    });
    BB.Modules.ListIndicators = ListIndicators
})(Streak); 
(function (Streak) {
    var $ = Streak.jQuery,
        _ = Streak._,
        Date = Streak.Date,
        Gmail = Streak.Gmail,
        Requester = Streak.Requester,
        HTML = Streak.HTML,
        Eventer = Streak.Eventer,
        BB = Streak.BentoBox;
    var TopNav = Eventer.create({
        el: null,
        elements: {},
        halted: false,
        loggedOut: true,
        _isMessage: false,
        init: function (cb) {
            var self = this;
            if (!self.el) {
                var url = "topNavNewUI";
                this.el = HTML.get(url, true);
                if (Gmail.elements.topbar.rightLinks && Gmail.elements.topbar.rightLinks.length > 0) Gmail.elements.topbar.rightLinks.prepend(self.el);
                else {
                    var msg = "Right links is empty";
                    Gmail.$("ol.gbtc").each(function (index) {
                        msg += "\n\n";
                        msg += "parent list " + index + ": ";
                        $(this).parents().each(function (index2) {
                            msg += "<" + this.tagName;
                            for (var i = 0; i < this.attributes.length; i++) {
                                msg += " " + this.attributes[i].nodeName + '="';
                                msg += this.attributes[i].nodeValue + '"'
                            }
                            msg += ">"
                        })
                    });
                    BB.logError(msg);
                    return
                }
                self.el.find(".bbClientVersion").html("client Version: " + Streak.clientVersion);
                self.el.find(".bbExtVersion").html("ext Version: " + Streak.extVersion);
                self.parse();
                self.initFunctionality();
                self.initTracking();
                self.elements.menu.connectEmail.hide();
                self.elements.menu.connected.hide();

                self.trigger("ready");
                if (cb) cb()
            } else {
                if (cb) cb();
                self.trigger("ready")
            }
        },
        initLoggedOut: function () {
            if (this.halted) return;
            var self = TopNav;
            self.loggedOut = true;
            self.ready(function () {
                self.elements.menu.connectEmail.show();
                self.elements.menu.connected.hide();
                self.elements.menu.connectedNoPipelines.hide();
                self.elements.menu.loading.hide();
                self.showExclamation();
                var dismissed = self.isDismissedForever();
                self.showMessage(BB.Locale.getString("get_started_with_streak_title"), BB.Locale.getString("get_started_with_streak_body"), BB.Locale.getString("get_started_with_streak_access"), function () {
                    self.elements.mainLink.trigger("startOauth");
                    self.startOauth()
                }, dismissed);
                if (!dismissed) self.elements.menu.find(".dismissForever").hide()
            })
        },
        initLoggedIn: function (readyCB) {
            if (this.halted) return;
            var self = TopNav;
            self.ready(function () {
                self.loggedOut = false;
                BB.bind("allready", function () {
                    self._isMessage = false;
                    self.elements.menu.find("#workflowMenuMessage").hide();
                    self.elements.menu.find("#workflowMenuDefaultInner").show();
                    self.elements.mainLink.exclamation.hide();
                    self.elements.mainLink.loading.hide();
                    self.elements.mainLink.icon.show();
                    self.elements.menu.connectEmail.hide();
                    self.elements.menu.loading.hide();
                    self.elements.menu.find("#topNavMsg").hide();
                    self.elements.menu.find(".dismissForever").hide();
                    self.elements.menu.find(".developerZone").hide();
                    if (BB.FirstRun.getStage() === 1) {
                        self.elements.menu.connected.show();
                        BB.FirstRun.showStage1Modal();
                    } else 
                    self.elements.menu.connected.show();

                });
                readyCB()
            })
        },
        parse: function () {
            this.elements.mainLink = $(this.el[0]);
            this.elements.mainLink.span = this.elements.mainLink.find("span");
            this.elements.mainLink.exclamation = this.elements.mainLink.find("#bentoBoxNotLoggedIn");
            this.elements.mainLink.loading = this.elements.mainLink.find("#bentoBoxLoggingIn");
            this.elements.mainLink.icon = this.elements.mainLink.find("#bentoBoxLoggedIn");
            this.elements.menu = this.el.find("#workflowMenu");
            this.elements.menu.loading = this.elements.menu.find("#workflowTopNavLoading");
            this.elements.menu.oauthStart = this.elements.menu.find("#workflowOauthStart");
            this.elements.menu.connectEmail = this.elements.menu.find("#workflowConnectEmail");
            this.elements.menu.connected = this.elements.menu.find("#workflowEmailConnected");
            this.elements.menu.connectedNoPipelines = this.elements.menu.find("#workflowEmailConnectedNoPipelines")
        },
        initFunctionality: function () {
            var self = this;
            self.elements.menu.on("click", function (e) {
                e.stopPropagation()
            });
            self.elements.mainLink.easyHoverClass("gbgt-hvr").click(function (e) {
                if (self.isMenuOpen()) self.closeMenu();
                else {
                    self.elements.mainLink.trigger("openMenu");
                    self.openMenu()
                }
                if (!$(e.target).is("a[target]")) e.preventDefault()
            }).bodyCloseAndStop({
                closeFunction: function () {
                    self.closeMenu()
                },
                stop: self.elements.mainLink[0],
                body: Gmail.elements.body,
                useCapture: true
            });
            self.elements.menu.oauthStart.click(function (e) {
                self.closeMenu();
                self.startOauth();
                e.stopPropagation()
            });
            self.elements.menu.find(".languageChoice").hide();
            BB.bind("logged_out", function () {
                self.halted = false;
                self.initLoggedOut()
            });
            var emailUs = self.elements.menu.find(".supportEmail a");
            emailUs[0].setAttribute("href", "#");
            emailUs.click(function (e) {
                e.preventDefault();
                window.open("http://mail.google.com/mail/?view=cm&fs=1&tf=1&to=me%40botao.hu", "Compose Mail", "scrollbars=auto,width=600,height=700,status=yes,resizable=yes,toolbar=no")
            });
            self.elements.menu.find("a").easyHoverClass("gbqfb-hvr");
            Gmail.addTimerObserver(self.versionCheck.bind(this), 36E5)
        },
        initTracking: function () {
            BB.Tracker.addTracking(this.elements.mainLink, "startOauth", {
                eventName: "TopNavSigninPressed"
            });
            BB.Tracker.addTracking(this.elements.mainLink, "openMenu", {
                eventName: "TopNavOpened"
            });
            BB.Tracker.addTracking(this.elements.mainLink, "accessGranted", {
                eventName: "TopNavSigninComplete"
            });
            BB.Tracker.addTracking(this.elements.mainLink, "accessDenied", {
                eventName: "TopNavSigninDenied"
            });
            BB.Tracker.addTracking(this.elements.menu.find("#showPromote"), "click", {
                eventName: "TopNavSpreadSelected"
            });
            BB.Tracker.addTracking(this.elements.menu.find(".support"), "click", {
                eventName: "TopNavSupportSelected"
            });
            BB.Tracker.addTracking(this.elements.menu.find(".emailUs"), "click", {
                eventName: "TopNavEmailSelected"
            });
            BB.Tracker.addTracking(this.elements.menu.find(".releaseNotes"), "click", {
                eventName: "TopNavUpdatesSelected"
            })
        },
        showError: function (title, message, actionString, action) {
            var self = this;
            this.ready(function () {
                self.showExclamation();
                self.showMessage(title, message, actionString, action);
                self.elements.menu.find("#topNavErrorMsg").show();
                self.elements.menu.find("#topNavMsg").hide()
            });
           // BB.BentoTips.init();
            this.init()
        },
        isDismissedForever: function () {
            return BB.LocalSettings.get("topNav/loggedOutDismissed")
        },
        dismissForever: function () {
            BB.LocalSettings.set("topNav/loggedOutDismissed", true)
        },
        showSmallMessage: function (message) {
            this.elements.menu.connectEmail.hide();
            this.elements.menu.connected.hide();
            this.elements.menu.connectedNoPipelines.hide();
            this.elements.menu.loading.hide();
            this.elements.menu.find("#topNavErrorMsg").hide();
            this.elements.menu.find("#topNavMsg").show();
            this.elements.menu.find("#topNavMsg")[0].innerHTML = message
        },
        showMessage: function (title, message, actionString, action, dontOpen) {
            var self = this;
            self._isMessage = true;
            this.ready(function () {
                self.showSmallMessage(BB.Locale.getString("message_from_streak"));
                self.elements.menu.find("#workflowMenuDefaultInner").hide();
                self.elements.menu.find("#workflowMenuMessage").show();
                self.elements.menu.find("#workflowMenuMessage .messageTitle")[0].innerHTML = title;
                self.elements.menu.find("#workflowMenuMessage .messageBody")[0].innerHTML = message;
                if (actionString) {
                    self.elements.menu.find("#workflowMenuMessage .messageAction").show().html(actionString);
                    self.elements.menu.find("#workflowMenuMessage .messageAction").unbind("click.bbEvent");
                    if (_.isFunction(action)) self.elements.menu.find("#workflowMenuMessage .messageAction").bind("click.bbEvent", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        action(e)
                    });
                    else if (_.isString(action)) {
                        self.elements.menu.find("#workflowMenuMessage .messageAction").attr("href", action);
                        self.elements.menu.find("#workflowMenuMessage .messageAction").attr("target", "_blank")
                    }
                } else self.elements.menu.find("#workflowMenuMessage .messageAction").hide();
                if (!dontOpen) self.openMenu()
            })
        },
        destroy: function () {
            if (this.el) this.el.remove()
        },
        haltExecution: function () {
            this.halted = true
        },
        showExclamation: function () {
            this.elements.mainLink.exclamation.css({
                display: "inline-block"
            });
            this.elements.mainLink.loading.hide();
            this.elements.mainLink.icon.hide()
        },
        isMenuOpen: function () {
            return this.elements.menu.is(":FastVisible(noCompute)")
        },
        openMenu: function () {
            var topEl = Gmail.$("#gbd4");
            if (topEl.length > 0) {
                var top = topEl.css("top");
                var clicked = false;
                if (parseInt(top) < 0) {
                    Gmail.$("#gbg4").click();
                    top = topEl.css("top");
                    clicked = true
                }
                this.elements.menu.css("top", top);
                top = parseInt(top);
                this.el.find(".gbmab").css("margin-top", top - 10);
                this.el.find(".gbmac").css("margin-top", top - 9);
                if (clicked) Gmail.$("#gbg4").click()
            }
            if (!this._isMessage && BB.FirstRun.getStage() == 1) this.elements.menu.connectedNoPipelines.show();
            else {
                this.elements.menu.connectedNoPipelines.hide();
                if (BB.isReady()) this.elements.menu.connected.show()
            }
            this.elements.menu.show();
            this.elements.mainLink.addClass("gbto")
        },
        closeMenu: function () {
            this.elements.menu.hide();
            this.elements.mainLink.removeClass("gbto")
        },
        startOauth: function () {
            var self = this;
            self.closeMenu();
            self.elements.mainLink.exclamation.hide();
            self.elements.mainLink.loading.css({
                display: "inline-block"
            });
            var height = 500;
            var width = 560;
            var top = window.screenY + (window.outerHeight / 2 - height / 2);
            var left = window.screenX + (window.outerWidth / 2 - width / 2);
            var openWindow = window.open(Streak.server + "/oauth/grantAccess/" + BB.userEmail + "/", "Lime-time Authorization", "height=" + height + ",width=" + width + ",left=" + left + ",top=" + top + ",toolbar=0,resizable=0,menubar=0,location=0,status=0,scrollbars=0");
            var timer = setInterval(function () {
                if (openWindow.closed) {
                    clearInterval(timer);
                    self.checkUserAuth(0)
                }
            }, 1E3)
        },
        checkUserAuth: function (num) {
            var self = this;
            Requester.get({
                entityType: "User"
            }, function (data) {
                if (data) {
                    self.elements.mainLink.trigger("accessGranted");
                    BB.setUser(data);
                    var creationDate = new Date(BB.getUser().get("creationTimestamp"));
                    if (creationDate.setHours(0, 0, 0, 0) == (new Date).setHours(0, 0, 0, 0)) BB.Tracker.born();
                    if (BB.getUser().get("isOauthComplete")) {
                        BB.load();
                        return
                    }
                }
                if (num < 5) setTimeout(function () {
                    self.checkUserAuth(num + 1)
                }, 500);
                else {
                    self.elements.mainLink.trigger("accessDenied");
                    self.showExclamation()
                }
            }, function () {
                BB.logError("error user signing in");
                BB.trigger("error_load");
                BB.isError = true;
                self.showExclamation()
            })
        },
        versionCheck: function () {
            var param = {
                msgUrl: "/ajaxcalls/checkSuggestedVersions",
                msgMethod: "GET"
            };
            Requester.get(param, function (res) {
                if (parseFloat(res.suggestedClientVersion) > parseFloat(Streak.clientVersion)) this.showUpdatedVersion(BB.Locale.getString("suggested_updated_client"));
                else if (parseFloat(res.suggestedExtVerson) > parseFloat(Streak.extVersion)) {
                    this.showUpdatedVersion(BB.Locale.getString("suggested_updated_extension"));
                    this.elements.menu.find("#topNavMsg a").attr("target", "_blank").attr("href", "")
                }
            }.bind(this))
        },
        showUpdatedVersion: function (message) {
            this.el.find("#bentoBoxNewUpdate").show();
            this.showSmallMessage(message)
        }
    });
    BB.onLoad(function (cb) {
        TopNav.init(cb)
    });
    BB.ready(function () {
        TopNav.initLoggedOut()
    }, true);
    BB.ready(function (readyCB) {
        TopNav.initLoggedIn(readyCB)
    });
    BB.Modules.TopNav = TopNav
})(Streak);

//BB Modules End


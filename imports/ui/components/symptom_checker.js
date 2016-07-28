import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import './symptom_checker.html';

Template.SymptomChecker.onRendered(function(){
    /*!
     * typeahead.js 0.10.5
     * https://github.com/twitter/typeahead.js
     * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
     */

    (function($) {
        var _ = function() {
            "use strict";
            return {
                isMsie: function() {
                    return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
                },
                isBlankString: function(str) {
                    return !str || /^\s*$/.test(str);
                },
                escapeRegExChars: function(str) {
                    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                },
                isString: function(obj) {
                    return typeof obj === "string";
                },
                isNumber: function(obj) {
                    return typeof obj === "number";
                },
                isArray: $.isArray,
                isFunction: $.isFunction,
                isObject: $.isPlainObject,
                isUndefined: function(obj) {
                    return typeof obj === "undefined";
                },
                toStr: function toStr(s) {
                    return _.isUndefined(s) || s === null ? "" : s + "";
                },
                bind: $.proxy,
                each: function(collection, cb) {
                    $.each(collection, reverseArgs);
                    function reverseArgs(index, value) {
                        return cb(value, index);
                    }
                },
                map: $.map,
                filter: $.grep,
                every: function(obj, test) {
                    var result = true;
                    if (!obj) {
                        return result;
                    }
                    $.each(obj, function(key, val) {
                        if (!(result = test.call(null, val, key, obj))) {
                            return false;
                        }
                    });
                    return !!result;
                },
                some: function(obj, test) {
                    var result = false;
                    if (!obj) {
                        return result;
                    }
                    $.each(obj, function(key, val) {
                        if (result = test.call(null, val, key, obj)) {
                            return false;
                        }
                    });
                    return !!result;
                },
                mixin: $.extend,
                getUniqueId: function() {
                    var counter = 0;
                    return function() {
                        return counter++;
                    };
                }(),
                templatify: function templatify(obj) {
                    return $.isFunction(obj) ? obj : template;
                    function template() {
                        return String(obj);
                    }
                },
                defer: function(fn) {
                    setTimeout(fn, 0);
                },
                debounce: function(func, wait, immediate) {
                    var timeout, result;
                    return function() {
                        var context = this, args = arguments, later, callNow;
                        later = function() {
                            timeout = null;
                            if (!immediate) {
                                result = func.apply(context, args);
                            }
                        };
                        callNow = immediate && !timeout;
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                        if (callNow) {
                            result = func.apply(context, args);
                        }
                        return result;
                    };
                },
                throttle: function(func, wait) {
                    var context, args, timeout, result, previous, later;
                    previous = 0;
                    later = function() {
                        previous = new Date();
                        timeout = null;
                        result = func.apply(context, args);
                    };
                    return function() {
                        var now = new Date(), remaining = wait - (now - previous);
                        context = this;
                        args = arguments;
                        if (remaining <= 0) {
                            clearTimeout(timeout);
                            timeout = null;
                            previous = now;
                            result = func.apply(context, args);
                        } else if (!timeout) {
                            timeout = setTimeout(later, remaining);
                        }
                        return result;
                    };
                },
                noop: function() {}
            };
        }();
        var VERSION = "0.10.5";
        var tokenizers = function() {
            "use strict";
            return {
                nonword: nonword,
                whitespace: whitespace,
                obj: {
                    nonword: getObjTokenizer(nonword),
                    whitespace: getObjTokenizer(whitespace)
                }
            };
            function whitespace(str) {
                str = _.toStr(str);
                return str ? str.split(/\s+/) : [];
            }
            function nonword(str) {
                str = _.toStr(str);
                return str ? str.split(/\W+/) : [];
            }
            function getObjTokenizer(tokenizer) {
                return function setKey() {
                    var args = [].slice.call(arguments, 0);
                    return function tokenize(o) {
                        var tokens = [];
                        _.each(args, function(k) {
                            tokens = tokens.concat(tokenizer(_.toStr(o[k])));
                        });
                        return tokens;
                    };
                };
            }
        }();
        var LruCache = function() {
            "use strict";
            function LruCache(maxSize) {
                this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
                this.reset();
                if (this.maxSize <= 0) {
                    this.set = this.get = $.noop;
                }
            }
            _.mixin(LruCache.prototype, {
                set: function set(key, val) {
                    var tailItem = this.list.tail, node;
                    if (this.size >= this.maxSize) {
                        this.list.remove(tailItem);
                        delete this.hash[tailItem.key];
                    }
                    if (node = this.hash[key]) {
                        node.val = val;
                        this.list.moveToFront(node);
                    } else {
                        node = new Node(key, val);
                        this.list.add(node);
                        this.hash[key] = node;
                        this.size++;
                    }
                },
                get: function get(key) {
                    var node = this.hash[key];
                    if (node) {
                        this.list.moveToFront(node);
                        return node.val;
                    }
                },
                reset: function reset() {
                    this.size = 0;
                    this.hash = {};
                    this.list = new List();
                }
            });
            function List() {
                this.head = this.tail = null;
            }
            _.mixin(List.prototype, {
                add: function add(node) {
                    if (this.head) {
                        node.next = this.head;
                        this.head.prev = node;
                    }
                    this.head = node;
                    this.tail = this.tail || node;
                },
                remove: function remove(node) {
                    node.prev ? node.prev.next = node.next : this.head = node.next;
                    node.next ? node.next.prev = node.prev : this.tail = node.prev;
                },
                moveToFront: function(node) {
                    this.remove(node);
                    this.add(node);
                }
            });
            function Node(key, val) {
                this.key = key;
                this.val = val;
                this.prev = this.next = null;
            }
            return LruCache;
        }();
        var PersistentStorage = function() {
            "use strict";
            var ls, methods;
            try {
                ls = window.localStorage;
                ls.setItem("~~~", "!");
                ls.removeItem("~~~");
            } catch (err) {
                ls = null;
            }
            function PersistentStorage(namespace) {
                this.prefix = [ "__", namespace, "__" ].join("");
                this.ttlKey = "__ttl__";
                this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
            }
            if (ls && window.JSON) {
                methods = {
                    _prefix: function(key) {
                        return this.prefix + key;
                    },
                    _ttlKey: function(key) {
                        return this._prefix(key) + this.ttlKey;
                    },
                    get: function(key) {
                        if (this.isExpired(key)) {
                            this.remove(key);
                        }
                        return decode(ls.getItem(this._prefix(key)));
                    },
                    set: function(key, val, ttl) {
                        if (_.isNumber(ttl)) {
                            ls.setItem(this._ttlKey(key), encode(now() + ttl));
                        } else {
                            ls.removeItem(this._ttlKey(key));
                        }
                        return ls.setItem(this._prefix(key), encode(val));
                    },
                    remove: function(key) {
                        ls.removeItem(this._ttlKey(key));
                        ls.removeItem(this._prefix(key));
                        return this;
                    },
                    clear: function() {
                        var i, key, keys = [], len = ls.length;
                        for (i = 0; i < len; i++) {
                            if ((key = ls.key(i)).match(this.keyMatcher)) {
                                keys.push(key.replace(this.keyMatcher, ""));
                            }
                        }
                        for (i = keys.length; i--; ) {
                            this.remove(keys[i]);
                        }
                        return this;
                    },
                    isExpired: function(key) {
                        var ttl = decode(ls.getItem(this._ttlKey(key)));
                        return _.isNumber(ttl) && now() > ttl ? true : false;
                    }
                };
            } else {
                methods = {
                    get: _.noop,
                    set: _.noop,
                    remove: _.noop,
                    clear: _.noop,
                    isExpired: _.noop
                };
            }
            _.mixin(PersistentStorage.prototype, methods);
            return PersistentStorage;
            function now() {
                return new Date().getTime();
            }
            function encode(val) {
                return JSON.stringify(_.isUndefined(val) ? null : val);
            }
            function decode(val) {
                return JSON.parse(val);
            }
        }();
        var Transport = function() {
            "use strict";
            var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests = 6, sharedCache = new LruCache(10);
            function Transport(o) {
                o = o || {};
                this.cancelled = false;
                this.lastUrl = null;
                this._send = o.transport ? callbackToDeferred(o.transport) : $.ajax;
                this._get = o.rateLimiter ? o.rateLimiter(this._get) : this._get;
                this._cache = o.cache === false ? new LruCache(0) : sharedCache;
            }
            Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
                maxPendingRequests = num;
            };
            Transport.resetCache = function resetCache() {
                sharedCache.reset();
            };
            _.mixin(Transport.prototype, {
                _get: function(url, o, cb) {
                    var that = this, jqXhr;
                    if (this.cancelled || url !== this.lastUrl) {
                        return;
                    }
                    if (jqXhr = pendingRequests[url]) {
                        jqXhr.done(done).fail(fail);
                    } else if (pendingRequestsCount < maxPendingRequests) {
                        pendingRequestsCount++;
                        pendingRequests[url] = this._send(url, o).done(done).fail(fail).always(always);
                    } else {
                        this.onDeckRequestArgs = [].slice.call(arguments, 0);
                    }
                    function done(resp) {
                        cb && cb(null, resp);
                        that._cache.set(url, resp);
                    }
                    function fail() {
                        cb && cb(true);
                    }
                    function always() {
                        pendingRequestsCount--;
                        delete pendingRequests[url];
                        if (that.onDeckRequestArgs) {
                            that._get.apply(that, that.onDeckRequestArgs);
                            that.onDeckRequestArgs = null;
                        }
                    }
                },
                get: function(url, o, cb) {
                    var resp;
                    if (_.isFunction(o)) {
                        cb = o;
                        o = {};
                    }
                    this.cancelled = false;
                    this.lastUrl = url;
                    if (resp = this._cache.get(url)) {
                        _.defer(function() {
                            cb && cb(null, resp);
                        });
                    } else {
                        this._get(url, o, cb);
                    }
                    return !!resp;
                },
                cancel: function() {
                    this.cancelled = true;
                }
            });
            return Transport;
            function callbackToDeferred(fn) {
                return function customSendWrapper(url, o) {
                    var deferred = $.Deferred();
                    fn(url, o, onSuccess, onError);
                    return deferred;
                    function onSuccess(resp) {
                        _.defer(function() {
                            deferred.resolve(resp);
                        });
                    }
                    function onError(err) {
                        _.defer(function() {
                            deferred.reject(err);
                        });
                    }
                };
            }
        }();
        var SearchIndex = function() {
            "use strict";
            function SearchIndex(o) {
                o = o || {};
                if (!o.datumTokenizer || !o.queryTokenizer) {
                    $.error("datumTokenizer and queryTokenizer are both required");
                }
                this.datumTokenizer = o.datumTokenizer;
                this.queryTokenizer = o.queryTokenizer;
                this.reset();
            }
            _.mixin(SearchIndex.prototype, {
                bootstrap: function bootstrap(o) {
                    this.datums = o.datums;
                    this.trie = o.trie;
                },
                add: function(data) {
                    var that = this;
                    data = _.isArray(data) ? data : [ data ];
                    _.each(data, function(datum) {
                        var id, tokens;
                        id = that.datums.push(datum) - 1;
                        tokens = normalizeTokens(that.datumTokenizer(datum));
                        _.each(tokens, function(token) {
                            var node, chars, ch;
                            node = that.trie;
                            chars = token.split("");
                            while (ch = chars.shift()) {
                                node = node.children[ch] || (node.children[ch] = newNode());
                                node.ids.push(id);
                            }
                        });
                    });
                },
                get: function get(query) {
                    var that = this, tokens, matches;
                    tokens = normalizeTokens(this.queryTokenizer(query));
                    _.each(tokens, function(token) {
                        var node, chars, ch, ids;
                        if (matches && matches.length === 0) {
                            return false;
                        }
                        node = that.trie;
                        chars = token.split("");
                        while (node && (ch = chars.shift())) {
                            node = node.children[ch];
                        }
                        if (node && chars.length === 0) {
                            ids = node.ids.slice(0);
                            matches = matches ? getIntersection(matches, ids) : ids;
                        } else {
                            matches = [];
                            return false;
                        }
                    });
                    return matches ? _.map(unique(matches), function(id) {
                        return that.datums[id];
                    }) : [];
                },
                reset: function reset() {
                    this.datums = [];
                    this.trie = newNode();
                },
                serialize: function serialize() {
                    return {
                        datums: this.datums,
                        trie: this.trie
                    };
                }
            });
            return SearchIndex;
            function normalizeTokens(tokens) {
                tokens = _.filter(tokens, function(token) {
                    return !!token;
                });
                tokens = _.map(tokens, function(token) {
                    return token.toLowerCase();
                });
                return tokens;
            }
            function newNode() {
                return {
                    ids: [],
                    children: {}
                };
            }
            function unique(array) {
                var seen = {}, uniques = [];
                for (var i = 0, len = array.length; i < len; i++) {
                    if (!seen[array[i]]) {
                        seen[array[i]] = true;
                        uniques.push(array[i]);
                    }
                }
                return uniques;
            }
            function getIntersection(arrayA, arrayB) {
                var ai = 0, bi = 0, intersection = [];
                arrayA = arrayA.sort(compare);
                arrayB = arrayB.sort(compare);
                var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
                while (ai < lenArrayA && bi < lenArrayB) {
                    if (arrayA[ai] < arrayB[bi]) {
                        ai++;
                    } else if (arrayA[ai] > arrayB[bi]) {
                        bi++;
                    } else {
                        intersection.push(arrayA[ai]);
                        ai++;
                        bi++;
                    }
                }
                return intersection;
                function compare(a, b) {
                    return a - b;
                }
            }
        }();
        var oParser = function() {
            "use strict";
            return {
                local: getLocal,
                prefetch: getPrefetch,
                remote: getRemote
            };
            function getLocal(o) {
                return o.local || null;
            }
            function getPrefetch(o) {
                var prefetch, defaults;
                defaults = {
                    url: null,
                    thumbprint: "",
                    ttl: 24 * 60 * 60 * 1e3,
                    filter: null,
                    ajax: {}
                };
                if (prefetch = o.prefetch || null) {
                    prefetch = _.isString(prefetch) ? {
                        url: prefetch
                    } : prefetch;
                    prefetch = _.mixin(defaults, prefetch);
                    prefetch.thumbprint = VERSION + prefetch.thumbprint;
                    prefetch.ajax.type = prefetch.ajax.type || "GET";
                    prefetch.ajax.dataType = prefetch.ajax.dataType || "json";
                    !prefetch.url && $.error("prefetch requires url to be set");
                }
                return prefetch;
            }
            function getRemote(o) {
                var remote, defaults;
                defaults = {
                    url: null,
                    cache: true,
                    wildcard: "%QUERY",
                    replace: null,
                    rateLimitBy: "debounce",
                    rateLimitWait: 300,
                    send: null,
                    filter: null,
                    ajax: {}
                };
                if (remote = o.remote || null) {
                    remote = _.isString(remote) ? {
                        url: remote
                    } : remote;
                    remote = _.mixin(defaults, remote);
                    remote.rateLimiter = /^throttle$/i.test(remote.rateLimitBy) ? byThrottle(remote.rateLimitWait) : byDebounce(remote.rateLimitWait);
                    remote.ajax.type = remote.ajax.type || "GET";
                    remote.ajax.dataType = remote.ajax.dataType || "json";
                    delete remote.rateLimitBy;
                    delete remote.rateLimitWait;
                    !remote.url && $.error("remote requires url to be set");
                }
                return remote;
                function byDebounce(wait) {
                    return function(fn) {
                        return _.debounce(fn, wait);
                    };
                }
                function byThrottle(wait) {
                    return function(fn) {
                        return _.throttle(fn, wait);
                    };
                }
            }
        }();
        (function(root) {
            "use strict";
            var old, keys;
            old = root.Bloodhound;
            keys = {
                data: "data",
                protocol: "protocol",
                thumbprint: "thumbprint"
            };
            root.Bloodhound = Bloodhound;
            function Bloodhound(o) {
                if (!o || !o.local && !o.prefetch && !o.remote) {
                    $.error("one of local, prefetch, or remote is required");
                }
                this.limit = o.limit || 5;
                this.sorter = getSorter(o.sorter);
                this.dupDetector = o.dupDetector || ignoreDuplicates;
                this.local = oParser.local(o);
                this.prefetch = oParser.prefetch(o);
                this.remote = oParser.remote(o);
                this.cacheKey = this.prefetch ? this.prefetch.cacheKey || this.prefetch.url : null;
                this.index = new SearchIndex({
                    datumTokenizer: o.datumTokenizer,
                    queryTokenizer: o.queryTokenizer
                });
                this.storage = this.cacheKey ? new PersistentStorage(this.cacheKey) : null;
            }
            Bloodhound.noConflict = function noConflict() {
                root.Bloodhound = old;
                return Bloodhound;
            };
            Bloodhound.tokenizers = tokenizers;
            _.mixin(Bloodhound.prototype, {
                _loadPrefetch: function loadPrefetch(o) {
                    var that = this, serialized, deferred;
                    if (serialized = this._readFromStorage(o.thumbprint)) {
                        this.index.bootstrap(serialized);
                        deferred = $.Deferred().resolve();
                    } else {
                        deferred = $.ajax(o.url, o.ajax).done(handlePrefetchResponse);
                    }
                    return deferred;
                    function handlePrefetchResponse(resp) {
                        that.clear();
                        that.add(o.filter ? o.filter(resp) : resp);
                        that._saveToStorage(that.index.serialize(), o.thumbprint, o.ttl);
                    }
                },
                _getFromRemote: function getFromRemote(query, cb) {
                    var that = this, url, uriEncodedQuery;
                    if (!this.transport) {
                        return;
                    }
                    query = query || "";
                    uriEncodedQuery = encodeURIComponent(query);
                    url = this.remote.replace ? this.remote.replace(this.remote.url, query) : this.remote.url.replace(this.remote.wildcard, uriEncodedQuery);
                    return this.transport.get(url, this.remote.ajax, handleRemoteResponse);
                    function handleRemoteResponse(err, resp) {
                        err ? cb([]) : cb(that.remote.filter ? that.remote.filter(resp) : resp);
                    }
                },
                _cancelLastRemoteRequest: function cancelLastRemoteRequest() {
                    this.transport && this.transport.cancel();
                },
                _saveToStorage: function saveToStorage(data, thumbprint, ttl) {
                    if (this.storage) {
                        this.storage.set(keys.data, data, ttl);
                        this.storage.set(keys.protocol, location.protocol, ttl);
                        this.storage.set(keys.thumbprint, thumbprint, ttl);
                    }
                },
                _readFromStorage: function readFromStorage(thumbprint) {
                    var stored = {}, isExpired;
                    if (this.storage) {
                        stored.data = this.storage.get(keys.data);
                        stored.protocol = this.storage.get(keys.protocol);
                        stored.thumbprint = this.storage.get(keys.thumbprint);
                    }
                    isExpired = stored.thumbprint !== thumbprint || stored.protocol !== location.protocol;
                    return stored.data && !isExpired ? stored.data : null;
                },
                _initialize: function initialize() {
                    var that = this, local = this.local, deferred;
                    deferred = this.prefetch ? this._loadPrefetch(this.prefetch) : $.Deferred().resolve();
                    local && deferred.done(addLocalToIndex);
                    this.transport = this.remote ? new Transport(this.remote) : null;
                    return this.initPromise = deferred.promise();
                    function addLocalToIndex() {
                        that.add(_.isFunction(local) ? local() : local);
                    }
                },
                initialize: function initialize(force) {
                    return !this.initPromise || force ? this._initialize() : this.initPromise;
                },
                add: function add(data) {
                    this.index.add(data);
                },
                get: function get(query, cb) {
                    var that = this, matches = [], cacheHit = false;
                    matches = this.index.get(query);
                    matches = this.sorter(matches).slice(0, this.limit);
                    matches.length < this.limit ? cacheHit = this._getFromRemote(query, returnRemoteMatches) : this._cancelLastRemoteRequest();
                    if (!cacheHit) {
                        (matches.length > 0 || !this.transport) && cb && cb(matches);
                    }
                    function returnRemoteMatches(remoteMatches) {
                        var matchesWithBackfill = matches.slice(0);
                        _.each(remoteMatches, function(remoteMatch) {
                            var isDuplicate;
                            isDuplicate = _.some(matchesWithBackfill, function(match) {
                                return that.dupDetector(remoteMatch, match);
                            });
                            !isDuplicate && matchesWithBackfill.push(remoteMatch);
                            return matchesWithBackfill.length < that.limit;
                        });
                        cb && cb(that.sorter(matchesWithBackfill));
                    }
                },
                clear: function clear() {
                    this.index.reset();
                },
                clearPrefetchCache: function clearPrefetchCache() {
                    this.storage && this.storage.clear();
                },
                clearRemoteCache: function clearRemoteCache() {
                    this.transport && Transport.resetCache();
                },
                ttAdapter: function ttAdapter() {
                    return _.bind(this.get, this);
                }
            });
            return Bloodhound;
            function getSorter(sortFn) {
                return _.isFunction(sortFn) ? sort : noSort;
                function sort(array) {
                    return array.sort(sortFn);
                }
                function noSort(array) {
                    return array;
                }
            }
            function ignoreDuplicates() {
                return false;
            }
        })(this);
        var html = function() {
            return {
                wrapper: '<span class="twitter-typeahead"></span>',
                dropdown: '<span class="tt-dropdown-menu"></span>',
                dataset: '<div class="tt-dataset-%CLASS%"></div>',
                suggestions: '<span class="tt-suggestions"></span>',
                suggestion: '<div class="tt-suggestion"></div>'
            };
        }();
        var css = function() {
            "use strict";
            var css = {
                wrapper: {
                    position: "relative",
                    display: "inline-block"
                },
                hint: {
                    position: "absolute",
                    top: "0",
                    left: "0",
                    borderColor: "transparent",
                    boxShadow: "none",
                    opacity: "1"
                },
                input: {
                    position: "relative",
                    verticalAlign: "top",
                    backgroundColor: "transparent"
                },
                inputWithNoHint: {
                    position: "relative",
                    verticalAlign: "top"
                },
                dropdown: {
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    zIndex: "100",
                    display: "none"
                },
                suggestions: {
                    display: "block"
                },
                suggestion: {
                    whiteSpace: "nowrap",
                    cursor: "pointer"
                },
                suggestionChild: {
                    whiteSpace: "normal"
                },
                ltr: {
                    left: "0",
                    right: "auto"
                },
                rtl: {
                    left: "auto",
                    right: " 0"
                }
            };
            if (_.isMsie()) {
                _.mixin(css.input, {
                    backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
                });
            }
            if (_.isMsie() && _.isMsie() <= 7) {
                _.mixin(css.input, {
                    marginTop: "-1px"
                });
            }
            return css;
        }();
        var EventBus = function() {
            "use strict";
            var namespace = "typeahead:";
            function EventBus(o) {
                if (!o || !o.el) {
                    $.error("EventBus initialized without el");
                }
                this.$el = $(o.el);
            }
            _.mixin(EventBus.prototype, {
                trigger: function(type) {
                    var args = [].slice.call(arguments, 1);
                    this.$el.trigger(namespace + type, args);
                }
            });
            return EventBus;
        }();
        var EventEmitter = function() {
            "use strict";
            var splitter = /\s+/, nextTick = getNextTick();
            return {
                onSync: onSync,
                onAsync: onAsync,
                off: off,
                trigger: trigger
            };
            function on(method, types, cb, context) {
                var type;
                if (!cb) {
                    return this;
                }
                types = types.split(splitter);
                cb = context ? bindContext(cb, context) : cb;
                this._callbacks = this._callbacks || {};
                while (type = types.shift()) {
                    this._callbacks[type] = this._callbacks[type] || {
                        sync: [],
                        async: []
                    };
                    this._callbacks[type][method].push(cb);
                }
                return this;
            }
            function onAsync(types, cb, context) {
                return on.call(this, "async", types, cb, context);
            }
            function onSync(types, cb, context) {
                return on.call(this, "sync", types, cb, context);
            }
            function off(types) {
                var type;
                if (!this._callbacks) {
                    return this;
                }
                types = types.split(splitter);
                while (type = types.shift()) {
                    delete this._callbacks[type];
                }
                return this;
            }
            function trigger(types) {
                var type, callbacks, args, syncFlush, asyncFlush;
                if (!this._callbacks) {
                    return this;
                }
                types = types.split(splitter);
                args = [].slice.call(arguments, 1);
                while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
                    syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
                    asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
                    syncFlush() && nextTick(asyncFlush);
                }
                return this;
            }
            function getFlush(callbacks, context, args) {
                return flush;
                function flush() {
                    var cancelled;
                    for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
                        cancelled = callbacks[i].apply(context, args) === false;
                    }
                    return !cancelled;
                }
            }
            function getNextTick() {
                var nextTickFn;
                if (window.setImmediate) {
                    nextTickFn = function nextTickSetImmediate(fn) {
                        setImmediate(function() {
                            fn();
                        });
                    };
                } else {
                    nextTickFn = function nextTickSetTimeout(fn) {
                        setTimeout(function() {
                            fn();
                        }, 0);
                    };
                }
                return nextTickFn;
            }
            function bindContext(fn, context) {
                return fn.bind ? fn.bind(context) : function() {
                    fn.apply(context, [].slice.call(arguments, 0));
                };
            }
        }();
        var highlight = function(doc) {
            "use strict";
            var defaults = {
                node: null,
                pattern: null,
                tagName: "strong",
                className: null,
                wordsOnly: false,
                caseSensitive: false
            };
            return function hightlight(o) {
                var regex;
                o = _.mixin({}, defaults, o);
                if (!o.node || !o.pattern) {
                    return;
                }
                o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
                regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
                traverse(o.node, hightlightTextNode);
                function hightlightTextNode(textNode) {
                    var match, patternNode, wrapperNode;
                    if (match = regex.exec(textNode.data)) {
                        wrapperNode = doc.createElement(o.tagName);
                        o.className && (wrapperNode.className = o.className);
                        patternNode = textNode.splitText(match.index);
                        patternNode.splitText(match[0].length);
                        wrapperNode.appendChild(patternNode.cloneNode(true));
                        textNode.parentNode.replaceChild(wrapperNode, patternNode);
                    }
                    return !!match;
                }
                function traverse(el, hightlightTextNode) {
                    var childNode, TEXT_NODE_TYPE = 3;
                    for (var i = 0; i < el.childNodes.length; i++) {
                        childNode = el.childNodes[i];
                        if (childNode.nodeType === TEXT_NODE_TYPE) {
                            i += hightlightTextNode(childNode) ? 1 : 0;
                        } else {
                            traverse(childNode, hightlightTextNode);
                        }
                    }
                }
            };
            function getRegex(patterns, caseSensitive, wordsOnly) {
                var escapedPatterns = [], regexStr;
                for (var i = 0, len = patterns.length; i < len; i++) {
                    escapedPatterns.push(_.escapeRegExChars(patterns[i]));
                }
                regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
                return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
            }
        }(window.document);
        var Input = function() {
            "use strict";
            var specialKeyCodeMap;
            specialKeyCodeMap = {
                9: "tab",
                27: "esc",
                37: "left",
                39: "right",
                13: "enter",
                38: "up",
                40: "down"
            };
            function Input(o) {
                var that = this, onBlur, onFocus, onKeydown, onInput;
                o = o || {};
                if (!o.input) {
                    $.error("input is missing");
                }
                onBlur = _.bind(this._onBlur, this);
                onFocus = _.bind(this._onFocus, this);
                onKeydown = _.bind(this._onKeydown, this);
                onInput = _.bind(this._onInput, this);
                this.$hint = $(o.hint);
                this.$input = $(o.input).on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
                if (this.$hint.length === 0) {
                    this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
                }
                if (!_.isMsie()) {
                    this.$input.on("input.tt", onInput);
                } else {
                    this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                        if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                            return;
                        }
                        _.defer(_.bind(that._onInput, that, $e));
                    });
                }
                this.query = this.$input.val();
                this.$overflowHelper = buildOverflowHelper(this.$input);
            }
            Input.normalizeQuery = function(str) {
                return (str || "").replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
            };
            _.mixin(Input.prototype, EventEmitter, {
                _onBlur: function onBlur() {
                    this.resetInputValue();
                    this.trigger("blurred");
                },
                _onFocus: function onFocus() {
                    this.trigger("focused");
                },
                _onKeydown: function onKeydown($e) {
                    var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
                    this._managePreventDefault(keyName, $e);
                    if (keyName && this._shouldTrigger(keyName, $e)) {
                        this.trigger(keyName + "Keyed", $e);
                    }
                },
                _onInput: function onInput() {
                    this._checkInputValue();
                },
                _managePreventDefault: function managePreventDefault(keyName, $e) {
                    var preventDefault, hintValue, inputValue;
                    switch (keyName) {
                      case "tab":
                        hintValue = this.getHint();
                        inputValue = this.getInputValue();
                        preventDefault = hintValue && hintValue !== inputValue && !withModifier($e);
                        break;

                      case "up":
                      case "down":
                        preventDefault = !withModifier($e);
                        break;

                      default:
                        preventDefault = false;
                    }
                    preventDefault && $e.preventDefault();
                },
                _shouldTrigger: function shouldTrigger(keyName, $e) {
                    var trigger;
                    switch (keyName) {
                      case "tab":
                        trigger = !withModifier($e);
                        break;

                      default:
                        trigger = true;
                    }
                    return trigger;
                },
                _checkInputValue: function checkInputValue() {
                    var inputValue, areEquivalent, hasDifferentWhitespace;
                    inputValue = this.getInputValue();
                    areEquivalent = areQueriesEquivalent(inputValue, this.query);
                    hasDifferentWhitespace = areEquivalent ? this.query.length !== inputValue.length : false;
                    this.query = inputValue;
                    if (!areEquivalent) {
                        this.trigger("queryChanged", this.query);
                    } else if (hasDifferentWhitespace) {
                        this.trigger("whitespaceChanged", this.query);
                    }
                },
                focus: function focus() {
                    this.$input.focus();
                },
                blur: function blur() {
                    this.$input.blur();
                },
                getQuery: function getQuery() {
                    return this.query;
                },
                setQuery: function setQuery(query) {
                    this.query = query;
                },
                getInputValue: function getInputValue() {
                    return this.$input.val();
                },
                setInputValue: function setInputValue(value, silent) {
                    this.$input.val(value);
                    silent ? this.clearHint() : this._checkInputValue();
                },
                resetInputValue: function resetInputValue() {
                    this.setInputValue(this.query, true);
                },
                getHint: function getHint() {
                    return this.$hint.val();
                },
                setHint: function setHint(value) {
                    this.$hint.val(value);
                },
                clearHint: function clearHint() {
                    this.setHint("");
                },
                clearHintIfInvalid: function clearHintIfInvalid() {
                    var val, hint, valIsPrefixOfHint, isValid;
                    val = this.getInputValue();
                    hint = this.getHint();
                    valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
                    isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
                    !isValid && this.clearHint();
                },
                getLanguageDirection: function getLanguageDirection() {
                    return (this.$input.css("direction") || "ltr").toLowerCase();
                },
                hasOverflow: function hasOverflow() {
                    var constraint = this.$input.width() - 2;
                    this.$overflowHelper.text(this.getInputValue());
                    return this.$overflowHelper.width() >= constraint;
                },
                isCursorAtEnd: function() {
                    var valueLength, selectionStart, range;
                    valueLength = this.$input.val().length;
                    selectionStart = this.$input[0].selectionStart;
                    if (_.isNumber(selectionStart)) {
                        return selectionStart === valueLength;
                    } else if (document.selection) {
                        range = document.selection.createRange();
                        range.moveStart("character", -valueLength);
                        return valueLength === range.text.length;
                    }
                    return true;
                },
                destroy: function destroy() {
                    this.$hint.off(".tt");
                    this.$input.off(".tt");
                    this.$hint = this.$input = this.$overflowHelper = null;
                }
            });
            return Input;
            function buildOverflowHelper($input) {
                return $('<pre aria-hidden="true"></pre>').css({
                    position: "absolute",
                    visibility: "hidden",
                    whiteSpace: "pre",
                    fontFamily: $input.css("font-family"),
                    fontSize: $input.css("font-size"),
                    fontStyle: $input.css("font-style"),
                    fontVariant: $input.css("font-variant"),
                    fontWeight: $input.css("font-weight"),
                    wordSpacing: $input.css("word-spacing"),
                    letterSpacing: $input.css("letter-spacing"),
                    textIndent: $input.css("text-indent"),
                    textRendering: $input.css("text-rendering"),
                    textTransform: $input.css("text-transform")
                }).insertAfter($input);
            }
            function areQueriesEquivalent(a, b) {
                return Input.normalizeQuery(a) === Input.normalizeQuery(b);
            }
            function withModifier($e) {
                return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
            }
        }();
        var Dataset = function() {
            "use strict";
            var datasetKey = "ttDataset", valueKey = "ttValue", datumKey = "ttDatum";
            function Dataset(o) {
                o = o || {};
                o.templates = o.templates || {};
                if (!o.source) {
                    $.error("missing source");
                }
                if (o.name && !isValidName(o.name)) {
                    $.error("invalid dataset name: " + o.name);
                }
                this.query = null;
                this.highlight = !!o.highlight;
                this.name = o.name || _.getUniqueId();
                this.source = o.source;
                this.displayFn = getDisplayFn(o.display || o.displayKey);
                this.templates = getTemplates(o.templates, this.displayFn);
                this.$el = $(html.dataset.replace("%CLASS%", this.name));
            }
            Dataset.extractDatasetName = function extractDatasetName(el) {
                return $(el).data(datasetKey);
            };
            Dataset.extractValue = function extractDatum(el) {
                return $(el).data(valueKey);
            };
            Dataset.extractDatum = function extractDatum(el) {
                return $(el).data(datumKey);
            };
            _.mixin(Dataset.prototype, EventEmitter, {
                _render: function render(query, suggestions) {
                    if (!this.$el) {
                        return;
                    }
                    var that = this, hasSuggestions;
                    this.$el.empty();
                    hasSuggestions = suggestions && suggestions.length;
                    if (!hasSuggestions && this.templates.empty) {
                        this.$el.html(getEmptyHtml()).prepend(that.templates.header ? getHeaderHtml() : null).append(that.templates.footer ? getFooterHtml() : null);
                    } else if (hasSuggestions) {
                        this.$el.html(getSuggestionsHtml()).prepend(that.templates.header ? getHeaderHtml() : null).append(that.templates.footer ? getFooterHtml() : null);
                    }
                    this.trigger("rendered");
                    function getEmptyHtml() {
                        return that.templates.empty({
                            query: query,
                            isEmpty: true
                        });
                    }
                    function getSuggestionsHtml() {
                        var $suggestions, nodes;
                        $suggestions = $(html.suggestions).css(css.suggestions);
                        nodes = _.map(suggestions, getSuggestionNode);
                        $suggestions.append.apply($suggestions, nodes);
                        that.highlight && highlight({
                            className: "tt-highlight",
                            node: $suggestions[0],
                            pattern: query
                        });
                        return $suggestions;
                        function getSuggestionNode(suggestion) {
                            var $el;
                            $el = $(html.suggestion).append(that.templates.suggestion(suggestion)).data(datasetKey, that.name).data(valueKey, that.displayFn(suggestion)).data(datumKey, suggestion);
                            $el.children().each(function() {
                                $(this).css(css.suggestionChild);
                            });
                            return $el;
                        }
                    }
                    function getHeaderHtml() {
                        return that.templates.header({
                            query: query,
                            isEmpty: !hasSuggestions
                        });
                    }
                    function getFooterHtml() {
                        return that.templates.footer({
                            query: query,
                            isEmpty: !hasSuggestions
                        });
                    }
                },
                getRoot: function getRoot() {
                    return this.$el;
                },
                update: function update(query) {
                    var that = this;
                    this.query = query;
                    this.canceled = false;
                    this.source(query, render);
                    function render(suggestions) {
                        if (!that.canceled && query === that.query) {
                            that._render(query, suggestions);
                        }
                    }
                },
                cancel: function cancel() {
                    this.canceled = true;
                },
                clear: function clear() {
                    this.cancel();
                    this.$el.empty();
                    this.trigger("rendered");
                },
                isEmpty: function isEmpty() {
                    return this.$el.is(":empty");
                },
                destroy: function destroy() {
                    this.$el = null;
                }
            });
            return Dataset;
            function getDisplayFn(display) {
                display = display || "value";
                return _.isFunction(display) ? display : displayFn;
                function displayFn(obj) {
                    return obj[display];
                }
            }
            function getTemplates(templates, displayFn) {
                return {
                    empty: templates.empty && _.templatify(templates.empty),
                    header: templates.header && _.templatify(templates.header),
                    footer: templates.footer && _.templatify(templates.footer),
                    suggestion: templates.suggestion || suggestionTemplate
                };
                function suggestionTemplate(context) {
                    return "<p>" + displayFn(context) + "</p>";
                }
            }
            function isValidName(str) {
                return /^[_a-zA-Z0-9-]+$/.test(str);
            }
        }();
        var Dropdown = function() {
            "use strict";
            function Dropdown(o) {
                var that = this, onSuggestionClick, onSuggestionMouseEnter, onSuggestionMouseLeave;
                o = o || {};
                if (!o.menu) {
                    $.error("menu is required");
                }
                this.isOpen = false;
                this.isEmpty = true;
                this.datasets = _.map(o.datasets, initializeDataset);
                onSuggestionClick = _.bind(this._onSuggestionClick, this);
                onSuggestionMouseEnter = _.bind(this._onSuggestionMouseEnter, this);
                onSuggestionMouseLeave = _.bind(this._onSuggestionMouseLeave, this);
                this.$menu = $(o.menu).on("click.tt", ".tt-suggestion", onSuggestionClick).on("mouseenter.tt", ".tt-suggestion", onSuggestionMouseEnter).on("mouseleave.tt", ".tt-suggestion", onSuggestionMouseLeave);
                _.each(this.datasets, function(dataset) {
                    that.$menu.append(dataset.getRoot());
                    dataset.onSync("rendered", that._onRendered, that);
                });
            }
            _.mixin(Dropdown.prototype, EventEmitter, {
                _onSuggestionClick: function onSuggestionClick($e) {
                    this.trigger("suggestionClicked", $($e.currentTarget));
                },
                _onSuggestionMouseEnter: function onSuggestionMouseEnter($e) {
                    this._removeCursor();
                    this._setCursor($($e.currentTarget), true);
                },
                _onSuggestionMouseLeave: function onSuggestionMouseLeave() {
                    this._removeCursor();
                },
                _onRendered: function onRendered() {
                    this.isEmpty = _.every(this.datasets, isDatasetEmpty);
                    this.isEmpty ? this._hide() : this.isOpen && this._show();
                    this.trigger("datasetRendered");
                    function isDatasetEmpty(dataset) {
                        return dataset.isEmpty();
                    }
                },
                _hide: function() {
                    this.$menu.hide();
                },
                _show: function() {
                    this.$menu.css("display", "block");
                },
                _getSuggestions: function getSuggestions() {
                    return this.$menu.find(".tt-suggestion");
                },
                _getCursor: function getCursor() {
                    return this.$menu.find(".tt-cursor").first();
                },
                _setCursor: function setCursor($el, silent) {
                    $el.first().addClass("tt-cursor");
                    !silent && this.trigger("cursorMoved");
                },
                _removeCursor: function removeCursor() {
                    this._getCursor().removeClass("tt-cursor");
                },
                _moveCursor: function moveCursor(increment) {
                    var $suggestions, $oldCursor, newCursorIndex, $newCursor;
                    if (!this.isOpen) {
                        return;
                    }
                    $oldCursor = this._getCursor();
                    $suggestions = this._getSuggestions();
                    this._removeCursor();
                    newCursorIndex = $suggestions.index($oldCursor) + increment;
                    newCursorIndex = (newCursorIndex + 1) % ($suggestions.length + 1) - 1;
                    if (newCursorIndex === -1) {
                        this.trigger("cursorRemoved");
                        return;
                    } else if (newCursorIndex < -1) {
                        newCursorIndex = $suggestions.length - 1;
                    }
                    this._setCursor($newCursor = $suggestions.eq(newCursorIndex));
                    this._ensureVisible($newCursor);
                },
                _ensureVisible: function ensureVisible($el) {
                    var elTop, elBottom, menuScrollTop, menuHeight;
                    elTop = $el.position().top;
                    elBottom = elTop + $el.outerHeight(true);
                    menuScrollTop = this.$menu.scrollTop();
                    menuHeight = this.$menu.height() + parseInt(this.$menu.css("paddingTop"), 10) + parseInt(this.$menu.css("paddingBottom"), 10);
                    if (elTop < 0) {
                        this.$menu.scrollTop(menuScrollTop + elTop);
                    } else if (menuHeight < elBottom) {
                        this.$menu.scrollTop(menuScrollTop + (elBottom - menuHeight));
                    }
                },
                close: function close() {
                    if (this.isOpen) {
                        this.isOpen = false;
                        this._removeCursor();
                        this._hide();
                        this.trigger("closed");
                    }
                },
                open: function open() {
                    if (!this.isOpen) {
                        this.isOpen = true;
                        !this.isEmpty && this._show();
                        this.trigger("opened");
                    }
                },
                setLanguageDirection: function setLanguageDirection(dir) {
                    this.$menu.css(dir === "ltr" ? css.ltr : css.rtl);
                },
                moveCursorUp: function moveCursorUp() {
                    this._moveCursor(-1);
                },
                moveCursorDown: function moveCursorDown() {
                    this._moveCursor(+1);
                },
                getDatumForSuggestion: function getDatumForSuggestion($el) {
                    var datum = null;
                    if ($el.length) {
                        datum = {
                            raw: Dataset.extractDatum($el),
                            value: Dataset.extractValue($el),
                            datasetName: Dataset.extractDatasetName($el)
                        };
                    }
                    return datum;
                },
                getDatumForCursor: function getDatumForCursor() {
                    return this.getDatumForSuggestion(this._getCursor().first());
                },
                getDatumForTopSuggestion: function getDatumForTopSuggestion() {
                    return this.getDatumForSuggestion(this._getSuggestions().first());
                },
                update: function update(query) {
                    _.each(this.datasets, updateDataset);
                    function updateDataset(dataset) {
                        dataset.update(query);
                    }
                },
                empty: function empty() {
                    _.each(this.datasets, clearDataset);
                    this.isEmpty = true;
                    function clearDataset(dataset) {
                        dataset.clear();
                    }
                },
                isVisible: function isVisible() {
                    return this.isOpen && !this.isEmpty;
                },
                destroy: function destroy() {
                    this.$menu.off(".tt");
                    this.$menu = null;
                    _.each(this.datasets, destroyDataset);
                    function destroyDataset(dataset) {
                        dataset.destroy();
                    }
                }
            });
            return Dropdown;
            function initializeDataset(oDataset) {
                return new Dataset(oDataset);
            }
        }();
        var Typeahead = function() {
            "use strict";
            var attrsKey = "ttAttrs";
            function Typeahead(o) {
                var $menu, $input, $hint;
                o = o || {};
                if (!o.input) {
                    $.error("missing input");
                }
                this.isActivated = false;
                this.autoselect = !!o.autoselect;
                this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
                this.$node = buildDom(o.input, o.withHint);
                $menu = this.$node.find(".tt-dropdown-menu");
                $input = this.$node.find(".tt-input");
                $hint = this.$node.find(".tt-hint");
                $input.on("blur.tt", function($e) {
                    var active, isActive, hasActive;
                    active = document.activeElement;
                    isActive = $menu.is(active);
                    hasActive = $menu.has(active).length > 0;
                    if (_.isMsie() && (isActive || hasActive)) {
                        $e.preventDefault();
                        $e.stopImmediatePropagation();
                        _.defer(function() {
                            $input.focus();
                        });
                    }
                });
                $menu.on("mousedown.tt", function($e) {
                    $e.preventDefault();
                });
                this.eventBus = o.eventBus || new EventBus({
                    el: $input
                });
                this.dropdown = new Dropdown({
                    menu: $menu,
                    datasets: o.datasets
                }).onSync("suggestionClicked", this._onSuggestionClicked, this).onSync("cursorMoved", this._onCursorMoved, this).onSync("cursorRemoved", this._onCursorRemoved, this).onSync("opened", this._onOpened, this).onSync("closed", this._onClosed, this).onAsync("datasetRendered", this._onDatasetRendered, this);
                this.input = new Input({
                    input: $input,
                    hint: $hint
                }).onSync("focused", this._onFocused, this).onSync("blurred", this._onBlurred, this).onSync("enterKeyed", this._onEnterKeyed, this).onSync("tabKeyed", this._onTabKeyed, this).onSync("escKeyed", this._onEscKeyed, this).onSync("upKeyed", this._onUpKeyed, this).onSync("downKeyed", this._onDownKeyed, this).onSync("leftKeyed", this._onLeftKeyed, this).onSync("rightKeyed", this._onRightKeyed, this).onSync("queryChanged", this._onQueryChanged, this).onSync("whitespaceChanged", this._onWhitespaceChanged, this);
                this._setLanguageDirection();
            }
            _.mixin(Typeahead.prototype, {
                _onSuggestionClicked: function onSuggestionClicked(type, $el) {
                    var datum;
                    if (datum = this.dropdown.getDatumForSuggestion($el)) {
                        this._select(datum);
                    }
                },
                _onCursorMoved: function onCursorMoved() {
                    var datum = this.dropdown.getDatumForCursor();
                    this.input.setInputValue(datum.value, true);
                    this.eventBus.trigger("cursorchanged", datum.raw, datum.datasetName);
                },
                _onCursorRemoved: function onCursorRemoved() {
                    this.input.resetInputValue();
                    this._updateHint();
                },
                _onDatasetRendered: function onDatasetRendered() {
                    this._updateHint();
                },
                _onOpened: function onOpened() {
                    this._updateHint();
                    this.eventBus.trigger("opened");
                },
                _onClosed: function onClosed() {
                    this.input.clearHint();
                    this.eventBus.trigger("closed");
                },
                _onFocused: function onFocused() {
                    this.isActivated = true;
                    this.dropdown.open();
                },
                _onBlurred: function onBlurred() {
                    this.isActivated = false;
                    this.dropdown.empty();
                    this.dropdown.close();
                },
                _onEnterKeyed: function onEnterKeyed(type, $e) {
                    var cursorDatum, topSuggestionDatum;
                    cursorDatum = this.dropdown.getDatumForCursor();
                    topSuggestionDatum = this.dropdown.getDatumForTopSuggestion();
                    if (cursorDatum) {
                        this._select(cursorDatum);
                        $e.preventDefault();
                    } else if (this.autoselect && topSuggestionDatum) {
                        this._select(topSuggestionDatum);
                        $e.preventDefault();
                    }
                },
                _onTabKeyed: function onTabKeyed(type, $e) {
                    var datum;
                    if (datum = this.dropdown.getDatumForCursor()) {
                        this._select(datum);
                        $e.preventDefault();
                    } else {
                        this._autocomplete(true);
                    }
                },
                _onEscKeyed: function onEscKeyed() {
                    this.dropdown.close();
                    this.input.resetInputValue();
                },
                _onUpKeyed: function onUpKeyed() {
                    var query = this.input.getQuery();
                    this.dropdown.isEmpty && query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.moveCursorUp();
                    this.dropdown.open();
                },
                _onDownKeyed: function onDownKeyed() {
                    var query = this.input.getQuery();
                    this.dropdown.isEmpty && query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.moveCursorDown();
                    this.dropdown.open();
                },
                _onLeftKeyed: function onLeftKeyed() {
                    this.dir === "rtl" && this._autocomplete();
                },
                _onRightKeyed: function onRightKeyed() {
                    this.dir === "ltr" && this._autocomplete();
                },
                _onQueryChanged: function onQueryChanged(e, query) {
                    this.input.clearHintIfInvalid();
                    query.length >= this.minLength ? this.dropdown.update(query) : this.dropdown.empty();
                    this.dropdown.open();
                    this._setLanguageDirection();
                },
                _onWhitespaceChanged: function onWhitespaceChanged() {
                    this._updateHint();
                    this.dropdown.open();
                },
                _setLanguageDirection: function setLanguageDirection() {
                    var dir;
                    if (this.dir !== (dir = this.input.getLanguageDirection())) {
                        this.dir = dir;
                        this.$node.css("direction", dir);
                        this.dropdown.setLanguageDirection(dir);
                    }
                },
                _updateHint: function updateHint() {
                    var datum, val, query, escapedQuery, frontMatchRegEx, match;
                    datum = this.dropdown.getDatumForTopSuggestion();
                    if (datum && this.dropdown.isVisible() && !this.input.hasOverflow()) {
                        val = this.input.getInputValue();
                        query = Input.normalizeQuery(val);
                        escapedQuery = _.escapeRegExChars(query);
                        frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
                        match = frontMatchRegEx.exec(datum.value);
                        match ? this.input.setHint(val + match[1]) : this.input.clearHint();
                    } else {
                        this.input.clearHint();
                    }
                },
                _autocomplete: function autocomplete(laxCursor) {
                    var hint, query, isCursorAtEnd, datum;
                    hint = this.input.getHint();
                    query = this.input.getQuery();
                    isCursorAtEnd = laxCursor || this.input.isCursorAtEnd();
                    if (hint && query !== hint && isCursorAtEnd) {
                        datum = this.dropdown.getDatumForTopSuggestion();
                        datum && this.input.setInputValue(datum.value);
                        this.eventBus.trigger("autocompleted", datum.raw, datum.datasetName);
                    }
                },
                _select: function select(datum) {
                    this.input.setQuery(datum.value);
                    this.input.setInputValue(datum.value, true);
                    this._setLanguageDirection();
                    this.eventBus.trigger("selected", datum.raw, datum.datasetName);
                    this.dropdown.close();
                    _.defer(_.bind(this.dropdown.empty, this.dropdown));
                },
                open: function open() {
                    this.dropdown.open();
                },
                close: function close() {
                    this.dropdown.close();
                },
                setVal: function setVal(val) {
                    val = _.toStr(val);
                    if (this.isActivated) {
                        this.input.setInputValue(val);
                    } else {
                        this.input.setQuery(val);
                        this.input.setInputValue(val, true);
                    }
                    this._setLanguageDirection();
                },
                getVal: function getVal() {
                    return this.input.getQuery();
                },
                destroy: function destroy() {
                    this.input.destroy();
                    this.dropdown.destroy();
                    destroyDomStructure(this.$node);
                    this.$node = null;
                }
            });
            return Typeahead;
            function buildDom(input, withHint) {
                var $input, $wrapper, $dropdown, $hint;
                $input = $(input);
                $wrapper = $(html.wrapper).css(css.wrapper);
                $dropdown = $(html.dropdown).css(css.dropdown);
                $hint = $input.clone().css(css.hint).css(getBackgroundStyles($input));
                $hint.val("").removeData().addClass("tt-hint").removeAttr("id name placeholder required").prop("readonly", true).attr({
                    autocomplete: "off",
                    spellcheck: "false",
                    tabindex: -1
                });
                $input.data(attrsKey, {
                    dir: $input.attr("dir"),
                    autocomplete: $input.attr("autocomplete"),
                    spellcheck: $input.attr("spellcheck"),
                    style: $input.attr("style")
                });
                $input.addClass("tt-input").attr({
                    autocomplete: "off",
                    spellcheck: false
                }).css(withHint ? css.input : css.inputWithNoHint);
                try {
                    !$input.attr("dir") && $input.attr("dir", "auto");
                } catch (e) {}
                return $input.wrap($wrapper).parent().prepend(withHint ? $hint : null).append($dropdown);
            }
            function getBackgroundStyles($el) {
                return {
                    backgroundAttachment: $el.css("background-attachment"),
                    backgroundClip: $el.css("background-clip"),
                    backgroundColor: $el.css("background-color"),
                    backgroundImage: $el.css("background-image"),
                    backgroundOrigin: $el.css("background-origin"),
                    backgroundPosition: $el.css("background-position"),
                    backgroundRepeat: $el.css("background-repeat"),
                    backgroundSize: $el.css("background-size")
                };
            }
            function destroyDomStructure($node) {
                var $input = $node.find(".tt-input");
                _.each($input.data(attrsKey), function(val, key) {
                    _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
                });
                $input.detach().removeData(attrsKey).removeClass("tt-input").insertAfter($node);
                $node.remove();
            }
        }();
        (function() {
            "use strict";
            var old, typeaheadKey, methods;
            old = $.fn.typeahead;
            typeaheadKey = "ttTypeahead";
            methods = {
                initialize: function initialize(o, datasets) {
                    datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
                    o = o || {};
                    return this.each(attach);
                    function attach() {
                        var $input = $(this), eventBus, typeahead;
                        _.each(datasets, function(d) {
                            d.highlight = !!o.highlight;
                        });
                        typeahead = new Typeahead({
                            input: $input,
                            eventBus: eventBus = new EventBus({
                                el: $input
                            }),
                            withHint: _.isUndefined(o.hint) ? true : !!o.hint,
                            minLength: o.minLength,
                            autoselect: o.autoselect,
                            datasets: datasets
                        });
                        $input.data(typeaheadKey, typeahead);
                    }
                },
                open: function open() {
                    return this.each(openTypeahead);
                    function openTypeahead() {
                        var $input = $(this), typeahead;
                        if (typeahead = $input.data(typeaheadKey)) {
                            typeahead.open();
                        }
                    }
                },
                close: function close() {
                    return this.each(closeTypeahead);
                    function closeTypeahead() {
                        var $input = $(this), typeahead;
                        if (typeahead = $input.data(typeaheadKey)) {
                            typeahead.close();
                        }
                    }
                },
                val: function val(newVal) {
                    return !arguments.length ? getVal(this.first()) : this.each(setVal);
                    function setVal() {
                        var $input = $(this), typeahead;
                        if (typeahead = $input.data(typeaheadKey)) {
                            typeahead.setVal(newVal);
                        }
                    }
                    function getVal($input) {
                        var typeahead, query;
                        if (typeahead = $input.data(typeaheadKey)) {
                            query = typeahead.getVal();
                        }
                        return query;
                    }
                },
                destroy: function destroy() {
                    return this.each(unattach);
                    function unattach() {
                        var $input = $(this), typeahead;
                        if (typeahead = $input.data(typeaheadKey)) {
                            typeahead.destroy();
                            $input.removeData(typeaheadKey);
                        }
                    }
                }
            };
            $.fn.typeahead = function(method) {
                var tts;
                if (methods[method] && method !== "initialize") {
                    tts = this.filter(function() {
                        return !!$(this).data(typeaheadKey);
                    });
                    return methods[method].apply(tts, [].slice.call(arguments, 1));
                } else {
                    return methods.initialize.apply(this, arguments);
                }
            };
            $.fn.typeahead.noConflict = function noConflict() {
                $.fn.typeahead = old;
                return this;
            };
        })();
    })(window.jQuery);   
});

Template.SymptomChecker.onRendered(function(){
    /**
     * ApiMedic.com Sample Avatar, a demo implementation of the ApiMedic.com Symptom Checker by priaid Inc, Switzerland
     * 
     * Copyright (C) 2012 priaid inc, Switzerland
     * 
     * This file is part of The Sample Avatar.
     * 
     * This is free implementation: you can redistribute it and/or modify it under the terms of the
     * GNU General Public License Version 3 as published by the Free Software Foundation.
     * 
     * The ApiMedic.com Sample Avatar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
     * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
     * 
     * See the GNU General Public License for more details. You should have received a copy of the GNU
     * General Public License along with ApiMedic.com. If not, see <http://www.gnu.org/licenses/>.
     * 
     * Authors: priaid inc, Switzerland
     */

    var keys = [
        "litTermsOfUsePolicyPrivacy",//disclaimerText
        "litDisclaimerNotChecked",//disclaimerNotAcceptedText
        "litAddAdditionalComplaints",//noSelectedSymptomsText
        "litEmergencyInfo",//diagnosisMessage
        "litEmptyDiagnosisDataTemplate",//noDiagnosisMessage
        "litSuggestedSymptoms",//proposedSymptomsText
        "litCarouselItem4",//symptomListMessage
        "genAvatarText",//skinText
        "litYears",//bornOnText
        "litSearchSymptoms",//typeYourSymptomsText
        "genSelectSymptoms",//selectSymptomsText
        "genSelectedSymptoms",//selectedSymptomsText
        "genPossibleDiseases",//possibleDiseasesText
        "btnGenerateDiagnose",//makeDiagnosisText
        "txtProfessionalName",//litProfName
        "genShortDescription",//litShortDescription
        "genDescription",//litDescription
        "genOccurrence",//litOccurrence
        "genSymptom",//litSymptom
        "genFollow1",//litFollow
        "genTreatment",//litTreatment
        "litPossibleSymptoms",//litPossibleSymptoms
        "litTermsOfUse", //litTermsOfUse
        "litPrivacyPolicy" // litPrivacyPolicy
    ];

    var disclaimerText = "";
    var disclaimerNotAcceptedText = "";
    var noSelectedSymptomsText = "";
    var diagnosisMessage = "";
    var noDiagnosisMessage = "";
    var proposedSymptomsText = "";
    var symptomListMessage = "";
    var skinText = "";
    var bornOnText = "";
    var typeYourSymptomsText = "";
    var selectSymptomsText = "";
    var selectedSymptomsText = "";
    var possibleDiseasesText = "";
    var makeDiagnosisText = "";

    var litProfName = "";
    var litShortDescription = "";
    var litDescription = "";
    var litOccurrence = "";
    var litSymptom = "";
    var litFollow = "";
    var litTreatment = "";
    var litPossibleSymptoms = "";
    var litTermsOfUse = "";
    var litPrivacyPolicy = "";
    var resObj = {};



    /////////////////////////////Optional parameters//////////////////////////////////

    /// Path to priaid webservice
    var pathToWebservice;

    /// Only for internal use
    var currentPlatform = "webservice";

    /// Required language
    var language = "";

    /// Security token for webservice access
    var token;

    /// Specialisation search url
    var specUrl = "/specialisation";

    /// Include always all specialisations for custom urls
    var includeAllSpec = false;

    /// Use redirect mode instead of selecting body parts
    var redirectMode = false;

    /// Redirect address
    var redirectUrl = "";

    /// Terms url
    var termsUrl = "/Terms_en-gb.html"; // Your terms html page

    /// Privacy url
    var privacyUrl = "/Privacy_en-gb.html"; // Your privacy policy html page

    /// SelectorMode : diagnosis or specialisation
    var mode = "diagnosis";

    //////////////////////////////////////////////////////////////////////
    /////////////Symptom selector plugin start///////////////////////

    (function ($) {

        var _plugin;

        var selectorStatus =
            {
                Man: "Man",
                Woman: "Woman",
                Boy: "Boy",
                Girl: "Girl"
            };

        var Gender =
            {
                Male: "Male",
                Female: "Female"
            };

        var SymptomsLocations =
            {
                Head: 6,
                Chest: 15,
                Arms: 7,
                Legs: 10,
                Hips: 16,
                Skin: 17
            };

        var _childAvatar;
        var _womanAvatar;
        var _manAvatar;
        var _childAvatarSmall;
        var _womanAvatarSmall;
        var _manAvatarSmall;
        var _symptomList;

        var _yearSelector;

        var _selectedSelectorStatus;
        var _selectedBodyPart;
        var _selectedGender;
        var _selectedYear;

        var d = new Date();
        var n = parseInt(d.getFullYear());

        var _defaultAdultYear = n - 25;
        var _defaultChildYear = n - 8;
        var _edgeYears = n - 11;

        var _statusLinkBorderColor = "cccccc";
        var pathToImages = "http://apimedic.net/symptomcheckeravatar/symptom_selector/images";
        var symptomListId = "symptomList";
        var _diagnosisListId = "diagnosisList";



        var methods = {

            init: function (options) {

                return this.each(function () {
                    _plugin = $(this);
                    pathToWebservice = options.webservice;
                    language = options.language;
                    token = options.accessToken;

                    if (options.specUrl) {
                        specUrl = options.specUrl;
                    }

                    if (options.includeAllSpec)
                        includeAllSpec = options.includeAllSpec;

                    if (options.platform)
                        currentPlatform = options.platform;

                    if (options.redirectUrl) {
                        setCookie("selectedBodyPart", "", -1);
                        redirectUrl = options.redirectUrl;
                    }

                    if (options.termsUrl) {
                        termsUrl = options.termsUrl;
                    }

                    if (options.privacyUrl) {
                        privacyUrl = options.privacyUrl;
                    }

                    if (options.mode) {
                        mode = options.mode;
                    }

                    _ajaxGetSpecificResources();

                });
            },
            Resize: function (options) {
                var currentAvatar = _getAvatarByStatus(_selectedSelectorStatus);
                _resizeSelector(currentAvatar);
            },
            Select: function (options) {
                var currentAvatar = _getAvatarByStatus(_selectedSelectorStatus);
                _resizeSelector(currentAvatar);
            },
            GetSelectedSymptoms: function (options) {
                return $("#" + symptomListId).symptomList("GetSelectedSymptoms");
            },
            Unbind: function (options) {
                if (_symptomList.children().length != 0)
                    _symptomList.symptomList("Unbind");
                if ($("#" + _diagnosisListId).children().length != 0)
                    $("#" + _diagnosisListId).diagnosis("Unbind");

                var avatar = _getAvatarByStatus(_selectedSelectorStatus);
                avatar.mapster('unbind');

                $("#prefetch .typeahead").typeahead("destroy");
                _plugin.unbind('click');
                _plugin.empty();
            }
        };

        $.fn.symptomSelector = function (method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.symptomSelector');
            }

        };

        //////////////////ajax calls//////////////////////////////////////////

        function _ajaxGetSymptoms(initTypeAhead) {
            $.ajax({
                url: pathToWebservice + "/symptoms/0/" + _selectedSelectorStatus,
                type: "GET",
                data:
                    {
                        token: token,
                        format: "json",
                        language: language,
                        platform: currentPlatform
                    },
                contentType: "application/json; charset=utf-8",
                cache: false,
                async: false,
                dataType: "jsonp",
                jsonp: "callback",
                jsonpCallback: "fillResults",
                success: function (responseData) { fillResults(responseData, initTypeAhead); },
                beforeSend: function (jqXHR, settings) {
                    $('#loader').show();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (window.console)
                        console.log(xhr.responseText);
                },
                complete: function () {
                    $('#loader').hide();
                }
            });

        }

        function _ajaxGetSpecificResources() {
            $.ajax({
                url: pathToWebservice + "/specificresources",
                type: "GET",
                data:
                    {
                        keys: JSON.stringify(keys),
                        token: token,
                        format: "json",
                        language: language
                    },
                async: false,
                contentType: "application/json; charset=utf-8",
                cache: false,
                dataType: "jsonp",
                jsonp: "callback",
                jsonpCallback: "_setSpecificResourcesCallback",
                success: function (responseData) { _setSpecificResourcesCallback(responseData); },
                beforeSend: function (jqXHR, settings) {
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (window.console)
                        console.log(xhr.responseText);
                },
                complete: function () {
                }
            });
        }

        //////////////////ajax calls end//////////////////////////////////////

        //////////////////private functions//////////////////////////////////////////
        function _setUpSelector() {
            _selectedSelectorStatus = getCookie("selectedSelectorStatus") !== "" ? getCookie("selectedSelectorStatus") : selectorStatus.Man;
            _selectedBodyPart = getCookie("selectedBodyPart") !== "" ? parseInt(getCookie("selectedBodyPart")) : "";
            //_selectedBodyPart = "";
            _selectedGender = getCookie("selectedGender") !== "" ? getCookie("selectedGender") : Gender.Male;
            _selectedYear = getCookie("selectedYear") !== "" ? parseInt(getCookie("selectedYear")) : _defaultAdultYear;

            _createSelectorHeader();
            _createSelectorTable();
            _createImageMaps();

            var avatarOptions = new Object();
            avatarOptions.LocationId = _selectedBodyPart;
            avatarOptions.SelectorStatus = _selectedSelectorStatus;
            avatarOptions.Gender = _selectedGender;
            avatarOptions.YearOfBirth = _selectedYear;
            _ajaxGetSymptoms(true);
            _symptomList = $("#" + symptomListId).symptomList(avatarOptions);
            _symptomList.symptomList("LoadBodyLocations", avatarOptions);
            _highlightBodyParts();
        }

        function _createSelectorTable() {
            var selectorTable = jQuery("<table/>", {
            });

            var selectorTableRow = jQuery("<tr/>", {
            });

            var statusContainer = _createChangeStatusContainer();

            var avatarContainer = _createAvatarContainer();

            selectorTableRow.append(statusContainer);
            selectorTableRow.append(avatarContainer);

            selectorTable.append(selectorTableRow);

            _markSelectedStatus(_selectedSelectorStatus);

            _plugin.append(selectorTable);

            if (_selectedSelectorStatus == selectorStatus.Boy || _selectedSelectorStatus == selectorStatus.Girl) {
                _createChildGenderSelector();
            }
        }
        function _createChangeStatusContainer() {
            var statusContainer = jQuery("<td/>", {
                "class": "status-container"
            });

            this._manAvatarSmall = _createStatusChangeLink(selectorStatus.Man);
            this._womanAvatarSmall = _createStatusChangeLink(selectorStatus.Woman);
            //TODO: ADD girl avatar
            this._childAvatarSmall = _createStatusChangeLink(selectorStatus.Boy);

            statusContainer.append(this._manAvatarSmall);
            statusContainer.append(this._womanAvatarSmall);
            statusContainer.append(this._childAvatarSmall);

            return statusContainer;
        }

        function _createAvatarContainer() {
            var avatarContainer = jQuery("<td/>", {
                "class": "avatar-container"
            });

            return avatarContainer;
        }

        function _createImageMaps() {
            _addImages();
            _createManMap();
            _createWomanMap();
            _createChildMap();
            _createSkinLink();
        }

        function _addImages() {
            this._manAvatar = jQuery("<img/>", {
                id: "manImg",
                src: pathToImages + "/male.png",
                usemap: "#manMap"
            });

            this._womanAvatar = jQuery("<img/>", {
                id: "womanImage",
                src: pathToImages + "/female.png",
                usemap: "#womanMap"
            });

            this._childAvatar = jQuery("<img/>", {
                id: "childImage",
                src: pathToImages + "/child.png",
                usemap: "#childMap"
            });

            switch (_selectedSelectorStatus) {
                case (selectorStatus.Man):
                    this._womanAvatar.hide();
                    this._childAvatar.hide();
                    break;
                case (selectorStatus.Woman):
                    this._manAvatar.hide();
                    this._childAvatar.hide();
                    break;
                case (selectorStatus.Boy):
                    this._manAvatar.hide();
                    this._womanAvatar.hide();
                    break;
                case (selectorStatus.Girl):
                    this._manAvatar.hide();
                    this._womanAvatar.hide();
                    break;
            }

            _plugin.find(".avatar-container").append(this._manAvatar);
            _plugin.find(".avatar-container").append(this._womanAvatar);
            _plugin.find(".avatar-container").append(this._childAvatar);
        }

        function _createManMap() {
            var manMap = jQuery("<map/>", {
                id: "manMap",
                name: "manMap"
            });

            var area1 = jQuery("<area/>", {
                shape: "poly",
                coords: "152,3, 150,1, 134,5, 123,12, 116,26, 114,41, 111,52, 114,64, 120,77, 124,86, 126,98, 123,110, 183,110, 179,98, 181,87, 183,75, 189,66, 195,59, 193,51, 191,46, 187,39, 186,31, 186,25, 181,17, 177,12, 171,6, 161,1, 154,1",
                accesskey: "0",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Head); }
            });

            var area2 = jQuery("<area/>", {
                shape: "poly",
                coords: "122,109, 119,106, 109,115, 97,121, 86,123, 79,126, 75,127, 75,182, 75,202, 76,213, 78,227, 79,237, 82,252, 84,258, 86,268, 221,268, 230,233, 233,213, 233,187, 233,175, 233,160, 233,126, 229,124, 204,117, 189,110, 117,110",
                accesskey: "1",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Chest); }
            });

            var area3 = jQuery("<area/>", {
                shape: "poly",
                coords: "85,268, 91,303, 90,319, 87,342, 84,363, 83,380, 80,400, 79,411, 79,420, 80,433, 231,433, 231,398, 229,375, 224,340, 222,316, 220,287, 221,268, 84,268",
                accesskey: "2",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Hips); }
            });

            var area4 = jQuery("<area/>", {
                shape: "poly",
                coords: "80,433, 78,433, 80,453, 84,481, 85,505, 84,532, 80,559, 77,585, 79,612, 83,653, 85,691, 85,716, 79,734, 76,753, 85,764, 99,767, 111,766, 120,762, 126,754, 125,741, 123,725, 121,707, 116,671, 117,647, 126,626, 127,606, 127,590, 124,577, 124,567, 135,524, 141,489, 146,466, 150,450, 153,438, 158,441, 166,468, 172,505, 181,547, 186,569, 182,592, 183,612, 188,639, 191,659, 188,704, 186,738, 185,754, 190,767, 207,767, 224,762, 232,753, 232,742, 227,730, 222,720, 223,705, 221,685, 221,677, 225,653, 230,622, 232,599, 231,567, 228,538, 228,511, 230,488, 232,467, 231,447, 231,433, 79,433",
                accesskey: "3",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Legs); }
            });

            var area5 = jQuery("<area/>", {
                shape: "poly",
                coords: "51,130, 33,146, 25,170, 25,187, 26,222, 24,239, 27,265, 22,283, 20,301, 21,316, 22,326, 16,338, 8,354, 6,363, 1,376, 6,380, 14,369, 23,382, 26,401, 34,414, 47,411, 50,405, 52,396, 56,392, 60,378, 59,360, 55,347, 53,337, 54,324, 59,303, 65,288, 66,270, 65,253, 65,249, 75,236, 75,221, 75,124, 53,129, 233,126, 262,136, 274,152, 280,174, 279,194, 282,221, 286,253, 283,286, 285,312, 288,340, 297,348, 301,362, 307,374, 305,378, 298,373, 293,366, 288,383, 282,403, 273,413, 266,411, 261,404, 258,397, 254,394, 250,375, 248,357, 250,349, 251,344, 255,333, 255,326, 250,300, 246,276, 244,255, 233,242, 233,237, 233,125",
                accesskey: "4",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Arms); }
            });

            manMap.append(area1);
            manMap.append(area2);
            manMap.append(area3);
            manMap.append(area4);
            manMap.append(area5);

            _plugin.find(".avatar-container").append(manMap);
        }

        function _createWomanMap() {
            var womanMap = jQuery("<map/>", {
                id: "womanMap",
                name: "womanMap"
            });

            var area1 = jQuery("<area/>", {
                shape: "poly",
                coords: "150,1, 124,8, 115,17, 110,36, 104,54, 98,71, 96,85, 98,102, 107,119, 118,130, 122,138, 185,138, 189,135, 187,132, 189,125, 201,113, 207,95, 208,76, 205,65, 201,52, 199,33, 195,24, 185,11, 168,3, 153,1",
                accesskey: "0",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Head); }
            });

            var area2 = jQuery("<area/>", {
                shape: "poly",
                coords: "121,139, 105,139, 95,187, 89,208, 90,220, 96,227, 103,235, 105,245, 204,245, 206,236, 211,226, 218,217, 221,209, 219,194, 201,142, 188,139, 120,139",
                accesskey: "1",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Chest); }
            });

            var area3 = jQuery("<area/>", {
                shape: "poly",
                coords: "104,244, 106,270, 108,292, 103,311, 97,329, 92,346, 90,359, 90,375, 91,386, 222,386, 223,365, 220,348, 217,329, 211,315, 208,300, 203,287, 203,277, 204,260, 205,244, 103,244",
                accesskey: "2",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Hips); }
            });

            var area4 = jQuery("<area/>", {
                shape: "poly",
                coords: "91,386, 94,437, 101,489, 109,532, 105,554, 99,577, 98,595, 102,621, 112,664, 116,704, 105,729, 96,742, 94,752, 104,760, 121,764, 133,762, 139,755, 143,747, 143,735, 138,714, 140,662, 144,626, 146,596, 141,559, 140,545, 142,513, 145,482, 148,447, 150,410, 147,397, 151,392, 157,396, 159,423, 160,463, 163,505, 167,537, 165,565, 159,594, 162,625, 166,652, 168,687, 166,714, 163,735, 162,752, 169,761, 185,765, 204,760, 213,747, 211,738, 205,732, 195,715, 191,695, 192,674, 197,653, 203,630, 209,607, 211,585, 207,568, 202,556, 200,540, 199,523, 205,501, 211,475, 215,456, 221,426, 221,405, 222,386, 94,386",
                accesskey: "3",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Legs); }
            });

            var area5 = jQuery("<area/>", {
                shape: "poly",
                coords: "106,141, 84,141, 68,148, 60,163, 56,184, 53,227, 49,264, 47,289, 38,316, 28,344, 13,361, 3,368, 3,374, 13,375, 7,390, 8,400, 15,407, 33,403, 41,388, 46,374, 46,361, 53,344, 64,323, 74,298, 80,275, 83,247, 85,217, 93,194, 106,141, 205,141, 224,141, 234,148, 251,169, 256,189, 259,217, 263,245, 269,267, 276,293, 279,326, 283,346, 295,359, 304,370, 301,375, 293,374, 300,386, 302,396, 296,404, 287,407, 276,404, 270,393, 266,380, 262,364, 263,351, 258,335, 249,315, 244,294, 237,267, 233,241, 226,213, 200,141",
                accesskey: "4",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Arms); }
            });

            womanMap.append(area1);
            womanMap.append(area2);
            womanMap.append(area3);
            womanMap.append(area4);
            womanMap.append(area5);

            _plugin.find(".avatar-container").append(womanMap);
        }

        function _createChildMap() {
            var childMap = jQuery("<map/>", {
                id: "childMap",
                name: "childMap"
            });

            var area1 = jQuery("<area/>", {
                shape: "poly",
                coords: "125,1, 89,12, 78,32, 75,63, 79,92, 91,115, 101,128, 96,152, 160,152, 154,129, 169,111, 177,91, 182,61, 180,33, 168,13, 147,4, 128,2",
                accesskey: "0",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Head); }
            });

            var area2 = jQuery("<area/>", {
                shape: "poly",
                coords: "94,147, 92,147, 70,153, 56,158, 56,263, 59,286, 62,307, 196,307, 204,266, 199,161, 163,152, 94,152",
                accesskey: "1",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Chest); }
            });

            var area3 = jQuery("<area/>", {
                shape: "poly",
                coords: "60,307, 59,343, 58,376, 61,439, 192,439, 197,399, 199,362, 197,329, 197,307, 66,307",
                accesskey: "2",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Hips); }
            });

            var area4 = jQuery("<area/>", {
                shape: "poly",
                coords: "61,439, 61,474, 66,531, 65,569, 69,613, 74,651, 78,693, 75,716, 56,746, 57,756, 73,762, 89,764, 102,758, 111,744, 114,730, 113,720, 110,706, 113,676, 117,643, 121,598, 119,568, 121,539, 123,511, 125,475, 127,440, 131,511, 132,559, 133,597, 135,627, 139,660, 147,701, 144,733, 150,751, 164,761, 183,764, 202,757, 202,749, 195,737, 184,714, 179,688, 184,651, 188,610, 189,581, 187,556, 186,526, 189,489, 191,458, 193,439, 64,439",
                accesskey: "3",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Legs); }
            });

            var area5 = jQuery("<area/>", {
                shape: "poly",
                coords: "56,158, 34,175, 27,193, 21,216, 18,246, 16,276, 11,300, 6,329, 6,356, 7,389, 9,415, 10,437, 12,450, 18,459, 34,465, 43,463, 46,445, 47,432, 46,419, 40,407, 38,387, 41,356, 46,323, 46,305, 48,281, 56,264, 56,158, 199,162, 218,173, 229,196, 236,235, 243,290, 252,324, 251,349, 249,382, 252,412, 250,448, 234,464, 221,465, 214,449, 212,432, 216,415, 221,401, 223,380, 217,348, 215,321, 211,299, 204,273, 199,162",
                accesskey: "4",
                href: "javascript:void(0)",
                click: function () { _selectBodyPart(SymptomsLocations.Arms); }
            });

            childMap.append(area1);
            childMap.append(area2);
            childMap.append(area3);
            childMap.append(area4);
            childMap.append(area5);

            _plugin.find(".avatar-container").append(childMap);
        }

        function _createStatusChangeLink(selectedStatus) {
            var imgSrc;
            switch (selectedStatus) {
                case selectorStatus.Man:
                    imgSrc = pathToImages + "/male_small.png";
                    break;
                case selectorStatus.Woman:
                    imgSrc = pathToImages + "/female_small.png";
                    break;
                case selectorStatus.Boy:
                    imgSrc = pathToImages + "/child_small.png";
                    break;
                case selectorStatus.Girl:
                    imgSrc = pathToImages + "/child_small.png";
                    break;
            }

            var statusLink = jQuery("<a/>", {
                "class": "status-change-link",
                href: "javascript:void(0)",
                click: function () { _setSelectorStatus(selectedStatus); }
            });

            var statusLinkImg = jQuery("<img/>", {
                src: imgSrc
            });

            statusLink.append(statusLinkImg);

            return statusLink;
        }

        function _createSkinLink() {
            var skinLink = jQuery("<a/>", {
                "class": "skin-link",
                href: "javascript:void(0)",
                //text: skinText,
                click: function () { _selectBodyPart(SymptomsLocations.Skin); }
            });

            var skin_Text = jQuery("<span/>", {
                text: skinText
            });

            var skinImage = jQuery("<img/>", {
                id: "skinImg",
                "class": "skin-image",
                src: pathToImages + "/skin-joint-general-bw-hellgrau-small.png",
                alt: skinText
            });

            skinLink.hover(
            function () {
                $(this).find(".skin-image").attr("src", pathToImages + "/skin-joint-general-bw-hellgrau-smallhover.png");
            },
            function () {
                $(this).find(".skin-image").attr("src", pathToImages + "/skin-joint-general-bw-hellgrau-small.png");
            });

            skinLink.append(skinImage);
            skinLink.append(skin_Text);

            _plugin.find(".avatar-container").append(skinLink);
        }

        function _createChildAvatarSmallMale() {
            var male = jQuery("<a/>", {
                id: "btnMale",
                href: "javascript:void(0)",
                "class": "child-gender-selector"
            });

            var maleIcon = jQuery("<i/>", {
                "class": "fa fa-male"
            });

            var checkIconChecked = jQuery("<i/>", {
                "class": "fa fa-check-square-o"
            });

            var checkIconUnchecked = jQuery("<i/>", {
                "class": "fa fa-square-o"
            });

            if (_selectedGender == Gender.Male)
                male.append(checkIconChecked);
            else
                male.append(checkIconUnchecked);

            male.append(maleIcon);

            male.bind('click', function () {
                $(this).addClass("disabled");
                $(this).find(".fa-square-o").addClass("fa-check-square-o");
                $(this).find(".fa-square-o").removeClass("fa-square-o");
                $("#btnFemale").find(".fa-check-square-o").addClass("fa-square-o");
                $("#btnFemale").find(".fa-check-square-o").removeClass("fa-check-square-o")
                $("#btnFemale").removeClass("disabled");
                _setSelectedGender(Gender.Male);
                _setSelectorStatus(selectorStatus.Boy);
            });

            return male;
        }

        function _createChildAvatarSmallFemale() {
            var female = jQuery("<a/>", {
                id: "btnFemale",
                href: "javascript:void(0)",
                "class": "child-gender-selector"
            });

            var femaleIcon = jQuery("<i/>", {
                "class": "fa fa-female"
            });

            var checkIconChecked = jQuery("<i/>", {
                "class": "fa fa-check-square-o"
            });

            var checkIconUnchecked = jQuery("<i/>", {
                "class": "fa fa-square-o"
            });

            if (_selectedGender == Gender.Female)
                female.append(checkIconChecked);
            else
                female.append(checkIconUnchecked);

            female.append(femaleIcon);

            female.bind('click', function () {
                $(this).addClass("disabled");
                $(this).find(".fa-square-o").addClass("fa-check-square-o");
                $(this).find(".fa-square-o").removeClass("fa-square-o");
                $("#btnMale").find(".fa-check-square-o").addClass("fa-square-o");
                $("#btnMale").find(".fa-check-square-o").removeClass("fa-check-square-o");
                $("#btnMale").removeClass("disabled");
                _setSelectedGender(Gender.Female);
                _setSelectorStatus(selectorStatus.Girl);
            });

            return female;
        }

        function _createChildGenderSelector() {
            var childGenderSelectorContainer = jQuery("<div/>", {
                "class": "child-gender-selector-container"
            });

            var childAvatarSmallMale = _createChildAvatarSmallMale();
            var childAvatarSmallFemale = _createChildAvatarSmallFemale();

            childGenderSelectorContainer.append(childAvatarSmallMale);
            childGenderSelectorContainer.append(childAvatarSmallFemale);

            _plugin.find(".status-container").append(childGenderSelectorContainer);
        }

        function _removeChildGenderSelector() {
            _plugin.find(".child-gender-selector-container").remove();
        }

        function _createSelectorHeader() {
            SetTranslationResources();
            var header = jQuery("<div/>", {
            });

            var searchField = _createSearchField();
            this._yearSelector = _createYearsField();

            var yearContainer = jQuery("<div/>", {
                "class": "year-container"
            });

            var yearIcon = jQuery("<i/>", {
                "class": "fa fa-calendar"
            });

            var yearText = jQuery("<span/>", {
                "class": "year-text",
                "text": bornOnText
            });

            yearContainer.append(yearIcon);
            yearContainer.append(yearText);
            yearContainer.append(this._yearSelector);

            header.append(searchField);
            header.append(yearContainer);

            _plugin.append(header);
        }

        function _createSearchField() {
            var searchField = jQuery("<input/>", {
                "id": "txtSearchSymptoms",
                "class": "typeahead",
                "placeholder": typeYourSymptomsText
            });
            var searchContainer = jQuery("<div/>", {
                "id": "prefetch"
            });

            searchContainer.append(searchField);
            return searchContainer;
        }

        function _createYearsField() {
            var ddlYears = jQuery("<select/>", {
                "id": "ddlYears"
            });

            var d = new Date();
            var n = parseInt(d.getFullYear());

            for (var i = n; i > (n - 100) ; i--) {
                var opt = jQuery("<option/>", {
                    "text": i,
                    "value": i
                });
                ddlYears.append(opt);
            }

            ddlYears.bind('change', function () {
                _handleSelectedYearChanged($(this).val());
            });

            ddlYears.val(_selectedYear);

            return ddlYears;
        }

        function _handleSelectedYearChanged(selectedYear) {
            _setSelectedYear(selectedYear);

            if (parseInt(selectedYear) < _edgeYears) {
                if (_selectedSelectorStatus == selectorStatus.Boy || _selectedSelectorStatus == selectorStatus.Girl) {
                    if (_selectedGender == Gender.Male)
                        _setSelectorStatus(selectorStatus.Man);
                    else
                        _setSelectorStatus(selectorStatus.Woman);
                }
                else {
                    _makeDiagnosis();
                }
            }
            else {
                if (_selectedSelectorStatus == selectorStatus.Man || _selectedSelectorStatus == selectorStatus.Woman) {
                    if (_selectedGender == Gender.Male)
                        _setSelectorStatus(selectorStatus.Boy);
                    else
                        _setSelectorStatus(selectorStatus.Girl);
                }
                else {
                    _setSelectorStatus(_selectedSelectorStatus);
                }
            }
        }

        function _highlightBodyParts() {
            var currentAvatar = _getAvatarByStatus(_selectedSelectorStatus);
            currentAvatar.mapster({
                fillColor: 'acacac',
                fillOpacity: 0.3,
                //isSelectable: true,
                clickNavigate: true,
                scaleMap: true,
                //singleSelect: true,
                mapKey: 'accesskey' //  (see http://www.outsharked.com/imagemapster/default.aspx?docs.html)
                //stroke: true,
                //strokeColor: "585858",
                //strokeOpacity: 0.8,
                //strokeWidth: 1
            });
            _selectBodyPart(_selectedBodyPart);
            _resizeSelector(currentAvatar);
        }

        function _resizeSelector(avatar) {
            var avatarHeight = _plugin.find(".avatar-container").height();
            if (_selectedSelectorStatus == selectorStatus.Boy || _selectedSelectorStatus == selectorStatus.Girl) {
                avatarHeight = avatarHeight * 0.7;
            }
            avatar.mapster('resize', 0, avatarHeight, 100);
        }

        function _selectBodyPart(location) {
            if (location === "")
                return;

            var currentAvatar = _getAvatarByStatus(_selectedSelectorStatus);
            _setSelectedBodyPart(location);

            // use try/catch to hide image mapster child resizing problem
            try {
                $('area').mapster('deselect');
            }
            catch (e) { }

            switch (location) {
                case SymptomsLocations.Head:
                    currentAvatar.mapster('set', true, "0");
                    break;
                case SymptomsLocations.Chest:
                    currentAvatar.mapster('set', true, "1");
                    break;
                case SymptomsLocations.Arms:
                    currentAvatar.mapster('set', true, "4");
                    break;
                case SymptomsLocations.Legs:
                    currentAvatar.mapster('set', true, "3");
                    break;
                case SymptomsLocations.Hips:
                    currentAvatar.mapster('set', true, "2");
                    break;
                case SymptomsLocations.Skin:
                    currentAvatar.mapster('set', true, "0,1,2,3,4");
                    break;
            }

            if (redirectUrl !== "") {
                setTimeout(function () { window.location = redirectUrl; }, 500);
                return;
            }

            if (location !== "")
                _fillBodySublocationList(location);
        }

        function _fillBodySublocationList(location) {
            var options = new Object();
            options.LocationId = location;
            options.SelectorStatus = _selectedSelectorStatus;
            options.Gender = _selectedGender;
            options.YearOfBirth = _selectedYear;
            _symptomList.symptomList("LoadBodySublocations", options);
        }
        function _showMainAvatar(selectedStatus) {
            var avatar = _getAvatarByStatus(selectedStatus);
            avatar.show();
            _highlightBodyParts();
        }

        function _hideMainAvatar(selectedStatus) {
            var avatar = _getAvatarByStatus(selectedStatus);
            avatar.mapster('unbind');
            avatar.hide();
        }

        function _getSmallAvatarByStatus(selectedStatus) {
            switch (selectedStatus) {
                case selectorStatus.Man:
                    return this._manAvatarSmall;
                case selectorStatus.Woman:
                    return this._womanAvatarSmall;
                case selectorStatus.Boy:
                    return this._childAvatarSmall;
                case selectorStatus.Girl:
                    return this._childAvatarSmall;
            }
        }

        function _getAvatarByStatus(selectedStatus) {
            switch (selectedStatus) {
                case selectorStatus.Man:
                    return this._manAvatar;
                case selectorStatus.Woman:
                    return this._womanAvatar;
                case selectorStatus.Boy:
                    return this._childAvatar;
                case selectorStatus.Girl:
                    return this._childAvatar;
            }
        }

        function _setSelectedBodyPart(selectedBodyPart) {
            _selectedBodyPart = selectedBodyPart;
            setCookie("selectedBodyPart", selectedBodyPart, 1);
        }

        function _setSelectorStatus(selectedStatus) {
            setCookie("selectedSelectorStatus", selectedStatus, 1);
            _hideMainAvatar(_selectedSelectorStatus);
            _clearSelectedStatusMark(_selectedSelectorStatus);
            _selectedSelectorStatus = selectedStatus;
            _showMainAvatar(_selectedSelectorStatus);
            _markSelectedStatus(selectedStatus);

            switch (selectedStatus) {
                case (selectorStatus.Man):
                    _setSelectedGender(Gender.Male);
                    _removeChildGenderSelector();
                    if (_edgeYears <= parseInt(this._yearSelector.val()))
                        _setSelectedYear(_defaultAdultYear);
                    break;
                case (selectorStatus.Woman):
                    _setSelectedGender(Gender.Female);
                    _removeChildGenderSelector();
                    if (_edgeYears <= parseInt(this._yearSelector.val()))
                        _setSelectedYear(_defaultAdultYear);
                    break;
                case (selectorStatus.Boy):
                    _removeChildGenderSelector();
                    _createChildGenderSelector();
                    if (_edgeYears > parseInt(this._yearSelector.val()))
                        _setSelectedYear(_defaultChildYear);
                    break;
                case (selectorStatus.Girl):
                    _removeChildGenderSelector();
                    _createChildGenderSelector();
                    if (_edgeYears > parseInt(this._yearSelector.val()))
                        _setSelectedYear(_defaultChildYear);
                    break;
            }
            _ajaxGetSymptoms(false);
            _makeDiagnosis();
        }

        function _setSelectedGender(selectedGender) {
            setCookie("selectedGender", selectedGender, 1);
            _selectedGender = selectedGender;
        }

        function _setSelectedYear(selectedYear) {
            setCookie("selectedYear", selectedYear, 1);
            this._yearSelector.val(selectedYear);
            _selectedYear = selectedYear;
        }

        function _markSelectedStatus(selectedStatus) {
            var selectedSmallAvatar = _getSmallAvatarByStatus(selectedStatus);
            selectedSmallAvatar.css("border", "2px solid #" + _statusLinkBorderColor);
        }

        function _clearSelectedStatusMark(selectedStatus) {
            var selectedSmallAvatar = _getSmallAvatarByStatus(selectedStatus);
            selectedSmallAvatar.css("border", "none");
        }

        function _makeDiagnosis() {
            if (mode == "booking")
                return;

            if (isDisclaimerChecked()) {
                var options = new Object();

                options.Symptoms = _symptomList.symptomList("GetSelectedSymptoms");
                options.Gender = _selectedGender;
                options.YearOfBirth = _selectedYear;
                if (mode == "diagnosis")
                    $("#" + _diagnosisListId).diagnosis("GetDiagnosis", options);

                if (mode == "specialisations")
                    $("#" + _diagnosisListId).specialisations("GetSpecialisations", options);

                _symptomList.symptomList("LoadProposedSymptoms", options);
            }

        }

        var substringMatcher = function (strs) {
            return function findMatches(q, cb) {
                var matches, substrRegex;

                // an array that will be populated with substring matches
                matches = [];

                // regex used to determine if a string contains the substring `q`
                substrRegex = new RegExp(q, 'i');

                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                $.each(strs, function (i, str) {
                    if (substrRegex.test(str.Name)) {
                        // the typeahead jQuery plugin expects suggestions to a
                        // JavaScript object, refer to typeahead docs for more info
                        matches.push({ value: str.Name });
                    }
                });

                cb(matches);
            };
        };

        var fillResults = function (symptoms, initTypeAhead) {
            var _symptoms = new Array();
            $.each(symptoms, function () {
                if (this.Name !== "" && this.Name !== " ")
                    _symptoms.push(this);
            });

            var options = new Object();
            options.LocationId = location;
            options.SelectorStatus = _selectedSelectorStatus;
            options.Gender = _selectedGender;
            options.YearOfBirth = _selectedYear;
            options.ValidSymptoms = _symptoms;

            _symptomList.symptomList("SetValidSymptoms", options);

            if (initTypeAhead)
                _initTypeAhead();
            else {
                $("#prefetch .typeahead").typeahead("destroy");
                _initTypeAhead();
            }

        };

        function _initTypeAhead() {
            $('#prefetch .typeahead').typeahead({
                hint: true,
                highlight: true,
                minLength: 2
            },
            {
                name: '_symptoms',
                displayKey: 'value',

                source: substringMatcher(_symptomList.symptomList("GetValidSymptoms"))
            }
            ).bind("typeahead:selected", function (obj, datum, name) {
                var result = $.grep(_symptomList.symptomList("GetValidSymptoms"), function (e) { return e.Name == datum.value; });
                var options = new Object();
                options.ID = result[0].ID;
                options.Name = result[0].Name;
                _symptomList.symptomList("SelectSymptom", options);
            });
        }


        function _setResourcesCallback(resources) {

            if (resources.length > 0) {
                var skinText = resources[0].Key;//("btnContactForm");
            }
        }

        function _setSpecificResourcesCallback(resources) {

            if (resources.length > 0) {

                $.each(resources, function () {
                    resObj[this.Key] = this.Value;

                });
                SetTranslationResources();
                _setUpSelector();
                $("#selectSymptomsTitle").text(selectSymptomsText);
                $("#selectedSymptomsTitle").text(selectedSymptomsText);
                $("#possibleDiseasesTitle").text(possibleDiseasesText);
            }
        }

        function SetTranslationResources() {

            if (resObj != null) {
                disclaimerText = resObj.litTermsOfUsePolicyPrivacy;
                litTermsOfUse = resObj.litTermsOfUse;
                litPrivacyPolicy = resObj.litPrivacyPolicy;
                disclaimerNotAcceptedText = resObj.litDisclaimerNotChecked;
                noSelectedSymptomsText = resObj["litAddAdditionalComplaints"];
                diagnosisMessage = resObj["litEmergencyInfo"];
                noDiagnosisMessage = resObj["litEmptyDiagnosisDataTemplate"];
                proposedSymptomsText = resObj["litSuggestedSymptoms"];
                symptomListMessage = resObj["litCarouselItem4"];
                skinText = resObj["genAvatarText"];
                bornOnText = resObj.litYears;
                typeYourSymptomsText = resObj.litSearchSymptoms;
                selectSymptomsText = resObj.genSelectSymptoms;
                selectedSymptomsText = resObj.genSelectedSymptoms;
                possibleDiseasesText = resObj.genPossibleDiseases;

                makeDiagnosisText = resObj.btnGenerateDiagnose;
                litProfName = resObj.txtProfessionalName;
                litShortDescription = resObj.genShortDescription;
                litDescription = resObj.genDescription;
                litOccurrence = resObj.genOccurrence;
                litSymptom = resObj.genSymptom;
                litFollowgen = resObj.genFollow1;
                litTreatment = resObj.genTreatment;
                litPossibleSymptoms = resObj.litPossibleSymptoms;
            }
        }

        //////////////////end private functions//////////////////////////////////////////

    })(jQuery);

    /////////////Symptom selector plugin end//////////////////////////////////
    //////////////////////////////////////////////////////////////////////////

    /////////////Symptom list plugin start/////////////////////////
    //////////////////////////////////////////////////////////////////////
    (function ($) {

        var _plugin;
        var _symptomList;
        var _locationName;
        var _selectorStatus;
        var _locations = new Object();
        var _validSymptoms = new Array();

        var _selectedList;
        var _selectedListId = "selectedSymptomList";
        var _diagnosisListId = "diagnosisList";
        var _proposedList;
        var _proposedListHeader;
        var _symptomListMessage;
        var _loader;
        var _header;
        var _emptySelectedSymptomMessage;
        var _redFlagMessage;

        var _avatarOptions;

        var methods = {

            init: function (options) {
                return this.each(function () {
                    _plugin = $(this);
                    _initSymptomList();
                    _avatarOptions = options;

                    if (redirectUrl === "") {
                        if (mode == "diagnosis")
                            $("#" + _diagnosisListId).diagnosis();

                        if (mode == "specialisations")
                            $("#" + _diagnosisListId).specialisations();

                        var symptoms = _getSelectedSymptoms();
                        if (symptoms.length !== 0) {
                            _showTerms();
                            _makeDiagnosis();
                        }
                    }
                });
            },
            LoadBodyLocations: function (options) {
                _ajaxLoadBodyLocations(options.LocationId);
            },
            LoadBodySublocations: function (options) {
                _avatarOptions = options;
                _loadBodySublocation(options.LocationId, options.SelectorStatus);
                _header.text(_locations[options.LocationId]);
            },
            GetSelectedSymptoms: function (options) {
                return _getSelectedSymptoms();
            },
            SelectSymptom: function (options) {
                _selectSymptom(options);
            },
            SetValidSymptoms: function (options) {
                _validSymptoms = options.ValidSymptoms;
                _avatarOptions.LocationId = options.LocationId;
                _avatarOptions.SelectorStatus = options.SelectorStatus;
                _avatarOptions.Gender = options.Gender;
                _avatarOptions.YearOfBirth = options.YearOfBirth;

                var synonyms = new Array();
                $.each(_validSymptoms, function () {
                    if (this.Synonyms != null && typeof (this.Synonyms) !== "undefined" && this.Synonyms.length > 0) {
                        var currentId = this.ID;
                        var name = this.Name;
                        var hasRedFlag = this.HasRedFlag;
                        $.each(this.Synonyms, function () {
                            var syn = new Object();
                            syn.ID = currentId;
                            syn.Name = this + "(" + name + ")";
                            syn.HasRedFlag = hasRedFlag;
                            syn.IsSynonym = true;
                            syn.HealthSymptomLocationIDs = new Array();
                            synonyms.push(syn);
                        });
                    }
                });

                $.each(synonyms, function () {
                    _validSymptoms.push(this);
                });
                var symptoms = _getSelectedSymptoms();
                if (symptoms.length !== 0) {
                    _addSelectedSymptoms(symptoms);
                }
            },
            GetValidSymptoms: function (options) {
                return _validSymptoms;
            },
            LoadProposedSymptoms: function (options) {
                _clearProposedSymptom();
                _ajaxLoadProposedSymptoms(options.Symptoms, options.Gender, options.YearOfBirth);
            },
            Unbind: function (options) {
                _selectedList.unbind('click');
                _selectedList.empty();
                _plugin.unbind('click');
                _plugin.empty();
            }
        };

        $.fn.symptomList = function (method) {

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.symptomList');
            }

        };

        //////////////////ajax calls/////////////////////////////////////////////////////
        function _ajaxLoadBodyLocations(selectedLocationId) {
            $.ajax({
                url: pathToWebservice + "/body/locations",
                type: "GET",
                data:
                    {
                        token: token,
                        format: "json",
                        language: language
                    },
                contentType: "application/json; charset=utf-8",
                cache: false,
                dataType: "jsonp",
                jsonpCallback: "_addLocationsCallback",
                success: function (responseData) { _addLocationsCallback(responseData, selectedLocationId); },
                beforeSend: function (jqXHR, settings) {
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (window.console)
                        console.log(xhr.responseText);
                },
                complete: function () {
                }
            });
        }

        function _ajaxLoadBodySublocations(locationId) {
            $.ajax({
                url: pathToWebservice + "/body/locations/" + locationId,
                type: "GET",
                data:
                    {
                        token: token,
                        format: "json",
                        language: language
                    },
                contentType: "application/json; charset=utf-8",
                cache: false,
                dataType: "jsonp",
                jsonpCallback: "_addSublocationsCallback",
                success: function (responseData) { _addSublocationsCallback(responseData, locationId); },
                beforeSend: function (jqXHR, settings) {
                    _loader.show();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (window.console)
                        console.log(xhr.responseText);
                },
                complete: function () {
                    _loader.hide();
                }
            });
        }

        function _ajaxLoadProposedSymptoms(symptoms, gender, year_of_birth) {
            $.ajax({
                url: pathToWebservice + "/symptoms/proposed",
                type: "GET",
                async: true,
                data:
                    {
                        token: token,
                        format: "json",
                        language: language,
                        symptoms: JSON.stringify(symptoms),
                        gender: gender,
                        year_of_birth: year_of_birth,
                        platform: currentPlatform
                    },
                contentType: "application/json; charset=utf-8",
                cache: false,
                dataType: "jsonp",
                jsonpCallback: "_addProposedSymptomsCallback",
                success: function (responseData) { _addProposedSymptomsCallback(responseData); },
                beforeSend: function (jqXHR, settings) {
                    $('#loader').show();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (window.console)
                        console.log(xhr.responseText);
                },
                complete: function () {
                    $('#loader').hide();
                }
            });
        }

        function _ajaxGetRedFlagText(symptomId) {
            $.ajax({
                url: pathToWebservice + "/redflag",
                type: "GET",
                async: true,
                data:
                    {
                        token: token,
                        format: "json",
                        language: language,
                        symptomId: symptomId
                    },
                contentType: "application/json; charset=utf-8",
                cache: false,
                dataType: "jsonp",
                jsonpCallback: "_getRedFlagCallback",
                success: function (responseData) { _getRedFlagCallback(responseData); },
                beforeSend: function (jqXHR, settings) {
                    $('#loader').show();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (window.console)
                        console.log(xhr.responseText);
                },
                complete: function () {
                    $('#loader').hide();
                }
            });
        }

        //////////////////end ajax calls/////////////////////////////////////////////////////

        //////////////////private functions//////////////////////////////////////////////

        function _initSymptomList() {
            _symptomList = jQuery("<ul/>", { "class": "location_list" });

            _proposedList = jQuery("<ul/>", { "class": "proposed_list" });
            _proposedListHeader = jQuery("<h4/>", { "text": proposedSymptomsText, "class": "header proposed_list_header" });
            _proposedListHeader.hide();

            _header = jQuery("<h4/>", { "class": "header symptom_list_header" });
            _header.hide();

            _symptomListMessage = jQuery("<span/>", { "class": "message info", "text": symptomListMessage });

            _loader = jQuery("<div/>", { "class": "loader" });
            _loader.hide();

            _plugin.append(_header);
            _plugin.append(_symptomListMessage);
            _plugin.append(_loader);

            _selectedList = $("#" + _selectedListId);
            _selectedList.parent().addClass("box-inactive");

            _selectedList.append(jQuery("<ul/>", { "class": "selected_list" }));
            _selectedList.append(_createNoSymptomsSelectedMessage());
            _selectedList.append(_createTermsElement());
            _selectedList.append(_createTermsNotAcceptedMessage());
            _selectedList.append(_proposedListHeader);
            _selectedList.append(_proposedList);

            _plugin.append(_symptomList);

            _createRedFlagMessage();
        }

        function _createRedFlagMessage() {
            _redFlagMessage = jQuery("<div/>", { "id": "redFlagMessage", "class": "info_page" });
            var redFlagMessageContainer = jQuery("<div/>", { "class": "container" });
            var message = jQuery("<span/>");
            _redFlagMessage.append(redFlagMessageContainer);

            _redFlagMessage.hide();


            $("body").append(_redFlagMessage);

            var content = jQuery("<div/>", { "id": "redFlagContent", "class": "warning" });
            content.append(message);
            redFlagMessageContainer.append(content);

            var btnClose = jQuery("<i/>", { "id": "btnCloseRedFlag", "class": "fa fa-times" });
            btnClose.bind('click', function () {
                _redFlagMessage.find("#redFlagContent span").empty();
                _redFlagMessage.hide();
            });

            content.append(btnClose);
        }

        //load body sublocations
        function _loadBodySublocation(locationId, selectorStatus) {
            _header.show();

            if (_selectorStatus != "" && _selectorStatus != selectorStatus)
                _hideSymptoms(_selectorStatus);

            _selectorStatus = selectorStatus;

            _symptomList.find(".sublocation").hide();

            if (!_isLoadedSublocations(locationId)) {
                _symptomListMessage.hide();
                _ajaxLoadBodySublocations(locationId);
            }
            else
                _symptomList.find(".location_" + locationId).show();
        }

        //create body sublocations list elements
        function _addBodySublocation(sublocation, locationId) {
            if (_isValidSublocation(sublocation.ID) == false)
                return;

            var sublocationListElement = jQuery("<li/>", {
                "id": "sublocation_" + sublocation.ID,
                "class": "sublocation location_" + locationId,
                "text": sublocation.Name
            });

            //var sublocationListElementText = jQuery("<p/>", {
            //    "text": sublocation.Name
            //});

            sublocationListElement.bind('click', function () {
                if (_isLoadedSymptoms(sublocation.ID))
                    _symptomList.find("#symptoms_" + _selectorStatus + "_" + sublocation.ID).toggle();
                else {
                    var symptoms = _getSublocationSymptoms(sublocation.ID)
                    _fillSublocations(symptoms, sublocation.ID);
                }

                $(this).toggleClass("open");
            });

            //sublocationListElement.append(sublocationListElementText);
            _symptomList.append(sublocationListElement);
        }

        //create body sublocations symptoms list elements
        function _addBodySublocationSymptoms(symptom, sublocation, selectedSymptoms) {

            var sublocationSymptomListElement = jQuery("<li/>", {
                "class": "symptom-item symptom_" + symptom.ID,
                "text": symptom.Name,
                "symptom_id": symptom.ID
            });

            var isSelected = $.grep(selectedSymptoms, function (e) { return parseInt(e) == parseInt(symptom.ID); });

            if (isSelected.length != 0)
                sublocationSymptomListElement.hide();

            sublocationSymptomListElement.bind('click', function () {
                _selectSymptom(symptom);
            });

            sublocation.append(sublocationSymptomListElement);
        }

        function _addLocationsCallback(locations, selectedLocationId) {
            $.each(locations, function () {
                _locations[this.ID] = this.Name;
            });

            if (selectedLocationId !== null && selectedLocationId !== "")
                _header.text(_locations[selectedLocationId]);
        }

        function _addSublocationsCallback(sublocations, locationId) {
            $.each(sublocations, function () {
                _addBodySublocation(this, locationId);
            });
        }

        function _fillSublocations(symptoms, sublocationId) {
            var symptomListElement = jQuery("<ul/>", {
                "id": "symptoms_" + _selectorStatus + "_" + sublocationId,
                "class": "symptom_list symptoms_" + _selectorStatus
            });

            _symptomList.find("#sublocation_" + sublocationId).append(symptomListElement);

            var selectedSymptoms = _getSelectedSymptoms();
            $.each(symptoms, function () {
                _addBodySublocationSymptoms(this, symptomListElement, selectedSymptoms);
            });
        }

        function _getSublocationSymptoms(sublocationId) {
            var symptoms = $.grep(_validSymptoms, function (e) {
                var valid = false;
                $.each(e.HealthSymptomLocationIDs, function () {

                    if (parseInt(this) == sublocationId)
                        valid = true;
                });
                return valid;
            });

            symptoms.sort(_sortByName);

            return symptoms;
        }

        function _getRedFlagCallback(redFlagText) {
            if (redFlagText !== null && redFlagText !== "") {
                _redFlagMessage.show();
                _redFlagMessage.find("#redFlagContent span").html(redFlagText);
            }
        }

        function _addSelectedSymptoms(symptoms) {
            $.each(symptoms, function () {
                var symptomId = this;

                var symptom = $.grep(_validSymptoms, function (e) { return parseInt(e.ID) == parseInt(symptomId); });
                _createSelectedSymptomElement(symptom[0]);
            });
        }

        function _isLoadedSymptoms(sublocationId) {
            return _symptomList.find("#symptoms_" + _selectorStatus + "_" + sublocationId).length > 0;
        }

        function _isLoadedSublocations(locationId) {
            return _symptomList.find(".location_" + locationId).length > 0;
        }

        function _selectSymptom(symptom) {
            var symptoms = _getSelectedSymptoms();
            if (inArray(symptom.ID, symptoms) >= 0)// already exist
                return;

            var selected = getCookie("selectedSymptoms");

            if (selected != "")
                selected += "," + symptom.ID;
            else
                selected = symptom.ID;

            setCookie("selectedSymptoms", selected, 1);

            if (redirectUrl !== "") {
                setTimeout(function () { window.location = redirectUrl; }, 500);
                return;
            }

            _createSelectedSymptomElement(symptom);
            _symptomList.find(".symptom_" + symptom.ID).hide();

            _showTerms();
            _ajaxGetRedFlagText(symptom.ID);
            _makeDiagnosis();
            _plugin.parent().removeClass("box-inactive");
        }

        function _hideSymptoms(selectorStatus) {
            _symptomList.find(".symptoms_" + _selectorStatus).hide();
            _symptomList.find(".symptoms_" + _selectorStatus).parent().removeClass("open");
        }

        function _isValidSublocation(sublocationId) {
            var valid = false;
            $.each(_validSymptoms, function () {
                $.each(this.HealthSymptomLocationIDs, function () {
                    if (parseInt(this) == parseInt(sublocationId))
                        valid = true;
                });
            });

            return valid;
        }

        function _sortByName(a, b) {
            var aName = a.Name.toLowerCase();
            var bName = b.Name.toLowerCase();
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        }

        ////////////////////selected list////////////////////////////////////////////////

        function _createSelectedSymptomElement(symptom) {
            if (_selectedList.find("#selected_" + symptom.ID).length > 0)
                return;

            var symptomElement = jQuery("<li/>", {
                "text": symptom.Name,
                "id": "selected_" + symptom.ID,
                "class": "selected_symptom",
                "symId": symptom.ID
            });

            var btnRemove = jQuery("<i/>", {
                "class": "fa fa-times"
            });

            btnRemove.bind('click', function () {
                _removeSymptom(symptom.ID);
                $(this).parent().remove();
            });

            symptomElement.append(btnRemove);

            _selectedList.find("ul.selected_list").append(symptomElement);
        }

        function _getSelectedSymptoms() {
            var symptoms = new Array();
            var selected = getCookie("selectedSymptoms");
            if (selected !== "")
                symptoms = selected.split(",");

            return symptoms;
        }

        function _addGenerateDiagnosisButton() {
            var btnGenerateDiagnosis = jQuery("<input/>", {
                "value": makeDiagnosisText,
                "id": "btnGenerateDiagnosis",
                "type": "button"
            });

            btnGenerateDiagnosis.bind('click', function () {
                if (!isDisclaimerChecked()) {
                    _selectedList.find("#termsNotAcceptedMessage").show();
                    return;
                }
                _makeDiagnosis();
            });

            return btnGenerateDiagnosis;
        }

        function _makeDiagnosis() {
            _avatarOptions.Symptoms = _getSelectedSymptoms();

            if (isDisclaimerChecked()) {
                if (mode == "diagnosis")
                    $("#" + _diagnosisListId).diagnosis("GetDiagnosis", _avatarOptions);

                if (mode == "specialisations")
                    $("#" + _diagnosisListId).specialisations("GetSpecialisations", _avatarOptions);
            }

            if (_avatarOptions.Symptoms.length > 0) {
                _clearProposedSymptom();
                _ajaxLoadProposedSymptoms(_avatarOptions.Symptoms, _avatarOptions.Gender, _avatarOptions.YearOfBirth);
            }
        }

        function _removeSymptom(symptomId) {
            var selected = _getSelectedSymptoms();

            selected = jQuery.grep(selected, function (el) {
                return (parseInt(el) !== symptomId);
            });
            setCookie("selectedSymptoms", selected, 1);

            if (selected.length == 0)
                _hideTerms();

            _symptomList.find(".symptom_" + symptomId).show();

            _makeDiagnosis();
        }

        function _createNoSymptomsSelectedMessage() {
            var p = jQuery("<span/>", {
                "id": "noSymptomsSelectedMessage",
                "class": "message info",
                "text": noSelectedSymptomsText
            });

            return p;
        }

        function _createTermsElement() {
            if (mode == "booking") {
                var p = jQuery("<p/>");
                return p;
            }

            var p = jQuery("<span/>", {
                id: "terms",
                "class": "message info"
            });
            var checked = isDisclaimerChecked();
            var chkBoxTerms = jQuery("<input/>", {
                "type": "checkbox",
                "checked": checked,
                "class": "terms-checkbox"
            });

            chkBoxTerms.bind('click', function () {
                if (this.checked) {
                    setCookie("diagnosisDisclaimer", "true", 0.1);
                    _selectedList.find("#termsNotAcceptedMessage").hide();
                }
                else {
                    setCookie("diagnosisDisclaimer", "false", -1);
                }
                isDisclaimerChecked();
            });

            // set privacy and terms links
            //disclaimerText = disclaimerText.replace(litTermsOfUse, "<a href='" + termsUrl + "' download='" + termsUrl + "' class='terms' target='_blank'>" + litTermsOfUse + "</a>").replace(litPrivacyPolicy, "<a href='" + privacyUrl + "' download='" + privacyUrl + "' class='terms' target='_blank'>" + litPrivacyPolicy + "</a>");
            var litTermsOfUseInText = '#' + litTermsOfUse.replace(/ /g, '').toLowerCase() + '#';
            var litPrivacyPolicyInText = '#' + litPrivacyPolicy.replace(/ /g, '').toLowerCase() + '#';
            disclaimerText = disclaimerText.replace(litTermsOfUseInText, "<a href='" + termsUrl + "' class='terms' target='_blank' >" + litTermsOfUse + "</a>").replace(litPrivacyPolicyInText, "<a href='" + privacyUrl + "' class='terms' target='_blank' >" + litPrivacyPolicy + "</a>");

            var termsText = jQuery("<label/>", {
            });

            termsText.html(disclaimerText);

            var diagnosisButton = _addGenerateDiagnosisButton();

            p.append(chkBoxTerms);
            p.append(termsText);
            p.append("<br/>");
            p.append(diagnosisButton);
            p.hide();

            return p;
        }

        function _createTermsNotAcceptedMessage() {
            var p = jQuery("<span/>", {
                "id": "termsNotAcceptedMessage",
                "class": "message warning",
                "text": disclaimerNotAcceptedText
            });

            p.hide();
            return p;
        }

        function _showTerms() {
            _selectedList.find("#noSymptomsSelectedMessage").hide();
            _selectedList.find("#terms").show();
            _selectedList.parent().removeClass("box-inactive");
        }

        function _hideTerms() {
            _selectedList.find("#terms").hide();
            _selectedList.find("#noSymptomsSelectedMessage").show();
            _selectedList.parent().addClass("box-inactive");
        }

        //////////////////proposed symptoms list/////////////////////////////////////////

        function _addProposedSymptomsCallback(symptoms) {
            if (symptoms.length > 0)
                _proposedListHeader.show();
            else
                _proposedListHeader.hide();

            $.each(symptoms, function () {
                _addProposedSymptom(this);
            });
        }

        function _addProposedSymptom(symptom) {
            var proposedSymptomListElement = jQuery("<li/>", {
                "text": symptom.Name,
                "symptom_id": symptom.ID
            });

            proposedSymptomListElement.bind('click', function () {
                _selectSymptom(symptom);
            });

            _proposedList.append(proposedSymptomListElement);
        }

        function _clearProposedSymptom() {
            _proposedList.find("li").remove();
        }

        //////////////////end private functions//////////////////////////////////////////

    })(jQuery);

    /////////////symptom list plugin end/////////////////////////
    //////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////
    /////////////diagosis result plugin start///////////////////////

    (function ($) {

        var _plugin;
        var _diagnosisList;
        var _diagnosisMessage;
        var _loader;
        var _infoPage;

        var methods = {

            init: function (options) {

                return this.each(function () {
                    _plugin = $(this);
                    _plugin.parent().addClass("box-inactive");
                    _initDiagnosisList();
                });
            },
            GetDiagnosis: function (options) {
                _clearDiagnosis();
                _ajaxGetDiagnosis(options.Symptoms, options.Gender, options.YearOfBirth);
            },
            Unbind: function (options) {
                _plugin.unbind('click');
                _plugin.empty();
            }
        };

        $.fn.diagnosis = function (method) {

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.diagnosis');
            }

        };

        //////////////////private functions//////////////////////////////////////////
        function _initDiagnosisList() {
            _diagnosisList = jQuery("<ul/>", { "class": "diagnosis_list" });

            _diagnosisMessage = jQuery("<span/>", { "class": "message info", "text": diagnosisMessage });
            _diagnosisMessage.hide();
            _loader = jQuery("<div/>", { "id": "diagnosisLoader", "class": "loader" });
            _loader.hide();
            _plugin.append(_loader);
            _plugin.append(_diagnosisList);
            _plugin.append(_diagnosisMessage);

            _createIssueInfoPage();
        }

        function _createIssueInfoPage() {
            _infoPage = jQuery("<div/>", { "class": "info_page" });
            $("body").append(_infoPage);

            var content = jQuery("<div/>", { "class": "info_page_content" });
            _infoPage.append(content);

            infoPageLoader = jQuery("<div/>", { "id": "infoPageLoader", "class": "loader" });
            _infoPage.append(infoPageLoader);

            var btnClose = jQuery("<i/>", { "id": "btnCloseInfo", "class": "fa fa-times btn_info" });
            btnClose.bind('click', function () {
                _infoPage.find(".info_page_content").empty();
                _infoPage.hide();
            });
            var btnPrint = jQuery("<i/>", { "id": "btnPrintInfo", "class": "fa fa-print btn_info" });
            btnPrint.bind('click', function () {
                _print(content);
            });

            _infoPage.append(btnClose);
            _infoPage.append(btnPrint);
        }

        function _createDiagnosisElement(diagnosis) {
            _diagnosisList.append(_createDiagnosisNameElement(diagnosis.Issue.ID, diagnosis.Issue.Name));
            _diagnosisList.append(_createProbabilityElement(diagnosis.Issue.Accuracy));
            _diagnosisList.append(_createSpecialisationElement(diagnosis.Specialisation));
        }

        function _addDiagnosisCallback(diagnosis) {
            _diagnosisMessage.hide();
            $.each(diagnosis, function () {
                _createDiagnosisElement(this);
            });
            if (diagnosis.length > 0) {
                _plugin.parent().removeClass("box-inactive");
                _setDiagnosisMessage(diagnosisMessage);
            }
            else {
                _plugin.parent().addClass("box-inactive");
                _setDiagnosisMessage(noDiagnosisMessage);
            }
        }

        function _addIssueInfoCallback(issueInfo) {
            var htmlContent = "<div>";
            htmlContent += "<h1 class='margin-none' itemprop=\"name\">" + issueInfo.Name + "</h1>";

            var countSynonyms = 0;
            if (issueInfo.Synonyms != null && issueInfo.Synonyms !== "") {
                htmlContent += "<h4>(" + issueInfo.Synonyms + ")</h4>";
            }

            if (issueInfo.ProfName != null && issueInfo.ProfName !== "") {
                htmlContent += "<h3 class='border-bottom'><small>" + litProfName + "  (<b itemprop=\"alternateName\">" + issueInfo.ProfName + "</b>)</small></h3>";
            }

            if (issueInfo.DescriptionShort != null && issueInfo.DescriptionShort != "") {
                htmlContent += "<h3>" + litShortDescription + "</h3><p class='healthIssueInfo'>" + issueInfo.DescriptionShort + "</p>";
            }

            //if (issueInfo.Description != null && issueInfo.Description != "") {
            //    htmlContent += "<h3>" + litDescription + "</h3><p class='healthIssueInfo'>" + issueInfo.Description + "</p>";
            //}

            //if (issueInfo.MedicalCondition != null && issueInfo.MedicalCondition != "" && typeof (issueInfo.MedicalCondition) != 'undefined' && issueInfo.MedicalCondition != null) {
            //    htmlContent += "<h3>" + litOccurrence + " + " + litSymptom + "</h3><p class='healthIssueInfo'>" + issueInfo.MedicalCondition + "</p>";
            //}

            //if (issueInfo.TreatmentDescription != null && issueInfo.TreatmentDescription != "") {
            //    htmlContent += "<h3>" + litFollow + " + " + litTreatment + "</h3><p class='healthIssueInfo'>" + issueInfo.TreatmentDescription + "</p>";
            //}

            if (issueInfo.PossibleSymptoms != "" && issueInfo.PossibleSymptoms != null) {
                htmlContent += "<h3>" + litPossibleSymptoms + "</h3><p class='healthIssueInfo'>" + issueInfo.PossibleSymptoms + "</p>";
            }

            //TODO: references should be shown properly - this string is comming from Wikipedia !!!! string ret = client.DownloadString(url);
            htmlContent = htmlContent.replace("Cite error: There are <ref> tags on this page, but the references will not show without a {{reflist}} template (see the help page).", "");

            var windowHeight = $(".container-table").height();
            _infoPage.css('min-height', windowHeight + 'px');

            _infoPage.find(".info_page_content").append(htmlContent);
            $("html, body").animate({ scrollTop: 0 }, "fast");
            $('html, body', window.parent.document).animate({ scrollTop: 100 }, 'fast');
        }

        function _createDiagnosisNameElement(issueId, diagnosisName) {
            var diagnosisListElement = jQuery("<li/>", {
            });

            var diagnosisNameElement = jQuery("<h4/>", {
                "text": diagnosisName,
                "class": "header diagnosis_name_header"
            });

            var issueInfo = jQuery("<i/>", {
                "class": "fa fa-info-circle ic-issue-info"
            });

            issueInfo.bind('click', function () {
                _ajaxGetIssueInfo(issueId);
            });

            diagnosisNameElement.append(issueInfo);

            diagnosisListElement.append(diagnosisNameElement);

            return diagnosisListElement;
        }

        function _createProbabilityElement(accuracy) {
            diagnosisListElement = jQuery("<li/>", {
            });

            var progress = jQuery("<div/>", {
                "class": "progress"
            });

            var bar = jQuery("<div/>", {
                "class": "progress-bar progress-bar-primary animate"
            });
            console.log(accuracy);
            var currentProgress = 0;
            bar.width(currentProgress + '%');
            var interval = setInterval(function () {
                if (currentProgress >= accuracy) {
                    clearInterval(interval);
                } else {
                    currentProgress++;
                    bar.width(currentProgress + '%');
                }
            }, 20);
            progress.append(bar);
            diagnosisListElement.append(progress);
            return diagnosisListElement;
        }

        function _createSpecialisationElement(specialisation) {
            var specList = jQuery("<ul/>", { "class": "spec_list" });

            if (!includeAllSpec) {
                $.each(specialisation, function () {
                    specListElement = jQuery("<li/>", {
                    });
                    var spec = jQuery("<a/>", {
                        "text": this.Name,
                        //TODO
                        //"href": specUrl + "/" + this.Name + "/" + this.ID
                        "href": specUrl + "?specId=" + this.SpecialistID
                    });

                    specListElement.append(spec);
                    specList.append(specListElement);
                });
            }
            else {
                var specNames = new Array();
                $.each(specialisation, function () {
                    specNames.push(this.Name);
                });
                $.each(specialisation, function () {
                    specListElement = jQuery("<li/>", {
                    });
                    var spec = jQuery("<a/>", {
                        "text": this.Name,
                        "href": specUrl + "?specs=" + JSON.stringify(specNames)
                    });

                    specListElement.append(spec);
                    specList.append(specListElement);
                });
            }


            var element = jQuery("<li/>", {
            });

            element.append(specList);
            return element;
        }

        function _clearDiagnosis() {
            _plugin.find("ul").empty();
        }

        function _setDiagnosisMessage(message) {
            _diagnosisMessage.text(message);
            _diagnosisMessage.show();
        }

        function _print(printSource) {
            var name = printSource.find("h1").text();
            var printFooter = "<div style=\"float:right;\"><img src=\"symptom_selector/images/logo.jpg\" alt=\"priaid\" class=\"logo\"><span><a href=\"http://www.priaid.com\" target=\"_blank\" class=\"priaid-powered\"> powered by  </a> </span></div>"
            printFooter += "<div style=\"float:right;padding-right:16px;clear:both;\"><span><a href=\"http://www.priaid.com\" target=\"_blank\"  class=\"priaid-powered padding0\">(www.priaid.com)</a> </span> </div></div>"
            var printContent = printSource.clone();

            printContent = printContent.html();

            var popupWin = window.open('', '_blank', 'width=800,height=600');
            popupWin.document.open();
            popupWin.document.write("<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"symptom_selector/print.css\"><title=\"priaid -" + name + "></title></head><body onload=\"window.print()\"><div id=\"#container\">" + printContent + printFooter + "</div></html>");
            //popupWin.document.write(html.join(""));
            popupWin.document.title = "priaid - " + name;
            popupWin.document.close();
        }

        //////////////////ajax calls//////////////////////////////////////////

        function _ajaxGetDiagnosis(symptoms, gender, year_of_birth) {
            $.ajax({
                url: pathToWebservice + "/diagnosis",
                type: "GET",
                data:
                    {
                        token: token,
                        format: "json",
                        language: language,
                        symptoms: JSON.stringify(symptoms),
                        gender: gender,
                        year_of_birth: year_of_birth,
                        platform: currentPlatform
                    },
                contentType: "application/json; charset=utf-8",
                cache: false,
                dataType: "jsonp",
                jsonpCallback: "_addDiagnosisCallback",
                success: function (responseData) { _addDiagnosisCallback(responseData); },
                beforeSend: function (jqXHR, settings) {
                    _loader.show();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (window.console)
                        console.log(xhr.responseText);
                },
                complete: function () {
                    _loader.hide();
                }
            });
        }

        function _ajaxGetIssueInfo(issueId) {
            $.ajax({
                url: pathToWebservice + "/issues/" + issueId + "/info",
                type: "GET",
                data:
                    {
                        token: token,
                        format: "json",
                        language: language,
                        platform: currentPlatform
                    },
                contentType: "application/json; charset=utf-8",
                cache: false,
                dataType: "jsonp",
                jsonpCallback: "_addIssueInfoCallback",
                success: function (responseData) { _addIssueInfoCallback(responseData); },
                beforeSend: function (jqXHR, settings) {
                    _infoPage.find("#infoPageLoader").show();
                    _infoPage.show();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (window.console)
                        console.log(xhr.responseText);
                },
                complete: function () {
                    _infoPage.find("#infoPageLoader").hide();
                }
            });


        }

        //////////////////end ajax calls//////////////////////////////////////////

        //////////////////end private functions//////////////////////////////////////////

    })(jQuery);

    /////////////diagosis result plugin end/////////////////////////
    //////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////
    /////////////specialisation result plugin start///////////////////////

    (function ($) {

        var _plugin;
        var _specialisationsList;
        var _diagnosisMessage;
        var _loader;

        var methods = {

            init: function (options) {

                return this.each(function () {
                    _plugin = $(this);
                    _plugin.parent().addClass("box-inactive");
                    _initSpecialisationList();
                });
            },
            GetSpecialisations: function (options) {
                _clearSpecialisations();
                _ajaxGetSpecialisations(options.Symptoms, options.Gender, options.YearOfBirth);
            },
            Unbind: function (options) {
                _plugin.unbind('click');
                _plugin.empty();
            }
        };

        $.fn.specialisations = function (method) {

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.diagnosis');
            }

        };

        //////////////////private functions//////////////////////////////////////////
        function _initSpecialisationList() {
            _specialisationsList = jQuery("<ul/>", { "class": "diagnosis_list" });

            _diagnosisMessage = jQuery("<span/>", { "class": "message info", "text": diagnosisMessage });
            _diagnosisMessage.hide();
            _loader = jQuery("<div/>", { "id": "diagnosisLoader", "class": "loader" });
            _loader.hide();
            _plugin.append(_loader);
            _plugin.append(_specialisationsList);
            _plugin.append(_diagnosisMessage);
        }

        function _createSpecialisationElement(spec, allSuggestedSpec) {
            _specialisationsList.append(_createSpecialisationNameElement(allSuggestedSpec, spec.Name));
            _specialisationsList.append(_createProbabilityElement(spec.Accuracy));
        }

        function _addSpecialisationsCallback(specialisations) {
            _diagnosisMessage.hide();
            var allSuggestedSpec = new Array();
            $.each(specialisations, function () {
                allSuggestedSpec.push(this.Name);
            });
            var specnames = JSON.stringify(allSuggestedSpec);

            $.each(specialisations, function () {
                _createSpecialisationElement(this, specnames);
            });
            if (specialisations.length > 0) {
                _plugin.parent().removeClass("box-inactive");
                _setDiagnosisMessage(diagnosisMessage);
            }
            else {
                _plugin.parent().addClass("box-inactive");
                _setDiagnosisMessage(noDiagnosisMessage);
            }
        }

        function _createSpecialisationNameElement(allSuggestedSpec, specName) {
            var specListElement = jQuery("<li/>", {
            });

            var spec = jQuery("<a/>", {
                "class": "suggested_spec",
                "text": specName,
                "href": specUrl + "?specs=" + allSuggestedSpec
            });

            var specNameElement = jQuery("<h4/>", {
                "class": "header diagnosis_name_header"
            });

            specNameElement.append(spec);

            specListElement.append(specNameElement);

            return specListElement;
        }

        function _createProbabilityElement(accuracy) {
            specListElement = jQuery("<li/>", {
            });

            var progress = jQuery("<div/>", {
                "class": "progress"
            });

            var bar = jQuery("<div/>", {
                "class": "progress-bar progress-bar-primary animate"
            });
            var currentProgress = 0;
            bar.width(currentProgress + '%');
            var interval = setInterval(function () {
                if (currentProgress >= accuracy) {
                    clearInterval(interval);
                } else {
                    currentProgress++;
                    bar.width(currentProgress + '%');
                }
            }, 20);
            progress.append(bar);
            specListElement.append(progress);
            return specListElement;
        }

        function _clearSpecialisations() {
            _plugin.find("ul").empty();
        }

        function _setDiagnosisMessage(message) {
            _diagnosisMessage.text(message);
            _diagnosisMessage.show();
        }
        //////////////////ajax calls//////////////////////////////////////////

        function _ajaxGetSpecialisations(symptoms, gender, year_of_birth) {
            $.ajax({
                url: pathToWebservice + "/diagnosis/specialisations",
                type: "GET",
                data:
                    {
                        token: token,
                        format: "json",
                        language: language,
                        symptoms: JSON.stringify(symptoms),
                        gender: gender,
                        year_of_birth: year_of_birth,
                        platform: currentPlatform
                    },
                contentType: "application/json; charset=utf-8",
                cache: false,
                dataType: "jsonp",
                jsonpCallback: "_addSpecialisationsCallback",
                success: function (responseData) { _addSpecialisationsCallback(responseData); },
                beforeSend: function (jqXHR, settings) {
                    _loader.show();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (window.console)
                        console.log(xhr.responseText);
                },
                complete: function () {
                    _loader.hide();
                }
            });
        }
        //////////////////end ajax calls//////////////////////////////////////////

        //////////////////end private functions//////////////////////////////////////////

    })(jQuery);

    /////////////specialisation result plugin end/////////////////////////
    //////////////////////////////////////////////////////////////////////


    //////////////global cookies functions ///////////////////

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = $.trim(ca[i]);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    function isDisclaimerChecked() {
        var isChecked = getCookie("diagnosisDisclaimer");
        return isChecked !== "" ? isChecked : false;
    }


    //////////////end cookies functions //////////////////////////////////

    function inArray(val, arr) {
        cnt = 0;
        index = -1;
        $(arr).each(function () {
            if (parseInt(this) == parseInt(val)) { index = cnt; }
            cnt++;
        });
        return index;
    } 
});

Template.SymptomChecker.onRendered(function(){
    $(document).ready(function () {
        $("#symptomSelector").symptomSelector(
        {
            mode: "diagnosis",
            webservice: "https://healthservice.priaid.ch",
            language: "en-gb",
            specUrl: "sampleSpecialisationPage",
            accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAcHJpYWlkLmNvbSIsInJvbGUiOiJVc2VyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc2lkIjoiMTI0IiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy92ZXJzaW9uIjoiOTMiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL2xpbWl0IjoiOTk5OTk5OTk5IiwiaHR0cDovL2V4YW1wbGUub3JnL2NsYWltcy9tZW1iZXJzaGlwIjoiUHJlbWl1bSIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbGFuZ3VhZ2UiOiJkZS1jaCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvZXhwaXJhdGlvbiI6IjIwOTktMTItMzEiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL21lbWJlcnNoaXBzdGFydCI6IjIwMDAtMDEtMDEiLCJpc3MiOiJodHRwczovL2F1dGhzZXJ2aWNlLnByaWFpZC5jaCIsImF1ZCI6Imh0dHBzOi8vaGVhbHRoc2VydmljZS5wcmlhaWQuY2giLCJleHAiOjE0Njk3MDIzMjIsIm5iZiI6MTQ2OTY5NTEyMn0.HilZvs98lFxiFDNjHTtCWBnFcJTT52ZaxXunE2wySjc'
        });
    });
});
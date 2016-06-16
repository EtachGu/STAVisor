(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("d3"));
	else if(typeof define === 'function' && define.amd)
		define(["d3"], factory);
	else if(typeof exports === 'object')
		exports["eventDrops"] = factory(require("d3"));
	else
		root["eventDrops"] = factory(root["d3"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(12);
	module.exports = __webpack_require__(16);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.default = filterData;
	function filterData() {
	    var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	    var scale = arguments[1];
	
	    var _scale$domain = scale.domain();
	
	    var _scale$domain2 = _slicedToArray(_scale$domain, 2);
	
	    var min = _scale$domain2[0];
	    var max = _scale$domain2[1];
	
	    return data.filter(function (d) {
	        return d >= min && d <= max;
	    });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	exports.default = function (xScale, configuration, where) {
	    var tickFormatData = configuration.tickFormat.map(function (t) {
	        return t.slice(0);
	    });
	    var tickFormat = configuration.locale ? configuration.locale.timeFormat.multi(tickFormatData) : _d2.default.time.format.multi(tickFormatData);
	
	    var axis = _d2.default.svg.axis().scale(xScale).orient(where).tickFormat(tickFormat);
	
	    if (typeof configuration.axisFormat === 'function') {
	        configuration.axisFormat(axis);
	    }
	
	    return axis;
	};
	
	var _d = __webpack_require__(1);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _d = __webpack_require__(1);
	
	var _d2 = _interopRequireDefault(_d);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var config = {
	    lineHeight: 45,
	    start: new Date(0),
	    end: new Date(),
	    minScale: 0,
	    maxScale: Infinity,
	    width: 1000,
	    margin: {
	        top: 60,
	        left: 200,
	        bottom: 40,
	        right: 50
	    },
	    locale: null,
	    axisFormat: null,
	    tickFormat: [['.%L', function (d) {
	        return d.getMilliseconds();
	    }], [':%S', function (d) {
	        return d.getSeconds();
	    }], ['%I:%M', function (d) {
	        return d.getMinutes();
	    }], ['%I %p', function (d) {
	        return d.getHours();
	    }], ['%a %d', function (d) {
	        return d.getDay() && d.getDate() !== 1;
	    }], ['%b %d', function (d) {
	        return d.getDate() !== 1;
	    }], ['%B', function (d) {
	        return d.getMonth();
	    }], ['%Y', function () {
	        return true;
	    }]],
	    eventHover: null,
	    eventZoom: null,
	    eventClick: null,
	    hasDelimiter: true,
	    hasTopAxis: true,
	    hasBottomAxis: function hasBottomAxis(d) {
	        return d.length >= 10;
	    },
	    eventLineColor: 'black',
	    eventColor: null,
	    metaballs: true,
	    zoomable: true
	};
	
	config.dateFormat = config.locale ? config.locale.timeFormat('%d %B %Y') : _d2.default.time.format('%d %B %Y');
	
	module.exports = config;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _xAxis = __webpack_require__(3);
	
	var _xAxis2 = _interopRequireDefault(_xAxis);
	
	var _xAxis3 = __webpack_require__(11);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var boolOrReturnValue = function boolOrReturnValue(x, data) {
	    return typeof x === 'function' ? x(data) : x;
	};
	
	exports.default = function (axesContainer, scales, configuration, dimensions) {
	    return function (data) {
	        var axis = function axis(orientation) {
	            var selection = axesContainer.selectAll('.x-axis.' + orientation).data([{}]);
	
	            selection.enter().append('g').classed('x-axis', true).classed(orientation, true).call((0, _xAxis2.default)(scales.x, configuration, orientation)).attr('transform', 'translate(0,' + (orientation === 'bottom' ? dimensions.height + 5 : 0) + ')');
	
	            selection.call((0, _xAxis2.default)(scales.x, configuration, orientation));
	
	            selection.exit().remove();
	        };
	
	        if (boolOrReturnValue(configuration.hasTopAxis, data)) {
	            axis('top');
	        }
	
	        if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
	            axis('bottom');
	        }
	    };
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var delimiters = exports.delimiters = function delimiters(svg, scales, dateFormat) {
	    var extremum = svg.select('.extremum');
	
	    extremum.selectAll('.minimum').remove();
	    extremum.selectAll('.maximum').remove();
	
	    var domain = scales.x.domain();
	    extremum.append('text').text(dateFormat(domain[0])).classed('minimum', true);
	
	    extremum.append('text').text(dateFormat(domain[1])).classed('maximum', true).attr('transform', 'translate(' + (scales.x.range()[1] - 200) + ')').attr('text-anchor', 'end');
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	exports.default = function (svg, scales, configuration) {
	    return function dropsSelector(data) {
	        var dropLines = svg.selectAll('.drop-line').data(data);
	
	        dropLines.enter().append('g').classed('drop-line', true).attr('transform', function (d, idx) {
	            return 'translate(10, ' + (40 + configuration.lineHeight + scales.y(idx)) + ')';
	        }).attr('fill', configuration.eventLineColor);
	
	        dropLines.each(function dropLineDraw(drop) {
	            var drops = d3.select(this).selectAll('.drop').data(drop.dates);
	
	            drops.attr('cx', function (d) {
	                return scales.x(d) + 200;
	            });
	
	            var circle = drops.enter().append('circle').classed('drop', true).attr('r', 5).attr('cx', function (d) {
	                return scales.x(d) + 200;
	            }).attr('cy', -5).attr('fill', configuration.eventColor);
	
	            if (configuration.eventClick) {
	                circle.on('click', configuration.eventClick);
	            }
	
	            if (configuration.eventHover) {
	                circle.on('mouseover', configuration.eventHover);
	            }
	
	            // unregister previous event handlers to prevent from memory leaks
	            drops.exit().on('click', null).on('mouseover', null);
	
	            drops.exit().remove();
	        });
	
	        dropLines.exit().remove();
	    };
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _d = __webpack_require__(1);
	
	var _d2 = _interopRequireDefault(_d);
	
	var _delimiters = __webpack_require__(6);
	
	var _filterData = __webpack_require__(2);
	
	var _filterData2 = _interopRequireDefault(_filterData);
	
	var _metaballs = __webpack_require__(13);
	
	var _axes = __webpack_require__(5);
	
	var _axes2 = _interopRequireDefault(_axes);
	
	var _drops = __webpack_require__(7);
	
	var _drops2 = _interopRequireDefault(_drops);
	
	var _labels = __webpack_require__(9);
	
	var _labels2 = _interopRequireDefault(_labels);
	
	var _lineSeparator = __webpack_require__(10);
	
	var _lineSeparator2 = _interopRequireDefault(_lineSeparator);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (svg, dimensions, scales, configuration) {
	    var defs = svg.append('defs');
	    defs.append('clipPath').attr('id', 'drops-container-clipper').append('rect').attr('id', 'drops-container-rect').attr('x', configuration.margin.left + 10).attr('y', 0).attr('width', dimensions.width).attr('height', dimensions.outer_height);
	
	    var labelsContainer = svg.append('g').classed('labels', true).attr('transform', 'translate(0, 45)');
	
	    var axesContainer = svg.append('g').classed('axes', true).attr('transform', 'translate(210, 55)');
	
	    var dropsContainer = svg.append('g').classed('drops-container', true).attr('clip-path', 'url(#drops-container-clipper)').style('filter', 'url(#metaballs)');
	
	    var extremaContainer = svg.append('g').classed('extremum', true).attr('width', dimensions.width).attr('height', 30).attr('transform', 'translate(' + configuration.margin.left + ', ' + (configuration.margin.top - 45) + ')');
	
	    configuration.metaballs && (0, _metaballs.metaballs)(defs);
	
	    var lineSeparator = (0, _lineSeparator2.default)(axesContainer, scales, configuration, dimensions);
	    var axes = (0, _axes2.default)(axesContainer, scales, configuration, dimensions);
	    var labels = (0, _labels2.default)(labelsContainer, scales, configuration);
	    var drops = (0, _drops2.default)(dropsContainer, scales, configuration);
	
	    return function (data) {
	        lineSeparator(data);
	        (0, _delimiters.delimiters)(svg, scales, configuration.dateFormat);
	        drops(data);
	        labels(data);
	        axes(data);
	    };
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _filterData = __webpack_require__(2);
	
	var _filterData2 = _interopRequireDefault(_filterData);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (container, scales, config) {
	    return function (data) {
	        var labels = container.selectAll('.label').data(data);
	
	        var text = function text(d) {
	            var count = (0, _filterData2.default)(d.dates, scales.x).length;
	            return d.name + (count > 0 ? ' (' + count + ')' : '');
	        };
	
	        labels.text(text);
	
	        labels.enter().append('text').classed('label', true).attr('x', 180).attr('transform', function (d, idx) {
	            return 'translate(0, ' + (40 + scales.y(idx)) + ')';
	        }).attr('text-anchor', 'end').text(text);
	
	        labels.exit().remove();
	    };
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	exports.default = function (axesContainer, scales, configuration, dimensions) {
	    return function (data) {
	        var separators = axesContainer.selectAll('.line-separator').data(data);
	
	        separators.enter().append('g').classed('line-separator', true).attr('transform', function (d, i) {
	            return 'translate(0, ' + (scales.y(i) + configuration.lineHeight) + ')';
	        }).append('line').attr('x1', 0).attr('x2', dimensions.width);
	
	        separators.exit().remove();
	    };
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.drawBottomAxis = exports.drawTopAxis = undefined;
	
	var _xAxis = __webpack_require__(3);
	
	var _xAxis2 = _interopRequireDefault(_xAxis);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var drawAxis = function drawAxis(svg, xScale, configuration, orientation, y) {
	    svg.append('g').classed('x-axis', true).classed(orientation, true).attr('transform', 'translate(' + configuration.margin.left + ', ' + y + ')').call((0, _xAxis2.default)(xScale, configuration, orientation));
	};
	
	var drawTopAxis = exports.drawTopAxis = function drawTopAxis(svg, xScale, configuration, dimensions) {
	    return drawAxis(svg, xScale, configuration, 'top', configuration.margin.top - 40);
	};
	var drawBottomAxis = exports.drawBottomAxis = function drawBottomAxis(svg, xScale, configuration, dimensions) {
	    return drawAxis(svg, xScale, configuration, 'bottom', +dimensions.height - 21);
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _d = __webpack_require__(1);
	
	var _d2 = _interopRequireDefault(_d);
	
	var _configurable = __webpack_require__(15);
	
	var _configurable2 = _interopRequireDefault(_configurable);
	
	var _config = __webpack_require__(4);
	
	var _config2 = _interopRequireDefault(_config);
	
	var _drawer = __webpack_require__(8);
	
	var _drawer2 = _interopRequireDefault(_drawer);
	
	var _zoom = __webpack_require__(14);
	
	var _zoom2 = _interopRequireDefault(_zoom);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function eventDrops() {
	    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	    var finalConfiguration = _extends({}, _config2.default, config);
	
	    var yScale = function yScale(data) {
	        var scale = _d2.default.scale.ordinal();
	
	        return scale.domain(data.map(function (d) {
	            return d.name;
	        })).range(data.map(function (d, i) {
	            return i * 40;
	        }));
	    };
	
	    var xScale = function xScale(width, timeBounds) {
	        return _d2.default.time.scale().range([0, width]).domain(timeBounds);
	    };
	
	    function eventDropGraph(selection) {
	        selection.each(function selector(data) {
	            _d2.default.select(this).select('.event-drops-chart').remove();
	
	            var height = data.length * 40;
	            var dimensions = {
	                width: finalConfiguration.width - finalConfiguration.margin.right - finalConfiguration.margin.left,
	                height: height,
	                outer_height: height + finalConfiguration.margin.top + finalConfiguration.margin.bottom
	            };
	
	            var scales = {
	                x: xScale(dimensions.width, [finalConfiguration.start, finalConfiguration.end]),
	                y: yScale(data)
	            };
	
	            var svg = _d2.default.select(this).append('svg').classed('event-drops-chart', true).attr({
	                width: dimensions.width,
	                height: dimensions.outer_height
	            });
	
	            var draw = (0, _drawer2.default)(svg, dimensions, scales, finalConfiguration).bind(selection);
	            draw(data);
	
	            if (finalConfiguration.zoomable) {
	                (0, _zoom2.default)(_d2.default.select(this), dimensions, scales, finalConfiguration, data, draw);
	            }
	        });
	    }
	
	    (0, _configurable2.default)(eventDropGraph, finalConfiguration);
	
	    return eventDropGraph;
	}
	
	_d2.default.chart = _d2.default.chart || {};
	_d2.default.chart.eventDrops = eventDrops;
	
	module.exports = eventDrops;

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var metaballs = exports.metaballs = function metaballs(defs) {
	    var filters = defs.append('filter');
	
	    filters.attr('id', 'metaballs');
	
	    filters.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 10).attr('result', 'blur');
	
	    filters.append('feColorMatrix').attr('in', 'blur').attr('mode', 'matrix').attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10').attr('result', 'contrast');
	
	    filters.append('feBlend').attr('in', 'SourceGraphic').attr('in2', 'contrast');
	
	    return filters;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _d = __webpack_require__(1);
	
	var _d2 = _interopRequireDefault(_d);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (container, dimensions, scales, configuration, data, callback) {
	    var zoom = _d2.default.behavior.zoom().size([dimensions.width, dimensions.height]).scaleExtent([configuration.minScale, configuration.maxScale]).x(scales.x).on('zoom', function () {
	        requestAnimationFrame(function () {
	            return callback(data);
	        });
	    });
	
	    if (configuration.eventZoom) {
	        zoom.on('zoomend', configuration.eventZoom);
	    }
	
	    return container.call(zoom);
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	function configurable(targetFunction, config) {
	
	    function configure(item) {
	        return function(value) {
	            if (!arguments.length) return config[item];
	            config[item] = value;
	
	            return targetFunction;
	        };
	    }
	
	    for (var item in config) {
	        targetFunction[item] = configure(item);
	    }
	}
	
	if(true) {
	    module.exports = configurable;
	} else if ('function' == typeof define && define.amd) {
	    define([], configurable);
	} else {
	    window.configurable = configurable;
	}


/***/ },
/* 16 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ])
});
;


/** WEBPACK FOOTER **
 ** eventDrops.js
 **/
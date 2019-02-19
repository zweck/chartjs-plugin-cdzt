"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.setWidth = exports.sliceData = void 0;

var _ramda = require("ramda");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var IS_ZOOMABLE = false;
var ZOOM_TOLERANCE = 0.1;
var ZOOMABLE_CHARTS = ['line'];
var DRAG_DIV_INITIAL_STYLE = "\n  pointer-events: none;\n  background: grey;\n  position: absolute;\n  height: 100%;\n  bottom: 0;\n  left: 0;\n  opacity: 0.2;\n  width: 0px;\n";

var createDomNodeFromString = function createDomNodeFromString(string) {
  var d = document.createElement('div');
  d.innerHTML = string;
  return d.firstChild;
};

var createResetButton = function createResetButton(chartInstance) {
  var resetButtonHTMLString = chartInstance.options.resetButton;
  var resetButton = createDomNodeFromString(resetButtonHTMLString);

  if (!resetButton) {
    resetButton = document.createElement('BUTTON');
    resetButton.innerText = 'RESET';
  }

  resetButton.id = '_cdzt-reset-button';
  return resetButton;
};

var sliceData = function sliceData() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var start = arguments.length > 1 ? arguments[1] : undefined;
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var _data$datasets = data.datasets,
      datasets = _data$datasets === void 0 ? [] : _data$datasets,
      _data$labels = data.labels,
      labels = _data$labels === void 0 ? [] : _data$labels;

  var findStart = function findStart(data) {
    return parseInt((0, _ramda.multiply)((0, _ramda.length)(data), start));
  };

  var findEnd = function findEnd(data) {
    return parseInt((0, _ramda.multiply)((0, _ramda.length)(data), end));
  };

  var dataSlicer = function dataSlicer(data) {
    return data.slice(findStart(data), findEnd(data));
  };

  var newDatasets = (0, _ramda.map)(function (_ref) {
    var _ref$data = _ref.data,
        data = _ref$data === void 0 ? [] : _ref$data,
        dataset = _objectWithoutProperties(_ref, ["data"]);

    return _objectSpread({}, dataset, {
      data: dataSlicer(data)
    });
  }, datasets);
  return _objectSpread({}, data, {
    datasets: newDatasets,
    labels: dataSlicer(labels)
  });
};

exports.sliceData = sliceData;

var setWidth = function setWidth(chartInstance) {
  return function (x) {
    if (x > 0) {
      chartInstance._cdzt.dragDiv.style.right = null;
      chartInstance._cdzt.dragDiv.style.marginLeft = null;
      chartInstance._cdzt.dragDiv.style.width = "".concat(Math.abs(x), "px");
      return chartInstance;
    }

    chartInstance._cdzt.dragDiv.style.right = chartInstance._cdzt.dragDiv.style.left;
    chartInstance._cdzt.dragDiv.style.marginLeft = "".concat(x, "px");
    chartInstance._cdzt.dragDiv.style.width = "".concat(Math.abs(x), "px");
    return chartInstance;
  };
};

exports.setWidth = setWidth;
var cdzt = {
  id: 'cdzt',
  beforeInit: function beforeInit(chartInstance) {
    chartInstance._cdzt = {}; // store original dataset

    chartInstance._cdzt.originalData = (0, _ramda.clone)(chartInstance.data); // The level of which to ignore the click and drag

    chartInstance._cdzt.zoomTolerance = (0, _ramda.pathOr)(ZOOM_TOLERANCE, ['options', 'cdzt', 'zoomTolerance'], chartInstance);
    IS_ZOOMABLE = (0, _ramda.includes)(chartInstance.config.type, ZOOMABLE_CHARTS);
    if (!IS_ZOOMABLE) return false;
    chartInstance._cdzt.zoom = sliceData;

    chartInstance._cdzt.resetZoom = function () {
      chartInstance.data = chartInstance._cdzt.originalData;
      chartInstance.update();
    };

    chartInstance._cdzt.isZooming = false;
    chartInstance._cdzt.resetButton = createResetButton(chartInstance);

    chartInstance._cdzt.resetButton.addEventListener('click', chartInstance._cdzt.resetZoom);

    chartInstance._cdzt.dragDiv = document.createElement('DIV');
    chartInstance._cdzt.dragDiv.id = '_cdzt';
    chartInstance._cdzt.dragDiv.style.cssText = DRAG_DIV_INITIAL_STYLE;
    chartInstance._cdzt.setWidth = setWidth(chartInstance);
  },
  afterRender: function afterRender(chartInstance) {
    if (!IS_ZOOMABLE) return false;
    var node = chartInstance.chart.ctx.canvas;
    chartInstance._cdzt.chartNode = node;
    var chartWrapper = chartInstance._cdzt.chartNode.parentElement;
    chartWrapper.appendChild(chartInstance._cdzt.dragDiv);
    chartWrapper.appendChild(chartInstance._cdzt.resetButton);

    var removeEventListeners = function removeEventListeners() {
      chartInstance._cdzt.chartNode.removeEventListener('mousedown', mouseDownHandler);

      chartInstance._cdzt.chartNode.removeEventListener('mousemove', mouseMoveHandler);

      chartInstance._cdzt.chartNode.removeEventListener('mouseup', mouseUpHandler);
    };

    var mouseDownHandler = function mouseDownHandler(e) {
      e.preventDefault();

      if (!chartInstance._cdzt.isZooming) {
        chartInstance._cdzt.isZooming = true;
        var rect = e.target.getBoundingClientRect();
        chartInstance._cdzt.canvasRect = rect;
        chartInstance._cdzt.clamp = (0, _ramda.clamp)(chartInstance.chartArea.left, rect.right);
        chartInstance._cdzt.dragStart = chartInstance._cdzt.clamp(e.x - rect.x);
        chartInstance._cdzt.dragDiv.style.left = "".concat(chartInstance._cdzt.dragStart, "px");

        chartInstance._cdzt.chartNode.addEventListener('mousemove', mouseMoveHandler);

        chartInstance._cdzt.chartNode.addEventListener('mouseup', mouseUpHandler);
      }
    };

    var mouseMoveHandler = function mouseMoveHandler(e) {
      e.preventDefault();

      if (chartInstance._cdzt.isZooming) {
        var width = (0, _ramda.reduce)(_ramda.subtract, chartInstance._cdzt.clamp(e.x), [chartInstance._cdzt.canvasRect.x, chartInstance._cdzt.dragStart]);

        chartInstance._cdzt.setWidth(width);
      }
    };

    var mouseUpHandler = function mouseUpHandler(e) {
      e.preventDefault();
      chartInstance._cdzt.dragEnd = e.x - chartInstance._cdzt.canvasRect.x;

      chartInstance._cdzt.setWidth(0);

      chartInstance._cdzt.isZooming = false;
      var chartData = chartInstance.data;

      var _sort = [chartInstance._cdzt.dragStart / chartInstance._cdzt.canvasRect.width, chartInstance._cdzt.dragEnd / chartInstance._cdzt.canvasRect.width].sort(),
          _sort2 = _slicedToArray(_sort, 2),
          start = _sort2[0],
          end = _sort2[1];

      if ((0, _ramda.gt)((0, _ramda.subtract)(end, start), chartInstance._cdzt.zoomTolerance)) {
        chartInstance.data = chartInstance._cdzt.zoom(chartData, start, end);
        chartInstance.update();
      }
    };

    removeEventListeners();

    chartInstance._cdzt.chartNode.addEventListener('mousedown', mouseDownHandler);
  }
};
var _default = cdzt;
exports.default = _default;

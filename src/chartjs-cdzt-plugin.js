import {
  pathOr,
  gt,
  includes,
  reduce,
  subtract,
  clamp,
  clone,
  length,
  multiply,
  map
} from 'ramda'

let IS_ZOOMABLE = false
const ZOOM_TOLERANCE = 0.1
const ZOOMABLE_CHARTS = ['line']

const DRAG_DIV_INITIAL_STYLE = `
  pointer-events: none;
  background: grey;
  position: absolute;
  height: 100%;
  bottom: 0;
  left: 0;
  opacity: 0.2;
  width: 0px;
`

const createDomNodeFromString = string => {
  const d = document.createElement('div')
  d.innerHTML = string
  return d.firstChild
}

const createResetButton = chartInstance => {
  const resetButtonHTMLString = chartInstance.options.resetButton
  let resetButton = createDomNodeFromString(resetButtonHTMLString)

  if (!resetButton) {
    resetButton = document.createElement('BUTTON')
    resetButton.innerText = 'RESET'
  }
  resetButton.id = '_cdzt-reset-button'
  return resetButton
}

export const sliceData = (data = {}, start, end) => {
  const { datasets = [], labels = [] } = data

  const findStart = data => (parseInt(multiply(length(data), start)))
  const findEnd = data => (parseInt(multiply(length(data), end)))

  const dataSlicer = data => data.slice(findStart(data), findEnd(data))

  const newDatasets = map(({ data = [], ...dataset }) => ({
    ...dataset,
    data: dataSlicer(data)
  }), datasets)

  return {
    ...data,
    datasets: newDatasets,
    labels: dataSlicer(labels)
  }
}

export const setWidth = chartInstance => x => {
  if (x > 0) {
    chartInstance._cdzt.dragDiv.style.right = null
    chartInstance._cdzt.dragDiv.style.marginLeft = null
    chartInstance._cdzt.dragDiv.style.width = `${Math.abs(x)}px`
    return chartInstance
  }

  chartInstance._cdzt.dragDiv.style.right = chartInstance._cdzt.dragDiv.style.left
  chartInstance._cdzt.dragDiv.style.marginLeft = `${x}px`
  chartInstance._cdzt.dragDiv.style.width = `${Math.abs(x)}px`
  return chartInstance
}

const cdzt = {
  id: 'cdzt',
  beforeInit: function (chartInstance) {
    chartInstance._cdzt = {}

    // store original dataset
    chartInstance._cdzt.originalData = clone(chartInstance.data)

    // The level of which to ignore the click and drag
    chartInstance._cdzt.zoomTolerance = pathOr(
      ZOOM_TOLERANCE,
      [ 'options', 'cdzt', 'zoomTolerance' ],
      chartInstance
    )
    IS_ZOOMABLE = includes(chartInstance.config.type, ZOOMABLE_CHARTS)

    if (!IS_ZOOMABLE) return false
    chartInstance._cdzt.zoom = sliceData

    chartInstance._cdzt.resetZoom = () => {
      chartInstance.data = chartInstance._cdzt.originalData
      chartInstance.update()
    }

    chartInstance._cdzt.isZooming = false
    chartInstance._cdzt.resetButton = createResetButton(chartInstance)
    chartInstance._cdzt.resetButton.addEventListener('click', chartInstance._cdzt.resetZoom)

    chartInstance._cdzt.dragDiv = document.createElement('DIV')
    chartInstance._cdzt.dragDiv.id = '_cdzt'
    chartInstance._cdzt.dragDiv.style.cssText = DRAG_DIV_INITIAL_STYLE
    chartInstance._cdzt.setWidth = setWidth(chartInstance)
  },
  afterRender: function (chartInstance) {
    if (!IS_ZOOMABLE) return false
    const node = chartInstance.chart.ctx.canvas

    chartInstance._cdzt.chartNode = node
    const chartWrapper = chartInstance._cdzt.chartNode.parentElement
    chartWrapper.appendChild(chartInstance._cdzt.dragDiv)
    chartWrapper.appendChild(chartInstance._cdzt.resetButton)

    const removeEventListeners = () => {
      chartInstance._cdzt.chartNode.removeEventListener('mousedown', mouseDownHandler)
      chartInstance._cdzt.chartNode.removeEventListener('mousemove', mouseMoveHandler)
      chartInstance._cdzt.chartNode.removeEventListener('mouseup', mouseUpHandler)
    }

    const mouseDownHandler = e => {
      e.preventDefault()
      if (!chartInstance._cdzt.isZooming) {
        chartInstance._cdzt.isZooming = true

        const rect = e.target.getBoundingClientRect()
        chartInstance._cdzt.canvasRect = rect
        chartInstance._cdzt.clamp = clamp(
          chartInstance.chartArea.left,
          rect.right
        )

        chartInstance._cdzt.dragStart = chartInstance._cdzt.clamp(e.x - rect.x)
        chartInstance._cdzt.dragDiv.style.left = `${chartInstance._cdzt.dragStart}px`
        chartInstance._cdzt.chartNode.addEventListener('mousemove', mouseMoveHandler)
        chartInstance._cdzt.chartNode.addEventListener('mouseup', mouseUpHandler)
      }
    }

    const mouseMoveHandler = e => {
      e.preventDefault()

      if (chartInstance._cdzt.isZooming) {
        const width = reduce(
          subtract,
          chartInstance._cdzt.clamp(e.x),
          [chartInstance._cdzt.canvasRect.x, chartInstance._cdzt.dragStart]
        )

        chartInstance._cdzt.setWidth(width)
      }
    }

    const mouseUpHandler = e => {
      e.preventDefault()
      chartInstance._cdzt.dragEnd = e.x - chartInstance._cdzt.canvasRect.x
      chartInstance._cdzt.setWidth(0)
      chartInstance._cdzt.isZooming = false

      const chartData = chartInstance.data
      const [ start, end ] = [
        chartInstance._cdzt.dragStart / chartInstance._cdzt.canvasRect.width,
        chartInstance._cdzt.dragEnd / chartInstance._cdzt.canvasRect.width
      ].sort()

      if (gt(subtract(end, start), chartInstance._cdzt.zoomTolerance)) {
        chartInstance.data = chartInstance._cdzt.zoom(chartData, start, end)
        chartInstance.update()
      }
    }

    removeEventListeners()
    chartInstance._cdzt.chartNode.addEventListener('mousedown', mouseDownHandler)
  }
}

export default cdzt

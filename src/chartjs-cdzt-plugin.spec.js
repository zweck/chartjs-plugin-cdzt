import cdzt, { sliceData as zoom } from './chartjs-cdzt-plugin'

global.document = {
  createElement: jest.fn(() => ({
    addEventListener: jest.fn(),
    style: {}
  }))
}

describe('#cdzt', () => {
  const DEFAULT_INIT_OBJ = { config: {}, _cdzt: { originalData: undefined, zoomTolerance: 0.1 } }
  it('should mutate chartInstance and attach cdzt objects to chartInstance', () => {
    const CHART_INSTANCE = { config: {} }
    cdzt.beforeInit(CHART_INSTANCE)
    expect(CHART_INSTANCE).toEqual(DEFAULT_INIT_OBJ)
  })

  it('should mutate chartInstance and attach zoom properties for line chart types', () => {
    const LINE_INIT_OBJ = {
      '_cdzt': {
        'dragDiv': {
          'addEventListener': expect.any(Function),
          'id': '_cdzt',
          'style': {
            'cssText': `
  pointer-events: none;
  background: grey;
  position: absolute;
  height: 100%;
  bottom: 0;
  left: 0;
  opacity: 0.2;
  width: 0px;
`
          }
        },
        'isZooming': false,
        'originalData': undefined,
        'resetButton': {
          'addEventListener': expect.any(Function),
          'id': '_cdzt-reset-button',
          'innerText': 'RESET',
          'style': {}
        },
        'resetZoom': expect.any(Function),
        'setWidth': expect.any(Function),
        'zoom': undefined,
        'zoomTolerance': 0.1
      },
      'config': {
        'type': 'line'
      },
      'options': {}
    }

    const CHART_INSTANCE = { config: { type: 'line' }, options: {} }
    cdzt.beforeInit(CHART_INSTANCE)
    expect(CHART_INSTANCE).toEqual(LINE_INIT_OBJ)
  })

  it('should attach new event listeners in the afterRender hook', () => {
    const appendChild = jest.fn()
    const removeEventListener = jest.fn()
    const addEventListener = jest.fn()
    const CHART_INSTANCE = {
      chart: {
        ctx: {
          canvas: {
            addEventListener,
            removeEventListener,
            parentElement: { appendChild }
          }
        }
      },
      config: {
        type: 'line'
      },
      options: {}
    }

    cdzt.beforeInit(CHART_INSTANCE)
    cdzt.afterRender(CHART_INSTANCE)

    expect(removeEventListener.mock.calls[0][0]).toEqual('mousedown')
    expect(removeEventListener.mock.calls[1][0]).toEqual('mousemove')
    expect(removeEventListener.mock.calls[2][0]).toEqual('mouseup')
    expect(addEventListener.mock.calls[0][0]).toEqual('mousedown')
  })

  it('should attach new mousemove and mouseup listeners on mousedown', () => {
    const appendChild = jest.fn()
    const removeEventListener = jest.fn()
    const addEventListener = jest.fn()
    const preventDefault = jest.fn()
    const getBoundingClientRect = jest.fn(() => ({ right: 10 }))
    const mockMouseDownEvent = {
      preventDefault,
      target: { getBoundingClientRect }
    }
    const CHART_INSTANCE = {
      chartArea: { left: 0 },
      chart: {
        ctx: {
          canvas: {
            addEventListener,
            removeEventListener,
            parentElement: { appendChild }
          }
        }
      },
      config: {
        type: 'line'
      },
      options: {}
    }

    cdzt.beforeInit(CHART_INSTANCE)
    cdzt.afterRender(CHART_INSTANCE)

    removeEventListener.mock.calls[0][1](mockMouseDownEvent)
    expect(addEventListener.mock.calls[0][0]).toEqual('mousedown')
    expect(addEventListener.mock.calls[1][0]).toEqual('mousemove')
    expect(addEventListener.mock.calls[2][0]).toEqual('mouseup')
  })

  it('should slice the provided chartjs data and labels by the %age zoomed', () => {
    const data = {
      datasets: [
        {
          data: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        },
        {
          data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
        }
      ],
      labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    }
    const start = 0.1
    const end = 0.9
    const slicedData = {
      datasets: [
        {
          data: ['1', '2', '3', '4', '5', '6', '7', '8']
        },
        {
          data: ['2', '3', '4', '5', '6', '7', '8', '9']
        }
      ],
      labels: ['1', '2', '3', '4', '5', '6', '7', '8']
    }
    expect(zoom(data, start, end)).toEqual(slicedData)
  })
})

import React from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

const ChartRenderer = ({ charts, isDark = false }) => {
  if (!charts || charts === null) return null;

  // Handle both single chart object and array of charts
  const chartList = Array.isArray(charts) ? charts : [charts];

  const renderChart = (chart, index) => {
    if (!chart || !chart.type) return null;

    // Common layout configuration
    const commonLayout = {
      autosize: true,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { 
        color: isDark ? '#f1f5f9' : '#1e293b',
        family: 'Inter, system-ui, sans-serif',
        size: 12
      },
      margin: { l: 60, r: 30, t: 50, b: 50 },
      showlegend: true,
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        bordercolor: isDark ? '#475569' : '#cbd5e1',
        borderwidth: 1,
        font: { color: isDark ? '#f1f5f9' : '#1e293b' }
      },
      ...(chart.layout || {})
    };

    // Default colors for different chart types
    const colorPalette = isDark 
      ? ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']
      : ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

    // Prepare data array - handle both array format and single object
    let plotData = [];
    
    if (Array.isArray(chart.data)) {
      // If data is already an array of traces (backend format)
      plotData = chart.data.map((trace, idx) => ({
        ...trace,
        type: trace.type || chart.type, // Use trace type or fallback to chart type
        name: trace.name || `Series ${idx + 1}`,
        marker: trace.marker || {
          color: trace.color || colorPalette[idx % colorPalette.length],
          line: { color: isDark ? '#1e293b' : '#ffffff', width: 1 }
        },
        line: trace.line || (chart.type === 'line' || chart.type === 'scatter' ? {
          color: trace.color || colorPalette[idx % colorPalette.length],
          width: 2
        } : undefined)
      }));
    } else if (chart.data) {
      // If data is a single object, convert to array
      plotData = [{
        ...chart.data,
        type: chart.data.type || chart.type,
        marker: chart.data.marker || {
          color: chart.data.color || colorPalette[0],
          line: { color: isDark ? '#1e293b' : '#ffffff', width: 1 }
        },
        line: chart.data.line || (chart.type === 'line' || chart.type === 'scatter' ? {
          color: chart.data.color || colorPalette[0],
          width: 2
        } : undefined)
      }];
    } else {
      // Fallback: use x, y from chart directly
      plotData = [{
        type: chart.type,
        x: chart.x || [],
        y: chart.y || [],
        marker: {
          color: colorPalette[0],
          line: { color: isDark ? '#1e293b' : '#ffffff', width: 1 }
        }
      }];
    }

    // Chart-specific configurations
    switch (chart.type) {
      case 'bar':
        plotData = plotData.map(trace => ({
          ...trace,
          type: 'bar',
          marker: {
            ...trace.marker,
            color: trace.marker?.color || colorPalette[0],
            line: { color: isDark ? '#334155' : '#e2e8f0', width: 1 }
          }
        }));
        break;

      case 'pie':
        plotData = plotData.map(trace => ({
          ...trace,
          type: 'pie',
          hole: trace.hole || 0,
          textinfo: 'label+percent',
          textposition: 'outside',
          marker: {
            colors: trace.colors || colorPalette,
            line: { color: isDark ? '#1e293b' : '#ffffff', width: 2 }
          }
        }));
        break;

      case 'line':
        plotData = plotData.map(trace => ({
          ...trace,
          type: 'scatter',
          mode: 'lines+markers',
          line: {
            ...trace.line,
            color: trace.line?.color || colorPalette[0],
            width: 2,
            shape: 'linear'
          },
          marker: {
            size: 6,
            color: trace.line?.color || colorPalette[0]
          }
        }));
        break;

      case 'scatter':
        plotData = plotData.map(trace => ({
          ...trace,
          type: 'scatter',
          mode: 'markers',
          marker: {
            ...trace.marker,
            size: trace.marker?.size || 8,
            color: trace.marker?.color || colorPalette[0],
            line: { color: isDark ? '#1e293b' : '#ffffff', width: 1 }
          }
        }));
        break;

      case 'treemap':
        plotData = plotData.map(trace => ({
          ...trace,
          type: 'treemap',
          marker: {
            ...trace.marker,
            colors: trace.colors || colorPalette,
            line: { color: isDark ? '#1e293b' : '#ffffff', width: 2 }
          }
        }));
        break;

      case 'choropleth':
        plotData = plotData.map(trace => ({
          ...trace,
          type: 'choropleth',
          marker: {
            ...trace.marker,
            line: { color: isDark ? '#334155' : '#cbd5e1', width: 1 }
          }
        }));
        break;

      default:
        // Default to bar chart if type is not recognized
        plotData = plotData.map(trace => ({
          ...trace,
          type: 'bar',
          marker: {
            color: colorPalette[0],
            line: { color: isDark ? '#334155' : '#e2e8f0', width: 1 }
          }
        }));
    }

    return (
      <div 
        key={index} 
        className={`mt-4 w-full ${chart.type === 'pie' ? 'h-80' : chart.type === 'treemap' ? 'h-96' : 'h-96'} ${isDark ? 'bg-slate-800/30' : 'bg-gray-50'} rounded-xl p-4 border ${isDark ? 'border-slate-700' : 'border-gray-200'} shadow-lg`}
      >
        <Plot
          data={plotData}
          layout={{
            ...commonLayout,
            title: {
              text: chart.layout?.title || chart.title || 'Chart',
              font: { 
                size: 16, 
                color: isDark ? '#f1f5f9' : '#1e293b',
                family: 'Inter, system-ui, sans-serif'
              },
              x: 0.5,
              xanchor: 'center'
            },
            xaxis: {
              ...commonLayout.xaxis,
              ...chart.layout?.xaxis,
              gridcolor: isDark ? '#334155' : '#e2e8f0',
              linecolor: isDark ? '#475569' : '#cbd5e1',
              title: {
                ...chart.layout?.xaxis?.title,
                font: { color: isDark ? '#cbd5e1' : '#64748b' }
              }
            },
            yaxis: {
              ...commonLayout.yaxis,
              ...chart.layout?.yaxis,
              gridcolor: isDark ? '#334155' : '#e2e8f0',
              linecolor: isDark ? '#475569' : '#cbd5e1',
              title: {
                ...chart.layout?.yaxis?.title,
                font: { color: isDark ? '#cbd5e1' : '#64748b' }
              }
            }
          }}
          style={{ width: '100%', height: '100%' }}
          config={{ 
            responsive: true, 
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
            displaylogo: false,
            toImageButtonOptions: {
              format: 'png',
              filename: 'chart',
              height: 600,
              width: 800,
              scale: 2
            }
          }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {chartList.map((chart, i) => renderChart(chart, i))}
    </div>
  );
};

export default ChartRenderer;


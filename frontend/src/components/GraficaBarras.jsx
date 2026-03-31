import { useEffect, useRef } from 'react'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

export default function GraficaBarras({ data, onBarClick }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: ['Bajo', 'Moderado', 'Alto', 'Crítico'],
        datasets: [
          {
            label: 'Ansiedad',
            data: data.map(d => d.ansiedad),
            backgroundColor: '#F59E0B',
            borderRadius: 8,
            borderSkipped: false,
          },
          {
            label: 'Estrés',
            data: data.map(d => d.estres),
            backgroundColor: '#F87171',
            borderRadius: 8,
            borderSkipped: false,
          },
          {
            label: 'Depresión',
            data: data.map(d => d.depresion),
            backgroundColor: '#818CF8',
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_, elements) => {
          if (!elements.length) return
          const { index, datasetIndex } = elements[0]
          // Mismo orden que dataGrafica: Bajo=0, Moderado=1, Alto=2, Crítico=3
          const niveles = ['Bajo', 'Moderado', 'Alto', 'Crítico']
          const tipos   = ['ansiedad', 'estres', 'depresion']
          console.log('Click → nivel:', niveles[index], 'tipo:', tipos[datasetIndex])
          onBarClick({ nivel: niveles[index], tipo: tipos[datasetIndex] })
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} alumnos`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 11, weight: '700', family: 'inherit' },
              color: '#6B7280',
            },
          },
          y: {
            grid: { color: '#F3F4F6' },
            border: { display: false },
            ticks: {
              font: { size: 11, weight: '700', family: 'inherit' },
              color: '#6B7280',
              stepSize: 1,
            },
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [data])

  return <canvas ref={canvasRef} />
}
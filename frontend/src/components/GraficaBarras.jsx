import { useEffect, useRef } from 'react'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const COLORS = {
  ansiedad: '#FFD18A', 
  estres: '#FFADAD',   
  depresion: '#A0A4FF', 
}

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
            backgroundColor: COLORS.ansiedad,
            hoverBackgroundColor: '#F59E0B',
            borderRadius: 4, // Radio reducido para que se vea más cuadrado
            barThickness: 28, // Un poco más anchas para acentuar la forma
          },
          {
            label: 'Estrés',
            data: data.map(d => d.estres),
            backgroundColor: COLORS.estres,
            hoverBackgroundColor: '#EF4444',
            borderRadius: 4,
            barThickness: 28,
          },
          {
            label: 'Depresión',
            data: data.map(d => d.depresion),
            backgroundColor: COLORS.depresion,
            hoverBackgroundColor: '#6366F1',
            borderRadius: 4,
            barThickness: 28,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10 } },
        onClick: (event, elements) => {
          if (!elements.length) return
          const { index, datasetIndex } = elements[0]
          const niveles = ['Bajo', 'Moderado', 'Alto', 'Crítico']
          const tipos = ['ansiedad', 'estres', 'depresion']
          onBarClick({ nivel: niveles[index], tipo: tipos[datasetIndex] })
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: '#FFFFFF',
            titleColor: '#1F2937',
            titleFont: { size: 13, weight: '800' },
            bodyColor: '#6B7280',
            bodyFont: { size: 12, weight: '600' },
            padding: 12,
            cornerRadius: 8, // Tooltip también más cuadradito
            borderColor: '#F3F4F6',
            borderWidth: 1,
            displayColors: true,
            boxPadding: 8,
            usePointStyle: true,
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
              font: { size: 11, weight: '800' },
              color: '#9CA3AF',
            },
          },
          y: {
            grid: { color: '#F3F4F6', drawTicks: false },
            border: { display: false },
            ticks: {
              font: { size: 11, weight: '700' },
              color: '#9CA3AF',
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
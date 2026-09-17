import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-200">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-6">
          <ArrowLeft size={16} />
          Back to map
        </Link>

        <h1 className="text-2xl font-semibold text-slate-100 mb-6">Methodology & Sources</h1>

        <section className="space-y-4 mb-8">
          <h2 className="text-lg font-medium text-slate-100">Water Consumption</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Water draw is calculated using <strong>Water Usage Effectiveness (WUE)</strong>, the industry-standard
            metric defined as liters of water consumed per kilowatt-hour of IT energy. A facility's MW capacity
            is converted to daily kWh, then multiplied by its WUE to produce daily water consumption.
          </p>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 space-y-1">
            <div>kWh/day = MW × 1,000 × 24</div>
            <div>daily_liters = WUE × kWh/day</div>
            <div>daily_gallons = daily_liters / 3.785</div>
            <div>equivalent_homes = daily_gallons / 300</div>
          </div>
          <p className="text-sm text-slate-400">
            The default WUE of 1.8 L/kWh represents a typical evaporative-cooled facility.
            Air-cooled facilities use minimal water (WUE ~0.1) but consume more electricity
            and generate more noise. Home equivalence uses the EPA average of 300 gallons/day.
          </p>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-lg font-medium text-slate-100">Noise Contours</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Noise dispersion is modeled using the <strong>inverse square law</strong>: sound pressure
            drops by approximately 6 dBA each time the distance from the source doubles. Data center
            noise primarily comes from rooftop HVAC chillers (~85 dBA at source) and diesel backup
            generators (~95 dBA during testing).
          </p>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300">
            radius = 10^(required_drop / 20) meters
          </div>
          <p className="text-sm text-slate-400">
            Contours assume free-field propagation with no terrain or building absorption. Actual
            noise levels may vary based on barriers, ground conditions, and atmospheric effects.
          </p>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-lg font-medium text-slate-100">Limitations</h2>
          <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
            <li>MW capacity values are estimates from public filings and may not reflect actual operational load</li>
            <li>WUE varies seasonally and by facility design — the slider shows the range of possible impact</li>
            <li>Noise contours are idealized circles, not terrain-aware models</li>
            <li>Not all data centers have public filings for their water and power usage</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-slate-100">Data Sources</h2>
          <ul className="text-sm text-slate-400 space-y-1.5">
            <li><a href="https://fractracker.org/2026/04/open-u-s-data-centers-tracker/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">FracTracker US Data Centers Tracker</a> — coordinates, MW, cooling method, status</li>
            <li><a href="https://www.electricchoice.com/datacenters/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">ElectricChoice</a> — 2,100+ facilities, power consumption by state</li>
            <li><a href="https://www.eesi.org/articles/view/data-centers-and-water-consumption" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">EESI</a> — data centers and water consumption</li>
            <li><a href="https://www.congress.gov/crs-product/R49057" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Congress.gov CRS Report</a> — data centers and water FAQ</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

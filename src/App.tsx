import { useState } from 'react'
import { Droplet, Plus } from 'lucide-react'
import './App.css'

function App() {
  const [waterIntake, setWaterIntake] = useState(0)
  const dailyGoal = 2000 // ml
  const progress = Math.min((waterIntake / dailyGoal) * 100, 100)

  const addWater = (amount: number) => {
    setWaterIntake(prev => prev + amount)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <Droplet className="logo" size={32} />
          <h1>Water Tracker</h1>
        </div>
      </header>

      <main className="main">
        <div className="tracker-card">
          <h2 className="tracker-title">Today's Progress</h2>
          
          <div className="water-display">
            <div className="water-amount">{waterIntake}</div>
            <div className="water-unit">ml / {dailyGoal} ml</div>
          </div>

          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="quick-add">
            <button 
              className="add-button"
              onClick={() => addWater(250)}
            >
              <Plus size={20} />
              250ml
            </button>
            <button 
              className="add-button"
              onClick={() => addWater(500)}
            >
              <Plus size={20} />
              500ml
            </button>
            <button 
              className="add-button"
              onClick={() => addWater(750)}
            >
              <Plus size={20} />
              750ml
            </button>
          </div>

          {waterIntake >= dailyGoal && (
            <div className="success-message">
              🎉 Goal achieved! Great job staying hydrated!
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>Day 1 Setup Complete ✅</h3>
          <ul className="feature-list">
            <li>✅ PWA Foundation</li>
            <li>✅ Tailwind CSS Configured</li>
            <li>✅ Supabase Client Ready</li>
            <li>⏳ Database Schema (Day 2)</li>
            <li>⏳ Authentication (Day 2)</li>
            <li>⏳ Data Persistence (Day 2)</li>
          </ul>
          <p className="note">
            This is a Day 1 preview. Full functionality coming in Day 2!
          </p>
        </div>
      </main>
    </div>
  )
}

export default App


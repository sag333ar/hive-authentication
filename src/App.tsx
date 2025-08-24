import { AuthButton } from './components/AuthButton'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Hive Authentication Demo</h2>
          <p>This is a demo of the Hive Authentication package.</p>
          <div className="card-actions justify-center mt-4">
            <AuthButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

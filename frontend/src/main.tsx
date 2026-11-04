import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { store } from './store/store'
import { Provider } from 'react-redux'
import { warmUpBackend } from './services/api'

// Wake a sleeping free-tier backend while the visitor is still on the login screen.
warmUpBackend()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)

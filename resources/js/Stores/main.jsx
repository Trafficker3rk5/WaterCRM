import { configureStore } from '@reduxjs/toolkit'
import authReducer from './Main/authSlice'

export default configureStore({
  reducer: {
    auth: authReducer
  },
})
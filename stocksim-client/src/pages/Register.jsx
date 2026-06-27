import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      loginUser(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">Invesync</span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
        <p className="text-[#475569] mb-2">Start with <span className="text-green-400 font-semibold">₹1,00,000</span> virtual balance</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Full Name</label>
            <input
              type="text"
              placeholder="Sumit Dubey"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#12121a] border border-[#2a2a3d] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-[#1a1a2e] transition-all placeholder-[#475569]"
            />
          </div>
          <div>
            <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#12121a] border border-[#2a2a3d] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-[#1a1a2e] transition-all placeholder-[#475569]"
            />
          </div>
          <div>
            <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#12121a] border border-[#2a2a3d] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-[#1a1a2e] transition-all placeholder-[#475569] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 transition-all mt-2"
          >
            {loading ? 'Creating account...' : 'Create free account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#475569] text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
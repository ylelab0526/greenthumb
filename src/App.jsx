import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'sans-serif'}}>Caricamento...</div>

  if (!session) return <Auth />

  return <Dashboard session={session} />
}

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [citta, setCitta] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('Errore: ' + error.message)
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: nome, city: citta } }
      })
      if (error) setMessage('Errore: ' + error.message)
      else setMessage('Controlla la tua email per confermare la registrazione!')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f7f4ee',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Arial,sans-serif',padding:'20px'}}>
      <div style={{background:'white',borderRadius:'16px',padding:'36px',width:'100%',maxWidth:'400px',boxShadow:'0 2px 16px rgba(58,46,30,0.09)',border:'1px solid #dce6dd'}}>
        
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{fontSize:'40px',marginBottom:'8px'}}>🌿</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'26px',color:'#5a7a5e',fontWeight:'600'}}>GreenThumb</div>
          <div style={{fontSize:'13px',color:'#6b5740',marginTop:'4px'}}>
            {isLogin ? 'Accedi al tuo giardino' : 'Crea il tuo account'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={{marginBottom:'14px'}}>
                <label style={{display:'block',fontSize:'12px',color:'#6b5740',fontWeight:'600',marginBottom:'5px'}}>Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Mario Rossi"
                  required
                  style={{width:'100%',border:'1px solid #dce6dd',borderRadius:'8px',padding:'9px 12px',fontSize:'14px',background:'#f7f4ee',boxSizing:'border-box'}}
                />
              </div>
              <div style={{marginBottom:'14px'}}>
                <label style={{display:'block',fontSize:'12px',color:'#6b5740',fontWeight:'600',marginBottom:'5px'}}>Città</label>
                <input
                  type="text"
                  value={citta}
                  onChange={e => setCitta(e.target.value)}
                  placeholder="es. Verona"
                  style={{width:'100%',border:'1px solid #dce6dd',borderRadius:'8px',padding:'9px 12px',fontSize:'14px',background:'#f7f4ee',boxSizing:'border-box'}}
                />
                <div style={{fontSize:'11px',color:'#6b5740',marginTop:'3px'}}>Solo la città — usata per il meteo e il Plant Match</div>
              </div>
            </>
          )}

          <div style={{marginBottom:'14px'}}>
            <label style={{display:'block',fontSize:'12px',color:'#6b5740',fontWeight:'600',marginBottom:'5px'}}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="mario@email.it"
              required
              style={{width:'100%',border:'1px solid #dce6dd',borderRadius:'8px',padding:'9px 12px',fontSize:'14px',background:'#f7f4ee',boxSizing:'border-box'}}
            />
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontSize:'12px',color:'#6b5740',fontWeight:'600',marginBottom:'5px'}}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{width:'100%',border:'1px solid #dce6dd',borderRadius:'8px',padding:'9px 12px',fontSize:'14px',background:'#f7f4ee',boxSizing:'border-box'}}
            />
          </div>

          {message && (
            <div style={{padding:'10px 12px',borderRadius:'8px',marginBottom:'14px',fontSize:'13px',background: message.includes('Errore') ? '#fdf0ef' : '#e8f0e9',color: message.includes('Errore') ? '#c0392b' : '#3d6b42'}}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{width:'100%',background:'#5a7a5e',color:'white',border:'none',borderRadius:'8px',padding:'11px',fontSize:'14px',fontWeight:'600',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1}}>
            {loading ? 'Attendere...' : isLogin ? 'Accedi' : 'Crea account'}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:'18px',fontSize:'13px',color:'#6b5740'}}>
          {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
          <button
            onClick={() => { setIsLogin(!isLogin); setMessage('') }}
            style={{background:'none',border:'none',color:'#5a7a5e',cursor:'pointer',textDecoration:'underline',fontSize:'13px',marginLeft:'5px'}}>
            {isLogin ? 'Registrati' : 'Accedi'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ session }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{minHeight:'100vh',background:'#f7f4ee',fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'white',borderBottom:'1px solid #dce6dd',padding:'0 20px',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'20px',color:'#5a7a5e',fontWeight:'600'}}>🌿 GreenThumb</div>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontSize:'13px',color:'#6b5740'}}>{session.user.email}</span>
          <button onClick={handleLogout} style={{background:'none',border:'1px solid #dce6dd',borderRadius:'7px',padding:'5px 12px',fontSize:'12px',color:'#6b5740',cursor:'pointer'}}>Esci</button>
        </div>
      </div>
      <div style={{padding:'32px 20px',textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'12px'}}>🌱</div>
        <div style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#3a2e1e',marginBottom:'8px'}}>Benvenuto in GreenThumb!</div>
        <div style={{fontSize:'14px',color:'#6b5740'}}>Il tuo giardino digitale è pronto. Stiamo costruendo le prossime funzionalità.</div>
      </div>
    </div>
  )
}
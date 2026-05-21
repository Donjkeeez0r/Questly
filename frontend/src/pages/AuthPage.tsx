import { AlertCircle, KeyRound, Mail, Sparkles, ShieldCheck, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../lib/authApi'
import { useAuthStore } from '../store/authStore'
import './AuthPage.css'

interface AuthPageProps {
  mode: 'login' | 'register'
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const setToken = useAuthStore((state) => state.setToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'USER' | 'CREATOR'>('USER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  const title = useMemo(() => (isLogin ? 'С возвращением, чемпион' : 'Создай аккаунт и начни прокачку'), [isLogin])

  const subtitle = useMemo(
    () =>
      isLogin
        ? 'Продолжи прохождение и поднимись в лидерборде'
        : 'Получай достижения, улучшай результат и соревнуйся с другими',
    [isLogin],
  )

  const validate = () => {
    if (!email.includes('@')) {
      setError('Введите корректный email')
      return false
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return false
    }

    return true
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!validate()) {
      return
    }

    try {
      setLoading(true)
      const response = isLogin
        ? await loginUser({ email, password })
        : await registerUser({ email, password, role })

      setToken(response.access_token)

      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/', { replace: true })
    } catch (err) {
      setError('Ошибка авторизации. Проверьте данные и попробуйте снова.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authPage">
      <div className="authShell">
        <section className="authHero">
          <div>
            <div className="brandBadge">
              <Sparkles size={14} />
              Questly
            </div>
            <h1 className="heroTitle">{title}</h1>
            <p className="heroText">{subtitle}</p>
            <p className="heroText" style={{marginTop: '16px', fontSize: '0.95rem', color: '#cbd5e1', fontStyle: 'italic'}}>Создавай • Проходи • Побеждай</p>

            <div className="heroStats">
              <div className="heroStat">
                <span className="heroStatValue">12,000+</span>
                <span className="heroStatLabel">игр сыграно</span>
              </div>
              <div className="heroStat">
                <span className="heroStatValue">250+</span>
                <span className="heroStatLabel">активных квизов</span>
              </div>
            </div>
          </div>

          <div className="heroFooter">
            <span className="pill">
              <ShieldCheck size={15} />
              Безопасный JWT вход
            </span>
            <span className="pill">
              <Trophy size={15} />
              Достижения и лидерборды
            </span>
          </div>
        </section>

        <section className="authCard">
          <form className="form" onSubmit={onSubmit}>
            <div className="formHeader">
              <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
              <p>{isLogin ? 'Войди, чтобы продолжить игру и открыть свои квизы.' : 'Создай аккаунт и сразу начинай соревноваться.'}</p>
            </div>

            <div className="toggleRow" role="tablist" aria-label="Переключение режима авторизации">
              <Link className={`toggleButton ${isLogin ? 'toggleButtonActive' : ''}`} to="/login">
                Вход
              </Link>
              <Link className={`toggleButton ${!isLogin ? 'toggleButtonActive' : ''}`} to="/register">
                Регистрация
              </Link>
            </div>

            {error ? (
              <div className="errorBox">
                <AlertCircle size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                {error}
              </div>
            ) : null}

            <div className="field">
              <label className="fieldLabel" htmlFor="email">Email</label>
              <div className="inputShell">
                <Mail size={16} className="inputIcon" />
                <input
                  className="input"
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <div className="field">
              <label className="fieldLabel" htmlFor="password">Пароль</label>
              <div className="inputShell">
                <KeyRound size={16} className="inputIcon" />
                <input
                  className="input"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  type="password"
                  value={password}
                />
              </div>
            </div>

            {!isLogin ? (
              <div className="field">
                <label className="fieldLabel" htmlFor="role">Роль</label>
                <div className="inputShell">
                  <select
                    className="select"
                    id="role"
                    onChange={(event) => setRole(event.target.value as 'USER' | 'CREATOR')}
                    value={role}
                  >
                    <option value="USER">Игрок (USER)</option>
                    <option value="CREATOR">Автор квизов (CREATOR)</option>
                  </select>
                </div>
              </div>
            ) : null}

            <button className="submitButton" disabled={loading} type="submit">
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
            </button>

            <p className="switchRow">
              {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
              <Link className="switchLink" to={isLogin ? '/register' : '/login'}>
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  const pathname = request.nextUrl.pathname
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "unknown"

  // Los webhooks (Stripe / TiendaNube) llegan desde IPs externas y en ráfagas;
  // ya están protegidos por firma, así que NO se rate-limitean por IP (evita
  // perder eventos por 429).
  const isWebhook = pathname.startsWith("/api/stripe/webhook") || pathname.startsWith("/api/tiendanube/webhooks")

  // Rate limit global por IP en rutas de auth — 20 requests por minuto
  if (!isWebhook && (pathname.startsWith("/api/") || pathname === "/login" || pathname === "/register")) {
    const { allowed } = rateLimit(`ip:${ip}:${pathname}`, 20, 60 * 1000)
    if (!allowed) {
      return new NextResponse("Too Many Requests", { status: 429 })
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Llamadas internas a /api/provision con el secret correcto pasan sin sesión
  if (pathname.startsWith('/api/provision')) {
    const internalSecret = request.headers.get('x-internal-secret')
    if (internalSecret && process.env.PROVISION_INTERNAL_SECRET && internalSecret === process.env.PROVISION_INTERNAL_SECRET) {
      return supabaseResponse
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isProtected = ['/dashboard', '/onboarding', '/settings'].some(p => pathname.startsWith(p))
  const isProtectedApi = [
    '/api/provision',
    '/api/trial',
    '/api/tiendanube/connect',
    '/api/tiendanube/disconnect',
    '/api/stripe/checkout',
    '/api/settings',
  ].some(p => pathname.startsWith(p))

  if (!user && (isProtected || isProtectedApi)) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Si el usuario ya completó el onboarding, no puede volver a él
  if (user && pathname.startsWith('/onboarding')) {
    const { data: onb } = await supabase
      .from('onboarding_data')
      .select('completed_at')
      .eq('client_id', user.id)
      .single()
    if (onb?.completed_at) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Headers de seguridad
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

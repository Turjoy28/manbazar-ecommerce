import DashboardOverview from '@/components/modules/dashboard/DashboardOverview/DashboardOverview'
import { orderService } from '@/services/order'
import { cookies } from 'next/headers'

/**
 * Dashboard page — Server Component
 *
 * WHY we read cookies here:
 * Next.js server components run on the Node.js runtime.
 * Unlike browser requests, server-side `fetch` does NOT automatically
 * forward the browser's cookies (like `adminToken`).
 * So we manually read `adminToken` from the incoming request's cookies
 * and pass it as a Bearer token when calling authenticated API routes.
 */
export default async function Dashboard(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const start = searchParams?.start as string | undefined;
    const end = searchParams?.end as string | undefined;

    // Read the JWT from the httpOnly cookie set at login
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    // Fetch stats and chart data in parallel, using the token for auth
    const [statsRes, chartRes] = await Promise.all([
        orderService.getOrderStats(token, start, end).catch((err) => {
            console.error('[Dashboard] Failed to fetch stats:', err?.message)
            return null
        }),
        orderService.getMonthlyData(token).catch((err) => {
            console.error('[Dashboard] Failed to fetch chart data:', err?.message)
            return null
        }),
    ])

    return (
        <DashboardOverview
            stats={statsRes?.data}
            chartData={chartRes?.data}
        />
    )
}

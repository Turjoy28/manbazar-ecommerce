import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { SectionCards } from '@/components/section-cards'
import { DashboardFilter } from '../DashboardFilter'
import React from 'react'

export default function DashboardOverview({ stats, chartData }: { stats?: any, chartData?: any }) {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <DashboardFilter />
                    <SectionCards stats={stats} />
                    <div className="px-4 lg:px-6">
                        <ChartAreaInteractive backendData={chartData} />
                    </div>
                </div>
            </div>
        </div>
    )
}

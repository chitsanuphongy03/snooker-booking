import { Button } from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { SnookerTable } from '../../components/ui/SnookerTable'
import { Loading } from '../../components/ui/Loading'
import { useTables } from '../../hooks/useTables'

export function TablesPage() {
  const { tables, loading } = useTables()
  const navigate = useNavigate()

  const handleTableClick = (tableId: string, time?: string) => {
    if (time) {
      navigate(`/book/${tableId}?startTime=${time}`)
    } else {
      navigate(`/book/${tableId}`)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">เลือกโต๊ะที่ต้องการ</h2>
        <p className="text-slate-500 text-sm">คลิกที่โต๊ะหรือเลือกเวลาที่ต้องการจอง</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <SnookerTable 
            key={table.id}
            name={table.name}
            type={table.type}
            status={table.status}
            showSlots={false}
            occupiedUntil={table.occupiedUntil}
            onClick={() => table.status !== 'maintenance' && handleTableClick(table.id)}
            disabled={table.status === 'maintenance'}
          >
            {table.status !== 'maintenance' ? (
              <Button 
                  variant="primary" 
                  className="w-full shadow-sm"
              >
                  จองโต๊ะ
              </Button>
            ) : (
              <div className="w-full py-2 rounded-xl bg-slate-50 text-slate-400 text-center font-bold text-sm border border-slate-100">
                ปิดปรับปรุง
              </div>
            )}
          </SnookerTable>
        ))}
      </div>
    </div>
  )
}

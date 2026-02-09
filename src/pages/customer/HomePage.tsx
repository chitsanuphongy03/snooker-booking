import { useNavigate } from 'react-router-dom'
import { SnookerTable } from '../../components/ui/SnookerTable'
import { Button } from '../../components/ui/Button'
import { Clock } from 'lucide-react'
import { Loading } from '../../components/ui/Loading'
import { useTables } from '../../hooks/useTables'

export function HomePage() {
  const navigate = useNavigate()
  const { tables, loading } = useTables()

  if (loading) {
     return <Loading />
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Available Tables Section (Now at the top) */}
      <section id="tables" className="space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100 mb-2">
            <Clock size={12} />
            เปิดให้บริการทุกวัน: 10:00 - 02:00 น.
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            เลือกจองโต๊ะสนุกเกอร์
          </h1>
          <div className="flex justify-center gap-4 text-xs font-bold pt-2 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> ว่าง</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> ไม่ว่าง(ตอนนี้)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400"></span> ปิดปรับปรุง</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-8 lg:gap-12 max-w-4xl mx-auto px-2 md:px-0">
          {tables.map((table) => (
            <SnookerTable
              key={table.id}
              name={table.name}
              status={table.status}
              type={table.type}
              showSlots={false}
              occupiedUntil={table.occupiedUntil}
              onClick={() => table.status !== 'maintenance' && navigate(`/book/${table.id}`)}
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
      </section>
    </div>
  )
}

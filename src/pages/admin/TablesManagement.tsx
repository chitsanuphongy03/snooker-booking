import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { getTables, updateTableStatus, createTable, updateTable, deleteTable } from '../../services/bookingService'
import type { Table } from '../../types'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { SnookerTable } from '../../components/ui/SnookerTable'
import { useAlert } from '../../hooks/useAlert'
import { Loading } from '../../components/ui/Loading'

export function TablesManagement() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTable, setNewTable] = useState({ name: '', type: 'standard' as 'standard' | 'vip' })
  const [saving, setSaving] = useState(false)
  const { showAlert } = useAlert()

  const loadTables = () => {
    getTables().then(data => {
      setTables(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadTables()
  }, [])

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
        await createTable({
            name: newTable.name,
            type: newTable.type,
            status: 'available',
            pricePerHour: 0
        })
        setIsAddModalOpen(false)
        setNewTable({ name: '', type: 'standard' })
        loadTables()
    } catch (error) {
        console.error('Failed to create table', error)
        showAlert({
            title: 'ผิดพลาด',
            message: 'ไม่สามารถเพิ่มโต๊ะใหม่ได้ในขณะนี้',
            type: 'error'
        })
    } finally {
        setSaving(false)
    }
  }

  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTable) return
    setSaving(true)
    try {
        await updateTable(editingTable.id, {
            name: editingTable.name,
            type: editingTable.type
        })
        setEditingTable(null)
        loadTables()
    } catch (error) {
        console.error('Failed to update table', error)
        showAlert({
            title: 'ผิดพลาด',
            message: 'ไม่สามารถแก้ไขข้อมูลโต๊ะได้ในขณะนี้',
            type: 'error'
        })
    } finally {
        setSaving(false)
    }
  }

  const handleDeleteTable = async () => {
    if (!deletingId) return
    setSaving(true)
    try {
        await deleteTable(deletingId)
        setDeletingId(null)
        loadTables()
    } catch (error) {
        console.error('Failed to delete table', error)
        showAlert({
            title: 'ผิดพลาด',
            message: 'ไม่สามารถลบโต๊ะได้ในขณะนี้',
            type: 'error'
        })
    } finally {
        setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: Table['status']) => {
    // Optimistic update
    setTables(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    
    try {
      await updateTableStatus(id, newStatus)
    } catch (error) {
      console.error('Failed to update status', error)
      // Revert on error
      loadTables()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-50 text-green-600 border-green-200 focus:ring-green-500'
      case 'occupied': return 'bg-red-50 text-red-600 border-red-200 focus:ring-red-500'
      case 'maintenance': return 'bg-orange-50 text-orange-600 border-orange-200 focus:ring-orange-500'
      default: return 'bg-slate-50 text-slate-600 border-slate-200 focus:ring-slate-500'
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">จัดการโต๊ะ</h2>
          <p className="text-slate-500 text-sm">เพิ่ม แก้ไข หรือเปลี่ยนสถานะโต๊ะสนุกเกอร์</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} className="mr-2" /> เพิ่มโต๊ะใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 h-full">
            {/* Visual Table Component */}
            <div className="pointer-events-none">
                <SnookerTable
                    name={table.name}
                    status={table.status}
                    type={table.type}
                    // For admin view, we might not need slots or occupied time yet, or we can pass if available
                    // occupiedUntil={table.occupiedUntil} 
                    disabled={true} // Disable interactive booking click
                />
            </div>

            {/* Admin Controls Area */}
            <div className="p-2 bg-slate-50/50 rounded-xl space-y-3 mt-auto">
                <div className="flex items-center justify-between text-sm px-2">
                     <span className="text-slate-500 font-medium">สถานะโต๊ะ:</span>
                     {table.pricePerHour ? (
                        <span className="text-slate-900 font-bold">{table.pricePerHour} บ./ชม.</span>
                     ) : (
                        <span className="text-slate-400 italic text-xs">ตามการตั้งค่าร้าน</span>
                     )}
                </div>

                <div className="flex gap-2">
                    <div className="flex-1">
                        <select
                        value={table.status}
                        onChange={(e) => handleStatusChange(table.id, e.target.value as Table['status'])}
                        className={`w-full h-10 rounded-lg text-sm font-bold border px-3 appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 ${getStatusColor(table.status)}`}
                        >
                        <option value="available" className="bg-white text-slate-900">พร้อมใช้งาน</option>
                        <option value="occupied" className="bg-white text-slate-900">ไม่ว่าง</option>
                        <option value="maintenance" className="bg-white text-slate-900">ปิดปรับปรุง</option>
                        </select>
                    </div>
                    
                    <Button variant="secondary" size="sm" onClick={() => setEditingTable(table)} className="h-10 w-10 p-0 rounded-lg">
                        <Edit2 size={16} />
                    </Button>
                    <Button variant="secondary" size="sm" className="h-10 w-10 p-0 rounded-lg text-red-500 hover:bg-red-50" onClick={() => setDeletingId(table.id)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
            setIsAddModalOpen(false)
            setNewTable({ name: '', type: 'standard' }) // Reset form
        }}
        title="เพิ่มโต๊ะใหม่"
      >
        <form onSubmit={handleAddTable} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ชื่อโต๊ะ</label>
                <Input 
                    required 
                    placeholder="เช่น โต๊ะ 1, VIP 1" 
                    value={newTable.name}
                    onChange={e => setNewTable({...newTable, name: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ประเภท</label>
                <select 
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-medium"
                    value={newTable.type}
                    onChange={e => setNewTable({...newTable, type: e.target.value as 'standard' | 'vip'})}
                >
                    <option value="standard">มาตรฐาน (Standard)</option>
                    <option value="vip">วีไอพี (VIP)</option>
                </select>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTable}
        onClose={() => setEditingTable(null)}
        title="แก้ไขข้อมูลโต๊ะ"
      >
        {editingTable && (
            <form onSubmit={handleUpdateTable} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ชื่อโต๊ะ</label>
                    <Input 
                        required 
                        value={editingTable.name}
                        onChange={e => setEditingTable({...editingTable, name: e.target.value})}
                    />
                </div>
                {/* 
                  Type editing might be tricky if pricing depends on it and there are bookings. 
                  For now let's allow it.
                */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ประเภท</label>
                    <select 
                        className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-medium"
                        value={editingTable.type}
                        onChange={e => setEditingTable({...editingTable, type: e.target.value as 'standard' | 'vip'})}
                    >
                        <option value="standard">มาตรฐาน (Standard)</option>
                        <option value="vip">วีไอพี (VIP)</option>
                    </select>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </Button>
            </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="ยืนยันการลบ"
      >
        <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <Trash2 size={24} />
            </div>
            <p className="text-slate-600">คุณต้องการลบโต๊ะนี้ใช่หรือไม่? <br/>การกระทำนี้ไม่สามารถยกเลิกได้</p>
            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setDeletingId(null)}>
                    ยกเลิก
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 border-red-500" onClick={handleDeleteTable} disabled={saving}>
                    {saving ? 'กำลังลบ...' : 'ลบโต๊ะนี้'}
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  )
}

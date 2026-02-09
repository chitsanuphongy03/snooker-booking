import { useState, useEffect } from 'react'
import { getTables } from '../services/bookingService'
import { supabase } from '../lib/supabaseClient'
import type { Table } from '../types'

/**
 * Custom hook for fetching tables with realtime subscription
 * Consolidates duplicate subscription logic from HomePage and TablesPage
 */
export function useTables() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      getTables().then(data => {
        setTables(data)
        setLoading(false)
      })
    }

    loadData()

    // Subscribe to realtime changes for both tables and bookings
    const channel = supabase
      .channel('tables-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, loadData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { tables, loading }
}

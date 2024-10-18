  'use client'
  import React, { useState, useEffect } from 'react'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
  import { db } from '@/utils/firebase'
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
  import moment from 'moment'

  const SuperAdminHome = () => {
    const [dashboardData, setDashboardData] = useState({
      totalAdmins: 0,
      totalLots: 0,
      totalQueue: 0,
      adminOverTime: [] as any,
      lotsOverTime: [] as any,
      queueOverTime: [] as any
    })

    useEffect(() => {
      const fetchDashboardData = async () => {
        try {
          const adminsSnapshot = await getDocs(collection(db, 'admins'))
          const lotsSnapshot = await getDocs(collection(db, 'lots'))
          const queueSnapshot = await getDocs(collection(db, 'queues'))

          const last30Days = Array.from({ length: 30 }, (_, i) => {
            return moment().subtract(i, 'days').startOf('day').toDate()
          }).reverse()

          const adminOverTime = await Promise.all(
            last30Days.map(async (date) => {
              const nextDay = moment(date).add(1, 'days').toDate()
              const snapshot = await getDocs(query(
                collection(db, 'admins'),
                where('createdAt', '>=', date.toISOString()),
                where('createdAt', '<', nextDay.toISOString())
              ))
              return {
                date: moment(date).format('YYYY-MM-DD'),
                count: snapshot.size
              }
            })
          )

          const lotsOverTime = await Promise.all(
            last30Days.map(async (date) => {
              const nextDay = moment(date).add(1, 'days').toDate()
              const snapshot = await getDocs(query(
                collection(db, 'lots'),
                where('createdAt', '>=', date.toISOString()),
                where('createdAt', '<', nextDay.toISOString())
              ))
              return {
                date: moment(date).format('YYYY-MM-DD'),
                count: snapshot.size
              }
            })
          )

          const queueOverTime = await Promise.all(
            last30Days.map(async (date) => {
              const nextDay = moment(date).add(1, 'days').toDate()
              const snapshot = await getDocs(query(
                collection(db, 'queues'),
                where('createdAt', '>=', date.toISOString()),
                where('createdAt', '<', nextDay.toISOString())
              ))
              return {
                date: moment(date).format('YYYY-MM-DD'),
                count: snapshot.size
              }
            })
          )

          setDashboardData({
            totalAdmins: adminsSnapshot.size,
            totalLots: lotsSnapshot.size,
            totalQueue: queueSnapshot.size,
            adminOverTime,
            lotsOverTime,
            queueOverTime
          })
        } catch (error) {
          console.error('Error fetching dashboard data:', error)
        }
      }

      fetchDashboardData()
    }, [])

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{dashboardData.totalAdmins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Lots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{dashboardData.totalLots}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{dashboardData.totalQueue}</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.adminOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Lots</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.lotsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Queues</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.queueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#ffc658" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  export default SuperAdminHome
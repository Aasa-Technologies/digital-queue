'use client'
import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import {QRCodeSVG} from 'qrcode.react'

const AdminHome = () => {
  const [adminId, setAdminId] = useState('')

  useEffect(() => {
    const fetchAdminData = async () => {
      const adminCollection = collection(db, 'admins')
      const adminSnapshot = await getDocs(adminCollection)
      if (!adminSnapshot.empty) {
        const adminDoc = adminSnapshot.docs[0]
        setAdminId(adminDoc.id)
      }
    }

    fetchAdminData()
  }, [])

  return (
    <div>
      <h1>Admin Home</h1>
      {adminId && (
        <div>
          <p>Admin ID: {adminId}</p>
          <QRCodeSVG value={adminId} />,
        </div>
      )}
    </div>
  )
}

export default AdminHome
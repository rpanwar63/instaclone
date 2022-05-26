import React from 'react'
import { doc, getDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import Navbar from '../../components/Navbar'
import { db } from '../../firebase';
import Router, { useRouter } from 'next/router';
import { useState } from 'react';

function Profile() {
  const { data: session } = useSession();
  const router = useRouter()
  const { uid } = router.query
  const [userProfile, setUserProfile] = useState();

  const getUserInfo = async () => {
    if(session && !userProfile){
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists) setUserProfile(docSnap.data())
    }
  }

  getUserInfo();
  
  return (
    <div>
        <Navbar />
        <div>
          <img src={userProfile?.image} alt="" />
        </div>
    </div>
  )
}

export default Profile
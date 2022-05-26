import { doc, getDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React from 'react'
import { useRecoilState } from 'recoil';
import { userAtom } from '../atoms/userAtom';
import Navbar from '../components/Navbar'
import { db } from '../firebase';

function Profile() {
  const { data: session } = useSession();
  const [user, setUser] = useRecoilState(userAtom);

  const getUserInfo = async () => {
    if(session && !user){
      const docRef = doc(db, "users", session.user.uid);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists) setUser(docSnap.data())
    }
  }

  if(session) getUserInfo();
  
  return (
    <div>
        <Navbar />
        <div>
          <img src={user?.image} alt="" />
        </div>
    </div>
  )
}

export default Profile
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import React from 'react'
import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil'
import { likeModal } from '../atoms/likeModal'
import { db } from '../firebase';

function LikeModal({postId}) {
  const [open, setOpen] = useRecoilState(likeModal);
  const [users, setUsers] = useState([])

  if(open) {document.body.style.overflow = 'hidden'}

  const closeModal = () => {
    document.body.style.overflow = 'scroll'
    setOpen(false)
  }

  const isLiked = async () => {
    // if(users.length % 10 == 0){
    //   console.log('ran again')
    //   const likesRef = query(collection(db, 'likes'), startAfter('078'), where('postId', '==', `${postId}`), orderBy('name', 'asc'), limit(10));
    //   const querySnapshot = await getDocs(likesRef);
    //   if(querySnapshot.docs.length) {
    //     setUsers(users.concat(querySnapshot.docs))
    //   }
    // }
    console.log('running '+postId)
    const likesRef = query(collection(db, 'likes'), where('postId', '==', `${postId}`), orderBy('username', 'asc'), limit(10));
    const querySnapshot = await getDocs(likesRef);
    console.log(querySnapshot.docs)
    if(querySnapshot.docs.length) {
      setUsers(querySnapshot.docs)
    }
  }

  useEffect(() => {
    isLiked()
  },[users]);

  return (
    <div className='modalBox2 fixed inset-0 flex items-center justify-center' onClick={closeModal}>
      <div className="bg-white h-2/3 w-2/4 lg:w-1/4" onClick={e => e.stopPropagation()}>{users.length > 0 && users[0].data().username}</div>
    </div>
  )
}

export default LikeModal
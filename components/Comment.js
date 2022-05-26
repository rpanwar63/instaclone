import { addDoc, collection, deleteDoc, doc, getDocs, increment, query, updateDoc, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React from 'react'
import { useEffect, useState } from 'react'
import { db } from '../firebase';

function Comment({ id, comment, username, uid, pid, timestamp, likes, userImg, replies}) {
  const { data: session } = useSession();
  const [like, setLike] = useState(false);
  const [likeId, setLikeId] = useState('');

  const isLiked = async () => {
    const likesRef = query(collection(db, 'commentLikes'), where('personId', '==', `${session.user.uid}`), where('commentId', '==', `${id}`));
    const querySnapshot = await getDocs(likesRef);
    if(querySnapshot.docs.length) {
        setLike(true)
        setLikeId(querySnapshot.docs[0].id)
    }
  }

  useEffect(() => {
    isLiked();
  }, [like]);

  const sendLikeToComment = async () => {
    if (!like) {
        setLike(true)
        await addDoc(collection(db, 'commentLikes'), {
            personId: session.user.uid,
            commentId: id,
            username,
            userImg
        });
        const postRef = doc(db, 'comments', id);
        await updateDoc(postRef, {
            likes: increment(1)
        })
    } else {
        setLike(false)
        await deleteDoc(doc(db, "commentLikes", likeId));
        const postRef = doc(db, 'comments', id);
        await updateDoc(postRef, {
            likes: increment(-1)
        })
    }
  }

  return (
    <>
    <div className='flex px-3 py-3 space-x-3'>
      <img src={userImg} alt="" className='rounded-full w-8 h-8'/>
      <div className='flex-1'>
        <p><span className='font-semibold'>{username}</span> {comment}</p>
        <p className='text-xs mt-2'>{likes} likes</p>
        <p className='text-xs mt-1'>{timestamp}</p>
      </div>
      <img src={like ? "/liked.png" : "/like.png"} alt="" className='w-4 h-4 mt-3' onClick={sendLikeToComment}/>
    </div>
    </>
  )
}

export default Comment
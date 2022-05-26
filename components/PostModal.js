import { addDoc, collection, deleteDoc, doc, getDocs, increment, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { db } from '../firebase';
import Comment from './Comment';
import moment from 'moment';
import InputEmoji from 'react-input-emoji';
import { useRecoilState } from 'recoil';
import { postModalBox } from '../atoms/postModal';

function PostModal({data:{ id, uid, username, image, userImg, caption, timestamp, likes, comments, date }}) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [like, setLike] = useState(false);
  const [likeId, setLikeId] = useState('');
  const [commentsD, setCommentsD] = useState([]);
  const [postModal, setPostModal] = useRecoilState(postModalBox);
  const [anim, setAnim] = useState(false);

  if (postModal) {document.body.style.overflow = 'hidden'}

  const isLiked = async () => {
    const likesRef = query(collection(db, 'likes'), where('personId', '==', `${session.user.uid}`), where('postId', '==', `${id}`));
    const querySnapshot = await getDocs(likesRef);
    if(querySnapshot.docs.length) {
        setLike(true)
        setLikeId(querySnapshot.docs[0].id)
    }
  }

  useEffect(() => {
    isLiked();
  }, [like])

  useEffect(() => {
    const postsRef = query(collection(db, 'comments'), where('personId', '==', `${session.user.uid}`), where('postId', '==', `${id}`))
    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      setCommentsD(snapshot.docs)
    })
    return unsubscribe;
  }, [db]);

  const sendLike = async () => {
    if (!like) {
        setLike(true)
        await addDoc(collection(db, 'likes'), {
            personId: session.user.uid,
            postId: id,
            username,
            userImg
        });
        const postRef = doc(db, 'posts', id);
        await updateDoc(postRef, {
            likes: increment(1)
        })
        isLiked();
    } else {
        setLike(false)
        await deleteDoc(doc(db, "likes", likeId));
        const postRef = doc(db, 'posts', id);
        await updateDoc(postRef, {
            likes: increment(-1)
        })
        isLiked();
    }
  }

  const sendComment = async () => {
    await addDoc(collection(db, 'comments'), {
        personId: session.user.uid,
        postId: id,
        username,
        userImg,
        comment: text,
        replies: [],
        likes: 0,
        timestamp: serverTimestamp()
    });
    const postRef = doc(db, 'posts', id);
    await updateDoc(postRef, {
        comments: increment(1)
    })
  }

  const closeModal = () => {
    document.body.style.overflow = 'scroll'
    setText('')
    setLike(false)
    setLikeId('')
    setCommentsD([])
    setAnim(false)
    setPostModal(false)
  }


  return (
    <div className={`fixed inset-0 modalBox1 flex items-center justify-center`} onClick={closeModal} onLoad={() => setAnim(true)}>
      <img src="/close.png" alt="" onClick={closeModal} className='fixed top-5 right-5' />
      <div className={`bg-black rounded-md shadow-md overflow-hidden m-h-500 flex m-w-80p transition-transform duration-300 scale01 ${anim && 'scale100'}`} onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center'>
          <img src={image} alt="" className='m-h-500 object-scale-down' onContextMenu={e => e.preventDefault()} />
        </div>
        <div className='b-x flex flex-col m-h-500 m-w-400 bg-white'>
          <div className='flex items-center justify-between px-3 py-2 border-b'>
            <Link href={session?.user?.uid == uid ? '/Profile' : `/profile/${uid}`}>
              <div className='flex space-x-2 items-center'>
                <img className="w-10 h-10 rounded-full" src={userImg} alt="" />
                <a href="#" className='font-semibold'>{username}</a>
              </div>
            </Link>
            <img className='w-4 h-4' src="/option.png" alt="" />
          </div>
          <div className='flex-1 overflow-y-scroll'>
            <div>
              <div className='flex px-3 py-3 space-x-3'>
                <img src={userImg} alt="" className='rounded-full w-8 h-8'/>
                <div>
                  <p><span className='font-semibold'>{username}</span> {caption}</p>
                  <p className='text-xs mt-2'>{timestamp}</p>
                </div>
              </div>
              {commentsD.length > 0 && commentsD.map(comment => 
                <Comment 
                  key={comment.id}
                  id={comment.id}
                  comment={comment.data().comment} 
                  username={comment.data().username}
                  uid={comment.data().personId}
                  pid={comment.data().postId}
                  timestamp={moment(comment.data().timestamp?.toDate()).fromNow()}
                  userImg={comment.data().userImg}
                  likes={comment.data().likes}
                  replies={comment.data().replies}
                />)}
            </div>
          </div>
          <div className='flex items-center justify-between px-3 py-3'>
            <div className='flex space-x-4'>
                <img className='w-7 h-7' src={like ? '/liked.png' : '/like.png'} alt="" onClick={sendLike} />
                <img className='w-7 h-7' src="/direct.png" alt="" />
            </div>
            <img className='w-7 h-7' src="/bookmark.png" alt="" />
          </div>
         
          <p className='text-sm text-gray-400 mx-3'>{likes} likes</p>
          <p className='text-xs text-gray-400 my-2 mx-3'>{timestamp}</p>
          <div>
            <InputEmoji
                value={text}
                onChange={setText}
                cleanOnEnter
                placeholder="Add a comment..."
                borderRadius='0'
                onEnter={sendComment}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostModal
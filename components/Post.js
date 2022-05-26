import InputEmoji from "react-input-emoji";
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState } from "react";
import Link from "next/link";
import { addDoc, collection, doc, getDocs, query, updateDoc, where, increment, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";
import PostModal from "./PostModal";
import { useRecoilState } from "recoil";
import { postModalBox } from "../atoms/postModal";
import { likeModal, likeModalBoxData } from '../atoms/likeModal';
import { postModalProps } from "../atoms/postModalProps";

function Post({ id, uid, username, image, userImg, caption, timestamp, likes, comments, date }) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [like, setLike] = useState(false);
  const [likeId, setLikeId] = useState('');
  const [postModal, setPostModal] = useRecoilState(postModalBox);
  const [postModalProp, setPostModalProp] = useRecoilState(postModalProps);
  const [likeModalProp, setLikeModalProp] = useRecoilState(likeModal);
  const [likeModalData, setLikeModalData] = useRecoilState(likeModalBoxData);

  const data = { id, uid, username, image, userImg, caption, timestamp, likes, comments, date }

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
    } else {
        setLike(false)
        await deleteDoc(doc(db, "likes", likeId));
        const postRef = doc(db, 'posts', id);
        await updateDoc(postRef, {
            likes: increment(-1)
        })
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

  return (
    <>
    <div className='mx-10 my-5 border-solid border-2 border-gray-100 shadow-md'>
        <div className='flex items-center justify-between px-3 py-2'>
            <Link href={session?.user?.uid == uid ? '/Profile' : `/profile/${uid}`}>
                <div className='flex space-x-2 items-center'>
                    <img className="w-10 h-10 rounded-full" src={userImg} alt="" />
                    <a href="#" className='font-semibold'>{username}</a>
                </div>
            </Link>
            <img className='w-4 h-4' src="/option.png" alt="" />
        </div>
        <img className='w-full object-cover h-full' src={image} alt="" />
        <div className='flex items-center justify-between px-3 py-3'>
            <div className='flex space-x-4'>
                <img className='w-7 h-7' src={like ? '/liked.png' : '/like.png'} alt="" onClick={sendLike} />
                <img className='w-7 h-7' src="/direct.png" alt="" />
            </div>
            <img className='w-7 h-7' src="/bookmark.png" alt="" />
        </div>
        <button className='font-semibold mx-3 text-sm' onClick={() => {if(likes > 0) {setLikeModalData(id); setLikeModalProp(true)}}}>{likes} likes</button>
        <p className='text-md mt-2 mx-3'>
            <span  className='font-semibold mr-2'>{username}</span>
            {caption}
        </p>
        <p className='text-sm text-gray-400 mx-3' onClick={() => {setPostModalProp(data); setPostModal(true)}}>{comments > 0 ? `View all ${comments} comments` : 'Be the first one to comment'}</p>
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
    
    </>
  )
}

export default Post
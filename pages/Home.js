import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import moment from 'moment';
import { signOut, useSession } from 'next-auth/react';
import Head from 'next/head'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { postModalBox } from '../atoms/postModal';
import { postModalProps } from '../atoms/postModalProps';
import { uploadModal } from '../atoms/uploadModal';
import { likeModal, likeModalBoxData } from '../atoms/likeModal';
import { userAtom } from '../atoms/userAtom';
import AddPost from '../components/AddPost';
import Navbar from '../components/Navbar'
import Post from '../components/Post';
import PostModal from '../components/PostModal';
import { db } from '../firebase';
import LikeModal from '../components/LikeModal';


export default function Home() {
  const { data: session } = useSession();
  const [open,setOpen] = useRecoilState(uploadModal);
  const [user, setUser] = useRecoilState(userAtom);
  const [posts, setPosts] = useState([]);
  const [postModal, setPostModal] = useRecoilState(postModalBox);
  const [postModalProp, setPostModalProp] = useRecoilState(postModalProps);
  const [likeModalProp, setLikeModalProp] = useRecoilState(likeModal);
  const [likeModalData, setLikeModalData] = useRecoilState(likeModalBoxData);

  useEffect(() => {
    if(user){
      const postsRef = query(collection(db, 'posts'), where('userID', '==', `${user.uid}`), orderBy('timestamp', 'desc'))
      const unsubscribe = onSnapshot(postsRef, (snapshot) => {
        setPosts(snapshot.docs)
      })
      return unsubscribe;
    }
  },[user, db])
  
  const getUserInfo = async () => {
    if(session && !user){
      const docRef = doc(db, "users", session.user.uid);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists) {
        setUser(docSnap.data())
      }
    }
  }

  if(session) getUserInfo();

  return (
    <>
      <div className='cursor-pointer'>
        <Head>
          <title>Instagram</title>
          <meta name="description" content="Instagram Clone" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navbar />
        <div className='mt-20 w-full lg:w-2/3 mx-auto grid md:grid-cols-5 lg:grid-cols-3'>
          <div className='md:col-span-3 lg:col-span-2'>
            {user &&
              posts.length > 0 ? posts.map(post => 
                <Post
                  key={post.id}
                  id={post.id}
                  uid={post.data().userID}
                  username={post.data().username}
                  userImg={post.data().profileImg}
                  image={post.data().image}
                  caption={post.data().caption} 
                  timestamp={moment(post.data().timestamp?.toDate()).fromNow()}
                  likes={post.data().likes}
                  comments={post.data().comments}
                  date={moment(post.data().timestamp?.toDate())}
                />
              )
            :
              <div className='flex items-center justify-center flex-col mt-20'>
                <p>No posts right now</p>
                <p>Make posts or Follow someone</p>
              </div>
            }
          </div>
          <div className='hidden md:block lg:block md:col-span-2 lg:col-span-1'>
            <div className='flex items-center my-5 justify-between px-3'>
              <Link href="/Profile">
                <div className='flex items-center space-x-3'>
                  <img src={user?.image} alt="" className='w-12 h-12 rounded-full'/>
                  <div>
                    <p className='leading-tight text-md'>{user?.username}</p>
                    <p className='leading-tight text-gray-400 text-xs'>{user?.name}</p>
                  </div>
                </div>
              </Link>
              <button className='text-blue-500' onClick={async () => {const data = await signOut({redirect: true, callbackUrl: "/"})}}>Log Out</button>
            </div>
          </div>
        </div>
      </div>
      {open && <AddPost />}
      {postModal && <PostModal data={postModalProp} />}
      {likeModalProp && <LikeModal postId={likeModalData} />}
    </>
  )
}
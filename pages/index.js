import { doc, getDoc} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import Head from 'next/head'
import Router from 'next/router';
import { useRecoilState } from 'recoil';
import { userAtom } from '../atoms/userAtom';
import Navbar from '../components/Navbar';
import { db } from '../firebase';

export default function Main() {
  const { data: session } = useSession();
  const [user, setUser] = useRecoilState(userAtom);

  if(user) Router.push('/Home')

  const getUserInfo = async () => {
    if(session && !user){
      const docRef = doc(db, "users", session.user.uid);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists) {
        setUser(docSnap.data())
        Router.push('/Home')
      }
    }
  }
  
  if(session) getUserInfo()
 
  return (
    <>
      <Head>
        <title>Instagram</title>
        <meta name="description" content="Instagram Clone" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
    </>
  )
}

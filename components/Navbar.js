import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react'
import { useRecoilState } from 'recoil';
import { uploadModal } from '../atoms/uploadModal'

function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useRecoilState(uploadModal);

  return (
    <div className='shadow-md fixed bg-white w-full top-0 mainNav'>
        <div className='flex h-16 lg:w-2/3 md:w-full md:px-5 lg:px-0 px-5 items-center justify-between mx-auto'>
            <div>
                <img src="/logo.png" alt="" />
            </div>
        {session ?
        <>
            <div className='flex bg-gray-200 px-2 py-1 rounded-md space-x-2 items-center'>
                <img className='w-4 h-4' src="/search.png" alt="" />
                <input type="text" placeholder='search' className='flex-1 bg-gray-200 focus:outline-none' />
            </div>
            <div className='flex space-x-5 items-center'>
                <Link href="/Home"><img className='h-5 w-5' src="/home.png" alt="" /></Link>
                <img className='h-5 w-5' src="/direct.png" alt="" />
                <img className='h-5 w-5' src="/more.png" alt="" onClick={() => setOpen(true)} />
                <img className='h-5 w-5' src="/like.png" alt="" />
                <img className='h-8 w-8 rounded-full' src={session?.user.image} alt="" onClick={async () => {const data = await signOut({redirect: true, callbackUrl: "/"})}}/>
            </div>
        </>
        :
        <button className='bg-blue-500 px-8 py-2 rounded-md text-white' onClick={signIn}>Log In</button>
        }
        </div>
    </div>
  )
}

export default Navbar